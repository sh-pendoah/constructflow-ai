import mongoose, { Document, Schema } from 'mongoose';

/**
 * ApprovalLog - Multi-stage approval tracking for invoices
 * Each approval action logged separately
 */
export interface IApprovalLog extends Document {
  tenantId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  stage: 'PM' | 'OWNER' | 'AUTO';
  approverUserId?: mongoose.Types.ObjectId;
  action: 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED';
  comments?: string;
  signedTokenUsed?: boolean;
  approvedAt: Date;
  createdAt: Date;
}

const approvalLogSchema = new Schema<IApprovalLog>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    stage: { type: String, enum: ['PM', 'OWNER', 'AUTO'], required: true },
    approverUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['APPROVED', 'REJECTED', 'AUTO_APPROVED'], required: true },
    comments: { type: String, trim: true },
    signedTokenUsed: { type: Boolean, default: false },
    approvedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

approvalLogSchema.index({ tenantId: 1, invoiceId: 1, createdAt: -1 });
approvalLogSchema.index({ approverUserId: 1, createdAt: -1 });

export const ApprovalLog = mongoose.model<IApprovalLog>('ApprovalLog', approvalLogSchema);
