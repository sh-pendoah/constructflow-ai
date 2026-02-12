import mongoose, { Document, Schema } from 'mongoose';

export interface ICOIVendor extends Document {
  name: string;
  email?: string;
  phone?: string;
  company: mongoose.Types.ObjectId;
  certificateNumber?: string;
  expirationDate?: Date;
  documentUrl?: string;
  status: 'valid' | 'expired' | 'pending' | 'missing';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const coiVendorSchema = new Schema<ICOIVendor>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    certificateNumber: { type: String, trim: true },
    expirationDate: { type: Date },
    documentUrl: { type: String },
    status: {
      type: String,
      enum: ['valid', 'expired', 'pending', 'missing'],
      default: 'pending',
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

coiVendorSchema.index({ company: 1, name: 1 });
coiVendorSchema.index({ status: 1 });
coiVendorSchema.index({ expirationDate: 1 });

export const COIVendor = mongoose.model<ICOIVendor>('COIVendor', coiVendorSchema);
