import mongoose, { Document, Schema } from 'mongoose';

export interface IWCCode extends Document {
  code: string;
  description: string;
  state: string;
  rate?: number;
  company: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wcCodeSchema = new Schema<IWCCode>(
  {
    code: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true, uppercase: true },
    rate: { type: Number },
    company: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

wcCodeSchema.index({ company: 1, code: 1, state: 1 }, { unique: true });
wcCodeSchema.index({ isActive: 1 });

export const WCCode = mongoose.model<IWCCode>('WCCode', wcCodeSchema);
