import mongoose, { Document, Schema } from 'mongoose';

/**
 * Worker - Worker records for daily log matching
 */
export interface IWorker extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  aliases: string[]; // Alternative names for fuzzy matching
  role?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workerSchema = new Schema<IWorker>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true, trim: true },
    aliases: { type: [String], default: [] },
    role: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

workerSchema.index({ tenantId: 1, name: 1 });
workerSchema.index({ tenantId: 1, aliases: 1 });

export const Worker = mongoose.model<IWorker>('Worker', workerSchema);
