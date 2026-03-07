import crypto from 'crypto';
import mongoose, { Document, Schema } from 'mongoose';

export interface IAuthToken extends Document {
  tokenHash: string;
  email: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const authTokenSchema = new Schema<IAuthToken>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL index: automatically remove expired tokens after they expire
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export const AuthToken = mongoose.model<IAuthToken>('AuthToken', authTokenSchema);
