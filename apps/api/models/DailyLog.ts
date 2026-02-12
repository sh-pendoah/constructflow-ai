import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyLog extends Document {
  job: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  date: Date;
  weather?: string;
  workPerformed: string;
  workers: Array<{
    name: string;
    hours: number;
    wcCode?: mongoose.Types.ObjectId;
  }>;
  equipment?: Array<{
    name: string;
    hours: number;
  }>;
  materials?: Array<{
    name: string;
    quantity: number;
    unit?: string;
  }>;
  notes?: string;
  documentUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const dailyLogSchema = new Schema<IDailyLog>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    weather: { type: String, trim: true },
    workPerformed: { type: String, required: true, trim: true },
    workers: [
      {
        name: { type: String, required: true, trim: true },
        hours: { type: Number, required: true },
        wcCode: { type: Schema.Types.ObjectId, ref: 'WCCode' },
      },
    ],
    equipment: [
      {
        name: { type: String, required: true, trim: true },
        hours: { type: Number, required: true },
      },
    ],
    materials: [
      {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true },
        unit: { type: String, trim: true },
      },
    ],
    notes: { type: String, trim: true },
    documentUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

dailyLogSchema.index({ company: 1, job: 1, date: 1 });
dailyLogSchema.index({ date: 1 });

export const DailyLog = mongoose.model<IDailyLog>('DailyLog', dailyLogSchema);
