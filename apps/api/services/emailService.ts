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

// Send magic link email
export async function sendMagicLinkEmail(email: string, token: string): Promise<void> {
  const magicLink = `${config.appUrl}/auth/verify?token=${encodeURIComponent(token)}`;
  const subject = 'Sign in to Your Account';
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Sign in to Your Account</h2>
      <p style="color: #555;">Click the secure link below to log in. No password needed.</p>
      <a href="${magicLink}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Sign In
      </a>
      <p style="color: #888; font-size: 13px;">Or copy this URL into your browser:</p>
      <p style="color: #888; font-size: 12px; word-break: break-all;">${magicLink}</p>
      <p style="color: #aaa; font-size: 12px; margin-top: 24px;">This link expires in 15 minutes and can only be used once. If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
  const text = `Sign in to your account:\n\n${magicLink}\n\nThis link expires in 15 minutes.`;

  await sendEmail({ to: email, subject, html, text });
}

// Send welcome email
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const subject = 'Welcome to docflow-360';
  const html = `
    <h2>Welcome to docflow-360, ${name}!</h2>
    <p>Your account has been created successfully.</p>
    <p>You can now log in and start managing your construction documents.</p>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}
