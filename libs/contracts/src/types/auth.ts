/**
 * Authentication and user types
 */

import type { ObjectId, Timestamps } from './common';

export type UserRole = 'admin' | 'manager' | 'field-user' | 'viewer';

export interface User extends Timestamps {
  _id: ObjectId;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
}

export interface AuthTokenPayload {
  userId: ObjectId;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
}
