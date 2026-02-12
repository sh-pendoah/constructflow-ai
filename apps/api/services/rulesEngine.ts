import { logger } from '../config/logger';
import mongoose from 'mongoose';

/**
 * Rules & Exceptions Engine
 * Deterministic logic for routing documents to review queue
 * NO LLM-based decisions - only rules-based evaluation
 */

export interface ExceptionRule {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  field?: string;
}

export interface RulesEngineResult {
  needsReview: boolean;
  exceptions: ExceptionRule[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  suggestedActions?: Array<{
    action: string;
    field: string;
    reason: string;
  }>;
}

/**
 * Standard exception codes
 */
export const EXCEPTION_CODES = {
  // Invoice exceptions
  DUPLICATE_INVOICE: 'DUPLICATE_INVOICE',
  UNKNOWN_VENDOR: 'UNKNOWN_VENDOR',
  AMOUNT_OVER_THRESHOLD: 'AMOUNT_OVER_THRESHOLD',
  MISSING_INVOICE_NUMBER: 'MISSING_INVOICE_NUMBER',
  MISSING_AMOUNT: 'MISSING_AMOUNT',
  MISSING_DATE: 'MISSING_DATE',
  LOW_OCR_CONFIDENCE: 'LOW_OCR_CONFIDENCE',

  // Daily log exceptions
  UNKNOWN_WORKER: 'UNKNOWN_WORKER',
  AMBIGUOUS_WC_CODE: 'AMBIGUOUS_WC_CODE',
  MISSING_HOURS: 'MISSING_HOURS',
  INVALID_HOURS: 'INVALID_HOURS',
  MISSING_DATE_DAILYLOG: 'MISSING_DATE_DAILYLOG',

  // Compliance exceptions
  UNKNOWN_CONTRACTOR: 'UNKNOWN_CONTRACTOR',
  MISSING_EXPIRATION: 'MISSING_EXPIRATION',
  EXPIRED_DOCUMENT: 'EXPIRED_DOCUMENT',
  EXPIRING_SOON: 'EXPIRING_SOON',
  INVALID_EXPIRATION: 'INVALID_EXPIRATION',

  // Classification exceptions
  UNCERTAIN_CLASSIFICATION: 'UNCERTAIN_CLASSIFICATION',
  POTENTIAL_DUPLICATE: 'POTENTIAL_DUPLICATE',
} as const;

/**
 * Evaluate invoice against rules
 */
export function evaluateInvoiceRules(data: {
  invoiceNumber?: string;
  vendor?: string;
  vendorId?: mongoose.Types.ObjectId | null;
  amount?: number;
  date?: Date;
  ocrConfidence?: number;
  isDuplicate?: boolean;
  approvalThreshold?: number;
}): RulesEngineResult {
  const exceptions: ExceptionRule[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

  // Rule 1: Duplicate detection
  if (data.isDuplicate) {
    exceptions.push({
      type: EXCEPTION_CODES.DUPLICATE_INVOICE,
      severity: 'high',
      message: 'Potential duplicate invoice detected',
      field: 'invoiceNumber',
    });
    priority = 'high';
  }

  // Rule 2: Unknown vendor
  if (!data.vendorId) {
    exceptions.push({
      type: EXCEPTION_CODES.UNKNOWN_VENDOR,
      severity: 'medium',
      message: 'Vendor not found in system - needs mapping',
      field: 'vendor',
    });
    if (priority === 'normal') priority = 'high';
  }

  // Rule 3: Amount over threshold (requires manual approval)
  if (data.amount && data.approvalThreshold && data.amount > data.approvalThreshold) {
    exceptions.push({
      type: EXCEPTION_CODES.AMOUNT_OVER_THRESHOLD,
      severity: 'medium',
      message: `Amount $${data.amount} exceeds approval threshold $${data.approvalThreshold}`,
      field: 'amount',
    });
    if (priority !== 'high') priority = 'normal';
  }

  // Rule 4: Missing critical fields
  if (!data.invoiceNumber) {
    exceptions.push({
      type: EXCEPTION_CODES.MISSING_INVOICE_NUMBER,
      severity: 'high',
      message: 'Invoice number is missing or not extracted',
      field: 'invoiceNumber',
    });
    priority = 'urgent';
  }

  if (!data.amount) {
    exceptions.push({
      type: EXCEPTION_CODES.MISSING_AMOUNT,
      severity: 'high',
      message: 'Invoice amount is missing or not extracted',
      field: 'amount',
    });
    priority = 'urgent';
  }

  if (!data.date) {
    exceptions.push({
      type: EXCEPTION_CODES.MISSING_DATE,
      severity: 'medium',
      message: 'Invoice date is missing or not extracted',
      field: 'date',
    });
  }

  // Rule 5: Low OCR confidence (< 70%)
  if (data.ocrConfidence !== undefined && data.ocrConfidence < 0.7) {
    exceptions.push({
      type: EXCEPTION_CODES.LOW_OCR_CONFIDENCE,
      severity: 'medium',
      message: `Low OCR confidence (${Math.round(data.ocrConfidence * 100)}%)`,
    });
    if (priority === 'normal') priority = 'high';
  }

  const needsReview = exceptions.length > 0;

  logger.info('Invoice rules evaluation completed', {
    needsReview,
    exceptionsCount: exceptions.length,
    priority,
  });

  return {
    needsReview,
    exceptions,
    priority,
  };
}

/**
 * Evaluate daily log against rules
 */
export function evaluateDailyLogRules(data: {
  workers?: Array<{ name: string; workerId?: mongoose.Types.ObjectId | null; hours?: number }>;
  date?: Date;
  wcCodeSuggestions?: Array<{ code: string; confidence: number }>;
  ocrConfidence?: number;
}): RulesEngineResult {
  const exceptions: ExceptionRule[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

  // Rule 1: Unknown workers
  if (data.workers) {
    const unknownWorkers = data.workers.filter(w => !w.workerId);
    if (unknownWorkers.length > 0) {
      exceptions.push({
        type: EXCEPTION_CODES.UNKNOWN_WORKER,
        severity: 'medium',
        message: `${unknownWorkers.length} worker(s) not found in system`,
        field: 'workers',
      });
      priority = 'high';
    }
  }

  // Rule 2: Ambiguous WC code (multiple suggestions with similar confidence)
  if (data.wcCodeSuggestions && data.wcCodeSuggestions.length > 1) {
    const topConfidence = data.wcCodeSuggestions[0]?.confidence || 0;
    const hasAmbiguity = data.wcCodeSuggestions.some(
      (s, idx) => idx > 0 && s.confidence > topConfidence * 0.9
    );

    if (hasAmbiguity || topConfidence < 0.9) {
      exceptions.push({
        type: EXCEPTION_CODES.AMBIGUOUS_WC_CODE,
        severity: 'medium',
        message: 'Multiple WC codes with similar confidence - requires selection',
        field: 'wcCode',
      });
      if (priority === 'normal') priority = 'high';
    }
  }

  // Rule 3: Missing or invalid hours
  if (data.workers) {
    const missingHours = data.workers.filter(w => !w.hours || w.hours <= 0);
    if (missingHours.length > 0) {
      exceptions.push({
        type: EXCEPTION_CODES.MISSING_HOURS,
        severity: 'high',
        message: `${missingHours.length} worker(s) missing valid hours`,
        field: 'hours',
      });
      priority = 'urgent';
    }

    const invalidHours = data.workers.filter(w => w.hours && (w.hours > 24 || w.hours < 0));
    if (invalidHours.length > 0) {
      exceptions.push({
        type: EXCEPTION_CODES.INVALID_HOURS,
        severity: 'high',
        message: `${invalidHours.length} worker(s) have invalid hours (>24 or <0)`,
        field: 'hours',
      });
      priority = 'urgent';
    }
  }

  // Rule 4: Missing date
  if (!data.date) {
    exceptions.push({
      type: EXCEPTION_CODES.MISSING_DATE_DAILYLOG,
      severity: 'medium',
      message: 'Log date is missing or not extracted',
      field: 'date',
    });
  }

  // Rule 5: Low OCR confidence
  if (data.ocrConfidence !== undefined && data.ocrConfidence < 0.7) {
    exceptions.push({
      type: EXCEPTION_CODES.LOW_OCR_CONFIDENCE,
      severity: 'medium',
      message: `Low OCR confidence (${Math.round(data.ocrConfidence * 100)}%)`,
    });
    if (priority === 'normal') priority = 'high';
  }

  const needsReview = exceptions.length > 0;

  logger.info('Daily log rules evaluation completed', {
    needsReview,
    exceptionsCount: exceptions.length,
    priority,
  });

  return {
    needsReview,
    exceptions,
    priority,
  };
}

/**
 * Evaluate compliance document against rules
 */
export function evaluateComplianceRules(data: {
  contractorName?: string;
  contractorId?: mongoose.Types.ObjectId | null;
  expirationDate?: Date;
  ocrConfidence?: number;
}): RulesEngineResult {
  const exceptions: ExceptionRule[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

  // Rule 1: Unknown contractor
  if (!data.contractorId) {
    exceptions.push({
      type: EXCEPTION_CODES.UNKNOWN_CONTRACTOR,
      severity: 'medium',
      message: 'Contractor not found in system - needs mapping',
      field: 'contractor',
    });
    priority = 'high';
  }

  // Rule 2: Missing expiration date
  if (!data.expirationDate) {
    exceptions.push({
      type: EXCEPTION_CODES.MISSING_EXPIRATION,
      severity: 'high',
      message: 'Expiration date is missing or not extracted',
      field: 'expirationDate',
    });
    priority = 'urgent';
  }

  // Rule 3: Already expired
  if (data.expirationDate && data.expirationDate < new Date()) {
    exceptions.push({
      type: EXCEPTION_CODES.EXPIRED_DOCUMENT,
      severity: 'high',
      message: 'Document is already expired',
      field: 'expirationDate',
    });
    priority = 'urgent';
  }

  // Rule 4: Expiring soon (within 30 days)
  if (data.expirationDate) {
    const daysUntilExpiry = Math.floor(
      (data.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
      exceptions.push({
        type: EXCEPTION_CODES.EXPIRING_SOON,
        severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
        message: `Document expires in ${daysUntilExpiry} days`,
        field: 'expirationDate',
      });
      if (daysUntilExpiry <= 7) {
        priority = 'high';
      }
    }

    // Invalid expiration date (too far in future)
    if (daysUntilExpiry > 365 * 3) {
      exceptions.push({
        type: EXCEPTION_CODES.INVALID_EXPIRATION,
        severity: 'medium',
        message: 'Expiration date may be incorrect (more than 3 years in future)',
        field: 'expirationDate',
      });
    }
  }

  // Rule 5: Low OCR confidence
  if (data.ocrConfidence !== undefined && data.ocrConfidence < 0.7) {
    exceptions.push({
      type: EXCEPTION_CODES.LOW_OCR_CONFIDENCE,
      severity: 'medium',
      message: `Low OCR confidence (${Math.round(data.ocrConfidence * 100)}%)`,
    });
    if (priority === 'normal') priority = 'high';
  }

  const needsReview = exceptions.length > 0;

  logger.info('Compliance rules evaluation completed', {
    needsReview,
    exceptionsCount: exceptions.length,
    priority,
  });

  return {
    needsReview,
    exceptions,
    priority,
  };
}

/**
 * Evaluate document classification confidence
 */
export function evaluateClassificationRules(data: {
  ocrText?: string;
  fileName?: string;
  emailSubject?: string;
  emailBody?: string;
  workflowType: 'INVOICE' | 'DAILY_LOG' | 'COMPLIANCE' | 'OTHER';
}): RulesEngineResult {
  const exceptions: ExceptionRule[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

  // Combine all text sources for classification
  const allText = [
    data.ocrText || '',
    data.fileName || '',
    data.emailSubject || '',
    data.emailBody || ''
  ].join(' ').toLowerCase();

  // Classification confidence scoring
  const classificationConfidence = calculateClassificationConfidence(allText, data.workflowType);

  if (classificationConfidence < 0.6) {
    exceptions.push({
      type: EXCEPTION_CODES.UNCERTAIN_CLASSIFICATION,
      severity: 'medium',
      message: `Low classification confidence (${Math.round(classificationConfidence * 100)}%) - manual review recommended`,
      field: 'classification',
    });
    priority = 'high';
  }

  const needsReview = exceptions.length > 0;

  logger.info('Classification rules evaluation completed', {
    workflowType: data.workflowType,
    confidence: classificationConfidence,
    needsReview,
    exceptionsCount: exceptions.length,
  });

  return {
    needsReview,
    exceptions,
    priority,
  };
}

/**
 * Calculate classification confidence based on text content
 */
function calculateClassificationConfidence(text: string, workflowType: string): number {
  let confidence = 0.5; // Base confidence

  const indicators = {
    'INVOICE': [
      'invoice', 'bill', 'receipt', 'payment', 'due date', 'amount due',
      'total', 'subtotal', 'tax', 'vendor', 'supplier'
    ],
    'DAILY_LOG': [
      'daily log', 'daily report', 'work log', 'time sheet', 'hours worked',
      'workers', 'labor', 'equipment', 'weather', 'job site'
    ],
    'COMPLIANCE': [
      'certificate of insurance', 'coi', 'insurance certificate',
      'compliance', 'expiration date', 'policy number', 'coverage',
      'contractor', 'subcontractor', 'liability'
    ]
  };

  const typeIndicators = indicators[workflowType as keyof typeof indicators] || [];
  const matchCount = typeIndicators.filter(indicator => text.includes(indicator)).length;

  // Confidence based on number of matching indicators
  if (matchCount >= 3) confidence = 0.9;
  else if (matchCount >= 2) confidence = 0.75;
  else if (matchCount >= 1) confidence = 0.6;
  else confidence = 0.3;

  return confidence;
}

/**
 * Determine routing decision based on all rules evaluation
 */
export function determineRoutingDecision(results: {
  invoiceRules?: RulesEngineResult;
  dailyLogRules?: RulesEngineResult;
  complianceRules?: RulesEngineResult;
  classificationRules?: RulesEngineResult;
  duplicateCheck?: { isDuplicate: boolean; score: number };
}): {
  needsReview: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  allExceptions: ExceptionRule[];
  recommendedAction: 'AUTO_APPROVE' | 'REVIEW_QUEUE' | 'REJECT';
} {
  const allExceptions: ExceptionRule[] = [];
  let maxPriority: 'low' | 'normal' | 'high' | 'urgent' = 'low';
  let needsReview = false;

  // Collect all exceptions and determine priority
  const allResults = [results.invoiceRules, results.dailyLogRules, results.complianceRules, results.classificationRules].filter(Boolean);

  for (const result of allResults) {
    if (result) {
      allExceptions.push(...result.exceptions);

      // Update priority based on highest severity
      const priorityOrder = { low: 1, normal: 2, high: 3, urgent: 4 };
      if (priorityOrder[result.priority] > priorityOrder[maxPriority]) {
        maxPriority = result.priority;
      }

      if (result.needsReview) {
        needsReview = true;
      }
    }
  }

  // Check duplicate status
  if (results.duplicateCheck?.isDuplicate) {
    needsReview = true;
    maxPriority = 'high';
    allExceptions.push({
      type: EXCEPTION_CODES.POTENTIAL_DUPLICATE,
      severity: 'high',
      message: `Potential duplicate detected (confidence: ${Math.round(results.duplicateCheck.score * 100)}%)`,
      field: 'duplicate',
    });
  }

  // Determine final action
  let recommendedAction: 'AUTO_APPROVE' | 'REVIEW_QUEUE' | 'REJECT' = 'REVIEW_QUEUE';

  if (!needsReview && allExceptions.length === 0) {
    recommendedAction = 'AUTO_APPROVE';
  } else if (allExceptions.some(e => e.severity === 'high' || e.type === EXCEPTION_CODES.EXPIRED_DOCUMENT)) {
    recommendedAction = 'REJECT';
  }

  logger.info('Routing decision determined', {
    needsReview,
    priority: maxPriority,
    exceptionCount: allExceptions.length,
    recommendedAction,
  });

  return {
    needsReview,
    priority: maxPriority,
    allExceptions,
    recommendedAction,
  };
}

/**
 * Rules engine namespace for easier imports
 */
export const rulesEngine = {
  evaluateInvoiceRules,
  evaluateDailyLogRules,
  evaluateComplianceRules,
  evaluateClassificationRules,
  determineRoutingDecision,
  EXCEPTION_CODES,
};
