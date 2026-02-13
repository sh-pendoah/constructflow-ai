import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from '@azure/ai-form-recognizer';
import { logger } from '../config/logger';

// OCR Result interface
export interface OCRResult {
  text: string;
  confidence: number;
  blocks?: Array<{
    text: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  structuredData?: Record<string, any>;
}

// Extracted field with confidence
export interface ExtractedField {
  value: string;
  confidence: number;
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Invoice extracted data
export interface InvoiceData {
  invoiceNumber?: ExtractedField;
  date?: ExtractedField;
  dueDate?: ExtractedField;
  vendor?: ExtractedField;
  total?: ExtractedField;
  subtotal?: ExtractedField;
  tax?: ExtractedField;
  lineItems?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
  }>;
  confidence: number;
}

// Daily log extracted data
export interface DailyLogData {
  date?: ExtractedField;
  jobName?: ExtractedField;
  weather?: ExtractedField;
  workPerformed?: ExtractedField;
  workers?: Array<{
    name: string;
    hours: number;
    task?: string;
  }>;
  equipment?: Array<{
    name: string;
    hours: number;
  }>;
  materials?: Array<{
    name: string;
    quantity: number;
  }>;
  confidence: number;
}

// Compliance document extracted data
export interface ComplianceData {
  vendor?: ExtractedField;
  documentType?: ExtractedField;
  expirationDate?: ExtractedField;
  issueDate?: ExtractedField;
  policyNumber?: ExtractedField;
  coverageAmount?: ExtractedField;
  confidence: number;
}

// OCR Provider interface
export interface OCRProvider {
  name: string;
  processDocument(filePath: string, mimeType: string): Promise<OCRResult>;
}

/**
 * Mock OCR Provider (for development/testing)
 */
class MockOCRProvider implements OCRProvider {
  name = 'mock';

  async processDocument(
    filePath: string,
    mimeType: string
  ): Promise<OCRResult> {
    logger.info(`Mock OCR processing ${filePath}`);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      text: 'Mock OCR result text',
      confidence: 0.85,
      blocks: [
        {
          text: 'Mock Invoice #12345',
          confidence: 0.9,
        },
        {
          text: 'Total: $1,234.56',
          confidence: 0.85,
        },
      ],
    };
  }
}

/**
 * Google Vision OCR Provider
 */
class GoogleVisionProvider implements OCRProvider {
  name = 'google-vision';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processDocument(
    filePath: string,
    mimeType: string
  ): Promise<OCRResult> {
    logger.info(`Google Vision OCR processing ${filePath}`);

    // TODO: Implement actual Google Vision API integration
    // For now, return mock data
    logger.warn('Google Vision API not fully implemented, returning mock data');

    return {
      text: 'Google Vision placeholder result',
      confidence: 0.9,
      blocks: [],
    };
  }
}

/**
 * AWS Textract OCR Provider
 */
class AWSTextractProvider implements OCRProvider {
  name = 'aws-textract';
  private accessKey: string;
  private secretKey: string;

  constructor(accessKey: string, secretKey: string) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
  }

  async processDocument(
    filePath: string,
    mimeType: string
  ): Promise<OCRResult> {
    logger.info(`AWS Textract processing ${filePath}`);

    // TODO: Implement actual AWS Textract integration
    logger.warn('AWS Textract not fully implemented, returning mock data');

    return {
      text: 'AWS Textract placeholder result',
      confidence: 0.88,
      blocks: [],
    };
  }
}

/**
 * Mindee OCR Provider
 */
class MindeeProvider implements OCRProvider {
  name = 'mindee';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processDocument(
    filePath: string,
    mimeType: string
  ): Promise<OCRResult> {
    logger.info(`Mindee OCR processing ${filePath}`);

    // TODO: Implement actual Mindee API integration
    logger.warn('Mindee API not fully implemented, returning mock data');

    return {
      text: 'Mindee placeholder result',
      confidence: 0.92,
      blocks: [],
    };
  }
}

/**
 * Azure Form Recognizer Pre-built Models Provider
 * Uses Azure's pre-trained models for invoices and receipts
 */
class AzureFormRecognizerProvider implements OCRProvider {
  name = 'azure-form-recognizer';
  private client: DocumentAnalysisClient;

  constructor(endpoint: string, apiKey: string) {
    this.client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );
  }

  async processDocument(
    filePath: string,
    mimeType: string
  ): Promise<OCRResult> {
    logger.info(`Azure Form Recognizer processing ${filePath}`);

    try {
      const fs = require('fs');
      const fileContent = fs.readFileSync(filePath);

      // Determine which pre-built model to use based on document type
      // For now, use 'prebuilt-invoice' for all documents
      // In production, you'd detect document type first
      const modelId = 'prebuilt-invoice';

      const poller = await this.client.beginAnalyzeDocument(
        modelId,
        fileContent
      );
      const result = await poller.pollUntilDone();

      if (!result || !result.documents || result.documents.length === 0) {
        throw new Error('No documents analyzed');
      }

      // Extract text and confidence
      let fullText = '';
      const blocks: Array<{
        text: string;
        confidence: number;
        boundingBox?: { x: number; y: number; width: number; height: number };
      }> = [];

      // Process pages for text content
      if (result.pages) {
        for (const page of result.pages) {
          if (page.lines) {
            for (const line of page.lines) {
              fullText += line.content + '\n';

              // Extract bounding box
              let boundingBox;
              if (line.polygon && line.polygon.length >= 4) {
                const points = line.polygon;
                const xCoords = points
                  .filter((_: any, i: number) => i % 2 === 0)
                  .map((p: any) => p.x || p);
                const yCoords = points
                  .filter((_: any, i: number) => i % 2 === 1)
                  .map((p: any) => p.y || p);

                boundingBox = {
                  x: Math.min(...xCoords),
                  y: Math.min(...yCoords),
                  width: Math.max(...xCoords) - Math.min(...xCoords),
                  height: Math.max(...yCoords) - Math.min(...yCoords),
                };
              }

              blocks.push({
                text: line.content,
                confidence: (line as any).confidence || 0.9,
                boundingBox,
              });
            }
          }
        }
      }

      // Extract structured data from pre-built model
      const doc = result.documents[0];
      const structuredData: Record<string, any> = {};

      if (doc.fields) {
        // Extract invoice-specific fields
        for (const [fieldName, field] of Object.entries(doc.fields)) {
          if (field && (field as any).value !== undefined) {
            structuredData[fieldName] = {
              value: (field as any).value,
              confidence: (field as any).confidence || 0.9,
            };
          }
        }
      }

      const averageConfidence =
        blocks.length > 0
          ? blocks.reduce((sum, block) => sum + block.confidence, 0) /
            blocks.length
          : 0.9;

      logger.info(
        `Azure Form Recognizer completed with confidence: ${averageConfidence}`
      );

      return {
        text: fullText.trim(),
        confidence: averageConfidence,
        blocks,
        structuredData,
      };
    } catch (error) {
      logger.error('Azure Form Recognizer error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Azure Form Recognizer processing failed: ${errorMessage}`
      );
    }
  }
}

// LLM Provider interface
export interface LLMProvider {
  name: string;
  extractStructuredData(
    ocrText: string,
    documentType: string,
    schema: any
  ): Promise<Record<string, any>>;
}

// Azure OpenAI LLM Provider
class AzureOpenAIProvider implements LLMProvider {
  name = 'azure-openai';
  private endpoint: string;
  private apiKey: string;
  private deployment: string;

  constructor(endpoint: string, apiKey: string, deployment: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.deployment = deployment;
  }

  async extractStructuredData(
    ocrText: string,
    documentType: string,
    schema: any
  ): Promise<Record<string, any>> {
    logger.info(`Azure OpenAI extracting ${documentType} data`);

    try {
      const prompt = this.buildExtractionPrompt(ocrText, documentType, schema);

      const response = await this.callAzureOpenAI(prompt);

      // Parse and validate the response
      const extractedData = JSON.parse(response);

      logger.info(`LLM extraction completed for ${documentType}`);
      return extractedData;
    } catch (error) {
      logger.error('Azure OpenAI extraction error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`LLM extraction failed: ${errorMessage}`);
    }
  }

  private buildExtractionPrompt(
    ocrText: string,
    documentType: string,
    schema: any
  ): string {
    const schemaStr = JSON.stringify(schema, null, 2);

    return `Extract structured data from the following document text. The document type is: ${documentType}

Document Text:
${ocrText}

Expected Output Schema:
${schemaStr}

Instructions:
1. Extract all relevant information that matches the schema
2. For dates, use ISO format (YYYY-MM-DD)
3. For amounts, extract as numbers without currency symbols
4. For confidence scores, provide values between 0 and 1
5. If a field is not found, omit it from the result
6. Return only valid JSON that matches the schema structure

Extracted Data:`;
  }

  private async callAzureOpenAI(prompt: string): Promise<string> {
    const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2025-03-01-preview`;

    const payload = {
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.1, // Low temperature for consistent extraction
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Azure OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data: any = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

// Mock LLM Provider for development/testing
class MockLLMProvider implements LLMProvider {
  name = 'mock-llm';

  async extractStructuredData(
    ocrText: string,
    documentType: string,
    schema: any
  ): Promise<Record<string, any>> {
    logger.info(`Mock LLM extracting ${documentType} data`);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return mock data based on document type
    switch (documentType) {
      case 'invoice':
        return {
          invoiceNumber: { value: 'INV-001', confidence: 0.95 },
          date: { value: '2024-01-15', confidence: 0.9 },
          vendor: { value: 'ABC Construction', confidence: 0.85 },
          total: { value: 1234.56, confidence: 0.95 },
          confidence: 0.89,
        };

      case 'daily-log':
        return {
          date: { value: '2024-01-15', confidence: 0.95 },
          workers: [
            { name: 'John Smith', hours: 8, task: 'Carpentry' },
            { name: 'Jane Doe', hours: 6, task: 'Electrical' },
          ],
          confidence: 0.82,
        };

      case 'compliance':
        return {
          vendor: { value: 'XYZ Insurance', confidence: 0.9 },
          expirationDate: { value: '2024-12-31', confidence: 0.95 },
          documentType: { value: 'COI', confidence: 0.85 },
          confidence: 0.87,
        };

      default:
        return { confidence: 0.5 };
    }
  }
}

/**
 * Azure AI Document Intelligence OCR Provider
 */
class AzureDocumentIntelligenceProvider implements OCRProvider {
  name = 'azure-document-intelligence';
  private endpoint: string;
  private apiKey: string;

  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async processDocument(
    filePath: string,
    mimeType: string
  ): Promise<OCRResult> {
    logger.info(`Azure Document Intelligence processing ${filePath}`);

    try {
      // Read file content
      const fs = require('fs');
      const fileContent = fs.readFileSync(filePath);

      // Prepare form data for Azure Document Intelligence API
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fileContent, {
        filename: 'document',
        contentType: mimeType,
      });

      // Make API call to Azure Document Intelligence
      const https = require('https');
      const url = `${this.endpoint}/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2024-11-30`;

      const options = {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          ...formData.getHeaders(),
        },
      };

      const result = await this.makeHttpsRequest(url, options, formData);

      // Parse the response and extract text and bounding boxes
      const analysis = JSON.parse(result);

      if (!analysis.analyzeResult || !analysis.analyzeResult.pages) {
        throw new Error('Invalid response from Azure Document Intelligence');
      }

      let fullText = '';
      const blocks: Array<{
        text: string;
        confidence: number;
        boundingBox?: { x: number; y: number; width: number; height: number };
      }> = [];

      // Process each page
      for (const page of analysis.analyzeResult.pages) {
        // Add page text
        if (page.lines) {
          for (const line of page.lines) {
            fullText += line.content + '\n';

            // Extract bounding box if available
            let boundingBox;
            if (line.polygon && line.polygon.length >= 4) {
              // Calculate bounding box from polygon
              const xCoords = line.polygon.filter(
                (_: any, i: number) => i % 2 === 0
              );
              const yCoords = line.polygon.filter(
                (_: any, i: number) => i % 2 === 1
              );
              const minX = Math.min(...xCoords);
              const maxX = Math.max(...xCoords);
              const minY = Math.min(...yCoords);
              const maxY = Math.max(...yCoords);

              boundingBox = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
              };
            }

            blocks.push({
              text: line.content,
              confidence: line.confidence || 0.8,
              boundingBox,
            });
          }
        }
      }

      const averageConfidence =
        blocks.length > 0
          ? blocks.reduce((sum, block) => sum + block.confidence, 0) /
            blocks.length
          : 0.8;

      return {
        text: fullText.trim(),
        confidence: averageConfidence,
        blocks,
      };
    } catch (error) {
      logger.error('Azure Document Intelligence error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Azure Document Intelligence processing failed: ${errorMessage}`
      );
    }
  }

  private makeHttpsRequest(
    url: string,
    options: any,
    formData: any
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = require('https').request(url, options, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error: any) => {
        reject(error);
      });

      // Pipe form data to request
      formData.pipe(req);
    });
  }
}

/**
 * OCR Service with provider abstraction
 */
class OCRService {
  public ocrProvider: OCRProvider;
  public llmProvider: LLMProvider;

  constructor() {
    this.ocrProvider = this.initializeOCRProvider();
    this.llmProvider = this.initializeLLMProvider();
  }

  private initializeOCRProvider(): OCRProvider {
    const providerName = process.env.OCR_PROVIDER || 'mock';

    switch (providerName.toLowerCase()) {
      case 'azure-form-recognizer':
        if (
          !process.env.AZURE_FORM_RECOGNIZER_ENDPOINT ||
          !process.env.AZURE_FORM_RECOGNIZER_API_KEY
        ) {
          logger.warn(
            'Azure Form Recognizer credentials not set, falling back to Document Intelligence'
          );
          // Try Document Intelligence as fallback
          if (
            process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT &&
            process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY
          ) {
            return new AzureDocumentIntelligenceProvider(
              process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
              process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY
            );
          }
          logger.warn(
            'Azure Document Intelligence credentials not set either, falling back to mock'
          );
          return new MockOCRProvider();
        }
        return new AzureFormRecognizerProvider(
          process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
          process.env.AZURE_FORM_RECOGNIZER_API_KEY
        );

      case 'azure-document-intelligence':
        if (
          !process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT ||
          !process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY
        ) {
          logger.warn(
            'Azure Document Intelligence credentials not set, falling back to mock'
          );
          return new MockOCRProvider();
        }
        return new AzureDocumentIntelligenceProvider(
          process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
          process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY
        );

      case 'google-vision':
        if (!process.env.GOOGLE_VISION_API_KEY) {
          logger.warn('GOOGLE_VISION_API_KEY not set, falling back to mock');
          return new MockOCRProvider();
        }
        return new GoogleVisionProvider(process.env.GOOGLE_VISION_API_KEY);

      case 'aws-textract':
        if (
          !process.env.AWS_ACCESS_KEY_ID ||
          !process.env.AWS_SECRET_ACCESS_KEY
        ) {
          logger.warn('AWS credentials not set, falling back to mock');
          return new MockOCRProvider();
        }
        return new AWSTextractProvider(
          process.env.AWS_ACCESS_KEY_ID,
          process.env.AWS_SECRET_ACCESS_KEY
        );

      case 'mindee':
        if (!process.env.MINDEE_API_KEY) {
          logger.warn('MINDEE_API_KEY not set, falling back to mock');
          return new MockOCRProvider();
        }
        return new MindeeProvider(process.env.MINDEE_API_KEY);

      case 'mock':
      default:
        logger.info('Using mock OCR provider');
        return new MockOCRProvider();
    }
  }

  private initializeLLMProvider(): LLMProvider {
    const providerName = process.env.LLM_PROVIDER || 'mock';

    switch (providerName.toLowerCase()) {
      case 'azure-openai':
        if (
          !process.env.AZURE_OPENAI_ENDPOINT ||
          !process.env.AZURE_OPENAI_API_KEY ||
          !process.env.AZURE_OPENAI_DEPLOYMENT
        ) {
          logger.warn('Azure OpenAI credentials not set, falling back to mock');
          return new MockLLMProvider();
        }
        return new AzureOpenAIProvider(
          process.env.AZURE_OPENAI_ENDPOINT,
          process.env.AZURE_OPENAI_API_KEY,
          process.env.AZURE_OPENAI_DEPLOYMENT
        );

      case 'mock':
      default:
        logger.info('Using mock LLM provider');
        return new MockLLMProvider();
    }
  }

  /**
   * Process document with OCR
   */
  async processDocument(
    filePath: string,
    mimeType: string
  ): Promise<OCRResult> {
    try {
      logger.info(
        `Processing document with ${this.ocrProvider.name}: ${filePath}`
      );
      const result = await this.ocrProvider.processDocument(filePath, mimeType);

      logger.info(`OCR completed with confidence: ${result.confidence}`);
      return result;
    } catch (error) {
      logger.error(`OCR processing failed:`, error);
      throw error;
    }
  }

  /**
   * Extract invoice data from OCR result using LLM
   */
  async extractInvoiceData(ocrResult: OCRResult): Promise<InvoiceData> {
    try {
      logger.info('Extracting invoice data with LLM');

      const schema = {
        invoiceNumber: { value: 'string', confidence: 'number' },
        date: { value: 'string', confidence: 'number' },
        dueDate: { value: 'string', confidence: 'number' },
        vendor: { value: 'string', confidence: 'number' },
        total: { value: 'number', confidence: 'number' },
        subtotal: { value: 'number', confidence: 'number' },
        tax: { value: 'number', confidence: 'number' },
        confidence: 'number',
      };

      const extractedData = await this.llmProvider.extractStructuredData(
        ocrResult.text,
        'invoice',
        schema
      );

      // Add bounding boxes if available
      if (extractedData.invoiceNumber && ocrResult.blocks) {
        extractedData.invoiceNumber.location = this.findBoundingBox(
          ocrResult.blocks,
          extractedData.invoiceNumber.value
        );
      }
      if (extractedData.vendor && ocrResult.blocks) {
        extractedData.vendor.location = this.findBoundingBox(
          ocrResult.blocks,
          extractedData.vendor.value
        );
      }

      return extractedData as InvoiceData;
    } catch (error) {
      logger.error('Invoice extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract daily log data from OCR result using LLM
   */
  async extractDailyLogData(ocrResult: OCRResult): Promise<DailyLogData> {
    try {
      logger.info('Extracting daily log data with LLM');

      const schema = {
        date: { value: 'string', confidence: 'number' },
        jobName: { value: 'string', confidence: 'number' },
        weather: { value: 'string', confidence: 'number' },
        workPerformed: { value: 'string', confidence: 'number' },
        workers: [
          {
            name: 'string',
            hours: 'number',
            task: 'string',
          },
        ],
        equipment: [
          {
            name: 'string',
            hours: 'number',
          },
        ],
        materials: [
          {
            name: 'string',
            quantity: 'number',
          },
        ],
        confidence: 'number',
      };

      const extractedData = await this.llmProvider.extractStructuredData(
        ocrResult.text,
        'daily-log',
        schema
      );

      return extractedData as DailyLogData;
    } catch (error) {
      logger.error('Daily log extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract compliance data from OCR result using LLM
   */
  async extractComplianceData(ocrResult: OCRResult): Promise<ComplianceData> {
    try {
      logger.info('Extracting compliance data with LLM');

      const schema = {
        vendor: { value: 'string', confidence: 'number' },
        documentType: { value: 'string', confidence: 'number' },
        expirationDate: { value: 'string', confidence: 'number' },
        issueDate: { value: 'string', confidence: 'number' },
        policyNumber: { value: 'string', confidence: 'number' },
        coverageAmount: { value: 'number', confidence: 'number' },
        confidence: 'number',
      };

      const extractedData = await this.llmProvider.extractStructuredData(
        ocrResult.text,
        'compliance',
        schema
      );

      return extractedData as ComplianceData;
    } catch (error) {
      logger.error('Compliance extraction failed:', error);
      throw error;
    }
  }

  /**
   * Find bounding box for extracted text
   */
  private findBoundingBox(
    blocks: Array<{ text: string; boundingBox?: any }>,
    searchText: string
  ): { x: number; y: number; width: number; height: number } | undefined {
    // Simple text matching - could be improved with fuzzy matching
    const normalizedSearch = searchText.toLowerCase().trim();

    for (const block of blocks) {
      if (
        block.text.toLowerCase().includes(normalizedSearch) &&
        block.boundingBox
      ) {
        return block.boundingBox;
      }
    }

    return undefined;
  }

  /**
   * Get confidence threshold for auto-processing
   */
  getConfidenceThreshold(documentType: string): number {
    const thresholds: Record<string, number> = {
      invoice: 0.85,
      'daily-log': 0.75,
      compliance: 0.8,
      other: 0.7,
    };

    return thresholds[documentType] || 0.7;
  }

  /**
   * Check if document needs manual review
   */
  needsManualReview(confidence: number, documentType: string): boolean {
    const threshold = this.getConfidenceThreshold(documentType);
    return confidence < threshold;
  }
}

// Export singleton instance
export const ocrService = new OCRService();
export default ocrService;
