import mongoose, { Document, Schema } from 'mongoose';

/**
 * WorkflowDocument - Core document model for email ingestion and processing pipeline
 * Represents documents from all workflows: INVOICE, DAILY_LOG, COMPLIANCE
 */
export interface IWorkflowDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  workflowType: 'INVOICE' | 'DAILY_LOG' | 'COMPLIANCE' | 'OTHER';
  status: 'RECEIVED' | 'PROCESSING' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'FAILED';
  source: 'EMAIL' | 'UPLOAD' | 'API';
  
  // File references
  originalFileUrl: string;
  normalizedFileUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  hashSha256: string; // For deduplication
  
  // Email metadata (if source = EMAIL)
  metadata: {
    sender?: string;
    subject?: string;
    messageId?: string;
    recipients?: string[];
    receivedAt?: Date;
    [key: string]: unknown;
  };
  
  // Processing timestamps
  receivedAt: Date;
  processedAt?: Date;
  
  // Links to workflow-specific records
  invoiceId?: mongoose.Types.ObjectId;
  dailyLogId?: mongoose.Types.ObjectId;
  complianceDocId?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const workflowDocumentSchema = new Schema<IWorkflowDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    workflowType: {
      type: String,
      enum: ['INVOICE', 'DAILY_LOG', 'COMPLIANCE', 'OTHER'],
      required: true,
    },
    status: {
      type: String,
      enum: ['RECEIVED', 'PROCESSING', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'FAILED'],
      default: 'RECEIVED',
      required: true,
    },
    source: {
      type: String,
      enum: ['EMAIL', 'UPLOAD', 'API'],
      default: 'EMAIL',
      required: true,
    },
    originalFileUrl: { type: String, required: true },
    normalizedFileUrl: { type: String },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    hashSha256: { type: String, required: true },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    receivedAt: { type: Date, required: true, default: Date.now },
    processedAt: { type: Date },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    dailyLogId: { type: Schema.Types.ObjectId, ref: 'DailyLog' },
    complianceDocId: { type: Schema.Types.ObjectId, ref: 'ComplianceDoc' },
  },
  { timestamps: true }
);

// Indexes for performance
workflowDocumentSchema.index({ tenantId: 1, status: 1 });
workflowDocumentSchema.index({ tenantId: 1, workflowType: 1 });
workflowDocumentSchema.index({ hashSha256: 1, tenantId: 1 }, { unique: true }); // Deduplication
workflowDocumentSchema.index({ receivedAt: -1 });
workflowDocumentSchema.index({ status: 1, workflowType: 1 });

export const WorkflowDocument = mongoose.model<IWorkflowDocument>('WorkflowDocument', workflowDocumentSchema);
