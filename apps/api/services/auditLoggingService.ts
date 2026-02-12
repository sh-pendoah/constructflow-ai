import { logger } from '../config/logger';
import { AuditLog } from '../models/AuditLog';
import mongoose from 'mongoose';

/**
 * Audit Logging Service
 * Creates immutable audit trail entries for all system events and mutations
 */

export const AUDIT_EVENTS = {
  // Document ingestion
  DOCUMENT_INGESTED: 'DOCUMENT_INGESTED',
  EMAIL_RECEIVED: 'EMAIL_RECEIVED',
  
  // OCR and extraction
  OCR_STARTED: 'OCR_STARTED',
  OCR_COMPLETED: 'OCR_COMPLETED',
  OCR_FAILED: 'OCR_FAILED',
  EXTRACTION_COMPLETED: 'EXTRACTION_COMPLETED',
  EXTRACTION_FAILED: 'EXTRACTION_FAILED',
  
  // Rules evaluation
  RULES_EVALUATED: 'RULES_EVALUATED',
  EXCEPTION_DETECTED: 'EXCEPTION_DETECTED',
  DUPLICATE_DETECTED: 'DUPLICATE_DETECTED',
  
  // Review queue
  REVIEW_ITEM_CREATED: 'REVIEW_ITEM_CREATED',
  REVIEW_ITEM_ASSIGNED: 'REVIEW_ITEM_ASSIGNED',
  REVIEW_ITEM_APPROVED: 'REVIEW_ITEM_APPROVED',
  REVIEW_ITEM_REJECTED: 'REVIEW_ITEM_REJECTED',
  REVIEW_ITEM_CORRECTED: 'REVIEW_ITEM_CORRECTED',
  
  // Invoice workflow
  INVOICE_CREATED: 'INVOICE_CREATED',
  INVOICE_APPROVED: 'INVOICE_APPROVED',
  INVOICE_REJECTED: 'INVOICE_REJECTED',
  INVOICE_PAID: 'INVOICE_PAID',
  
  // Daily log workflow
  DAILY_LOG_CREATED: 'DAILY_LOG_CREATED',
  DAILY_LOG_UPDATED: 'DAILY_LOG_UPDATED',
  WORKER_MATCHED: 'WORKER_MATCHED',
  WC_CODE_SELECTED: 'WC_CODE_SELECTED',
  
  // Compliance workflow
  COMPLIANCE_DOC_CREATED: 'COMPLIANCE_DOC_CREATED',
  COMPLIANCE_STATUS_CHANGED: 'COMPLIANCE_STATUS_CHANGED',
  COMPLIANCE_ALERT_SENT: 'COMPLIANCE_ALERT_SENT',
  
  // Exports
  EXPORT_GENERATED: 'EXPORT_GENERATED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  
  // Admin actions
  VENDOR_CREATED: 'VENDOR_CREATED',
  WORKER_CREATED: 'WORKER_CREATED',
  CONTRACTOR_CREATED: 'CONTRACTOR_CREATED',
  WC_CODE_UPLOADED: 'WC_CODE_UPLOADED',
} as const;

/**
 * Create audit log entry
 */
export async function createAuditLog(params: {
  tenantId: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  reviewItemId?: mongoose.Types.ObjectId;
  eventType: string;
  actor: 'SYSTEM' | 'USER';
  actorUserId?: mongoose.Types.ObjectId;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await AuditLog.create({
      tenantId: params.tenantId,
      documentId: params.documentId,
      reviewItemId: params.reviewItemId,
      eventType: params.eventType,
      actor: params.actor,
      actorUserId: params.actorUserId,
      beforeState: params.beforeState,
      afterState: params.afterState,
      metadata: params.metadata,
    });

    logger.info('Audit log created', {
      eventType: params.eventType,
      actor: params.actor,
      documentId: params.documentId,
    });
  } catch (error) {
    logger.error('Failed to create audit log', {
      error,
      eventType: params.eventType,
    });
    // Don't throw - audit log failures should not break main flow
  }
}

/**
 * Helper: Log document ingestion
 */
export async function logDocumentIngestion(
  tenantId: mongoose.Types.ObjectId,
  documentId: mongoose.Types.ObjectId,
  metadata: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    tenantId,
    documentId,
    eventType: AUDIT_EVENTS.DOCUMENT_INGESTED,
    actor: 'SYSTEM',
    metadata,
  });
}

/**
 * Helper: Log OCR completion
 */
export async function logOCRCompletion(
  tenantId: mongoose.Types.ObjectId,
  documentId: mongoose.Types.ObjectId,
  ocrProvider: string,
  confidence: number
): Promise<void> {
  await createAuditLog({
    tenantId,
    documentId,
    eventType: AUDIT_EVENTS.OCR_COMPLETED,
    actor: 'SYSTEM',
    metadata: { ocrProvider, confidence },
  });
}

/**
 * Helper: Log extraction completion
 */
export async function logExtractionCompletion(
  tenantId: mongoose.Types.ObjectId,
  documentId: mongoose.Types.ObjectId,
  extractedData: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    tenantId,
    documentId,
    eventType: AUDIT_EVENTS.EXTRACTION_COMPLETED,
    actor: 'SYSTEM',
    afterState: extractedData,
  });
}

/**
 * Helper: Log rules evaluation
 */
export async function logRulesEvaluation(
  tenantId: mongoose.Types.ObjectId,
  documentId: mongoose.Types.ObjectId,
  exceptions: Array<{ type: string; severity: string; message: string }>
): Promise<void> {
  await createAuditLog({
    tenantId,
    documentId,
    eventType: AUDIT_EVENTS.RULES_EVALUATED,
    actor: 'SYSTEM',
    metadata: { exceptionsCount: exceptions.length, exceptions },
  });
}

/**
 * Helper: Log review item approval
 */
export async function logReviewApproval(
  tenantId: mongoose.Types.ObjectId,
  reviewItemId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  notes?: string
): Promise<void> {
  await createAuditLog({
    tenantId,
    reviewItemId,
    eventType: AUDIT_EVENTS.REVIEW_ITEM_APPROVED,
    actor: 'USER',
    actorUserId: userId,
    metadata: { notes },
  });
}

/**
 * Helper: Log review item rejection
 */
export async function logReviewRejection(
  tenantId: mongoose.Types.ObjectId,
  reviewItemId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  reason: string
): Promise<void> {
  await createAuditLog({
    tenantId,
    reviewItemId,
    eventType: AUDIT_EVENTS.REVIEW_ITEM_REJECTED,
    actor: 'USER',
    actorUserId: userId,
    metadata: { reason },
  });
}

/**
 * Helper: Log invoice creation
 */
export async function logInvoiceCreation(
  tenantId: mongoose.Types.ObjectId,
  documentId: mongoose.Types.ObjectId,
  invoiceData: Record<string, unknown>,
  userId?: mongoose.Types.ObjectId
): Promise<void> {
  await createAuditLog({
    tenantId,
    documentId,
    eventType: AUDIT_EVENTS.INVOICE_CREATED,
    actor: userId ? 'USER' : 'SYSTEM',
    actorUserId: userId,
    afterState: invoiceData,
  });
}

/**
 * Helper: Log invoice approval
 */
export async function logInvoiceApproval(
  tenantId: mongoose.Types.ObjectId,
  invoiceId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  amount: number
): Promise<void> {
  await createAuditLog({
    tenantId,
    documentId: invoiceId,
    eventType: AUDIT_EVENTS.INVOICE_APPROVED,
    actor: 'USER',
    actorUserId: userId,
    metadata: { amount },
  });
}

/**
 * Helper: Log daily log creation
 */
export async function logDailyLogCreation(
  tenantId: mongoose.Types.ObjectId,
  documentId: mongoose.Types.ObjectId,
  logData: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    tenantId,
    documentId,
    eventType: AUDIT_EVENTS.DAILY_LOG_CREATED,
    actor: 'SYSTEM',
    afterState: logData,
  });
}

/**
 * Helper: Log compliance document creation
 */
export async function logComplianceCreation(
  tenantId: mongoose.Types.ObjectId,
  documentId: mongoose.Types.ObjectId,
  complianceData: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    tenantId,
    documentId,
    eventType: AUDIT_EVENTS.COMPLIANCE_DOC_CREATED,
    actor: 'SYSTEM',
    afterState: complianceData,
  });
}

/**
 * Helper: Log compliance alert
 */
export async function logComplianceAlert(
  tenantId: mongoose.Types.ObjectId,
  documentId: mongoose.Types.ObjectId,
  alertType: string,
  daysUntilExpiry: number
): Promise<void> {
  await createAuditLog({
    tenantId,
    documentId,
    eventType: AUDIT_EVENTS.COMPLIANCE_ALERT_SENT,
    actor: 'SYSTEM',
    metadata: { alertType, daysUntilExpiry },
  });
}

/**
 * Helper: Log export generation
 */
export async function logExportGeneration(
  tenantId: mongoose.Types.ObjectId,
  exportType: string,
  recordCount: number,
  userId: mongoose.Types.ObjectId
): Promise<void> {
  await createAuditLog({
    tenantId,
    eventType: AUDIT_EVENTS.EXPORT_GENERATED,
    actor: 'USER',
    actorUserId: userId,
    metadata: { exportType, recordCount },
  });
}
