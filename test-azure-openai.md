# Azure OpenAI Configuration - Update Complete

## Summary

The docflow-360 application has been fully configured to use Azure OpenAI instead of regular OpenAI.

## Changes Made

### 1. Environment Variables (.env)

✅ Configured Azure OpenAI settings:

- `AZURE_OPENAI_ENDPOINT=https://gpt35finetuning-testing.openai.azure.com/`
- `AZURE_OPENAI_API_KEY=aafe8c42652e4581b947afc27d8bf20d`
- `AZURE_OPENAI_DEPLOYMENT=gpt-4.1`
- `AZURE_OPENAI_API_VERSION=2025-03-01-preview`
- `LLM_PROVIDER=azure-openai`
- `OCR_PROVIDER=azure-form-recognizer`

✅ Azure Document Intelligence / Form Recognizer:

- `AZURE_FORM_RECOGNIZER_ENDPOINT=https://galsi-adi.cognitiveservices.azure.com/`
- `AZURE_FORM_RECOGNIZER_API_KEY=[configured]`
- `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://galsi-adi.cognitiveservices.azure.com/`
- `AZURE_DOCUMENT_INTELLIGENCE_API_KEY=[configured]`

✅ Azure Blob Storage:

- `AZURE_STORAGE_ACCOUNT=shdevagenticcxcore`
- `AZURE_STORAGE_CONNECTION_STRING=[configured]`
- `AZURE_STORAGE_CONTAINER=sh-dev-docflow-360`

### 2. API Configuration (apps/api/config/index.ts)

✅ Added structured Azure OpenAI configuration object:

```typescript
azureOpenAI: {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-03-01-preview',
},
llmProvider: process.env.LLM_PROVIDER || 'azure-openai',
```

✅ Marked legacy OpenAI settings as deprecated

### 3. Rate Limiter Fix (apps/api/middleware/rateLimiter.ts)

✅ Fixed IPv6 vulnerability (ERR_ERL_KEY_GEN_IPV6):

- Imported `ipKeyGenerator` helper from express-rate-limit
- Updated custom keyGenerator to properly handle IPv6 addresses using `ipKeyGenerator(req.ip, 56)`

### 4. Infrastructure

✅ MongoDB and Redis running via Docker Compose:

- MongoDB: localhost:27017 (healthy)
- Redis: localhost:6379 (healthy)

✅ API Service running on port 3000

## Azure Resources Being Used

### From sh-dev Resource Group:

- **Storage Account**: shdevagenticcxcore
  - Container: sh-dev-docflow-360

### From AzureFleekDev Resource Group:

- **Azure OpenAI**: GPT35FInetuning-testing
  - Endpoint: https://gpt35finetuning-testing.openai.azure.com/
  - Deployment: gpt-4.1 (also available: gpt-5, gpt-5-mini, gpt-5.2)

### From CommonDev Resource Group:

- **Document Intelligence**: galsi-ADI
  - Endpoint: https://galsi-adi.cognitiveservices.azure.com/
  - Used for both Form Recognizer and Document Intelligence APIs

## Provider Architecture

The application uses a provider pattern for OCR and LLM:

**OCR Provider** (`OCR_PROVIDER=azure-form-recognizer`):

- Azure Form Recognizer for invoice/receipt processing
- Azure Document Intelligence for general OCR
- Mock provider for development/testing

**LLM Provider** (`LLM_PROVIDER=azure-openai`):

- AzureOpenAIProvider - Uses Azure OpenAI API
- Configured to use GPT-4.1 deployment
- API version: 2025-03-01-preview (latest)

## Implementation Details

### Azure OpenAI Integration (apps/api/services/ocrService.ts)

The `AzureOpenAIProvider` class implements structured data extraction:

1. **Endpoint**: `${endpoint}/openai/deployments/${deployment}/chat/completions`
2. **Authentication**: Uses `api-key` header (not Bearer token)
3. **API Version**: Query parameter `?api-version=2025-03-01-preview`
4. **Temperature**: 0.1 (low temperature for consistent extraction)
5. **Max Tokens**: 2000

### Extraction Process:

1. OCR text → Build extraction prompt with schema
2. Call Azure OpenAI Chat Completions API
3. Parse JSON response
4. Add bounding boxes from OCR results
5. Return structured data (InvoiceData, DailyLogData, or ComplianceData)

## Testing Status

✅ All services built successfully:

- API (Express + TypeScript)
- Web (Next.js 16.1.6)
- Landing (Vite + React)
- Worker (BullMQ)
- Scheduler (node-cron)

✅ Infrastructure healthy:

- MongoDB 7.0 - Connected
- Redis 7.0 - Connected

✅ API Service Running:

- Port 3000 listening
- Azure OpenAI provider loaded
- Azure Form Recognizer provider loaded

⚠️ Minor Warning:

- Azure Blob Storage using mock (optional - can be enabled later)

## Next Steps

1. **Test End-to-End Workflows**:
   - Upload invoice → OCR → Azure OpenAI extraction
   - Upload daily log → OCR → Azure OpenAI extraction
   - Upload COI → OCR → Azure OpenAI extraction

2. **Frontend Testing**:
   - Start web service: `cd apps/web && npm run dev`
   - Test Review Queue UI with real Azure services

3. **Deployment to Azure**:
   - Azure Container Registry (ACR) for Docker images
   - Azure Container Apps or AKS for hosting
   - Azure Cosmos DB (MongoDB API) for production database
   - Azure Redis Cache for production queues

## Environment Verification Commands

```powershell
# Check Azure OpenAI connectivity
Invoke-RestMethod -Uri "https://gpt35finetuning-testing.openai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-03-01-preview" `
  -Method POST `
  -Headers @{"api-key"="aafe8c42652e4581b947afc27d8bf20d"} `
  -Body '{"messages":[{"role":"user","content":"test"}],"max_tokens":10}' `
  -ContentType "application/json"

# List Azure OpenAI deployments
az cognitiveservices account deployment list -g AzureFleekDev -n GPT35FInetuning-testing -o table

# Check Document Intelligence
az cognitiveservices account show -g CommonDev -n galsi-ADI

# Check Blob Storage container
az storage container show --name sh-dev-docflow-360 --account-name shdevagenticcxcore
```

## Configuration is Complete ✅

The application is now fully configured to use Azure OpenAI and Azure AI services. All provider settings are correctly configured in the .env file and the application code properly routes to Azure services based on the provider selection.


