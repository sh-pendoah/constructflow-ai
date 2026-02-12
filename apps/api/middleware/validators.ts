import { body, param, query, ValidationChain } from 'express-validator';

// Common validators
export const idValidator = param('id').isMongoId().withMessage('Invalid ID');

// Job validators
export const createJobValidators: ValidationChain[] = [
  body('jobNumber').notEmpty().trim().withMessage('Job number is required'),
  body('name').notEmpty().trim().withMessage('Job name is required'),
  body('description').optional().trim(),
  body('customer').optional().trim(),
  body('status').optional().isIn(['active', 'completed', 'on-hold', 'cancelled']),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
];

export const updateJobValidators: ValidationChain[] = [
  idValidator,
  body('jobNumber').optional().trim(),
  body('name').optional().trim(),
  body('status').optional().isIn(['active', 'completed', 'on-hold', 'cancelled']),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
];

// Cost Code validators
export const createCostCodeValidators: ValidationChain[] = [
  body('code').notEmpty().trim().withMessage('Cost code is required'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('category').optional().trim(),
];

export const updateCostCodeValidators: ValidationChain[] = [
  idValidator,
  body('code').optional().trim(),
  body('description').optional().trim(),
  body('category').optional().trim(),
  body('isActive').optional().isBoolean(),
];

// WC Code validators
export const createWCCodeValidators: ValidationChain[] = [
  body('code').notEmpty().trim().withMessage('WC code is required'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('state').notEmpty().trim().isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters'),
  body('rate').optional().isNumeric().withMessage('Rate must be a number'),
];

export const updateWCCodeValidators: ValidationChain[] = [
  idValidator,
  body('code').optional().trim(),
  body('description').optional().trim(),
  body('state').optional().trim().isLength({ min: 2, max: 2 }),
  body('rate').optional().isNumeric(),
  body('isActive').optional().isBoolean(),
];

// COI Vendor validators
export const createCOIVendorValidators: ValidationChain[] = [
  body('name').notEmpty().trim().withMessage('Vendor name is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().trim(),
  body('expirationDate').optional().isISO8601().withMessage('Invalid date'),
  body('status').optional().isIn(['valid', 'expired', 'pending', 'missing']),
];

export const updateCOIVendorValidators: ValidationChain[] = [
  idValidator,
  body('name').optional().trim(),
  body('email').optional().isEmail(),
  body('expirationDate').optional().isISO8601(),
  body('status').optional().isIn(['valid', 'expired', 'pending', 'missing']),
];

// Approval Rule validators
export const createApprovalRuleValidators: ValidationChain[] = [
  body('name').notEmpty().trim().withMessage('Rule name is required'),
  body('threshold').isNumeric().withMessage('Threshold must be a number'),
  body('approvers').isArray().withMessage('Approvers must be an array'),
  body('documentType').optional().isIn(['invoice', 'expense', 'timelog', 'all']),
];

export const updateApprovalRuleValidators: ValidationChain[] = [
  idValidator,
  body('name').optional().trim(),
  body('threshold').optional().isNumeric(),
  body('approvers').optional().isArray(),
  body('documentType').optional().isIn(['invoice', 'expense', 'timelog', 'all']),
  body('isActive').optional().isBoolean(),
];

// Invoice validators
export const createInvoiceValidators: ValidationChain[] = [
  body('invoiceNumber').notEmpty().trim().withMessage('Invoice number is required'),
  body('vendor').notEmpty().trim().withMessage('Vendor is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('invoiceDate').isISO8601().withMessage('Invalid invoice date'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('job').optional().isMongoId().withMessage('Invalid job ID'),
  body('costCode').optional().isMongoId().withMessage('Invalid cost code ID'),
];

export const updateInvoiceValidators: ValidationChain[] = [
  idValidator,
  body('invoiceNumber').optional().trim(),
  body('vendor').optional().trim(),
  body('amount').optional().isNumeric(),
  body('invoiceDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'paid', 'processing']),
];

// Daily Log validators
export const createDailyLogValidators: ValidationChain[] = [
  body('job').isMongoId().withMessage('Valid job ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('workPerformed').notEmpty().trim().withMessage('Work performed is required'),
  body('workers').optional().isArray(),
  body('workers.*.name').optional().trim(),
  body('workers.*.hours').optional().isNumeric(),
  body('equipment').optional().isArray(),
  body('materials').optional().isArray(),
];

export const updateDailyLogValidators: ValidationChain[] = [
  idValidator,
  body('date').optional().isISO8601(),
  body('workPerformed').optional().trim(),
  body('workers').optional().isArray(),
  body('equipment').optional().isArray(),
  body('materials').optional().isArray(),
];

// Compliance Document validators
export const createComplianceDocValidators: ValidationChain[] = [
  body('type').isIn(['coi', 'license', 'permit', 'certification', 'other']).withMessage('Invalid document type'),
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('documentUrl').notEmpty().trim().withMessage('Document URL is required'),
  body('issueDate').optional().isISO8601().withMessage('Invalid issue date'),
  body('expirationDate').optional().isISO8601().withMessage('Invalid expiration date'),
  body('vendor').optional().isMongoId().withMessage('Invalid vendor ID'),
];

export const updateComplianceDocValidators: ValidationChain[] = [
  idValidator,
  body('type').optional().isIn(['coi', 'license', 'permit', 'certification', 'other']),
  body('title').optional().trim(),
  body('issueDate').optional().isISO8601(),
  body('expirationDate').optional().isISO8601(),
  body('status').optional().isIn(['valid', 'expired', 'expiring-soon', 'pending']),
];

// Auth validators
export const registerValidators: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('role').optional().isIn(['admin', 'manager', 'worker']),
];

export const loginValidators: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];
