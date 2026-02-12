import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  settings: {
    invoiceThresholds?: {
      pmAutoApproveLimit?: number;
      ownerApprovalLimit?: number;
    };
    approvalRouting?: Record<string, unknown>;
    alertPreferences?: {
      complianceAlerts?: boolean;
      expirationDays?: number[];
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    settings: {
      type: {
        invoiceThresholds: {
          pmAutoApproveLimit: { type: Number, default: 5000 },
          ownerApprovalLimit: { type: Number, default: 25000 },
        },
        approvalRouting: { type: Schema.Types.Mixed, default: {} },
        alertPreferences: {
          complianceAlerts: { type: Boolean, default: true },
          expirationDays: { type: [Number], default: [30, 15, 7, 0] },
        },
      },
      default: {},
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tenantSchema.index({ name: 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);
