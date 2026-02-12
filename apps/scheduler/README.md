# Worklight Scheduler Service

Independent cron job service for scheduled tasks.

## Responsibilities

- **Compliance Expiration Scanning**: Daily check for expiring/expired compliance docs
- **Alert Generation**: Send email alerts at 30/15/7/0 day windows
- **Weekly Summary Emails**: Send summary of pending items every Monday
- **Queue Health Monitoring**: Check BullMQ queue health every 15 minutes
- **Status Updates**: Update document statuses (ACTIVE → EXPIRING → EXPIRED)

## Scheduled Jobs

### 1. Compliance Expiration Check
- **Schedule**: Daily at 9 AM (configurable via `COMPLIANCE_CHECK_CRON`)
- **Actions**:
  - Query expiring compliance documents
  - Send alerts to contractors and admins
  - Update document statuses
  - Log all actions in audit trail

### 2. Weekly Summary Email
- **Schedule**: Every Monday at 8 AM (configurable via `SUMMARY_EMAIL_CRON`)
- **Content**:
  - Unresolved review queue count
  - Overdue compliance documents
  - Invoices awaiting approval
  - Daily logs pending WC confirmation

### 3. Queue Health Monitoring
- **Schedule**: Every 15 minutes (configurable via `QUEUE_HEALTH_CRON`)
- **Checks**:
  - Queue sizes (waiting, active, delayed, failed)
  - Stuck jobs detection
  - Performance metrics

## Environment Variables

See `.env.example` for required configuration.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run production
npm start
```

## Docker

```bash
# Build image
docker build -t worklight-scheduler .

# Run container
docker run -d \
  --name worklight-scheduler \
  --env-file .env \
  worklight-scheduler
```

## Deployment

This service is designed to run as a single instance:
- Azure Container Apps (with min replicas = 1, max replicas = 1)
- Kubernetes CronJob
- Docker container with restart policy

**Note**: Only one instance should run to avoid duplicate scheduled tasks.

## Cron Expression Format

```
*    *    *    *    *
┬    ┬    ┬    ┬    ┬
│    │    │    │    │
│    │    │    │    └─── Day of Week (0-7, Sun=0 or 7)
│    │    │    └──────── Month (1-12)
│    │    └───────────── Day of Month (1-31)
│    └────────────────── Hour (0-23)
└─────────────────────── Minute (0-59)
```

Examples:
- `0 9 * * *` - Daily at 9 AM
- `0 8 * * 1` - Every Monday at 8 AM
- `*/15 * * * *` - Every 15 minutes
