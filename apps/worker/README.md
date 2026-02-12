# Worklight Worker Service

Independent BullMQ consumer service responsible for processing queued jobs.

## Responsibilities

- **Email Attachment Processing**: Extract and normalize attachments from emails
- **OCR Execution**: Run Azure AI Document Intelligence or other OCR providers
- **LLM Extraction**: Execute Azure OpenAI for structured data extraction
- **Rules Engine**: Evaluate business rules and assign exception codes
- **Auto-Approval**: Automatically approve documents meeting criteria
- **Review Item Creation**: Create review queue items for manual review
- **Export Generation**: Generate CSV/JSON exports on demand

## Queue Processors

### 1. Document Processing Queue
- Queue: `document-processing`
- Concurrency: 5 (configurable)
- Processes OCR, extraction, and rules evaluation

### 2. Email Ingestion Queue
- Queue: `email-ingestion`
- Concurrency: 3
- Rate limited: 10 per minute
- Processes incoming emails and attachments

### 3. Export Generation Queue
- Queue: `export-generation`
- Concurrency: 2
- Generates reports and exports

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
docker build -t worklight-worker .

# Run container
docker run -d \
  --name worklight-worker \
  --env-file .env \
  worklight-worker
```

## Deployment

This service is designed to run as an independent container:
- Azure Container Apps
- Kubernetes
- Docker Swarm
- Any container orchestration platform

The worker will automatically scale based on queue depth.
