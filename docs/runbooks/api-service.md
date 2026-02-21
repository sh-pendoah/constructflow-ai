# Runbook: API Service — docflow-360

**Service**: `apps/api` — Express REST API  
**Owner**: `@sh-pendoah/backend`  
**On-call rotation**: See PagerDuty `docflow-360-api`  
**SLO**: 99.5% availability (30-day rolling), p99 latency ≤ 500 ms  
**Last reviewed**: 2026-02-21

---

## Table of Contents

1. [Overview](#overview)
2. [Health Probes](#health-probes)
3. [Deployment](#deployment)
4. [Rollback](#rollback)
5. [Common Incidents](#common-incidents)
6. [Escalation](#escalation)

---

## Overview

The API service is the primary backend for docflow-360. It handles document
ingestion, OCR orchestration, rules engine evaluation, and the review queue.
It runs as an Azure Container Apps revision-mode `Multiple` app to support
canary deployments and zero-downtime rollbacks.

**Key dependencies:**
- MongoDB (Azure Cosmos DB for MongoDB API)
- Redis (Azure Managed Redis)
- Azure Blob Storage
- AI Runtime service (`apps/ai-runtime`, port 3002)

---

## Health Probes

| Endpoint          | Purpose          | Expected response           |
|-------------------|------------------|-----------------------------|
| `GET /health/live`  | Liveness probe   | `200 {"status":"alive"}`    |
| `GET /health/ready` | Readiness probe  | `200 {"status":"ready"}` or `503 {"status":"not_ready"}` |
| `GET /health`       | Full health      | `200` (healthy) or `503` (degraded) |

**If `/health/live` returns non-200:** The process is deadlocked or crashed.
ACA will restart the replica automatically. Check container logs.

**If `/health/ready` returns 503:** A required dependency (MongoDB or Redis)
is unavailable. The replica is removed from load balancing until it recovers.
See [Common Incidents](#common-incidents) for dependency failure playbooks.

---

## Deployment

All production deployments go through the `promote.yml` GitHub Actions workflow.
No human should run `az containerapp update` or `terraform apply` directly
against prd (§4 least-privilege; break-glass requires incident ticket).

### Normal deployment

1. Merge to `main` → `ci.yml` builds immutable image tagged with git SHA
2. Trigger `promote.yml` workflow:
   - `image_tag`: the git SHA from CI
   - `target_env`: `stg` first, then `prd`
3. Workflow deploys canary at 10% traffic → smoke tests → shifts to 100%

---

## Rollback

**Rollback = traffic shift back to a known-good ACA revision.**  
No rebuild is required (§13 rollback plan).

### Via promote.yml workflow (preferred)

1. Go to Actions → "Promote — Gated stg→prd"
2. Set `rollback_revision` to the name of the last known-good ACA revision
3. Trigger the workflow — it shifts 100% traffic back to that revision

### Via Azure CLI (break-glass only)

```bash
# List revisions to find the stable one
az containerapp revision list \
  --name docflow-360-api-prd \
  --resource-group rg-docflow-360-prd \
  --output table

# Shift all traffic back to stable revision
az containerapp ingress traffic set \
  --name docflow-360-api-prd \
  --resource-group rg-docflow-360-prd \
  --revision-weight <STABLE_REVISION_NAME>=100
```

**After break-glass:** File an incident ticket + post-reconciliation within 24h.

---

## Common Incidents

### MongoDB connection failure

**Symptoms:** `/health/ready` returns `503`, `"mongodb":"disconnected"` in body.

**Steps:**
1. Check Azure Cosmos DB status in Azure Portal
2. Verify `MONGO_URI` secret is correctly set in the ACA app settings
3. Check network security group / private endpoint configuration
4. If Cosmos DB is healthy, restart the ACA replica:
   ```bash
   az containerapp revision restart \
     --name docflow-360-api-prd \
     --resource-group rg-docflow-360-prd \
     --revision <REVISION_NAME>
   ```

### Redis connection failure

**Symptoms:** `/health/ready` returns `503`, `"redis":"disconnected"` in body.

**Steps:**
1. Check Azure Managed Redis health in Azure Portal
2. Verify `REDIS_URL` secret is set correctly
3. Check firewall rules on the Redis instance
4. BullMQ jobs will queue but not process until Redis recovers — no data loss

### High error rate (>1%)

**Symptoms:** Application Insights alert, pnpm audit alerts, Trivy scan alerts.

**Steps:**
1. Check Application Insights → Failures blade
2. Identify error type (5xx vs 4xx)
3. For 5xx: check container logs
   ```bash
   az containerapp logs show \
     --name docflow-360-api-prd \
     --resource-group rg-docflow-360-prd \
     --tail 100
   ```
4. For persistent 5xx: rollback to previous revision (see [Rollback](#rollback))

### Memory/CPU saturation

**Symptoms:** ACA scaling events, p99 latency spike, OOM kills in logs.

**Steps:**
1. Check ACA metrics in Azure Portal (CPU%, memory%)
2. Verify `api_max_replicas` in `infra/environments/prd/terraform.tfvars`
3. If replicas are at max: check for memory leak in recent deployments
4. Temporary mitigation: increase `api_max_replicas` via `promote.yml`

---

## Escalation

| Level | Contact              | Trigger                                   |
|-------|----------------------|-------------------------------------------|
| L1    | On-call engineer     | Any alert from PagerDuty                  |
| L2    | Backend team lead    | Incident > 15 min without resolution      |
| L3    | CTO / Azure support  | Data loss risk, security incident, SLO breach > 1h |
