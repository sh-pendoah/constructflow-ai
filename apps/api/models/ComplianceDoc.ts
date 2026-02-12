import mongoose, { Document, Schema } from 'mongoose';

export interface IComplianceDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  type: 'coi' | 'license' | 'permit' | 'certification' | 'other';
  title: string;
  company: mongoose.Types.ObjectId;
  contractorId?: mongoose.Types.ObjectId;
  contractorName?: string;
  vendor?: mongoose.Types.ObjectId;
  documentNumber?: string;
  issueDate?: Date;
  expirationDate?: Date;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'INACTIVE';
  documentUrl: string;
  notes?: string;
  alerts?: {
    '30_DAY'?: boolean;
    '30_DAY_sentAt'?: Date;
    '15_DAY'?: boolean;
    '15_DAY_sentAt'?: Date;
    '7_DAY'?: boolean;
    '7_DAY_sentAt'?: Date;
  };
  lastStatusChange?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const complianceDocSchema = new Schema<IComplianceDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    type: {
      type: String,
      enum: ['coi', 'license', 'permit', 'certification', 'other'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contractorId: { type: Schema.Types.ObjectId, ref: 'Contractor' },
    contractorName: { type: String, trim: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'COIVendor' },
    documentNumber: { type: String, trim: true },
    issueDate: { type: Date },
    expirationDate: { type: Date },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRING', 'EXPIRED', 'INACTIVE'],
      default: 'ACTIVE',
    },
    documentUrl: { type: String, required: true },
    notes: { type: String, trim: true },
    alerts: {
      '30_DAY': { type: Boolean },
      '30_DAY_sentAt': { type: Date },
      '15_DAY': { type: Boolean },
      '15_DAY_sentAt': { type: Date },
      '7_DAY': { type: Boolean },
      '7_DAY_sentAt': { type: Date },
    },
    lastStatusChange: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

complianceDocSchema.index({ tenantId: 1, company: 1, type: 1 });
complianceDocSchema.index({ status: 1 });
complianceDocSchema.index({ expirationDate: 1 });
complianceDocSchema.index({ contractorId: 1 });

export const ComplianceDoc = mongoose.model<IComplianceDoc>('ComplianceDoc', complianceDocSchema);
