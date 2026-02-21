# Runbook: Scheduler Service — docflow-360

**Service**: `apps/scheduler` — node-cron compliance alert scheduler  
**Owner**: `@sh-pendoah/backend`  
**On-call rotation**: See PagerDuty `docflow-360-scheduler`  
**SLO**: Compliance alerts sent within 1 hour of scheduled window  
**Last reviewed**: 2026-02-21

---

## Table of Contents

1. [Overview](#overview)
2. [Scheduled Jobs](#scheduled-jobs)
3. [Deployment](#deployment)
4. [Rollback](#rollback)
5. [Common Incidents](#common-incidents)
6. [Escalation](#escalation)

---

## Overview

The scheduler runs cron-based compliance alert checks. It queries MongoDB for
documents approaching expiration and sends notifications.

**Important:** The scheduler must run as exactly **1 replica** to prevent
duplicate alerts. The Terraform configuration enforces `min_replicas=1` and
`max_replicas=1`. Do not scale this service horizontally.

**Alert idempotency:** Alerts include a 24-hour `sentAt` guard — the same
alert will not be resent within 24 hours even if the scheduler restarts.

**Key dependencies:**
- MongoDB (Azure Cosmos DB) — compliance document store
- Email service (SMTP / Azure Communication Services)

---

## Scheduled Jobs

| Job                         | Schedule (UTC)    | Description                                     |
|-----------------------------|-------------------|-------------------------------------------------|
| Compliance expiration alerts | `0 8 * * *`       | Check documents expiring in 30/15/7/0 days      |
| Daily summary               | `0 9 * * 1-5`     | Send daily summary to project managers (weekdays) |

---

## Deployment

The scheduler runs as a single-replica ACA app. Deployment via `promote.yml`
restarts the replica with the new image (zero-downtime: cron jobs are short-lived).

**Never scale beyond 1 replica** — multiple replicas will send duplicate alerts.
The `terraform.tfvars` files enforce this:
```hcl
min_replicas = 1
max_replicas = 1
```

---

## Rollback

Rollback follows the same ACA traffic-shift approach as other services.
See [API Service Runbook — Rollback](./api-service.md#rollback).

**Alert deduplication after rollback:** The 24-hour `sentAt` guard prevents
re-sending alerts that were already sent by the previous revision.

---

## Common Incidents

### Compliance alerts not being sent

**Symptoms:** Customers report missing expiration notifications; no alerts in
MongoDB's `ComplianceAlert` collection for recent windows.

**Steps:**
1. Check scheduler container logs:
   ```bash
   az containerapp logs show \
     --name docflow-360-scheduler-prd \
     --resource-group rg-docflow-360-prd \
     --tail 100
   ```
2. Verify the scheduler replica is running:
   ```bash
   az containerapp revision list \
     --name docflow-360-scheduler-prd \
     --resource-group rg-docflow-360-prd
   ```
3. Check MongoDB connectivity from the scheduler (logs will show connection errors)
4. Manually trigger a compliance check run if needed:
   ```bash
   # Exec into the scheduler container and trigger manually
   az containerapp exec \
     --name docflow-360-scheduler-prd \
     --resource-group rg-docflow-360-prd \
     --command "node -e \"require('./dist/index').runComplianceCheck()\""
   ```

### Duplicate alerts sent

**Symptoms:** Customers report receiving the same alert multiple times.

**Root cause:** Usually caused by multiple scheduler replicas running simultaneously.

**Steps:**
1. Immediately check replica count:
   ```bash
   az containerapp show \
     --name docflow-360-scheduler-prd \
     --resource-group rg-docflow-360-prd \
     --query "properties.template.scale"
   ```
2. If replicas > 1, scale back to 1:
   ```bash
   az containerapp update \
     --name docflow-360-scheduler-prd \
     --resource-group rg-docflow-360-prd \
     --min-replicas 1 --max-replicas 1
   ```
3. File an incident ticket — the 24-hour guard should have prevented this.
   If it didn't, investigate the alert idempotency logic.
4. Apply Terraform to re-enforce the 1-replica constraint:
   ```bash
   terraform apply -var-file="environments/prd/terraform.tfvars" -target=module.scheduler
   ```

### Email delivery failures

**Symptoms:** Scheduler logs show `emailService` errors; no emails received.

**Steps:**
1. Check SMTP / Azure Communication Services credentials
2. Verify email configuration in ACA app settings
3. For SMTP: test connectivity from container:
   ```bash
   az containerapp exec --command "nc -zv smtp.host 587"
   ```

---

## Escalation

| Level | Contact              | Trigger                                    |
|-------|----------------------|--------------------------------------------|
| L1    | On-call engineer     | Any missed compliance alert window         |
| L2    | Backend team lead    | Alert failures > 2 consecutive windows     |
| L3    | CTO / Legal          | Compliance deadline missed (regulatory risk) |
