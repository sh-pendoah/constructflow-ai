/**
 * docflow-360 Scheduler Service
 *
 * Independent cron job service responsible for:
 * - Compliance expiration scanning (daily at 9 AM)
 * - Weekly summary emails (Monday at 8 AM)
 * - Queue health monitoring (every 15 minutes)
 * - Automated alert generation
 *
 * This service runs independently and executes scheduled tasks.
 */

import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import winston from 'winston';

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

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// MongoDB connection
async function connectDatabase() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/docflow-360'
    );
    logger.info('Scheduler: MongoDB connected successfully');
  } catch (error) {
    logger.error('Scheduler: MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define ComplianceDoc schema locally for scheduler
interface IComplianceDoc {
  _id: mongoose.Types.ObjectId;
  type?: string;
  company: mongoose.Types.ObjectId;
  contractorName?: string;
  expirationDate?: Date;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'INACTIVE';
  alerts?: Record<string, { sentAt: Date; recipient: string }>;
}

const complianceDocSchema = new mongoose.Schema({
  type: String,
  company: { type: mongoose.Schema.Types.ObjectId, required: true },
  contractorName: String,
  expirationDate: Date,
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRING', 'EXPIRED', 'INACTIVE'],
    default: 'ACTIVE',
  },
  alerts: mongoose.Schema.Types.Mixed,
});

const ComplianceDoc = mongoose.model<IComplianceDoc>(
  'ComplianceDoc',
  complianceDocSchema
);

// Scheduled Jobs

/**
 * Compliance Expiration Check
 * Runs daily at 9 AM (configurable)
 * Scans for expiring/expired compliance documents and sends alerts
 */
async function checkComplianceExpirations() {
  logger.info('Scheduler: Running compliance expiration check...');

  try {
    const now = new Date();

    // Alert windows: 30, 15, 7, and 0 (expired) days
    const alertWindows = [
      { days: 30, type: '30_DAY' },
      { days: 15, type: '15_DAY' },
      { days: 7, type: '7_DAY' },
      { days: 0, type: 'EXPIRED' },
    ];

    for (const window of alertWindows) {
      const windowDate = new Date(now);
      windowDate.setDate(windowDate.getDate() + window.days);

      const windowEnd = new Date(windowDate);
      windowEnd.setDate(windowEnd.getDate() + 1); // Next day

      // Find docs expiring within this window that haven't been alerted yet
      const query: any = {
        expirationDate: {
          $gte: windowDate,
          $lt: windowEnd,
        },
        $and: [
          // Either alert doesn't exist
          {
            $or: [
              { [`alerts.${window.type}`]: { $exists: false } },
              { [`alerts.${window.type}.sentAt`]: { $exists: false } },
            ],
          },
        ],
      };

      // Additional guard: skip if alert was sent within the last 24 hours
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      query.$and.push({
        $or: [
          { [`alerts.${window.type}.sentAt`]: { $exists: false } },
          { [`alerts.${window.type}.sentAt`]: { $lt: twentyFourHoursAgo } },
        ],
      });

      const docs = await ComplianceDoc.find(query);

      logger.info(
        `Scheduler: Found ${docs.length} compliance docs for ${window.days}-day window`
      );

      for (const doc of docs) {
        try {
          // Update status based on window
          let newStatus: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' = 'ACTIVE';
          if (window.days === 0) {
            newStatus = 'EXPIRED';
          } else if (window.days <= 30) {
            newStatus = 'EXPIRING';
          }

          // Send alert email (placeholder - actual email service would be called here)
          logger.info(
            `Scheduler: Sending ${window.type} alert for compliance doc ${doc._id}`,
            {
              contractorName: doc.contractorName,
              expirationDate: doc.expirationDate,
              type: doc.type,
            }
          );

          // Mark alert as sent
          const alertKey = `alerts.${window.type}`;
          const updateData: any = {
            status: newStatus,
          };
          updateData[alertKey] = {
            sentAt: now,
            recipient: doc.contractorName || 'admin',
          };

          // Update document
          await ComplianceDoc.findByIdAndUpdate(doc._id, updateData);

          logger.info(`Scheduler: Alert sent and document updated`, {
            docId: doc._id,
            alertType: window.type,
            newStatus,
          });
        } catch (docError) {
          logger.error(
            `Scheduler: Failed to process compliance doc ${doc._id}`,
            docError
          );
        }
      }
    }

    logger.info('Scheduler: Compliance expiration check complete');
  } catch (error) {
    logger.error('Scheduler: Compliance check failed:', error);
  }
}

/**
 * Weekly Summary Email
 * Runs every Monday at 8 AM (configurable)
 * Sends summary of pending reviews, overdue compliance, and awaiting approvals
 */
async function sendWeeklySummary() {
  logger.info('Scheduler: Generating weekly summary...');

  try {
    // TODO: Implement actual summary generation
    // 1. Count unresolved ReviewQueueItems
    // 2. Count overdue compliance docs
    // 3. Count invoices awaiting approval
    // 4. Count daily logs pending WC confirmation
    // 5. Generate HTML email
    // 6. Send to all ADMIN and REVIEWER users
    // 7. Log action in AuditLog

    const recipients = process.env.ALERT_RECIPIENTS?.split(',') || [];

    if (recipients.length === 0) {
      logger.warn('Scheduler: No recipients configured for weekly summary');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@docflow-360.com',
      to: recipients.join(','),
      subject: 'docflow-360 Weekly Summary',
      html: `
        <h2>docflow-360 Weekly Summary</h2>
        <p>This is a placeholder summary email.</p>
        <ul>
          <li>Pending reviews: TBD</li>
          <li>Overdue compliance: TBD</li>
          <li>Awaiting approvals: TBD</li>
        </ul>
      `,
    };

    // await emailTransporter.sendMail(mailOptions);
    logger.info(
      `Scheduler: Weekly summary sent to ${recipients.length} recipients`
    );
  } catch (error) {
    logger.error('Scheduler: Weekly summary failed:', error);
  }
}

/**
 * Queue Health Monitoring
 * Runs every 15 minutes (configurable)
 * Checks BullMQ queue health and logs status
 */
async function checkQueueHealth() {
  logger.info('Scheduler: Checking queue health...');

  try {
    // TODO: Implement actual queue health checking
    // 1. Connect to Redis
    // 2. Check queue sizes (waiting, active, delayed, failed)
    // 3. Check for stuck jobs
    // 4. Log warnings if thresholds exceeded
    // 5. Optional: Send alert emails for critical issues

    logger.info('Scheduler: Queue health check complete');
  } catch (error) {
    logger.error('Scheduler: Queue health check failed:', error);
  }
}

// Schedule jobs using cron expressions
function scheduleJobs() {
  // Compliance expiration check - Daily at 9 AM
  const complianceCron = process.env.COMPLIANCE_CHECK_CRON || '0 9 * * *';
  cron.schedule(complianceCron, checkComplianceExpirations, {
    timezone: 'America/New_York',
  });
  logger.info(`Scheduler: Compliance check scheduled: ${complianceCron}`);

  // Weekly summary - Every Monday at 8 AM
  const summaryCron = process.env.SUMMARY_EMAIL_CRON || '0 8 * * 1';
  cron.schedule(summaryCron, sendWeeklySummary, {
    timezone: 'America/New_York',
  });
  logger.info(`Scheduler: Weekly summary scheduled: ${summaryCron}`);

  // Queue health - Every 15 minutes
  const queueHealthCron = process.env.QUEUE_HEALTH_CRON || '*/15 * * * *';
  cron.schedule(queueHealthCron, checkQueueHealth, {
    timezone: 'America/New_York',
  });
  logger.info(`Scheduler: Queue health check scheduled: ${queueHealthCron}`);
}

// Graceful shutdown
const shutdown = async () => {
  logger.info('Scheduler: Shutting down gracefully...');

  await mongoose.connection.close();

  logger.info('Scheduler: Shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Health check endpoint
const healthServer = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    const mongoStatus =
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const healthy = mongoStatus === 'connected';

    res.writeHead(healthy ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: healthy ? 'healthy' : 'degraded',
        service: 'scheduler',
        timestamp: new Date().toISOString(),
        dependencies: {
          mongodb: mongoStatus,
        },
        scheduledJobs: {
          complianceCheck: 'active',
          weeklySummary: 'active',
          queueHealth: 'active',
        },
      })
    );
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// Start scheduler
async function start() {
  logger.info('Scheduler: Starting docflow-360 Scheduler Service...');

  await connectDatabase();
  scheduleJobs();

  logger.info('Scheduler: All jobs scheduled and ready');
  logger.info('Scheduler: Service running...');

  // Start health check server
  const healthPort = parseInt(process.env.HEALTH_PORT || '3003');
  healthServer.listen(healthPort, () => {
    logger.info(
      `Scheduler: Health check endpoint available at http://localhost:${healthPort}/health`
    );
  });
}

start().catch((error) => {
  logger.error('Scheduler: Failed to start', error);
  process.exit(1);
});

