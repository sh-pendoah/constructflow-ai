import 'dotenv/config';
import { Worker } from 'bullmq';
import { redisConnection } from './config/redis';
import { logger } from './config/logger';
// import { processEmailJob } from './workers/email-worker'; // To be implemented
// import { processOCRJob } from './workers/ocr-worker';     // To be implemented

logger.info('Starting Worker Service...');

// Example Worker: Email Processing
const emailWorker = new Worker('email-queue', async (job) => {
  logger.info(`Processing email job ${job.id}`);
  // await processEmailJob(job);
  return { processed: true };
}, { connection: redisConnection });

emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed!`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email job ${job?.id} failed with ${err.message}`);
});

// Example Worker: OCR Processing
const ocrWorker = new Worker('ocr-queue', async (job) => {
  logger.info(`Processing OCR job ${job.id}`);
  // await processOCRJob(job);
  return { processed: true };
}, { connection: redisConnection });

ocrWorker.on('completed', (job) => {
  logger.info(`OCR job ${job.id} completed!`);
});

ocrWorker.on('failed', (job, err) => {
  logger.error(`OCR job ${job?.id} failed with ${err.message}`);
});

logger.info('Worker Service is running and listening for jobs...');
