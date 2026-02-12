import mongoose, { Document, Schema } from 'mongoose';

/**
 * Extraction - Versioned OCR and LLM extraction results
 * Stores raw outputs for audit trail and reprocessing
 */
export interface IExtraction extends Document {
  documentId: mongoose.Types.ObjectId;
  version: number;
  
  // OCR data
  ocrProvider: 'AZURE_DOCUMENT_INTELLIGENCE' | 'GOOGLE_VISION' | 'AWS_TEXTRACT' | 'MOCK';
  ocrRawJson: Record<string, unknown>;
  
  // LLM extraction
  llmProvider: 'AZURE_OPENAI' | 'OPENAI' | 'MOCK';
  llmRawJson: Record<string, unknown>;
  
  // Structured extracted data
  extractedData: Record<string, unknown>;
  
  // Bounding boxes for Review Queue overlays
  boundingBoxes?: Array<{
    field: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    page?: number;
    confidence?: number;
  }>;
  
  // Confidence scoring
  confidenceScore: number; // 0-100
  fieldConfidences?: Record<string, number>;
  
  createdAt: Date;
}

const extractionSchema = new Schema<IExtraction>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'WorkflowDocument', required: true },
    version: { type: Number, required: true, default: 1 },
    ocrProvider: {
      type: String,
      enum: ['AZURE_DOCUMENT_INTELLIGENCE', 'GOOGLE_VISION', 'AWS_TEXTRACT', 'MOCK'],
      required: true,
    },
    ocrRawJson: { type: Schema.Types.Mixed, required: true },
    llmProvider: {
      type: String,
      enum: ['AZURE_OPENAI', 'OPENAI', 'MOCK'],
      required: true,
    },
    llmRawJson: { type: Schema.Types.Mixed, required: true },
    extractedData: { type: Schema.Types.Mixed, required: true },
    boundingBoxes: [{
      field: { type: String, required: true },
      text: { type: String, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      page: { type: Number },
      confidence: { type: Number },
    }],
    confidenceScore: { type: Number, required: true, min: 0, max: 100 },
    fieldConfidences: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Indexes
extractionSchema.index({ documentId: 1, version: -1 });
extractionSchema.index({ createdAt: -1 });

export const Extraction = mongoose.model<IExtraction>('Extraction', extractionSchema);
