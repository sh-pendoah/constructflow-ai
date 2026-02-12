import mongoose, { Document, Schema } from 'mongoose';

export interface IApprovalRule extends Document {
  name: string;
  company: mongoose.Types.ObjectId;
  threshold: number;
  approvers: mongoose.Types.ObjectId[];
  documentType?: 'invoice' | 'expense' | 'timelog' | 'all';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const approvalRuleSchema = new Schema<IApprovalRule>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    threshold: { type: Number, required: true },
    approvers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    documentType: {
      type: String,
      enum: ['invoice', 'expense', 'timelog', 'all'],
      default: 'all',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

approvalRuleSchema.index({ company: 1, threshold: 1 });
approvalRuleSchema.index({ isActive: 1 });

export const ApprovalRule = mongoose.model<IApprovalRule>('ApprovalRule', approvalRuleSchema);
