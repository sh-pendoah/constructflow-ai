import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { ComplianceDoc } from '../models/ComplianceDoc';
import { COIVendor } from '../models/COIVendor';
import { User } from '../models/User';
import { sendExpirationAlert, sendCOIExpirationAlert } from './emailService';

// Create queue for scheduled compliance checks
export const complianceQueue = new Queue('compliance-checks', {
  connection: redis,
});

// Worker for compliance checks
export const complianceWorker = new Worker(
  'compliance-checks',
  async (job: Job) => {
    logger.info(`Running compliance check: ${job.name}`);

    try {
      await checkExpiringDocuments();
      await checkExpiringCOIs();
      await updateExpiredStatuses();
      
      logger.info('Compliance check completed');
      return { success: true };
    } catch (error) {
      logger.error('Compliance check error:', error);
      throw error;
    }
  },
  {
    connection: redis,
  }
);

// Check for expiring compliance documents
async function checkExpiringDocuments() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringDocs = await ComplianceDoc.find({
    expirationDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
    status: { $in: ['valid', 'pending'] },
    $or: [{ alertSent: { $exists: false } }, { alertSent: false }],
  }).populate('company', 'email name');

  for (const doc of expiringDocs) {
    try {
      // Update status to expiring-soon
      await ComplianceDoc.findByIdAndUpdate(doc._id, {
        status: 'expiring-soon',
        alertSent: true,
      });

      // Send alert email
      const user = doc.company as any;
      if (user.email) {
        await sendExpirationAlert(user.email, doc.title, doc.expirationDate!);
        logger.info(`Expiration alert sent for document ${doc._id}`);
      }
    } catch (error) {
      logger.error(`Failed to send alert for document ${doc._id}:`, error);
    }
  }

  logger.info(`Checked ${expiringDocs.length} expiring documents`);
}

// Check for expiring COI vendors
async function checkExpiringCOIs() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringVendors = await COIVendor.find({
    expirationDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
    status: 'valid',
  }).populate('company', 'email name');

  for (const vendor of expiringVendors) {
    try {
      // Update status to pending (needs renewal)
      await COIVendor.findByIdAndUpdate(vendor._id, { status: 'pending' });

      // Send alert email
      const user = vendor.company as any;
      if (user.email) {
        await sendCOIExpirationAlert(user.email, vendor.name, vendor.expirationDate!);
        logger.info(`COI expiration alert sent for vendor ${vendor._id}`);
      }
    } catch (error) {
      logger.error(`Failed to send alert for COI vendor ${vendor._id}:`, error);
    }
  }

  logger.info(`Checked ${expiringVendors.length} expiring COI vendors`);
}

// Update expired statuses
async function updateExpiredStatuses() {
  const now = new Date();

  // Update expired compliance documents
  const expiredDocs = await ComplianceDoc.updateMany(
    {
      expirationDate: { $lt: now },
      status: { $ne: 'expired' },
    },
    { status: 'expired' }
  );

  // Update expired COI vendors
  const expiredVendors = await COIVendor.updateMany(
    {
      expirationDate: { $lt: now },
      status: { $ne: 'expired' },
    },
    { status: 'expired' }
  );

  logger.info(
    `Updated ${expiredDocs.modifiedCount} expired documents and ${expiredVendors.modifiedCount} expired vendors`
  );
}

// Schedule daily compliance checks at 9 AM
export async function scheduleComplianceChecks() {
  // Run immediately on startup
  await complianceQueue.add(
    'daily-check',
    {},
    {
      repeat: {
        pattern: '0 9 * * *', // Every day at 9 AM
      },
    }
  );

  logger.info('Scheduled daily compliance checks');
}

// Worker event handlers
complianceWorker.on('completed', (job) => {
  logger.info(`Compliance check job ${job.id} completed`);
});

complianceWorker.on('failed', (job, err) => {
  logger.error(`Compliance check job ${job?.id} failed:`, err);
});

logger.info('Compliance check queue and worker initialized');
