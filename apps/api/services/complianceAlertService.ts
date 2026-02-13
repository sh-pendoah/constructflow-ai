import { logger } from '../config/logger';
import { ComplianceDoc } from '../models/ComplianceDoc';
import { logComplianceAlert } from './auditLoggingService';
import mongoose from 'mongoose';

/**
 * Compliance Expiration Alert Service
 * Implements 30-day, 15-day, and 7-day alert windows
 */

export interface ComplianceAlertWindow {
  days: number;
  alertType: '30_DAY' | '15_DAY' | '7_DAY' | 'EXPIRED';
}

const ALERT_WINDOWS: ComplianceAlertWindow[] = [
  { days: 30, alertType: '30_DAY' },
  { days: 15, alertType: '15_DAY' },
  { days: 7, alertType: '7_DAY' },
];

/**
 * Get compliance documents expiring within specified alert windows
 */
export async function getExpiringCompliance(
  tenantId: mongoose.Types.ObjectId,
  alertWindow: ComplianceAlertWindow
): Promise<any[]> {
  const now = new Date();
  const targetDate = new Date(now.getTime() + alertWindow.days * 24 * 60 * 60 * 1000);
  
  // Find documents expiring within the target window (±1 day buffer)
  const startDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000);
  const endDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

  // Additional guard: skip if alert was sent within the last 24 hours
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const docs = await ComplianceDoc.find({
    tenantId,
    expirationDate: {
      $gte: startDate,
      $lte: endDate,
    },
    status: { $nin: ['EXPIRED', 'INACTIVE'] },
    // Check if alert not already sent for this window - consistent with scheduler
    $and: [
      {
        $or: [
          { [`alerts.${alertWindow.alertType}`]: { $exists: false } },
          { [`alerts.${alertWindow.alertType}.sentAt`]: { $exists: false } }
        ]
      },
      // Skip if sent within last 24 hours
      {
        $or: [
          { [`alerts.${alertWindow.alertType}.sentAt`]: { $exists: false } },
          { [`alerts.${alertWindow.alertType}.sentAt`]: { $lt: twentyFourHoursAgo } }
        ]
      }
    ]
  });

  return docs;
}

/**
 * Get expired compliance documents
 */
export async function getExpiredCompliance(
  tenantId: mongoose.Types.ObjectId
): Promise<any[]> {
  const now = new Date();

  const docs = await ComplianceDoc.find({
    tenantId,
    expirationDate: { $lt: now },
    status: { $ne: 'EXPIRED' }, // Not already marked as expired
  });

  return docs;
}

/**
 * Send alert for expiring compliance document
 */
export async function sendExpirationAlert(
  doc: any,
  alertType: '30_DAY' | '15_DAY' | '7_DAY',
  daysUntilExpiry: number
): Promise<void> {
  try {
    // TODO: Implement actual email sending via emailService
    // For now, just log the alert
    
    logger.info('Compliance expiration alert triggered', {
      docId: doc._id,
      contractor: doc.contractorName,
      expirationDate: doc.expirationDate,
      alertType,
      daysUntilExpiry,
    });

    // Mark alert as sent with timestamp for idempotency
    const alertKey = `alerts.${alertType}`;
    await ComplianceDoc.findByIdAndUpdate(doc._id, {
      $set: {
        [`${alertKey}.sentAt`]: new Date(),
        [`${alertKey}.recipient`]: doc.contractorName || 'admin',
      },
    });

    // Log to audit trail
    await logComplianceAlert(
      doc.tenantId,
      doc._id,
      alertType,
      daysUntilExpiry
    );
  } catch (error) {
    logger.error('Failed to send compliance alert', {
      error,
      docId: doc._id,
      alertType,
    });
  }
}

/**
 * Update status to EXPIRED for documents past expiration
 */
export async function markAsExpired(doc: any): Promise<void> {
  try {
    await ComplianceDoc.findByIdAndUpdate(doc._id, {
      $set: {
        status: 'EXPIRED',
        lastStatusChange: new Date(),
      },
    });

    logger.info('Compliance document marked as expired', {
      docId: doc._id,
      contractor: doc.contractorName,
      expirationDate: doc.expirationDate,
    });

    // Log to audit trail
    await logComplianceAlert(
      doc.tenantId,
      doc._id,
      'EXPIRED',
      0
    );
  } catch (error) {
    logger.error('Failed to mark compliance as expired', {
      error,
      docId: doc._id,
    });
  }
}

/**
 * Update status to EXPIRING for documents approaching expiration
 */
export async function markAsExpiring(doc: any): Promise<void> {
  try {
    const currentStatus = doc.status;
    
    // Only update if not already EXPIRING
    if (currentStatus !== 'EXPIRING') {
      await ComplianceDoc.findByIdAndUpdate(doc._id, {
        $set: {
          status: 'EXPIRING',
          lastStatusChange: new Date(),
        },
      });

      logger.info('Compliance document status updated to EXPIRING', {
        docId: doc._id,
        contractor: doc.contractorName,
        previousStatus: currentStatus,
      });
    }
  } catch (error) {
    logger.error('Failed to update compliance status', {
      error,
      docId: doc._id,
    });
  }
}

/**
 * Process all compliance alerts for a tenant
 * Should be called daily by scheduler
 */
export async function processComplianceAlerts(
  tenantId: mongoose.Types.ObjectId
): Promise<{
  alerts30Day: number;
  alerts15Day: number;
  alerts7Day: number;
  expired: number;
}> {
  const results = {
    alerts30Day: 0,
    alerts15Day: 0,
    alerts7Day: 0,
    expired: 0,
  };

  try {
    // Process each alert window
    for (const window of ALERT_WINDOWS) {
      const expiringDocs = await getExpiringCompliance(tenantId, window);
      
      for (const doc of expiringDocs) {
        const alertType = window.alertType as '30_DAY' | '15_DAY' | '7_DAY';
        await sendExpirationAlert(doc, alertType, window.days);
        await markAsExpiring(doc);
        
        if (window.alertType === '30_DAY') results.alerts30Day++;
        if (window.alertType === '15_DAY') results.alerts15Day++;
        if (window.alertType === '7_DAY') results.alerts7Day++;
      }
    }

    // Process expired documents
    const expiredDocs = await getExpiredCompliance(tenantId);
    for (const doc of expiredDocs) {
      await markAsExpired(doc);
      results.expired++;
    }

    logger.info('Compliance alert processing complete', {
      tenantId,
      ...results,
    });

    return results;
  } catch (error) {
    logger.error('Error processing compliance alerts', {
      error,
      tenantId,
    });
    throw error;
  }
}

/**
 * Get compliance summary for a tenant
 * Used for admin portal and weekly summaries
 */
export async function getComplianceSummary(
  tenantId: mongoose.Types.ObjectId
): Promise<{
  active: number;
  expiring: number;
  expired: number;
  expiringNext30Days: number;
  expiringNext15Days: number;
  expiringNext7Days: number;
}> {
  try {
    const now = new Date();
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const next15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      active,
      expiring,
      expired,
      expiringNext30Days,
      expiringNext15Days,
      expiringNext7Days,
    ] = await Promise.all([
      ComplianceDoc.countDocuments({ tenantId, status: 'ACTIVE' }),
      ComplianceDoc.countDocuments({ tenantId, status: 'EXPIRING' }),
      ComplianceDoc.countDocuments({ tenantId, status: 'EXPIRED' }),
      ComplianceDoc.countDocuments({
        tenantId,
        expirationDate: { $lte: next30Days, $gt: now },
        status: { $ne: 'EXPIRED' },
      }),
      ComplianceDoc.countDocuments({
        tenantId,
        expirationDate: { $lte: next15Days, $gt: now },
        status: { $ne: 'EXPIRED' },
      }),
      ComplianceDoc.countDocuments({
        tenantId,
        expirationDate: { $lte: next7Days, $gt: now },
        status: { $ne: 'EXPIRED' },
      }),
    ]);

    return {
      active,
      expiring,
      expired,
      expiringNext30Days,
      expiringNext15Days,
      expiringNext7Days,
    };
  } catch (error) {
    logger.error('Error getting compliance summary', { error, tenantId });
    throw error;
  }
}
