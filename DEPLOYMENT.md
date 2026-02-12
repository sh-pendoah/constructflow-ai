# Worklighter Azure Deployment Guide

Complete guide for deploying Worklighter Construction Operations Automation Engine to Microsoft Azure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Azure Services Overview](#azure-services-overview)
3. [Initial Setup](#initial-setup)
4. [Azure Resource Provisioning](#azure-resource-provisioning)
5. [Application Deployment](#application-deployment)
6. [Configuration](#configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Scaling & Performance](#scaling--performance)
9. [Security Best Practices](#security-best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- Azure CLI (`az`) version 2.50.0+
- Docker version 24.0+
- Node.js 20+ (for local testing)
- Git
- kubectl (for AKS deployment)

### Azure Subscription

- Active Azure subscription
- Contributor or Owner role on subscription
- Resource quota for required services (check quotas before provisioning)

### Required Knowledge

- Basic Azure concepts (Resource Groups, App Services, etc.)
- Container basics (Docker)
- Basic networking (VNets, NSGs, DNS)

---

## Azure Services Overview

Worklighter uses the following Azure services:

### Core Services

| Service                           | Purpose                     | Recommended Tier         | Est. Cost               |
| --------------------------------- | --------------------------- | ------------------------ | ----------------------- |
| **Azure Container Apps**          | Host API, Worker, Scheduler | Consumption (Serverless) | $20-40/mo               |
| **Azure Cosmos DB (MongoDB API)** | Document database           | Serverless               | $25-50/mo               |
| **Azure Cache for Redis**         | Job queues (BullMQ)         | Basic C1                 | $15-20/mo               |
| **Azure Blob Storage**            | Document storage            | Hot tier, LRS            | $5-10/mo                |
| **Azure Form Recognizer**         | Invoice OCR                 | S0 (Standard)            | $30-50/mo (pay-per-use) |
| **Azure OpenAI**                  | LLM extraction              | Standard                 | $20-40/mo (pay-per-use) |
| **Azure Container Registry**      | Container image registry    | Basic                    | $5/mo                   |
| **Azure Virtual Network**         | Network isolation           | Standard                 | Included                |
| **Azure Application Insights**    | Monitoring & logging        | Pay-as-you-go            | $10-20/mo               |
| **Azure Front Door**              | CDN & load balancing        | Standard                 | $35+/mo                 |

**Total Estimated Cost**: $165-290/month (startup), $500-1500/month (production)

### Optional Services

| Service                  | Purpose            | When to Use                       |
| ------------------------ | ------------------ | --------------------------------- |
| **Azure Key Vault**      | Secrets management | Production environments           |
| **Azure Service Bus**    | Advanced messaging | High-volume workloads             |
| **Azure API Management** | API gateway        | Multi-tenant/partner integrations |
| **Azure AKS**            | Kubernetes         | Complex deployments               |

---

## Initial Setup

### 1. Install Azure CLI

**macOS:**

```bash
brew update && brew install azure-cli
```

**Linux:**

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**Windows:**
Download installer from https://aka.ms/installazurecliwindows

**Verify Installation:**

```bash
az --version
```

### 2. Login to Azure

```bash
# Interactive login
az login

# List subscriptions
az account list --output table

# Set default subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 3. Create Resource Group

```bash
# Set variables
export RESOURCE_GROUP="worklighter-prod"
export LOCATION="eastus"  # Check availability: eastus, westus2, westeurope, etc.

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

---

## Azure Resource Provisioning

### Step 1: Azure Container Registry

Create registry for Docker images:

```bash
export ACR_NAME="worklighteracr"  # must be globally unique

# Create ACR
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Get ACR credentials
az acr credential show --name $ACR_NAME --output table

# Login to ACR
az acr login --name $ACR_NAME
```

---

### Step 2: Azure Cosmos DB (MongoDB API)

```bash
export COSMOSDB_ACCOUNT="worklightdb"

# Create Cosmos DB account with MongoDB API
az cosmosdb create \
  --name $COSMOSDB_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --kind MongoDB \
  --server-version 7.0 \
  --default-consistency-level Session \
  --locations regionName=$LOCATION failoverPriority=0 \
  --capabilities EnableServerless

# Create database
az cosmosdb mongodb database create \
  --account-name $COSMOSDB_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --name worklighter

# Get connection string (save this securely)
az cosmosdb keys list \
  --name $COSMOSDB_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --type connection-strings \
  --output tsv --query 'connectionStrings[0].connectionString'
```

---

### Step 3: Azure Cache for Redis

```bash
export REDIS_NAME="worklighterredis"

# Create Redis cache
az redis create \
  --name $REDIS_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Basic \
  --vm-size c1 \
  --enable-non-ssl-port false

# Get connection info
az redis show \
  --name $REDIS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query '[hostName,sslPort,primaryKey]' \
  --output tsv
```

---

### Step 4: Azure Blob Storage

```bash
export STORAGE_ACCOUNT="worklighterstorage"  # must be globally unique

# Create storage account
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot

# Create containers
for container in documents pdfs images exports; do
  az storage container create \
    --account-name $STORAGE_ACCOUNT \
    --name $container \
    --auth-mode login
done

# Get connection string
az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --output tsv
```

---

### Step 5: Azure Form Recognizer

```bash
export FORM_RECOGNIZER_NAME="worklighterformrec"

# Create Form Recognizer resource
az cognitiveservices account create \
  --name $FORM_RECOGNIZER_NAME \
  --resource-group $RESOURCE_GROUP \
  --kind FormRecognizer \
  --sku S0 \
  --location $LOCATION \
  --yes

# Get endpoint and keys
az cognitiveservices account show \
  --name $FORM_RECOGNIZER_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.endpoint --output tsv

az cognitiveservices account keys list \
  --name $FORM_RECOGNIZER_NAME \
  --resource-group $RESOURCE_GROUP
```

---

### Step 6: Azure OpenAI

```bash
export OPENAI_NAME="worklighteropenai"

# Create Azure OpenAI resource (requires approval)
az cognitiveservices account create \
  --name $OPENAI_NAME \
  --resource-group $RESOURCE_GROUP \
  --kind OpenAI \
  --sku S0 \
  --location eastus \  # Limited region availability
  --yes

# Create GPT-4 deployment
az cognitiveservices account deployment create \
  --name $OPENAI_NAME \
  --resource-group $RESOURCE_GROUP \
  --deployment-name gpt-4 \
  --model-name gpt-4 \
  --model-version 0613 \
  --model-format OpenAI \
  --sku-capacity 20 \
  --sku-name Standard
```

---

### Step 7: Azure Application Insights

```bash
export APP_INSIGHTS_NAME="worklighterinsights"

# Create App Insights
az monitor app-insights component create \
  --app $APP_INSIGHTS_NAME \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --application-type web

# Get instrumentation key
az monitor app-insights component show \
  --app $APP_INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey --output tsv
```

---

## Application Deployment

### Option 1: Azure Container Apps (Recommended)

#### Create Container Apps Environment

```bash
export CONTAINERAPPS_ENV="worklighter-env"

# Create environment
az containerapp env create \
  --name $CONTAINERAPPS_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

#### Build and Push Docker Images

```bash
# Tag and push each service
for service in api web worker scheduler; do
  docker build -t $ACR_NAME.azurecr.io/worklight-$service:latest ./apps/$service
  docker push $ACR_NAME.azurecr.io/worklight-$service:latest
done
```

#### Deploy Services

**API Service:**

```bash
az containerapp create \
  --name worklighter-api \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINERAPPS_ENV \
  --image $ACR_NAME.azurecr.io/worklight-api:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --cpu 1.0 --memory 2.0Gi \
  --min-replicas 1 --max-replicas 5
```

**Worker Service:**

```bash
az containerapp create \
  --name worklighter-worker \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINERAPPS_ENV \
  --image $ACR_NAME.azurecr.io/worklight-worker:latest \
  --registry-server $ACR_NAME.azurecr.io \
  --cpu 2.0 --memory 4.0Gi \
  --min-replicas 2 --max-replicas 10 \
  --scale-rule-name queue-length \
  --scale-rule-type azure-queue
```

**Scheduler Service:**

```bash
az containerapp create \
  --name worklighter-scheduler \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINERAPPS_ENV \
  --image $ACR_NAME.azurecr.io/worklight-scheduler:latest \
  --registry-server $ACR_NAME.azurecr.io \
  --cpu 0.5 --memory 1.0Gi \
  --min-replicas 1 --max-replicas 1
```

**Web Frontend:**

```bash
az containerapp create \
  --name worklighter-web \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINERAPPS_ENV \
  --image $ACR_NAME.azurecr.io/worklight-web:latest \
  --target-port 3001 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --cpu 0.5 --memory 1.0Gi
```

---

### Option 2: Azure Kubernetes Service (AKS)

_Terraform manifests available in `terraform/` directory_

```bash
# Create AKS cluster
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name worklighter-aks \
  --node-count 3 \
  --vm-set-type VirtualMachineScaleSets \
  --load-balancer-sku standard
```

---

## Configuration

### Environment Variables

Store all secrets in Azure Key Vault:

```bash
# Create Key Vault
az keyvault create \
  --name worklighter-vault \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Store secrets
az keyvault secret set --vault-name worklighter-vault --name MONGO-URI --value "$(az cosmosdb keys list --name $COSMOSDB_ACCOUNT --resource-group $RESOURCE_GROUP --type connection-strings --query 'connectionStrings[0].connectionString' --output tsv)"

az keyvault secret set --vault-name worklighter-vault --name REDIS-URL --value "redis://:$(az redis show-connection-string --name $REDIS_NAME --resource-group $RESOURCE_GROUP)@$(az redis show --name $REDIS_NAME --resource-group $RESOURCE_GROUP --query hostName --output tsv):6380?ssl=True"

# Reference in Container Apps via secret refs
# See container app deployment commands above for env-vars syntax
```

---

## Monitoring & Logging

### Application Insights

Automatic with Container Apps. View metrics:

```bash
# Stream logs
az containerapp logs show \
  --name worklighter-api \
  --resource-group $RESOURCE_GROUP \
  --follow

# View in Azure Portal
az monitor app-insights component show \
  --app $APP_INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP
```

### Alerts

```bash
# Alert on high error rate
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group $RESOURCE_GROUP \
  --scopes $(az containerapp show --name worklighter-api --resource-group $RESOURCE_GROUP --query id --output tsv) \
  --condition "avg exceptions/server > 10" \
  --window-size 5m
```

---

## Scaling & Performance

### Autoscaling Rules

Container Apps automatically scales based on CPU, memory, and HTTP concurrency. Adjust:

```bash
az containerapp update \
  --name worklighter-api \
  --resource-group $RESOURCE_GROUP \
  --min-replicas 2 --max-replicas 10
```

### Performance Optimization

1. Enable Azure CDN for static assets
2. Use Azure Front Door for global distribution
3. Enable Redis persistence
4. Configure Cosmos DB autoscale
5. Use managed identities for Azure service access

---

## Security Best Practices

### Network Security

```bash
# Create virtual network
az network vnet create \
  --name worklighter-vnet \
  --resource-group $RESOURCE_GROUP \
  --address-prefixes 10.0.0.0/16
```

### Managed Identities

```bash
# Enable system-assigned identity
az containerapp identity assign \
  --name worklighter-api \
  --resource-group $RESOURCE_GROUP \
  --system-assigned
```

### IP Restrictions

```bash
# Restrict API to specific IPs
az containerapp ingress access-restriction set \
  --name worklighter-api \
  --resource-group $RESOURCE_GROUP \
  --rule-name office-only \
  --ip-address 203.0.113.0/24 \
  --action Allow
```

### Secrets Management

✅ Store all secrets in Key Vault
✅ Use managed identities instead of connection strings
✅ Rotate credentials regularly
✅ Enable audit logging in Key Vault
❌ Never commit `.env` files

---

## Troubleshooting

### Common Issues

**Container app won't start**:

```bash
az containerapp logs show --name worklighter-api --resource-group $RESOURCE_GROUP --tail 100
```

**Database connection failures**:

```bash
# Test connectivity
az cosmosdb mongodb collection show \
  --account-name $COSMOSDB_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --database-name worklighter \
  --name invoices
```

**High latency**:

```bash
# Check replica count and resource usage
az monitor metrics list \
  --resource $(az containerapp show --name worklighter-api --resource-group $RESOURCE_GROUP --query id --output tsv) \
  --metric "CpuPercentage,MemoryPercentage"
```

### Support Resources

- **Azure Docs**: https://docs.microsoft.com/azure
- **Worklighter Docs**: See SETUP.md and README.md
- **Azure Support**: Create ticket in Azure Portal

---

## Rollback Plan

**When to rollback**:

- Critical bug affecting all users
- Data corruption detected
- Service unavailable >15 minutes

**Rollback steps** (Container Apps):

1. Portal → Container App → Revisions
2. Select previous revision → Activate
3. Verify health with smoke tests
4. Database: Forward fixes only (no rollback)

**RTO**: 15 minutes

---

## Next Steps

1. ✅ Complete this guide
2. ✅ Set up monitoring and alerts
3. ✅ Configure backups
4. ✅ Test failover procedures
5. ✅ Document runbooks
6. ✅ Schedule security review

---

## Appendix: Useful Commands

```bash
# List all resources
az resource list --resource-group $RESOURCE_GROUP --query '[].{name:name, type:type}' --output table

# Cost analysis
az consumption usage list --start-date 2024-01-01 --end-date 2024-02-01

# Export ARM template
az group export --name $RESOURCE_GROUP --output json > template.json

# Delete all resources
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

---

**Last Updated**: February 12, 2026
**Status**: Ready for deployment
