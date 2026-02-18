# docflow-360 Core API Documentation

## Overview
The docflow-360 Core API provides backend services for construction document management, invoice processing, workers compensation tracking, and compliance monitoring.

## Base URL
- Local: `http://localhost:3000/api`
- Staging: `https://staging-api.docflow-360.com/api`
- Production: `https://api.docflow-360.com/api`

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "admin|manager|worker",
  "company": "Company Name"
}
```

**Response:** `201 Created`
```json
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### GET /auth/me
Get current user profile.

**Response:** `200 OK`
```json
{
  "user": { ... }
}
```

---

### Jobs

#### GET /jobs
List all jobs for the company.

**Response:** `200 OK`
```json
{
  "jobs": [
    {
      "_id": "...",
      "jobNumber": "J-2024-001",
      "name": "Main Street Project",
      "status": "active",
      "budget": 50000,
      ...
    }
  ]
}
```

#### GET /jobs/:id
Get a specific job by ID.

#### POST /jobs
Create a new job.

**Request Body:**
```json
{
  "jobNumber": "J-2024-001",
  "name": "Main Street Project",
  "description": "Project description",
  "customer": "Customer Name",
  "status": "active",
  "budget": 50000,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

#### PUT /jobs/:id
Update a job.

#### DELETE /jobs/:id
Delete a job.

---

### Cost Codes

#### GET /cost-codes
List all cost codes.

**Query Parameters:**
- `isActive`: Filter by active status (true/false)

#### POST /cost-codes
Create a new cost code.

**Request Body:**
```json
{
  "code": "CC-001",
  "description": "Labor - Carpentry",
  "category": "Labor",
  "isActive": true
}
```

#### POST /cost-codes/import
Import cost codes from CSV file.

**Request:** `multipart/form-data` with file field named `file`

**CSV Format:**
```
code,description,category
CC-001,Labor - Carpentry,Labor
CC-002,Materials - Lumber,Materials
```

#### GET /cost-codes/export/csv
Export cost codes to CSV.

---

### Workers Compensation Codes

#### GET /wc-codes
List all WC codes.

**Query Parameters:**
- `state`: Filter by state
- `isActive`: Filter by active status

#### POST /wc-codes
Create a new WC code.

**Request Body:**
```json
{
  "code": "5403",
  "description": "Carpentry",
  "state": "CA",
  "rate": 12.50,
  "isActive": true
}
```

#### POST /wc-codes/import
Import WC codes from CSV file.

#### GET /wc-codes/export/csv
Export WC codes to CSV.

---

### COI Vendors

#### GET /coi-vendors
List all COI vendors.

**Query Parameters:**
- `status`: Filter by status (valid, expired, pending, missing)

#### GET /coi-vendors/expiring
Get vendors with COIs expiring within 30 days.

#### POST /coi-vendors
Create a new COI vendor.

**Request Body:**
```json
{
  "name": "ABC Contractors",
  "email": "contact@abc.com",
  "phone": "555-1234",
  "certificateNumber": "COI-12345",
  "expirationDate": "2024-12-31",
  "status": "valid"
}
```

---

### Approval Rules

#### GET /approval-rules
List all approval rules.

#### POST /approval-rules
Create a new approval rule.

**Request Body:**
```json
{
  "name": "Invoice Approval - Over $5000",
  "threshold": 5000,
  "approvers": ["user-id-1", "user-id-2"],
  "documentType": "invoice",
  "isActive": true
}
```

---

### Invoices

#### GET /invoices
List all invoices.

**Query Parameters:**
- `status`: Filter by status (pending, approved, rejected, paid, processing)
- `job`: Filter by job ID

#### POST /invoices
Create a new invoice.

**Request Body:**
```json
{
  "invoiceNumber": "INV-2024-001",
  "vendor": "Supplier Inc",
  "job": "job-id",
  "costCode": "cost-code-id",
  "amount": 7500,
  "invoiceDate": "2024-01-15",
  "dueDate": "2024-02-15"
}
```

**Response:** Includes `requiresApproval` flag if threshold exceeded.

#### POST /invoices/:id/approve
Approve an invoice.

#### POST /invoices/:id/reject
Reject an invoice.

**Request Body:**
```json
{
  "notes": "Reason for rejection"
}
```

---

### Daily Logs

#### GET /daily-logs
List all daily logs.

**Query Parameters:**
- `job`: Filter by job ID
- `startDate`: Filter by date range
- `endDate`: Filter by date range

#### POST /daily-logs
Create a new daily log.

**Request Body:**
```json
{
  "job": "job-id",
  "date": "2024-01-15",
  "weather": "Sunny, 72°F",
  "workPerformed": "Framing completed on north wall",
  "workers": [
    {
      "name": "John Doe",
      "hours": 8,
      "wcCode": "wc-code-id"
    }
  ],
  "equipment": [
    {
      "name": "Excavator",
      "hours": 4
    }
  ]
}
```

#### GET /daily-logs/export/wc-report
Export Workers Comp report with aggregated hours by WC code.

**Query Parameters:**
- `startDate`: Report start date
- `endDate`: Report end date
- `job`: Filter by job ID (optional)

---

### Compliance Documents

#### GET /compliance
List all compliance documents.

**Query Parameters:**
- `type`: Filter by type (coi, license, permit, certification, other)
- `status`: Filter by status (valid, expired, expiring-soon, pending)

#### GET /compliance/expiring
Get documents expiring within 30 days.

#### GET /compliance/expired
Get expired documents.

#### POST /compliance
Create a new compliance document.

**Request Body:**
```json
{
  "type": "coi",
  "title": "Certificate of Insurance",
  "vendor": "vendor-id",
  "documentNumber": "COI-12345",
  "issueDate": "2024-01-01",
  "expirationDate": "2024-12-31",
  "documentUrl": "/uploads/coi-12345.pdf",
  "status": "valid"
}
```

---

### Health Check

#### GET /health
Check API health status.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "database": "connected",
  "redis": "connected"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Background Services

### Document Processing Queue
Documents uploaded to the system are automatically queued for processing using BullMQ. The processing includes:
- OCR extraction (placeholder ready for Google Vision API integration)
- Data extraction based on document type
- Automatic field population

### Compliance Scheduler
A scheduled job runs daily at 9 AM to:
- Check for expiring documents (within 30 days)
- Update document statuses (expired, expiring-soon)
- Send email notifications to company admins

### Email Notifications
The system sends automated emails for:
- Approval requests
- Compliance document expirations
- COI vendor expirations
- Welcome emails for new users

---

## Configuration

### Environment Variables

```bash
# Server
CORE_API_PORT=3000
NODE_ENV=local|staging|production

# MongoDB
MONGO_URI=mongodb://user:pass@host:port/database
MONGO_USER=admin
MONGO_PASSWORD=password
MONGO_PORT=27017
MONGO_DB=docflow-360

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@docflow-360.com

# File Uploads
MAX_FILE_SIZE=50mb
UPLOAD_DIR=/tmp/uploads

# AI/OpenAI (for future OCR integration)
OPENAI_API_KEY=your-key
OPENAI_CHAT_MODEL=gpt-4o

# CORS
CORS_ORIGINS=http://localhost:3001,http://localhost:5173
```

---

## Development

### Running Locally

1. Start infrastructure services:
   ```bash
   npm run infra:up
   ```

2. Install dependencies:
   ```bash
   cd apps/api && npm install
   ```

3. Start the API:
   ```bash
   npm run dev:local
   ```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

---

## Next Steps / TODOs

1. **OCR Integration**: Integrate Google Vision API in `services/documentProcessing.ts`
2. **Document Classification**: Implement ML model for document type classification
3. **Email Ingestion**: Add email parsing for automated invoice/document import
4. **Audit Logging**: Add comprehensive audit trail for all changes
5. **Rate Limiting**: Add API rate limiting per user/company
6. **Comprehensive Tests**: Add unit and integration tests
7. **API Versioning**: Implement API versioning strategy
8. **Webhooks**: Add webhook support for real-time integrations

---

## Review Queue API

### GET /review-queue
List review queue items with filtering and pagination.

**Query Parameters:**
- `documentType` - Filter by document type (invoice, daily-log, compliance, other)
- `status` - Filter by status (pending, in-review, approved, rejected, needs-correction)
- `priority` - Filter by priority (low, normal, high, urgent)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:** `200 OK`
```json
{
  "items": [
    {
      "_id": "...",
      "documentType": "invoice",
      "status": "pending",
      "priority": "normal",
      "ocrConfidence": 0.85,
      "extractedData": { ... },
      "suggestedActions": [ ... ],
      "exceptions": [ ... ],
      "submittedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### GET /review-queue/stats
Get statistics for review queue.

**Response:** `200 OK`
```json
{
  "byStatus": [
    { "_id": "pending", "count": 45 },
    { "_id": "approved", "count": 120 }
  ],
  "byPriority": [ ... ],
  "byDocumentType": [ ... ],
  "avgConfidence": [
    { "_id": null, "avgConfidence": 0.82 }
  ]
}
```

### GET /review-queue/:id
Get specific review queue item.

**Response:** `200 OK`
```json
{
  "_id": "...",
  "documentType": "daily-log",
  "status": "pending",
  "extractedData": {
    "date": { "value": "2024-01-15", "confidence": 0.9 },
    "workers": [ ... ]
  },
  "suggestedActions": [
    {
      "action": "assign-wc-code",
      "field": "worker.John Doe",
      "suggestedValue": "wc-code-id",
      "confidence": 0.85,
      "reason": "Matched carpentry keywords (3)"
    }
  ]
}
```

### PATCH /review-queue/:id/assign
Assign review queue item to user.

**Request Body:**
```json
{
  "assignedTo": "user-id"  // Optional, defaults to current user
}
```

**Response:** `200 OK`

### POST /review-queue/:id/corrections
Add correction to review queue item.

**Request Body:**
```json
{
  "field": "invoiceNumber",
  "correctedValue": "INV-2024-001"
}
```

**Response:** `200 OK`

### POST /review-queue/:id/approve
Approve review queue item.

**Request Body:**
```json
{
  "notes": "Approved after verification"  // Optional
}
```

**Response:** `200 OK`

### POST /review-queue/:id/reject
Reject review queue item.

**Request Body:**
```json
{
  "notes": "Invalid invoice, rejected"  // Required
}
```

**Response:** `200 OK`

### POST /review-queue/:id/request-correction
Request correction for review queue item.

**Request Body:**
```json
{
  "notes": "Please verify vendor name"
}
```

**Response:** `200 OK`

### DELETE /review-queue/:id
Delete review queue item.

**Response:** `200 OK`

---

## Export API

### GET /exports/wc-audit
Generate Workers' Compensation audit report.

**Query Parameters:**
- `dateFrom` - Start date (YYYY-MM-DD, required)
- `dateTo` - End date (YYYY-MM-DD, required)
- `format` - Output format (json or csv, default: json)

**Response:** `200 OK` (JSON format)
```json
{
  "companyId": "...",
  "reportPeriod": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-12-31T23:59:59Z"
  },
  "summary": {
    "totalHours": 15240.5,
    "totalWorkers": 45,
    "totalJobs": 12,
    "totalWCCodes": 8
  },
  "byWCCode": [
    {
      "wcCode": "5403",
      "description": "Carpentry",
      "state": "CA",
      "rate": 8.50,
      "totalHours": 3240.0,
      "totalCost": 27540.0,
      "workerCount": 12,
      "jobCount": 8
    }
  ],
  "byWorker": [ ... ],
  "byJob": [ ... ],
  "detailedLogs": [ ... ]
}
```

**Response:** `200 OK` (CSV format)
Returns CSV file for download.

### GET /exports/invoices
Export invoices to CSV.

**Query Parameters:**
- `dateFrom` - Start date (YYYY-MM-DD, optional)
- `dateTo` - End date (YYYY-MM-DD, optional)
- `jobId` - Filter by job (optional)

**Response:** `200 OK`
Returns CSV file for download with columns:
- Invoice Number, Vendor, Date, Amount, Status, Job, Description

### GET /exports/compliance
Export compliance documents to CSV.

**Response:** `200 OK`
Returns CSV file for download with columns:
- Vendor, Document Type, Expiration Date, Status, Document URL, Notes

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

### General API Endpoints
- **Limit:** 100 requests per 15 minutes per IP
- **Headers:** 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

### Authentication Endpoints
- **Limit:** 5 requests per 15 minutes per IP
- Applies to `/auth/login` and `/auth/register`

### Upload Endpoints
- **Limit:** 20 requests per hour per IP

### API Key Endpoints
- **Limit:** 1000 requests per 15 minutes per API key
- Use header: `X-API-Key: your-api-key`

When rate limit is exceeded, API returns:
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

---

## New Features Summary

### Email Ingestion System
- Dedicated email addresses for document routing:
  - `invoices@` - Routes to invoice workflow
  - `logs@` - Routes to daily log workflow
  - `compliance@` - Routes to compliance workflow
  - `docs@` - Routes to general documents

### OCR Provider Abstraction
- Supports multiple OCR providers:
  - Google Vision API
  - AWS Textract
  - Mindee
  - Mock (for development)
- Set via environment variable: `OCR_PROVIDER=google-vision`
- Automatic confidence scoring
- Structured data extraction per document type

### Workers' Comp Code Suggestions
- AI-powered keyword matching
- Fuzzy matching for job roles
- Returns top 1-3 code suggestions with confidence scores
- Batch processing for multiple workers
- Historical pattern analysis (planned)

### Unified Review Queue
- Single queue for all document types
- Exception tracking and prioritization
- Correction history for audit trail
- Suggested actions with confidence scores
- Auto-escalation based on confidence and exceptions

### Security Enhancements
- Rate limiting on all endpoints
- Stricter limits for authentication
- API key support for integrations
- Comprehensive audit logging


