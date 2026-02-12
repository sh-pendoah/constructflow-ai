/**
 * Swagger/OpenAPI Configuration for Worklighter API
 * 
 * This file configures the API documentation using OpenAPI 3.0 specification.
 * Provides comprehensive documentation for all API endpoints, models, and authentication.
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Worklighter Construction Ops Automation API',
      version: '1.0.0',
      description: `
# Worklighter API Documentation

Worklighter is a lightweight Construction Operations Automation Engine designed to streamline document workflows across construction companies.

## Core Workflows

### 1. Invoice Processing
- Automated OCR extraction of invoice data
- Vendor matching and normalization
- Duplicate detection
- Threshold-based approval routing
- Review queue for exceptions

### 2. Daily Logs + Workers Comp
- Daily log ingestion via email
- Worker hours and task extraction
- Workers Comp code suggestion engine
- Audit report generation
- Job-based tracking

### 3. Compliance & Insurance
- Certificate of Insurance (COI) tracking
- Expiration monitoring (30/15/7/0 day alerts)
- Vendor/Contractor compliance status
- Automated email notifications

## Architecture

- **Email Ingestion**: Documents submitted via dedicated inboxes (invoices@, logs@, compliance@)
- **Azure AI Integration**: OCR (Form Recognizer), LLM extraction (Azure OpenAI)
- **Rules Engine**: Deterministic routing based on confidence, thresholds, and business rules
- **Review Queue**: Unified UI for manual review and corrections
- **Background Workers**: BullMQ-based job processing for OCR and exports
- **Storage**: Azure Blob Storage for documents, MongoDB for metadata

## Authentication

All API endpoints (except /health) require JWT authentication via Bearer token:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

Obtain tokens via POST /api/auth/login with email and password.

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes per IP
- **Document upload**: 50 requests per hour per user
- **Export generation**: 10 requests per hour per user

## Error Responses

All error responses follow this format:

\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional context
}
\`\`\`

Common HTTP status codes:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resources)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error
- **503**: Service Unavailable (dependencies down)

## Pagination

List endpoints support pagination via query parameters:

- **page**: Page number (default: 1)
- **limit**: Results per page (default: 20, max: 100)
- **sortBy**: Field to sort by
- **sortOrder**: "asc" or "desc" (default: "desc")

Response format:

\`\`\`json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`

## Webhooks

Configure webhooks to receive real-time notifications for:
- Document processed
- Review item created
- Approval completed
- Compliance document expiring

Webhook payloads include event type, timestamp, and relevant resource IDs.

## Support

- **Email**: support@worklighter.com
- **Documentation**: https://docs.worklighter.com
- **Status Page**: https://status.worklighter.com
      `,
      contact: {
        name: 'Worklighter Support',
        email: 'support@worklighter.com',
        url: 'https://worklighter.com',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
      {
        url: 'https://staging-api.worklighter.com',
        description: 'Staging Environment',
      },
      {
        url: 'https://api.worklighter.com',
        description: 'Production Environment',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /api/auth/login',
        },
      },
      schemas: {
        // Common Models
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' },
            code: { type: 'string', description: 'Error code for programmatic handling' },
            details: { type: 'object', description: 'Additional error context' },
          },
          required: ['error'],
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            totalItems: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
        
        // Invoice Models
        Invoice: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'objectid' },
            tenantId: { type: 'string', description: 'Company/tenant identifier' },
            invoiceNumber: { type: 'string' },
            vendor: { type: 'string' },
            vendorId: { type: 'string', format: 'objectid', nullable: true },
            amount: { type: 'number', format: 'double' },
            date: { type: 'string', format: 'date' },
            dueDate: { type: 'string', format: 'date', nullable: true },
            jobId: { type: 'string', format: 'objectid', nullable: true },
            costCodeId: { type: 'string', format: 'objectid', nullable: true },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
            },
            documentUrl: { type: 'string', format: 'uri' },
            extractionConfidence: { type: 'number', format: 'float', minimum: 0, maximum: 1 },
            needsReview: { type: 'boolean' },
            reviewedBy: { type: 'string', format: 'objectid', nullable: true },
            reviewedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Daily Log Models
        DailyLog: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'objectid' },
            tenantId: { type: 'string' },
            date: { type: 'string', format: 'date' },
            jobId: { type: 'string', format: 'objectid', nullable: true },
            weather: { type: 'string', nullable: true },
            workPerformed: { type: 'string', nullable: true },
            workers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  hours: { type: 'number', format: 'double' },
                  task: { type: 'string', nullable: true },
                  wcCode: { type: 'string', nullable: true },
                  wcCodeConfidence: { type: 'number', format: 'float', nullable: true },
                  suggestedWcCodes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        code: { type: 'string' },
                        description: { type: 'string' },
                        confidence: { type: 'number', format: 'float' },
                      },
                    },
                  },
                },
              },
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
            },
            needsReview: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Compliance Models
        ComplianceDoc: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'objectid' },
            tenantId: { type: 'string' },
            vendor: { type: 'string' },
            vendorId: { type: 'string', format: 'objectid', nullable: true },
            documentType: {
              type: 'string',
              enum: ['COI', 'LICENSE', 'BOND', 'INSURANCE', 'CERTIFICATION', 'OTHER'],
            },
            issueDate: { type: 'string', format: 'date', nullable: true },
            expirationDate: { type: 'string', format: 'date' },
            policyNumber: { type: 'string', nullable: true },
            coverageAmount: { type: 'number', format: 'double', nullable: true },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'EXPIRING', 'EXPIRED', 'RENEWED'],
            },
            alerts: {
              type: 'object',
              properties: {
                '30_DAY': { type: 'boolean' },
                '30_DAY_sentAt': { type: 'string', format: 'date-time', nullable: true },
                '15_DAY': { type: 'boolean' },
                '15_DAY_sentAt': { type: 'string', format: 'date-time', nullable: true },
                '7_DAY': { type: 'boolean' },
                '7_DAY_sentAt': { type: 'string', format: 'date-time', nullable: true },
                '0_DAY': { type: 'boolean' },
                '0_DAY_sentAt': { type: 'string', format: 'date-time', nullable: true },
              },
            },
            documentUrl: { type: 'string', format: 'uri' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Review Queue Models
        ReviewQueueItem: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'objectid' },
            tenantId: { type: 'string' },
            documentType: {
              type: 'string',
              enum: ['invoice', 'daily-log', 'compliance', 'other'],
            },
            documentId: { type: 'string', format: 'objectid' },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION'],
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            },
            assignedTo: { type: 'string', format: 'objectid', nullable: true },
            exceptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                  message: { type: 'string' },
                  field: { type: 'string', nullable: true },
                  resolved: { type: 'boolean' },
                },
              },
            },
            extractedData: { type: 'object', description: 'Document-specific extracted fields' },
            corrections: { type: 'array', items: { type: 'object' } },
            boundingBoxes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  text: { type: 'string' },
                  x: { type: 'number' },
                  y: { type: 'number' },
                  width: { type: 'number' },
                  height: { type: 'number' },
                  confidence: { type: 'number' },
                },
              },
            },
            reviewNotes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and token management',
      },
      {
        name: 'Invoices',
        description: 'Invoice processing and management',
      },
      {
        name: 'Daily Logs',
        description: 'Daily log submission and workers comp tracking',
      },
      {
        name: 'Compliance',
        description: 'Compliance document and COI management',
      },
      {
        name: 'Review Queue',
        description: 'Review queue for manual document verification',
      },
      {
        name: 'Contractors',
        description: 'Contractor and vendor management',
      },
      {
        name: 'Cost Codes',
        description: 'Cost code management and mapping',
      },
      {
        name: 'WC Codes',
        description: 'Workers Compensation code management',
      },
      {
        name: 'Jobs',
        description: 'Job and project management',
      },
      {
        name: 'Exports',
        description: 'Data export and report generation',
      },
      {
        name: 'Health',
        description: 'System health and status monitoring',
      },
    ],
  },
  apis: [
    './routes/*.ts',
    './routes/*.js',
    './models/*.ts',
    './models/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
