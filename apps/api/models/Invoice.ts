import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  vendor: string;
  job?: mongoose.Types.ObjectId;
  costCode?: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  amount: number;
  dueDate?: Date;
  invoiceDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'processing';
  documentUrl?: string;
  extractedData?: Record<string, unknown>;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, trim: true },
    vendor: { type: String, required: true, trim: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    costCode: { type: Schema.Types.ObjectId, ref: 'CostCode' },
    company: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date },
    invoiceDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid', 'processing'],
      default: 'pending',
    },
    documentUrl: { type: String },
    extractedData: { type: Schema.Types.Mixed },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ company: 1, invoiceNumber: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ job: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
