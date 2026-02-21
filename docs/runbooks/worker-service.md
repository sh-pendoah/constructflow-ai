# Runbook: Worker Service — docflow-360

**Service**: `apps/worker` — BullMQ job processor  
**Owner**: `@sh-pendoah/backend`  
**On-call rotation**: See PagerDuty `docflow-360-worker`  
**SLO**: Job failure rate ≤ 0.5% (30-day rolling)  
**Last reviewed**: 2026-02-21

---

## Table of Contents

1. [Overview](#overview)
2. [Queues](#queues)
3. [Deployment and Scaling](#deployment-and-scaling)
4. [Rollback](#rollback)
5. [Common Incidents](#common-incidents)
6. [Escalation](#escalation)

---

## Overview

The worker service processes asynchronous jobs enqueued by the API service.
It handles the OCR → LLM extraction → rules engine → storage pipeline for
document processing, and export generation.

**Key dependencies:**
- Redis (Azure Managed Redis) — BullMQ job storage
- MongoDB (Azure Cosmos DB) — document storage
- Azure Blob Storage — document files
- AI Runtime service (`apps/ai-runtime`) — LLM extraction calls

---

## Queues

| Queue                  | Purpose                                      | Max concurrency |
|------------------------|----------------------------------------------|-----------------|
| `document-processing`  | OCR → LLM → rules → review queue insertion  | 5               |
| `email-ingestion`      | Parse inbound emails, enqueue documents      | 3               |
| `export-generation`    | Generate CSV/XLSX audit reports              | 2               |

---

## Deployment and Scaling

Workers scale with ACA's KEDA-based HTTP/queue-depth scaling. The Terraform
module configures `min_replicas=1` (stg) or `min_replicas=2` (prd) to ensure
a worker is always available.

**Normal deployment:** via `promote.yml` workflow (same as API service).

---

## Rollback

Worker rollback follows the same ACA traffic-shift approach as the API service.
See [API Service Runbook — Rollback](./api-service.md#rollback).

**Important:** In-flight jobs are not lost — BullMQ stores job state in Redis.
Jobs that were being processed when rollback occurs will be retried by the
restarted replica after the next `STALLED_INTERVAL`.

---

## Common Incidents

### Jobs accumulating in queue (backlog growing)

**Symptoms:** BullBoard shows jobs in `waiting` state growing; no `active` jobs.

**Steps:**
1. Check worker container logs for errors:
   ```bash
   az containerapp logs show \
     --name docflow-360-worker-prd \
     --resource-group rg-docflow-360-prd \
     --tail 50
   ```
2. Check Redis health (see [API Service Runbook](./api-service.md#redis-connection-failure))
3. Verify worker replicas are running:
   ```bash
   az containerapp revision list \
     --name docflow-360-worker-prd \
     --resource-group rg-docflow-360-prd \
     --output table
   ```
4. Scale up manually if needed (temporary):
   ```bash
   az containerapp update \
     --name docflow-360-worker-prd \
     --resource-group rg-docflow-360-prd \
     --min-replicas 3
   ```

### High job failure rate

**Symptoms:** BullBoard shows jobs in `failed` state; alert from Application Insights.

**Steps:**
1. Check failed job payloads in BullBoard for common error patterns
2. If OCR failures: check Azure Form Recognizer service health
3. If LLM failures: check AI Runtime service health (`apps/ai-runtime`)
4. If storage failures: check Azure Blob Storage connectivity
5. Retry failed jobs in bulk via BullBoard UI or Redis CLI:
   ```bash
   # Retry all failed jobs in document-processing queue
   redis-cli EVAL "..." (use BullMQ retry script)
   ```

### Worker OOM crash

**Symptoms:** Container restarts, `OOMKilled` in container events.

**Steps:**
1. Identify large document being processed (check job payload in Redis)
2. Increase worker memory in Terraform tfvars and deploy
3. Consider streaming large files instead of buffering in memory

---

## Escalation

| Level | Contact              | Trigger                                   |
|-------|----------------------|-------------------------------------------|
| L1    | On-call engineer     | Queue backlog > 1000 jobs                 |
| L2    | Backend team lead    | Job failure rate > 1% for > 15 min        |
| L3    | CTO                  | Data loss risk (jobs lost from Redis)     |
