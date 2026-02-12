import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  jobNumber: string;
  name: string;
  description?: string;
  company: mongoose.Types.ObjectId;
  customer?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  costCodes: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    jobNumber: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zip: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'on-hold', 'cancelled'],
      default: 'active',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number },
    costCodes: [{ type: Schema.Types.ObjectId, ref: 'CostCode' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

jobSchema.index({ company: 1, jobNumber: 1 });
jobSchema.index({ status: 1 });

export const Job = mongoose.model<IJob>('Job', jobSchema);
