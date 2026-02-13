import { Queue, Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { redisConnection } from '../config/redis';
import { logger } from '../config/logger';
import { WorkflowDocument } from '../models/WorkflowDocument';
import { ReviewQueueItem } from '../models/ReviewQueueItem';
import { ocrService } from './ocrService';
import { wcCodeSuggestionEngine } from './wcCodeSuggestionEngine';
import { rulesEngine, determineRoutingDecision } from './rulesEngine';
import { duplicateDetectionService } from './duplicateDetectionService';
import { createAuditLog, AUDIT_EVENTS } from './auditLoggingService';
import { v4 as uuidv4 } from 'uuid';

export interface DocumentProcessingJob {
  documentId: string;
  filePath: string;
  workflowType: 'INVOICE' | 'DAILY_LOG' | 'COMPLIANCE' | 'OTHER';
}

// Create queue for document processing
export const documentQueue = new Queue<DocumentProcessingJob>('document-processing', {
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

// Worker for processing documents
export const documentWorker = new Worker<DocumentProcessingJob>(
  'document-processing',
  async (job: Job<DocumentProcessingJob>) => {
    const { documentId, filePath, workflowType } = job.data;

    logger.info(`Processing document ${documentId} of type ${workflowType}`);

    try {
      // Get workflow document details
      const workflowDoc = await WorkflowDocument.findById(documentId);
      if (!workflowDoc) {
        throw new Error(`Workflow document ${documentId} not found`);
      }

      // Update status to processing
      await WorkflowDocument.findByIdAndUpdate(documentId, {
        status: 'PROCESSING',
        processedAt: new Date()
      });

      // Step 1: OCR Processing
      logger.info(`Running OCR on document ${documentId}`);
      const ocrResult = await ocrService.processDocument(filePath, workflowDoc.mimeType);
      logger.info(`OCR completed with confidence ${ocrResult.confidence}`);

      // Step 2: Extract structured data using LLM
      let extractedData: any = {};
      let boundingBoxes: any[] = [];

      try {
        switch (workflowType) {
          case 'INVOICE':
            const invoiceData = await ocrService.extractInvoiceData(ocrResult);
            extractedData = invoiceData;
            break;
          case 'DAILY_LOG':
            const dailyLogData = await ocrService.extractDailyLogData(ocrResult);
            extractedData = dailyLogData;
            break;
          case 'COMPLIANCE':
            const complianceData = await ocrService.extractComplianceData(ocrResult);
            extractedData = complianceData;
            break;
          default:
            extractedData = { confidence: ocrResult.confidence };
        }

        // Store bounding boxes if available
        boundingBoxes = ocrResult.blocks?.map(block => ({
          field: 'unknown', // Will be populated by LLM extraction
          text: block.text,
          x: block.boundingBox?.x || 0,
          y: block.boundingBox?.y || 0,
          width: block.boundingBox?.width || 0,
          height: block.boundingBox?.height || 0,
          confidence: block.confidence
        })) || [];

      } catch (extractionError) {
        logger.error(`Extraction failed for ${workflowType}:`, extractionError);
        extractedData = { confidence: ocrResult.confidence, extractionError: true };
      }

      // Step 3: Create Extraction record
      const { Extraction } = await import('../models/Extraction');
      const extraction = await Extraction.create({
        documentId: workflowDoc._id,
        version: 1,
        ocrProvider: ocrService.ocrProvider.name,
        ocrRawJson: ocrResult as unknown as Record<string, unknown>,
        llmProvider: ocrService.llmProvider.name,
        llmRawJson: extractedData,
        extractedData,
        boundingBoxes,
        confidenceScore: extractedData.confidence || ocrResult.confidence,
        fieldConfidences: {}, // TODO: Extract from LLM response
        createdAt: new Date()
      });

      // Step 4: Run rules engine evaluation
      const routingDecision = await evaluateWorkflowRules(
        workflowDoc,
        extractedData,
        ocrResult.confidence
      );

      // Step 5: Handle routing decision
      if (routingDecision.recommendedAction === 'AUTO_APPROVE') {
        // Update workflow document status
        await WorkflowDocument.findByIdAndUpdate(documentId, {
          status: 'APPROVED'
        });

        // Create corresponding workflow record
        await createWorkflowRecord(workflowDoc, extractedData);

        await createAuditLog({
          tenantId: workflowDoc.tenantId,
          documentId: workflowDoc._id,
          eventType: AUDIT_EVENTS.REVIEW_ITEM_APPROVED,
          actor: 'SYSTEM',
          metadata: { autoApproved: true, confidence: ocrResult.confidence }
        });

      } else if (routingDecision.recommendedAction === 'REJECT') {
        // Update workflow document status
        await WorkflowDocument.findByIdAndUpdate(documentId, {
          status: 'REJECTED'
        });

        await createAuditLog({
          tenantId: workflowDoc.tenantId,
          documentId: workflowDoc._id,
          eventType: AUDIT_EVENTS.REVIEW_ITEM_REJECTED,
          actor: 'SYSTEM',
          metadata: { autoRejected: true, exceptions: routingDecision.allExceptions }
        });

      } else {
        // Create review queue item
        const normalizedType: 'invoice' | 'daily-log' | 'compliance' | 'other' =
          workflowType === 'INVOICE' ? 'invoice' :
          workflowType === 'DAILY_LOG' ? 'daily-log' :
          workflowType === 'COMPLIANCE' ? 'compliance' : 'other';

        const queueItem = await ReviewQueueItem.createFromDocument(
          normalizedType,
          workflowDoc._id,
          workflowDoc.tenantId,
          extractedData,
          ocrResult.confidence
        );

        // Add exceptions to queue item
        if (routingDecision.allExceptions.length > 0) {
          for (const exception of routingDecision.allExceptions) {
            queueItem.addException(
              exception.type,
              exception.severity,
              exception.message,
              exception.field
            );
          }
          await queueItem.save();
        }

        // Set priority based on routing decision
        queueItem.priority = routingDecision.priority;
        await queueItem.save();

        await createAuditLog({
          tenantId: workflowDoc.tenantId,
          documentId: workflowDoc._id,
          reviewItemId: queueItem._id,
          eventType: AUDIT_EVENTS.REVIEW_ITEM_CREATED,
          actor: 'SYSTEM',
          metadata: {
            priority: routingDecision.priority,
            exceptionCount: routingDecision.allExceptions.length
          }
        });
      }

      // Update workflow document status to completed
      await WorkflowDocument.findByIdAndUpdate(documentId, {
        status: routingDecision.recommendedAction === 'AUTO_APPROVE' ? 'APPROVED' :
               routingDecision.recommendedAction === 'REJECT' ? 'REJECTED' : 'NEEDS_REVIEW'
      });

      logger.info(`Document ${documentId} processing completed: ${routingDecision.recommendedAction}`);

      return {
        success: true,
        documentId,
        workflowType,
        action: routingDecision.recommendedAction,
        confidence: ocrResult.confidence
      };

    } catch (error) {
      logger.error(`Error processing document ${documentId}:`, error);

      // Mark document as failed
      await WorkflowDocument.findByIdAndUpdate(documentId, {
        status: 'FAILED'
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000, // 10 documents per second
    },
  }
);

// Error handling
documentWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Document processing job ${job.id} failed:`, err);
  }
});

documentWorker.on('completed', (job) => {
  logger.info(`Document processing job ${job.id} completed`);
});

export default documentQueue;

/**
 * Evaluate workflow rules for routing decision
 */
async function evaluateWorkflowRules(
  workflowDoc: any,
  extractedData: any,
  ocrConfidence: number
): Promise<any> {
  try {
    // Prepare data for rules evaluation
    const rulesResults: any = {};

    // Run appropriate rules based on workflow type
    switch (workflowDoc.workflowType) {
      case 'INVOICE':
        // Check for duplicates
        const duplicateCheck = await checkInvoiceDuplicate(extractedData, workflowDoc.tenantId);

        // Evaluate invoice rules
        rulesResults.invoiceRules = rulesEngine.evaluateInvoiceRules({
          invoiceNumber: extractedData.invoiceNumber?.value,
          vendor: extractedData.vendor?.value,
          vendorId: null, // TODO: Look up vendor ID
          amount: extractedData.total?.value ? parseFloat(extractedData.total.value) : undefined,
          date: extractedData.date?.value ? new Date(extractedData.date.value) : undefined,
          ocrConfidence,
          isDuplicate: duplicateCheck.isDuplicate,
          approvalThreshold: 5000, // TODO: Get from tenant settings
        });
        rulesResults.duplicateCheck = duplicateCheck;
        break;

      case 'DAILY_LOG':
        rulesResults.dailyLogRules = rulesEngine.evaluateDailyLogRules({
          workers: extractedData.workers?.map((w: any) => ({
            name: w.name,
            workerId: null, // TODO: Look up worker ID
            hours: w.hours
          })),
          date: extractedData.date?.value ? new Date(extractedData.date.value) : undefined,
          ocrConfidence,
          wcCodeSuggestions: [], // TODO: Get suggestions from WC engine
        });
        break;

      case 'COMPLIANCE':
        rulesResults.complianceRules = rulesEngine.evaluateComplianceRules({
          contractorName: extractedData.vendor?.value,
          contractorId: null, // TODO: Look up contractor ID
          expirationDate: extractedData.expirationDate?.value ? new Date(extractedData.expirationDate.value) : undefined,
          ocrConfidence,
        });
        break;
    }

    // Evaluate classification confidence
    rulesResults.classificationRules = rulesEngine.evaluateClassificationRules({
      ocrText: '', // TODO: Pass OCR text
      fileName: workflowDoc.fileName,
      emailSubject: workflowDoc.metadata?.subject,
      emailBody: workflowDoc.metadata?.bodyPreview,
      workflowType: workflowDoc.workflowType,
    });

    // Determine routing decision
    return rulesEngine.determineRoutingDecision(rulesResults);

  } catch (error) {
    logger.error('Error evaluating workflow rules:', error);
    // Default to review queue on error
    return {
      needsReview: true,
      priority: 'high' as const,
      allExceptions: [{
        type: 'SYSTEM_ERROR',
        severity: 'high' as const,
        message: 'Error evaluating workflow rules',
        field: 'system'
      }],
      recommendedAction: 'REVIEW_QUEUE' as const
    };
  }
}

/**
 * Check for invoice duplicates
 */
async function checkInvoiceDuplicate(extractedData: any, tenantId: mongoose.Types.ObjectId): Promise<{ isDuplicate: boolean; score: number }> {
  try {
    if (!extractedData.invoiceNumber?.value || !extractedData.vendor?.value) {
      return { isDuplicate: false, score: 0 };
    }

    const duplicateResult = await duplicateDetectionService.checkInvoiceDuplicate(
      extractedData.invoiceNumber.value,
      extractedData.vendor.value,
      extractedData.total?.value ? parseFloat(extractedData.total.value) : 0,
      extractedData.date?.value ? new Date(extractedData.date.value) : new Date(),
      tenantId
    );

    return {
      isDuplicate: duplicateResult.isDuplicate,
      score: duplicateResult.duplicateScore
    };
  } catch (error) {
    logger.error('Error checking for duplicates:', error);
    return { isDuplicate: false, score: 0 };
  }
}

/**
 * Create corresponding workflow record (Invoice, DailyLog, ComplianceDoc)
 */
async function createWorkflowRecord(workflowDoc: any, extractedData: any): Promise<void> {
  try {
    switch (workflowDoc.workflowType) {
      case 'INVOICE':
        const Invoice = mongoose.model('Invoice');
        await Invoice.create({
          company: workflowDoc.tenantId,
          invoiceNumber: extractedData.invoiceNumber?.value,
          vendor: extractedData.vendor?.value,
          amount: extractedData.total?.value ? parseFloat(extractedData.total.value) : undefined,
          invoiceDate: extractedData.date?.value ? new Date(extractedData.date.value) : undefined,
          dueDate: extractedData.dueDate?.value ? new Date(extractedData.dueDate.value) : undefined,
          status: 'approved',
          documentId: workflowDoc._id,
        });
        break;

      case 'DAILY_LOG':
        const DailyLog = mongoose.model('DailyLog');
        await DailyLog.create({
          company: workflowDoc.tenantId,
          date: extractedData.date?.value ? new Date(extractedData.date.value) : undefined,
          job: null, // TODO: Look up job
          workers: extractedData.workers?.map((w: any) => ({
            name: w.name,
            hours: w.hours,
            task: w.task,
          })) || [],
          workPerformed: extractedData.workPerformed?.value || '',
          status: 'approved',
          documentId: workflowDoc._id,
        });
        break;

      case 'COMPLIANCE':
        const ComplianceDoc = mongoose.model('ComplianceDoc');
        await ComplianceDoc.create({
          company: workflowDoc.tenantId,
          type: extractedData.documentType?.value || 'COI',
          contractorName: extractedData.vendor?.value,
          expirationDate: extractedData.expirationDate?.value ? new Date(extractedData.expirationDate.value) : undefined,
          status: 'ACTIVE',
          documentUrl: workflowDoc.originalFileUrl,
          documentId: workflowDoc._id,
        });
        break;
    }

    logger.info(`Created ${workflowDoc.workflowType} record for document ${workflowDoc._id}`);
  } catch (error) {
    logger.error(`Error creating workflow record for ${workflowDoc.workflowType}:`, error);
    throw error;
  }
}

logger.info('Document processing queue and worker initialized');
