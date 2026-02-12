import mongoose, { Document, Schema } from 'mongoose';

/**
 * Vendor - Normalized vendor/supplier records with aliases for matching
 */
export interface IVendor extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  aliases: string[]; // Alternative names for fuzzy matching
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true, trim: true },
    aliases: { type: [String], default: [] },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    taxId: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vendorSchema.index({ tenantId: 1, name: 1 });
vendorSchema.index({ tenantId: 1, aliases: 1 });

export const Vendor = mongoose.model<IVendor>('Vendor', vendorSchema);
