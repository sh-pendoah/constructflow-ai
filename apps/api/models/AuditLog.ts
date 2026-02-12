import mongoose, { Document, Schema } from 'mongoose';

/**
 * AuditLog - Immutable audit trail for all system events
 * Captures every decision and mutation for compliance
 */
export interface IAuditLog extends Document {
  tenantId: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  reviewItemId?: mongoose.Types.ObjectId;
  
  eventType: string; // OCR_COMPLETED, EXTRACTION_UPDATED, APPROVED, REJECTED, etc.
  actor: 'SYSTEM' | 'USER';
  actorUserId?: mongoose.Types.ObjectId;
  
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  
  metadata?: Record<string, unknown>;
  
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'WorkflowDocument' },
    reviewItemId: { type: Schema.Types.ObjectId, ref: 'ReviewQueueItem' },
    eventType: { type: String, required: true, index: true },
    actor: { type: String, enum: ['SYSTEM', 'USER'], required: true },
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    beforeState: { type: Schema.Types.Mixed },
    afterState: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Prevent updates (immutable)
auditLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('AuditLog records are immutable and cannot be updated');
});

auditLogSchema.pre('updateOne', function () {
  throw new Error('AuditLog records are immutable and cannot be updated');
});

// Indexes
auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ documentId: 1, createdAt: -1 });
auditLogSchema.index({ reviewItemId: 1, createdAt: -1 });
auditLogSchema.index({ eventType: 1, createdAt: -1 });
auditLogSchema.index({ actorUserId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
