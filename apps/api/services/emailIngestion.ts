import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { logger } from '../config/logger';
import { DocumentModel } from '../models/Document';
import { DailyLog } from '../models/DailyLog';
import { Invoice } from '../models/Invoice';
import { ComplianceDoc } from '../models/ComplianceDoc';
import { documentQueue } from './documentProcessing';
import { WorkflowDocument } from '../models/WorkflowDocument';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

export interface EmailIngestionJob {
  from: string;
  to: string;
  subject: string;
  body: string;
  attachments: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
    size: number;
  }>;
  receivedAt: Date;
  messageId: string;
}

export type DocumentType = 'INVOICE' | 'DAILY_LOG' | 'COMPLIANCE' | 'OTHER';

// Dedicated email addresses for different workflows
const EMAIL_ROUTING: Record<string, DocumentType> = {
  'invoices@': 'INVOICE',
  'logs@': 'DAILY_LOG',
  'compliance@': 'COMPLIANCE',
  'docs@': 'OTHER',
};

// Create queue for email ingestion
export const emailQueue = new Queue<EmailIngestionJob>('email-ingestion', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 60 * 60, // 24 hours
    },
    removeOnFail: {
      count: 50,
    },
  },
});

/**
 * Determine document type based on recipient email address
 */
function determineDocumentType(toAddress: string): DocumentType {
  const lowerTo = toAddress.toLowerCase();
  
  for (const [prefix, type] of Object.entries(EMAIL_ROUTING)) {
    if (lowerTo.includes(prefix)) {
      return type;
    }
  }
  
  return 'OTHER';
}

/**
 * Extract tenant/company ID from email address
 * Supports patterns like: invoices+companyA@worklighter.com, companyA-logs@worklighter.com
 */
function extractTenantIdFromEmail(toAddress: string): string | null {
  const lowerTo = toAddress.toLowerCase();
  
  // Pattern 1: invoices+companyA@domain.com
  const plusMatch = lowerTo.match(/\+([a-z0-9-_]+)@/);
  if (plusMatch) {
    return plusMatch[1];
  }
  
  // Pattern 2: companyA-logs@domain.com
  const dashMatch = lowerTo.match(/^([a-z0-9-_]+)-(invoices|logs|compliance|docs)@/);
  if (dashMatch) {
    return dashMatch[1];
  }
  
  // Pattern 3: invoices.companyA@domain.com
  const dotMatch = lowerTo.match(/\.(companyA|[a-z0-9-_]+)@/);
  if (dotMatch) {
    return dotMatch[1];
  }
  
  logger.warn(`Could not extract tenant ID from email: ${toAddress}`);
  return null;
}

/**
 * Generate SHA256 hash for file deduplication
 */
function generateFileHash(content: Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Convert HEIC images to JPEG format using Sharp
 */
async function convertHeicToJpeg(content: Buffer, filename: string): Promise<{ content: Buffer; filename: string; mimeType: string }> {
  try {
    // Use sharp to convert HEIC to JPEG
    const sharp = require('sharp');
    const jpegBuffer = await sharp(content)
      .jpeg({ quality: 90 })
      .toBuffer();
    
    logger.info(`Converted HEIC image to JPEG: ${filename}`);
    
    return {
      content: jpegBuffer,
      filename: filename.replace(/\.heic$/i, '.jpg'),
      mimeType: 'image/jpeg'
    };
  } catch (error) {
    logger.error('HEIC conversion failed, using original:', error);
    // Fallback to original if conversion fails
    return {
      content,
      filename,
      mimeType: 'image/jpeg'
    };
  }
}

/**
 * Upload file to Azure Blob Storage
 */
async function uploadToBlobStorage(content: Buffer, filename: string, mimeType: string, hash: string, tenantId?: string): Promise<string> {
  try {
    const { azureBlobStorageService } = require('./azureBlobStorageService');
    
    // Determine container based on file type
    let containerName = 'documents';
    if (mimeType === 'application/pdf') {
      containerName = 'pdfs';
    } else if (mimeType.startsWith('image/')) {
      containerName = 'images';
    }
    
    // Generate unique blob name
    const blobName = azureBlobStorageService.generateBlobName(filename, tenantId);
    
    // Upload to blob storage
    const { blobUrl } = await azureBlobStorageService.uploadFile({
      containerName,
      blobName,
      buffer: content,
      contentType: mimeType,
      metadata: {
        sha256Hash: hash,
        originalFilename: filename,
        uploadedAt: new Date().toISOString(),
        tenantId: tenantId || 'unknown',
      },
    });
    
    logger.info(`File uploaded to blob storage: ${containerName}/${blobName}`);
    return blobUrl;
  } catch (error) {
    logger.error('Blob storage upload failed, falling back to local storage:', error);
    
    // Fallback to local filesystem if Azure is unavailable
    const uploadDir = config.uploadDir || path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${hash}-${filename}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, content);
    
    // Return relative URL for the file
    return `/uploads/${fileName}`;
  }
}

/**
 * Check if file already exists based on hash
 */
async function checkFileExists(hash: string): Promise<boolean> {
  // Check if file with this hash already exists in WorkflowDocument collection
  const existingDoc = await WorkflowDocument.findOne({ hashSha256: hash });
  return !!existingDoc;
}

/**
 * Process email attachments and create document entries
 */
async function processAttachments(
  job: EmailIngestionJob,
  documentType: DocumentType,
  companyId: string
): Promise<void> {
  if (!job.attachments || job.attachments.length === 0) {
    logger.info(`No attachments in email ${job.messageId}`);
    return;
  }

  for (const attachment of job.attachments) {
    // Skip non-document attachments
    const supportedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/heic',
      'image/heif',
      'text/plain',
    ];

    if (!supportedTypes.includes(attachment.contentType)) {
      logger.warn(`Skipping unsupported file type: ${attachment.contentType}`);
      continue;
    }

    try {
      // Generate SHA256 hash for deduplication
      const fileHash = generateFileHash(attachment.content);

      // Check if file already exists
      const fileExists = await checkFileExists(fileHash);
      if (fileExists) {
        logger.info(`Duplicate file detected (hash: ${fileHash}), skipping`);
        continue;
      }

      // Convert HEIC images to JPEG if needed
      let processedContent = attachment.content;
      let processedFilename = attachment.filename;
      let processedMimeType = attachment.contentType;

      if (attachment.contentType === 'image/heic' || attachment.contentType === 'image/heif') {
        const converted = await convertHeicToJpeg(attachment.content, attachment.filename);
        processedContent = converted.content;
        processedFilename = converted.filename;
        processedMimeType = converted.mimeType;
      }

      // Upload file to blob storage
      const fileUrl = await uploadToBlobStorage(
        processedContent,
        processedFilename,
        processedMimeType,
        fileHash,
        companyId  // Pass tenant ID for blob organization
      );

      // Create WorkflowDocument record
      const workflowDoc = await WorkflowDocument.create({
        tenantId: companyId, // Using companyId as tenantId for now
        workflowType: documentType,
        status: 'RECEIVED',
        source: 'EMAIL',
        originalFileUrl: fileUrl,
        normalizedFileUrl: fileUrl, // For now, same as original
        fileName: processedFilename,
        fileSize: processedContent.length,
        mimeType: processedMimeType,
        hashSha256: fileHash,
        receivedAt: job.receivedAt,
        metadata: {
          from: job.from,
          to: job.to,
          subject: job.subject,
          messageId: job.messageId,
          recipients: [job.to], // Array of recipients
        },
      });

      logger.info(`Created workflow document ${workflowDoc._id} from email attachment`);

      // Queue document for OCR processing
      await documentQueue.add('process-document' as any, {
        documentId: workflowDoc._id.toString(),
        filePath: fileUrl,
        workflowType: documentType,
      });

      logger.info(`Queued workflow document ${workflowDoc._id} for processing`);
    } catch (error) {
      logger.error(`Error processing attachment ${attachment.filename}:`, error);
      throw error;
    }
  }
}

/**
 * Process email body as text document if no attachments
 */
async function processEmailBody(
  job: EmailIngestionJob,
  documentType: DocumentType,
  companyId: string
): Promise<void> {
  if (!job.body || job.body.trim().length === 0) {
    logger.warn(`Empty email body in ${job.messageId}`);
    return;
  }

  try {
    // Create text document from email body
    const fileUrl = `/uploads/${uuidv4()}-email-body.txt`;
    
    const document = await DocumentModel.create({
      title: `Email: ${job.subject}`,
      description: `Email body from ${job.from}`,
      project: companyId,
      uploadedBy: companyId,
      fileUrl,
      fileName: 'email-body.txt',
      fileSize: job.body.length,
      mimeType: 'text/plain',
      status: 'pending',
      metadata: {
        from: job.from,
        to: job.to,
        subject: job.subject,
        bodyContent: job.body,
      },
    });

    logger.info(`Created document ${document._id} from email body`);

    // Queue for processing
    await documentQueue.add('process-document' as any, {
      documentId: document._id.toString(),
      filePath: fileUrl,
      workflowType: documentType,
    });
  } catch (error) {
    logger.error(`Error processing email body:`, error);
    throw error;
  }
}

// Worker for email ingestion
export const emailWorker = new Worker<EmailIngestionJob>(
  'email-ingestion',
  async (job: Job<EmailIngestionJob>) => {
    const { from, to, subject, attachments } = job.data;

    logger.info(`Processing email from ${from} to ${to}: ${subject}`);

    try {
      // Determine document type based on recipient
      const documentType = determineDocumentType(to);
      logger.info(`Classified as document type: ${documentType}`);

      // Extract tenant/company ID from email address
      const tenantId = extractTenantIdFromEmail(to) || 'default-tenant';
      logger.info(`Email tenant ID: ${tenantId}`);

      // Process attachments
      if (attachments && attachments.length > 0) {
        await processAttachments(job.data, documentType, tenantId);
      } else {
        // Process email body if no attachments
        await processEmailBody(job.data, documentType, tenantId);
      }

      logger.info(`Successfully processed email ${job.data.messageId}`);

      return {
        status: 'success',
        documentType,
        attachmentsProcessed: attachments?.length || 0,
      };
    } catch (error) {
      logger.error(`Error processing email ${job.data.messageId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 60000, // 10 emails per minute
    },
  }
);

// Error handling
emailWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Email ingestion job ${job.id} failed:`, err);
  }
});

emailWorker.on('completed', (job) => {
  logger.info(`Email ingestion job ${job.id} completed`);
});

export default emailQueue;
