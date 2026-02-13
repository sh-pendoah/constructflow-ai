/**
 * Zod schemas for user validation
 */

import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'manager', 'field-user', 'viewer']);

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const userSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleSchema,
  isActive: z.boolean(),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
