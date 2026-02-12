import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../config/logger';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    logger.warn('Email transporter verification failed:', error);
  } else {
    logger.info('Email transporter ready');
  }
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Send email
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (!config.smtp.host || !config.smtp.user) {
      // In production, email must be configured
      if (config.env === 'production') {
        throw new Error('Email service not configured. SMTP_HOST and SMTP_USER are required.');
      }
      logger.warn('Email not configured, skipping send (dev mode)');
      return;
    }

    await transporter.sendMail({
      from: config.emailFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    logger.info(`Email sent to ${options.to}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
}

// Send approval notification
export async function sendApprovalNotification(
  approverEmail: string,
  documentType: string,
  documentId: string,
  amount?: number
): Promise<void> {
  const subject = `Approval Required: ${documentType}`;
  const html = `
    <h2>Approval Required</h2>
    <p>A ${documentType} requires your approval.</p>
    ${amount ? `<p><strong>Amount:</strong> $${amount.toFixed(2)}</p>` : ''}
    <p><strong>Document ID:</strong> ${documentId}</p>
    <p>Please log in to the system to review and approve.</p>
  `;

  await sendEmail({
    to: approverEmail,
    subject,
    html,
  });
}

// Send expiration alert
export async function sendExpirationAlert(
  email: string,
  documentTitle: string,
  expirationDate: Date
): Promise<void> {
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const subject = `Expiration Alert: ${documentTitle}`;
  const html = `
    <h2>Document Expiration Alert</h2>
    <p><strong>${documentTitle}</strong> is expiring soon.</p>
    <p><strong>Expiration Date:</strong> ${expirationDate.toLocaleDateString()}</p>
    <p><strong>Days Remaining:</strong> ${daysUntilExpiration}</p>
    <p>Please renew this document to maintain compliance.</p>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

// Send COI expiration alert
export async function sendCOIExpirationAlert(
  email: string,
  vendorName: string,
  expirationDate: Date
): Promise<void> {
  const subject = `COI Expiration: ${vendorName}`;
  const html = `
    <h2>Certificate of Insurance Expiration Alert</h2>
    <p>The Certificate of Insurance for <strong>${vendorName}</strong> is expiring soon.</p>
    <p><strong>Expiration Date:</strong> ${expirationDate.toLocaleDateString()}</p>
    <p>Please request an updated COI from the vendor.</p>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

// Send welcome email
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const subject = 'Welcome to Worklight';
  const html = `
    <h2>Welcome to Worklight, ${name}!</h2>
    <p>Your account has been created successfully.</p>
    <p>You can now log in and start managing your construction documents.</p>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}
