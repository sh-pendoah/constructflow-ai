import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'REVIEWER' | 'PM' | 'OWNER' | 'manager' | 'worker';
  tenantId?: mongoose.Types.ObjectId; // Multi-tenant support
  company?: string; // Legacy field - kept for backward compatibility
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['ADMIN', 'REVIEWER', 'PM', 'OWNER', 'admin', 'manager', 'worker'], default: 'worker' },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    company: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password, ...result } = ret;
    return result;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
