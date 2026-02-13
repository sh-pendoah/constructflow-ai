/**
 * Document-related types
 */

import type { ObjectId, Timestamps } from './common';

export type DocumentType = 'invoice' | 'daily-log' | 'compliance' | 'other';

export type DocumentStatus = 'pending' | 'processing' | 'review' | 'approved' | 'rejected';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedField {
  value: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface DocumentMetadata {
  fileName: string;
  mimeType: string;
  size: number;
  uploadedBy: ObjectId;
  uploadedAt: Date;
}

export interface BaseDocument extends Timestamps {
  _id: ObjectId;
  type: DocumentType;
  status: DocumentStatus;
  metadata: DocumentMetadata;
  blobUrl?: string;
  thumbnailUrl?: string;
}

export interface Invoice extends BaseDocument {
  type: 'invoice';
  vendor?: ExtractedField;
  invoiceNumber?: ExtractedField;
  invoiceDate?: ExtractedField;
  dueDate?: ExtractedField;
  total?: ExtractedField;
  lineItems?: Array<{
    description: ExtractedField;
    quantity: ExtractedField;
    unitPrice: ExtractedField;
    total: ExtractedField;
  }>;
}

export interface DailyLog extends BaseDocument {
  type: 'daily-log';
  projectName?: ExtractedField;
  date?: ExtractedField;
  weather?: ExtractedField;
  workers?: Array<{
    name: ExtractedField;
    hours: ExtractedField;
    trade: ExtractedField;
  }>;
  notes?: ExtractedField;
}

export interface ComplianceDocument extends BaseDocument {
  type: 'compliance';
  documentType?: ExtractedField;
  issuer?: ExtractedField;
  expirationDate?: ExtractedField;
  policyNumber?: ExtractedField;
}
