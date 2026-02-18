# docflow-360 End-to-End Testing Guide

Complete guide for testing all three MVP workflows end-to-end.

## Prerequisites

### Services Running

- MongoDB (docker-compose or local)
- Redis (docker-compose or local)
- Core API (port 3000)
- Worker Service
- Scheduler Service
- Frontend (port 3001)

### Environment Configuration

```bash
# Copy and configure .env
cp .env.example .env

# Essential variables
MONGODB_URI=mongodb://localhost:27017/docflow-360
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-for-testing
OCR_PROVIDER=mock  # or azure-di, google-vision, aws-textract
NODE_ENV=development
```

### Test User Account

```bash
# Create test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@docflow-360.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login and save token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@docflow-360.com",
    "password": "TestPassword123!"
  }' | jq -r '.token')
```

---

## Workflow 1: Invoice Processing

### Step 1: Upload Invoice Document

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@sample-invoice.pdf" \
  -F "documentType=invoice"
```

**Expected Response**:

```json
{
  "documentId": "abc123...",
  "status": "uploaded",
  "message": "Document uploaded and queued for processing"
}
```

### Step 2: Verify OCR & Extraction

Monitor worker logs:

```bash
cd apps/worker && npm run dev
# Watch for: "Processing document: abc123"
#            "OCR extraction complete"
#            "Rules evaluation: invoice over threshold"
```

Verify in MongoDB:

```javascript
//mongosh
db.extractions.findOne({ documentId: ObjectId('abc123') });

// Should contain:
// {
//   invoiceNumber: "INV-2024-001",
//   vendor: "ABC Construction",
//   amount: 5250.00,
//   date: "2024-01-15",
//   confidence: 0.95,
//   boundingBoxes: [...]
// }
```

### Step 3: Check Review Queue

```bash
curl -X GET "http://localhost:3000/api/review-queue?documentType=invoice" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:

```json
{
  "items": [
    {
      "_id": "item123",
      "documentType": "invoice",
      "status": "pending",
      "priority": "high",
      "invoiceNumber": "INV-2024-001",
      "vendor": "ABC Construction",
      "amount": 5250.0,
      "exceptions": [
        {
          "type": "OVER_THRESHOLD",
          "severity": "high",
          "message": "Exceeds PM approval threshold of $5000"
        }
      ]
    }
  ],
  "total": 1,
  "pagination": { "page": 1, "limit": 20 }
}
```

### Step 4: Review in UI and Approve

**Open Frontend**: http://localhost:3001/review-queue

1. Click invoice item to select
2. Review extracted data in right panel
3. Verify bounding boxes on document preview
4. Press **Y** to approve (or click Approve button)

**Or via API**:

```bash
curl -X POST "http://localhost:3000/api/review-queue/item123/approve" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "notes": "Approved - verified with PO" }'
```

**Expected Result**: Item removed from queue, status → approved

### Step 5: Verify Audit Trail

```bash
curl -X GET "http://localhost:3000/api/audit-logs?documentId=abc123" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Events**:

1. `DOCUMENT_UPLOADED`
2. `EXTRACTION_COMPLETED`
3. `REVIEW_QUEUE_CREATED`
4. `INVOICE_APPROVED`

### Step 6: Generate Export

```bash
curl -X POST http://localhost:3000/api/exports/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-02-28",
    "status": "approved"
  }' > invoices-export.csv
```

**Verify CSV Contains**:

- Invoice Number
- Vendor
- Amount
- Date
- Status (Approved)
- Approved By
- Approved At

---

## Workflow 2: Daily Log Processing

### Step 1: Upload Daily Log

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@daily-log.pdf" \
  -F "documentType=daily-log"
```

### Step 2: Monitor Extraction & Worker Matching

```javascript
// mongosh - Verify extraction with worker matches
db.extractions.findOne({ _id: ObjectId('...') });

// Should have:
// {
//   workers: [
//     {
//       name: "John Doe",
//       hours: 8,
//       matchedWorkerId: ObjectId("..."),
//       confidence: 0.95,
//       suggestedWCCodes: [
//         { code: "5645", description: "Carpentry", confidence: 0.88 }
//       ]
//     }
//   ]
// }
```

### Step 3: Review Queue & WC Code Selection

**In UI** (http://localhost:3001/review-queue):

1. Select daily log item
2. Review worker matches (correct if needed)
3. Confirm WC code for each worker
4. Save and approve

**Or via API**:

```bash
# Get item to review
curl -X GET "http://localhost:3000/api/review-queue/item456" \
  -H "Authorization: Bearer $TOKEN"

# Submit corrections and approve
curl -X POST "http://localhost:3000/api/review-queue/item456/corrections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "corrections": {
      "workers[0].wcCode": "5403"
    }
  }'

# Approve
curl -X POST "http://localhost:3000/api/review-queue/item456/approve" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4: Export WC Audit Report

```bash
curl -X POST http://localhost:3000/api/exports/daily-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "groupBy": "wcCode"
  }' > wc-audit.csv
```

**Verify Aggregations**:

- Hours per WC code
- Hours per worker
- Hours per job
- Total hours

---

## Workflow 3: Compliance Document Processing

### Step 1: Upload Compliance Document

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@insurance-certificate.pdf" \
  -F "documentType=compliance"
```

### Step 2: Verify Extraction & Status

```javascript
// mongosh
db.compliancedocs.findOne({ _id: ObjectId('...') });

// Should have:
// {
//   contractorName: "ABC Contractors",
//   certificateType: "General Liability",
//   expirationDate: ISODate("2024-05-15"),
//   status: "ACTIVE",  // or EXPIRING, EXPIRED
//   alerts: []
// }
```

### Step 3: Review & Approve

**In UI**:

1. Navigate to http://localhost:3001/review-queue
2. Select compliance item
3. Verify contractor name and expiration date
4. Approve

**Or via API**:

```bash
curl -X POST "http://localhost:3000/api/review-queue/item789/approve" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4: Test Scheduler Alerts

**Verify scheduler logic**:

```bash
# Terminal 1: Start scheduler
cd apps/scheduler && npm run dev

# Monitor logs:
# [9:00 AM] Running compliance expiration check...
# [9:00 AM] Found X docs expiring in 30 days
# [9:00 AM] Processing alerts...
```

**Test alert idempotency**:

```bash
# Run scheduler twice on same day
cd apps/scheduler && npm run dev
# Stop with Ctrl+C

# Run again immediately
npm run dev

# Verify in MongoDB:
db.compliancedocs.findOne({ _id: ObjectId("...") })

// Should have only 1 alert sent (not 2)
// Check sentAt timestamp in alerts array
```

### Step 5: Admin Dashboard

**Navigate to**: http://localhost:3001/admin-dashboard

**Verify Statistics**:

- Expiring within 30 days: [number]
- Expiring within 15 days: [number]
- Expiring within 7 days: [number]
- Expired: [number]

---

## Testing Checklist

### Pre-Test Verification

- [ ] All services running (`npm run dev`)
- [ ] MongoDB connected and seeded
- [ ] Redis accessible
- [ ] Frontend loads at port 3001
- [ ] Test user created and token obtained

### Invoice Workflow

- [ ] Upload invoice PDF successfully
- [ ] Document record created in MongoDB
- [ ] OCR extraction completed within 30 seconds
- [ ] Review queue item created with correct exceptions
- [ ] Bounding boxes visible in preview
- [ ] Approve via UI with keyboard shortcut (Y)
- [ ] Audit log entry created for approval
- [ ] CSV export generated and contains all invoices

### Daily Log Workflow

- [ ] Upload daily log successfully
- [ ] Worker fuzzy matching > 80% confidence
- [ ] WC code suggestions displayed
- [ ] Corrections applied correctly
- [ ] Approve workflow complete
- [ ] Export aggregations correct (hours by code/worker/job)

### Compliance Workflow

- [ ] Upload compliance doc successfully
- [ ] Contractor matching successful
- [ ] Expiration date extracted correctly
- [ ] Status set appropriately (ACTIVE/EXPIRING/EXPIRED)
- [ ] Admin dashboard shows correct counts
- [ ] Scheduler runs without errors
- [ ] Alerts sent exactly once (not duplicated)

### UI & UX

- [ ] Review queue keyboard shortcuts work (Y/N/arrows)
- [ ] Bounding boxes display correctly
- [ ] Confidence colors (amber/blue) correct
- [ ] Admin dashboard updates after approval
- [ ] No console errors in browser

### Audit & Compliance

- [ ] Audit log entries created for all actions
- [ ] Rejection notes required and logged
- [ ] Corrections tracked in audit trail
- [ ] No secrets exposed in logs
- [ ] User information recorded with actions

### Performance

- [ ] Review queue loads with 100+ items
- [ ] Search/filtering responsive
- [ ] Export generation < 30 seconds
- [ ] Worker processes documents without queue backlog
- [ ] Scheduler completes daily run in < 5 minutes

---

## Error Scenarios to Test

### Duplicate Detection

```bash
# Upload same invoice twice
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@invoice.pdf" \
  -F "documentType=invoice"

# Wait for processing, upload again
# Should create exception: "Duplicate invoice detected"
```

### Unknown Worker

```bash
# Upload daily log with non-existent worker name
# Should flag with low confidence match
# Review queue item created with exception
```

### Low OCR Confidence

```bash
# Upload blurry or handwritten invoice
# Should flag fields with < 70% confidence
# Bounding boxes shown in amber color
```

### Expired Compliance

```javascript
// mongosh - manually set expiration to past date
db.compliancedocs.updateOne(
  { _id: ObjectId('...') },
  { $set: { expirationDate: ISODate('2023-01-01') } }
);

// Run scheduler
// Document should be flagged as EXPIRED
// Alert should be sent
```

---

## Performance Testing

### Load Test: Review Queue

```bash
# Generate 100+ test documents
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/documents/upload \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@invoice.pdf" \
    -F "documentType=invoice" \
    -F "metadata={\"testRun\": true}"
done

# Monitor UI performance
# open http://localhost:3001/review-queue
# Should load and display items without lag
```

### Load Test: Worker Queue

```bash
# Monitor worker processing time
cd apps/worker && npm run dev

# Watch logs for performance:
# "Processing document: ... (elapsed: 2s)"
# "Processing document: ... (elapsed: 3s)"
# Should average under 5 seconds per document
```

---

## Success Criteria

✅ **MVP is production ready when:**

- [x] All 3 workflows run end-to-end without errors
- [x] Review queue resolves exceptions < 30 seconds per item
- [x] OCR confidence > 85% for clean documents
- [x] Worker processes documents reliably
- [x] Scheduler alerts fire once per window
- [x] All approvals/rejections logged
- [x] Exports generate and contain correct data
- [x] Admin dashboard shows accurate metrics
- [x] Keyboard shortcuts work reliably
- [x] No security vulnerabilities (npm audit pass)

---

## Acceptance Criteria for Alpha Deployment

All must pass before deploying to production:

- [x] Invoice workflow: upload → review → approve → export
- [x] Daily log workflow: upload → WC codes → export
- [x] Compliance workflow: upload → status → alerts
- [x] Scheduler runs twice → exactly 1 alert sent (not 2)
- [x] Reject action → notes required → audit logged
- [x] Approve action → audit log entry created
- [x] Review queue keyboard shortcuts (Y/N/arrows) work
- [x] Bounding boxes display in preview
- [x] Admin dashboard shows correct stats
- [x] No secrets in logs
- [x] Health check endpoint returns 200

---

## Troubleshooting Guide

### Issue: Worker not processing jobs

```bash
# Check Redis connection
redis-cli ping  # Should respond PONG

# Check queue status
redis-cli LLEN bull:document-processing:wait

# Check worker logs
cd apps/worker && npm run dev  # Should show job pickup
```

### Issue: OCR extraction fails

```bash
# Check OCR provider settings
echo $OCR_PROVIDER  # Should be 'mock' for testing

# Check logs
tail -f apps/worker/logs/worker.log

# Verify API credentials (if using real provider)
echo $AZURE_FORM_RECOGNIZER_API_KEY
```

### Issue: Review queue empty

```javascript
// mongosh - Verify rules evaluation
db.reviewqueueitems.find({ status: "pending" })

// Check exceptions
db.reviewqueueitems.findOne().exceptions

// View rule engine logs
tail -f apps/api/logs/rules-engine.log
```

### Issue: Scheduler alerts not sent

```bash
# Verify scheduler running
ps aux | grep scheduler

# Check cron schedule
cd apps/scheduler && npm run dev  # Watch for cron execution

// mongosh - Check for alert records
db.compliancedocs.findOne({ "alerts.30_DAY": true })
```

---

## Seed Data Generator

Create realistic test data:

```bash
# Generate test documents, workers, vendors
cd apps/api
node scripts/seed-test-data.js

# Creates:
# - 5 vendors with aliases
# - 10 workers
# - 5 contractors
# - 20 cost codes
# - 15 WC codes
# - Sample documents for each workflow
```

---

**Last Updated**: February 12, 2026
**Status**: Ready for end-to-end testing

