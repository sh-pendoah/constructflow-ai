# docflow-360 Core API - Setup Guide

## Prerequisites

- Node.js >= 20
- MongoDB 7.0+
- Redis 7+
- Docker (optional, for running infrastructure)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd docflow-360
npm run install:all
```

### 2. Start Infrastructure Services

Using Docker Compose:
```bash
npm run infra:up
```

This starts:
- MongoDB on port 27017
- Redis on port 6379

### 3. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```bash
# Core API
CORE_API_PORT=3000
NODE_ENV=local

# MongoDB
MONGO_URI=mongodb://admin:password@localhost:27017/docflow-360?authSource=admin
MONGO_USER=admin
MONGO_PASSWORD=password
MONGO_DB=docflow-360

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Email (Optional for local dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@docflow-360.com

# File Uploads
MAX_FILE_SIZE=50mb
UPLOAD_DIR=/tmp/uploads

# CORS
CORS_ORIGINS=http://localhost:3001,http://localhost:5173
```

### 4. Start the API

```bash
npm run dev:core-api
```

The API will be available at `http://localhost:3000`

## Project Structure

```
apps/api/
├── config/              # Configuration files
│   ├── index.ts        # Main config
│   ├── database.ts     # MongoDB connection
│   ├── redis.ts        # Redis connection
│   └── logger.ts       # Winston logger
├── middleware/         # Express middleware
│   ├── auth.ts         # JWT authentication
│   ├── errorHandler.ts # Error handling
│   ├── validators.ts   # Input validation rules
│   └── validate.ts     # Validation middleware
├── models/             # MongoDB/Mongoose models
│   ├── User.ts
│   ├── Job.ts
│   ├── Invoice.ts
│   ├── CostCode.ts
│   ├── WCCode.ts
│   ├── COIVendor.ts
│   ├── ApprovalRule.ts
│   ├── DailyLog.ts
│   └── ComplianceDoc.ts
├── routes/             # API routes
│   ├── auth.ts
│   ├── jobs.ts
│   ├── invoices.ts
│   ├── cost-codes.ts
│   ├── wc-codes.ts
│   ├── coi-vendors.ts
│   ├── approval-rules.ts
│   ├── daily-logs.ts
│   ├── compliance.ts
│   ├── documents.ts
│   └── projects.ts
├── services/           # Business logic services
│   ├── documentProcessing.ts   # BullMQ document queue
│   ├── emailService.ts         # Email notifications
│   └── complianceScheduler.ts  # Scheduled compliance checks
└── index.ts            # Main application entry
```

## Database Models

### Core Models Implemented

1. **User** - User accounts with authentication
2. **Job** - Construction projects/jobs
3. **Invoice** - Invoices with approval workflow
4. **CostCode** - Cost accounting codes
5. **WCCode** - Workers compensation codes
6. **COIVendor** - Certificate of Insurance vendors
7. **ApprovalRule** - Threshold-based approval rules
8. **DailyLog** - Daily work logs with worker hours
9. **ComplianceDoc** - Compliance documents tracking
10. **Project** - Legacy project management (can be migrated to Jobs)
11. **Document** - Generic document storage

## API Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin, manager, worker)
- Company-level data isolation

### Job Management
- CRUD operations for jobs
- Status tracking (active, completed, on-hold, cancelled)
- Budget tracking
- Cost code assignment

### Cost Code Management
- CRUD operations
- CSV import/export
- Category organization
- Active/inactive status

### Workers Compensation Tracking
- WC code management by state
- Rate tracking
- CSV import/export
- Daily log integration for hour tracking
- Automated WC reporting with hour aggregation

### Invoice Processing
- Invoice CRUD with document attachment
- Threshold-based approval routing
- Multi-approver support
- Status tracking (pending, approved, rejected, paid)
- Automatic approval rule matching

### COI & Compliance Management
- Vendor COI tracking
- Expiration date monitoring
- Automated expiration alerts (30-day notice)
- Status updates (valid, expired, expiring-soon, pending)
- Multiple compliance document types

### Daily Logs
- Work performed documentation
- Worker hours by WC code
- Equipment hours tracking
- Materials usage
- Weather conditions
- WC report export with aggregation

### Document Processing
- BullMQ queue for async processing
- Document status tracking (pending, processing, processed, error)
- Placeholder for OCR integration
- Metadata extraction

### Notifications
- Email notifications for approvals
- Compliance expiration alerts
- COI expiration alerts
- Welcome emails

### Scheduled Jobs
- Daily compliance checks (9 AM)
- Automatic status updates for expired documents
- Email notifications for expiring items

## Running with Docker

### Full Stack with Docker Compose

```bash
# Start all services (frontend, landing page, API, infrastructure)
npm run compose:up

# View logs
npm run compose:logs

# Stop all services
npm run compose:down
```

### Infrastructure Only

```bash
# Start just MongoDB and Redis
npm run infra:up

# View logs
npm run infra:logs

# Stop infrastructure
npm run infra:down
```

## Development

### Running in Development Mode

```bash
# Run with auto-reload
npm run dev:local

# Run in staging mode
npm run dev:staging
```

### Building for Production

```bash
# Build TypeScript to JavaScript
npm run build

# Start production build
npm start
```

### Linting

```bash
npm run lint
```

## Testing

### Manual API Testing

1. Register a user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@docflow-360.com",
    "password": "password123",
    "name": "Admin User",
    "role": "admin"
  }'
```

2. Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@docflow-360.com",
    "password": "password123"
  }'
```

3. Use the returned token for authenticated requests:
```bash
curl -X GET http://localhost:3000/api/jobs \
  -H "Authorization: Bearer <your-token>"
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## Deployment

### Environment-Specific Builds

```bash
# Staging
npm run build:staging

# UAT
npm run build:uat

# Production
npm run build:prod
```

### Environment Variables by Environment

**Local:**
- Use `.env` file
- Connect to local MongoDB/Redis

**Staging:**
- Set via CI/CD or hosting platform
- Use staging database
- Enable debug logging

**Production:**
- Set via hosting platform secrets
- Use production database
- Disable debug logging
- Enable rate limiting
- Use secure JWT secrets

## Troubleshooting

### MongoDB Connection Issues

1. Check MongoDB is running:
```bash
docker ps | grep mongodb
```

2. Test connection:
```bash
mongosh mongodb://admin:password@localhost:27017/docflow-360?authSource=admin
```

3. Check logs:
```bash
docker logs docflow-360-mongodb
```

### Redis Connection Issues

1. Check Redis is running:
```bash
docker ps | grep redis
```

2. Test connection:
```bash
redis-cli ping
```

3. Check logs:
```bash
docker logs docflow-360-redis
```

### API Not Starting

1. Check ports are available:
```bash
lsof -i :3000
```

2. Check logs in console output

3. Verify environment variables are set

### Email Not Sending

1. Verify SMTP credentials in `.env`
2. For Gmail, use App Password, not regular password
3. Check email service logs in console

## Security Considerations

### JWT Secrets
- Use strong, random secrets in production
- Never commit secrets to version control
- Rotate secrets periodically

### Database Security
- Use strong passwords
- Enable authentication
- Use SSL/TLS for connections in production
- Regular backups

### API Security
- Implement rate limiting (TODO)
- Add request size limits (configured)
- Use HELMET for security headers (enabled)
- Validate all inputs (validators implemented)
- Sanitize data

### File Uploads
- Validate file types
- Limit file sizes (configured: 50MB)
- Scan for malware (TODO)
- Use secure storage (S3, etc. for production)

## Performance Optimization

### Database Indexes
All models include appropriate indexes:
- Company-level queries
- Status filtering
- Date-based queries
- Reference lookups

### Redis Caching
Redis is configured for:
- BullMQ job queues
- Session storage (TODO)
- Cache frequently accessed data (TODO)

### Queue Processing
- BullMQ configured with concurrency: 5
- Retry logic with exponential backoff
- Failed job retention

## Monitoring & Logging

### Logging
Winston logger configured with:
- Console output in development
- File output for production (TODO)
- Log levels (error, warn, info, debug)
- Structured logging

### Metrics (TODO)
- API response times
- Queue processing times
- Error rates
- Active users

## Future Enhancements

### High Priority
1. OCR Integration (Google Vision API)
2. Email ingestion for automated invoice import
3. Comprehensive test suite
4. API rate limiting
5. Audit logging

### Medium Priority
1. Webhook support
2. Real-time updates (WebSocket/SSE)
3. Advanced search and filtering
4. Bulk operations
5. Export to QuickBooks/accounting systems

### Low Priority
1. Multi-language support
2. Advanced reporting
3. Mobile app API optimizations
4. GraphQL API
5. API versioning

## Support

For issues and questions:
- Check logs: `docker-compose logs -f core-api`
- Review API documentation: `API_DOCUMENTATION.md`
- Check environment configuration
- Verify database connections

## License

[Your License Here]

