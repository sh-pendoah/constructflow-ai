/**
 * Worklight Worker Service
 * 
 * Independent BullMQ consumer service responsible for:
 * - Email attachment extraction and normalization
 * - OCR execution (Azure AI Document Intelligence)
 * - LLM extraction and structured output validation
 * - Rules engine evaluation and exception assignment
 * - Auto-approve or create review items
 * - Export generation jobs
 * 
 * This service runs independently and processes jobs from Redis queues.
 */

import dotenv from 'dotenv';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import winston from 'winston';
import http from 'http';

// Load environment variables
dotenv.config();

// Logger setup
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Redis connection config for BullMQ
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

// Redis connection
const redis = new IORedis(redisConnection);

// MongoDB connection
async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/worklighter');
    logger.info('Worker: MongoDB connected successfully');
  } catch (error) {
    logger.error('Worker: MongoDB connection error:', error);
    process.exit(1);
  }
}

// Job processors
interface DocumentProcessingJob {
  documentId: string;
  filePath: string;
  workflowType: 'INVOICE' | 'DAILY_LOG' | 'COMPLIANCE';
}

interface EmailIngestionJob {
  emailId: string;
  from: string;
  to: string[];
  subject: string;
  attachments: Array<{ filename: string; path: string; contentType: string }>;
}

interface ExportGenerationJob {
  exportType: 'invoice' | 'payroll' | 'compliance';
  tenantId: string;
  filters: Record<string, unknown>;
}

// Document Processing Worker
const documentWorker = new Worker<DocumentProcessingJob>(
  'document-processing',
  async (job: Job<DocumentProcessingJob>) => {
    logger.info(`Processing document job ${job.id}`, { data: job.data });
    
    const { documentId, filePath, workflowType } = job.data;
    
    try {
      // TODO: Implement actual processing
      // 1. OCR execution
      // 2. LLM extraction
      // 3. Rules engine evaluation
      // 4. Create review item or auto-approve
      
      await job.updateProgress(25);
      logger.info(`Document ${documentId}: OCR started`);
      
      await job.updateProgress(50);
      logger.info(`Document ${documentId}: LLM extraction started`);
      
      await job.updateProgress(75);
      logger.info(`Document ${documentId}: Rules evaluation started`);
      
      await job.updateProgress(100);
      logger.info(`Document ${documentId}: Processing complete`);
      
      return { success: true, documentId, workflowType };
    } catch (error) {
      logger.error(`Document ${documentId} processing failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

// Email Ingestion Worker
const emailWorker = new Worker<EmailIngestionJob>(
  'email-ingestion',
  async (job: Job<EmailIngestionJob>) => {
    logger.info(`Processing email job ${job.id}`, { data: job.data });
    
    const { emailId, from, to, subject, attachments } = job.data;
    
    try {
      // TODO: Implement actual processing
      // 1. Extract attachments
      // 2. Normalize to PDF
      // 3. Generate SHA256 hash
      // 4. Detect duplicates
      // 5. Store in blob storage
      // 6. Create WorkflowDocument record
      // 7. Enqueue document processing job
      
      await job.updateProgress(50);
      logger.info(`Email ${emailId}: Attachments extracted`);
      
      await job.updateProgress(100);
      logger.info(`Email ${emailId}: Processing complete`);
      
      return { success: true, emailId, attachmentCount: attachments.length };
    } catch (error) {
      logger.error(`Email ${emailId} processing failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 60000, // 10 per minute
    },
  }
);

// Export Generation Worker
const exportWorker = new Worker<ExportGenerationJob>(
  'export-generation',
  async (job: Job<ExportGenerationJob>) => {
    logger.info(`Generating export job ${job.id}`, { data: job.data });
    
    const { exportType, tenantId, filters } = job.data;
    
    try {
      // TODO: Implement actual export generation
      // 1. Query data based on type and filters
      // 2. Generate CSV/JSON
      // 3. Store in blob storage
      // 4. Create export record in DB
      
      await job.updateProgress(50);
      logger.info(`Export ${exportType}: Data queried`);
      
      await job.updateProgress(100);
      logger.info(`Export ${exportType}: Generation complete`);
      
      return { success: true, exportType, tenantId };
    } catch (error) {
      logger.error(`Export ${exportType} generation failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

// Worker event handlers
function setupWorkerEvents(worker: Worker, workerName: string) {
  worker.on('completed', (job) => {
    logger.info(`${workerName}: Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`${workerName}: Job ${job?.id} failed`, { error: err.message });
  });

  worker.on('error', (err) => {
    logger.error(`${workerName}: Worker error`, { error: err.message });
  });
}

setupWorkerEvents(documentWorker, 'DocumentWorker');
setupWorkerEvents(emailWorker, 'EmailWorker');
setupWorkerEvents(exportWorker, 'ExportWorker');

// Graceful shutdown
const shutdown = async () => {
  logger.info('Worker: Shutting down gracefully...');
  
  await documentWorker.close();
  await emailWorker.close();
  await exportWorker.close();
  await redis.quit();
  await mongoose.connection.close();
  
  logger.info('Worker: Shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Health check endpoint
const healthServer = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const redisStatus = redis.status === 'ready' ? 'connected' : 'disconnected';
    const healthy = mongoStatus === 'connected' && redisStatus === 'connected';
    
    res.writeHead(healthy ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: healthy ? 'healthy' : 'degraded',
      service: 'worker',
      timestamp: new Date().toISOString(),
      dependencies: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
      workers: {
        documentWorker: 'active',
        emailWorker: 'active',
        exportWorker: 'active',
      },
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// Start worker
async function start() {
  logger.info('Worker: Starting Worklight Worker Service...');
  
  await connectDatabase();
  
  logger.info('Worker: All workers initialized and ready');
  logger.info(`Worker: Document Processing - Concurrency: ${process.env.WORKER_CONCURRENCY || 5}`);
  logger.info('Worker: Email Ingestion - Concurrency: 3');
  logger.info('Worker: Export Generation - Concurrency: 2');
  
  // Start health check server
  const healthPort = parseInt(process.env.HEALTH_PORT || '3002');
  healthServer.listen(healthPort, () => {
    logger.info(`Worker: Health check endpoint available at http://localhost:${healthPort}/health`);
  });
}

start().catch((error) => {
  logger.error('Worker: Failed to start', error);
  process.exit(1);
});
