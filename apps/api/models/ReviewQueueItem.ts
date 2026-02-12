import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IReviewQueueItem extends Document {
  company: mongoose.Types.ObjectId;
  documentType: 'invoice' | 'daily-log' | 'compliance' | 'other';
  documentId: mongoose.Types.ObjectId;
  status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'needs-correction';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // OCR and extraction results
  ocrConfidence?: number;
  extractedData?: Record<string, any>;
  boundingBoxes?: Array<{
    field: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    page?: number;
    confidence?: number;
  }>;
  suggestedActions?: Array<{
    action: string;
    field: string;
    suggestedValue: any;
    confidence: number;
    reason: string;
  }>;
  
  // Exception flags
  exceptions?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    field?: string;
  }>;
  
  // File information
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  
  // Workflow metadata
  assignedTo?: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  // Corrections
  corrections?: Array<{
    field: string;
    originalValue: any;
    correctedValue: any;
    correctedBy: mongoose.Types.ObjectId;
    correctedAt: Date;
  }>;
  
  // For invoice-specific data
  invoiceNumber?: string;
  invoiceTotal?: number;
  vendor?: string;
  
  // For daily log-specific data
  date?: Date;
  jobId?: mongoose.Types.ObjectId;
  workersCount?: number;
  totalHours?: number;
  
  // For compliance-specific data
  expirationDate?: Date;
  complianceType?: string;
  
  // Timestamps
  submittedAt: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  addException(type: string, severity: 'low' | 'medium' | 'high', message: string, field?: string): void;
  addCorrection(field: string, originalValue: any, correctedValue: any, correctedBy: mongoose.Types.ObjectId): void;
}

export interface IReviewQueueItemModel extends Model<IReviewQueueItem> {
  createFromDocument(
    documentType: 'invoice' | 'daily-log' | 'compliance' | 'other',
    documentId: mongoose.Types.ObjectId,
    companyId: mongoose.Types.ObjectId,
    extractedData?: Record<string, any>,
    ocrConfidence?: number
  ): Promise<IReviewQueueItem>;
}

const reviewQueueSchema = new Schema<IReviewQueueItem>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    documentType: {
      type: String,
      enum: ['invoice', 'daily-log', 'compliance', 'other'],
      required: true,
    },
    documentId: { type: Schema.Types.ObjectId, required: true, ref: 'Document' },
    status: {
      type: String,
      enum: ['pending', 'in-review', 'approved', 'rejected', 'needs-correction'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    
    // OCR data
    ocrConfidence: { type: Number, min: 0, max: 1 },
    extractedData: { type: Schema.Types.Mixed },
    boundingBoxes: [{
      field: { type: String, required: true },
      text: { type: String, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      page: { type: Number },
      confidence: { type: Number },
    }],
    suggestedActions: [
      {
        action: { type: String, required: true },
        field: { type: String },
        suggestedValue: { type: Schema.Types.Mixed },
        confidence: { type: Number, min: 0, max: 1 },
        reason: { type: String },
      },
    ],
    
    // Exceptions
    exceptions: [
      {
        type: { type: String, required: true },
        severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
        message: { type: String, required: true },
        field: { type: String },
      },
    ],
    
    // File info
    fileName: { type: String },
    fileUrl: { type: String },
    mimeType: { type: String },
    
    // Workflow
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
    
    // Corrections
    corrections: [
      {
        field: { type: String, required: true },
        originalValue: { type: Schema.Types.Mixed },
        correctedValue: { type: Schema.Types.Mixed },
        correctedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        correctedAt: { type: Date, default: Date.now },
      },
    ],
    
    // Type-specific quick fields
    invoiceNumber: { type: String },
    invoiceTotal: { type: Number },
    vendor: { type: String },
    date: { type: Date },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    workersCount: { type: Number },
    totalHours: { type: Number },
    expirationDate: { type: Date },
    complianceType: { type: String },
    
    // Timestamps
    submittedAt: { type: Date, default: Date.now },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

// Indexes for efficient querying
reviewQueueSchema.index({ company: 1, status: 1 });
reviewQueueSchema.index({ company: 1, documentType: 1, status: 1 });
reviewQueueSchema.index({ company: 1, priority: 1, submittedAt: 1 });
reviewQueueSchema.index({ assignedTo: 1, status: 1 });
reviewQueueSchema.index({ dueDate: 1 });
reviewQueueSchema.index({ ocrConfidence: 1 });

// Virtual for determining if item needs urgent review
reviewQueueSchema.virtual('needsUrgentReview').get(function (this: IReviewQueueItem) {
  if (this.priority === 'urgent') return true;
  if (this.dueDate && this.dueDate < new Date()) return true;
  if (this.ocrConfidence && this.ocrConfidence < 0.7) return true;
  if (this.exceptions && this.exceptions.some(e => e.severity === 'high')) return true;
  return false;
});

// Method to add exception
reviewQueueSchema.methods.addException = function (
  this: IReviewQueueItem,
  type: string,
  severity: 'low' | 'medium' | 'high',
  message: string,
  field?: string
) {
  if (!this.exceptions) {
    this.exceptions = [];
  }
  this.exceptions.push({ type, severity, message, field });
  
  // Auto-escalate priority if high severity exception
  if (severity === 'high' && this.priority !== 'urgent') {
    this.priority = 'high';
  }
};

// Method to add correction
reviewQueueSchema.methods.addCorrection = function (
  this: IReviewQueueItem,
  field: string,
  originalValue: any,
  correctedValue: any,
  correctedBy: mongoose.Types.ObjectId
) {
  if (!this.corrections) {
    this.corrections = [];
  }
  this.corrections.push({
    field,
    originalValue,
    correctedValue,
    correctedBy,
    correctedAt: new Date(),
  });
};

// Static method to create from document
reviewQueueSchema.statics.createFromDocument = async function (
  documentType: 'invoice' | 'daily-log' | 'compliance' | 'other',
  documentId: mongoose.Types.ObjectId,
  companyId: mongoose.Types.ObjectId,
  extractedData?: Record<string, any>,
  ocrConfidence?: number
): Promise<IReviewQueueItem> {
  const queueItem = new this({
    company: companyId,
    documentType,
    documentId,
    extractedData,
    ocrConfidence,
    submittedAt: new Date(),
  });

  // Set priority based on confidence
  if (ocrConfidence !== undefined) {
    if (ocrConfidence < 0.6) {
      queueItem.priority = 'high';
    } else if (ocrConfidence < 0.8) {
      queueItem.priority = 'normal';
    } else {
      queueItem.priority = 'low';
    }
  }

  return await queueItem.save();
};

export const ReviewQueueItem = mongoose.model<IReviewQueueItem, IReviewQueueItemModel>('ReviewQueueItem', reviewQueueSchema);
