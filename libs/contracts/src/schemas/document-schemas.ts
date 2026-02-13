/**
 * Zod schemas for document validation
 */

import { z } from 'zod';

export const documentTypeSchema = z.enum(['invoice', 'daily-log', 'compliance', 'other']);

export const documentStatusSchema = z.enum(['pending', 'processing', 'review', 'approved', 'rejected']);

export const boundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const extractedFieldSchema = z.object({
  value: z.string(),
  confidence: z.number().min(0).max(1),
  boundingBox: boundingBoxSchema.optional(),
});

export const documentMetadataSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  uploadedBy: z.string(),
  uploadedAt: z.date(),
});
