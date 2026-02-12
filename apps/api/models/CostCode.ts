import mongoose, { Document, Schema } from 'mongoose';

export interface ICostCode extends Document {
  code: string;
  description: string;
  category?: string;
  company: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const costCodeSchema = new Schema<ICostCode>(
  {
    code: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

costCodeSchema.index({ company: 1, code: 1 }, { unique: true });
costCodeSchema.index({ isActive: 1 });

export const CostCode = mongoose.model<ICostCode>('CostCode', costCodeSchema);
