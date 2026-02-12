import mongoose, { Document, Schema } from 'mongoose';

/**
 * Contractor - Contractor/subcontractor records for compliance tracking
 */
export interface IContractor extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  aliases: string[]; // Alternative names for matching
  email?: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  insuranceCarrier?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contractorSchema = new Schema<IContractor>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true, trim: true },
    aliases: { type: [String], default: [] },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    insuranceCarrier: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

contractorSchema.index({ tenantId: 1, name: 1 });
contractorSchema.index({ tenantId: 1, aliases: 1 });

export const Contractor = mongoose.model<IContractor>('Contractor', contractorSchema);
