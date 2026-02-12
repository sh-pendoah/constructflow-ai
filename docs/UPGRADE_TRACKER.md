# Worklighter - Upgrade Tracker & Checklist

**Reference Documents:**
- [Detailed Analysis](./UPGRADE_RECOMMENDATIONS_2026.md)
- [Migration Scripts](./UPGRADE_MIGRATION_SCRIPTS.md)

**Date Started:** _____________  
**Team Lead:** _____________

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Total Upgrades Identified | 23 |
| Critical Priority | 3 |
| High Priority | 5 |
| Medium Priority | 4 |
| Low Priority | 11 |
| Services Affected | 5 |
| Estimated Total Effort | 25-40 hours |

---

## Phase 1: Critical Path (Week 1-2)

### 🔴 P0: Express 4 → 5 (API Service)
- [ ] **Pre-flight:** Backup package-lock.json
- [ ] **Pre-flight:** Review all route handlers for deprecated patterns
- [ ] **Pre-flight:** Document current error handling approach
- [ ] **Upgrade:** Install Express 5.0.0 and latest types
- [ ] **Code:** Update async/await error handling (optional)
- [ ] **Code:** Remove any `req.param()` usage
- [ ] **Code:** Remove any `app.del()` usage
- [ ] **Test:** All REST endpoints via Postman/Swagger
- [ ] **Test:** Authentication flows
- [ ] **Test:** Invoice processing workflow
- [ ] **Test:** Daily log submission
- [ ] **Test:** Compliance document handling
- [ ] **Test:** Review queue operations
- [ ] **Test:** Rate limiting behavior
- [ ] **Monitor:** Check Application Insights for errors
- [ ] **Deploy:** Staging environment test
- [ ] **Deploy:** Production deployment
- [ ] **Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

**Assigned To:** _____________  
**Started:** _____________  
**Completed:** _____________  
**Notes:**
```




```

---

### 🔴 P0: Mongoose 8 → 9 (API, Worker, Scheduler)
- [ ] **Pre-flight:** Review all Mongoose models
- [ ] **Pre-flight:** Document current schema patterns
- [ ] **Pre-flight:** Check for custom virtuals
- [ ] **Upgrade:** API service (apps/api)
- [ ] **Upgrade:** Worker service (apps/worker)
- [ ] **Upgrade:** Scheduler service (apps/scheduler)
- [ ] **Test:** All models compile without TypeScript errors
- [ ] **Test:** Database read operations (GET endpoints)
- [ ] **Test:** Database write operations (POST/PUT/PATCH)
- [ ] **Test:** Audit logging captures operations
- [ ] **Test:** Document queries with filters
- [ ] **Test:** Aggregation pipelines
- [ ] **Test:** Virtual fields work correctly
- [ ] **Test:** Timestamp handling
- [ ] **Monitor:** Query performance benchmarks
- [ ] **Deploy:** Staging with full data migration test
- [ ] **Deploy:** Production deployment
- [ ] **Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

**Assigned To:** _____________  
**Started:** _____________  
**Completed:** _____________  
**Notes:**
```




```

---

### 🔴 P0: LangChain 0.3 → 1.2 (API, Worker)
- [ ] **Pre-flight:** Review OCR service integration
- [ ] **Pre-flight:** Review LLM service integration
- [ ] **Pre-flight:** Document current extraction workflows
- [ ] **Pre-flight:** Backup sample extraction results
- [ ] **Upgrade:** API service (apps/api)
- [ ] **Upgrade:** Worker service (apps/worker)
- [ ] **Code:** Verify import statements from correct packages
- [ ] **Code:** Check for deprecated method calls
- [ ] **Test:** OCR extraction accuracy (invoice)
- [ ] **Test:** OCR extraction accuracy (daily log)
- [ ] **Test:** OCR extraction accuracy (compliance doc)
- [ ] **Test:** LLM provider integration (Azure OpenAI)
- [ ] **Test:** Bounding box coordinate accuracy
- [ ] **Test:** Confidence score calculation
- [ ] **Test:** Error handling for failed extractions
- [ ] **Test:** Worker job processing end-to-end
- [ ] **Monitor:** Extraction quality metrics
- [ ] **Deploy:** Staging with sample documents
- [ ] **Deploy:** Production deployment
- [ ] **Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

**Assigned To:** _____________  
**Started:** _____________  
**Completed:** _____________  
**Notes:**
```




```

---

## Phase 2: Frontend Consistency (Week 3)

### 🟡 P1: React 18 → 19 (Landing Page)
- [ ] **Pre-flight:** Backup landing page package files
- [ ] **Pre-flight:** Test current build
- [ ] **Upgrade:** Install React 19.0.4 and types
- [ ] **Test:** Dev server starts (http://localhost:5173)
- [ ] **Test:** Production build succeeds
- [ ] **Test:** Visual regression - Hero section
- [ ] **Test:** Visual regression - Navigation
- [ ] **Test:** Visual regression - Footer
- [ ] **Test:** Responsive design (mobile)
- [ ] **Test:** Responsive design (tablet)
- [ ] **Test:** No console errors
- [ ] **Deploy:** Staging
- [ ] **Deploy:** Production
- [ ] **Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

**Assigned To:** _____________  
**Started:** _____________  
**Completed:** _____________

---

### 🟡 P1: Tailwind CSS 3 → 4 (Landing Page)
- [ ] **Pre-flight:** Review custom Tailwind classes
- [ ] **Pre-flight:** Document current config
- [ ] **Upgrade:** Install Tailwind 4.1.18
- [ ] **Code:** Update tailwind.config.js if needed
- [ ] **Code:** Update postcss.config.js
- [ ] **Test:** Build succeeds without warnings
- [ ] **Test:** All Tailwind classes render correctly
- [ ] **Test:** Custom colors preserved
- [ ] **Test:** Responsive breakpoints correct
- [ ] **Test:** Hover states work
- [ ] **Test:** Animations smooth
- [ ] **Deploy:** Staging
- [ ] **Deploy:** Production
- [ ] **Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

**Assigned To:** _____________  
**Started:** _____________  
**Completed:** _____________

---

### 🟡 P1: Vite 6 → 7 (Landing Page)
- [ ] **Pre-flight:** Review vite.config.ts
- [ ] **Upgrade:** Install Vite 7.0.x
- [ ] **Test:** Dev server starts
- [ ] **Test:** Hot reload works
- [ ] **Test:** Production build succeeds
- [ ] **Test:** Build output is optimized
- [ ] **Test:** Preview mode works
- [ ] **Deploy:** Staging
- [ ] **Deploy:** Production
- [ ] **Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

**Assigned To:** _____________  
**Started:** _____________  
**Completed:** _____________

---

### 🟢 P2: Next.js 15.1 → 15.5 (Web App)
- [ ] **Pre-flight:** Backup web package files
- [ ] **Upgrade:** Install Next.js 15.5.11
- [ ] **Test:** Dev server starts (http://localhost:3001)
- [ ] **Test:** Login page loads
- [ ] **Test:** Dashboard renders
- [ ] **Test:** Review queue loads
- [ ] **Test:** Navigation between pages
- [ ] **Test:** Server-side rendering works
- [ ] **Test:** API routes functional
- [ ] **Test:** Production build succeeds
- [ ] **Deploy:** Staging
- [ ] **Deploy:** Production
- [ ] **Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

**Assigned To:** _____________  
**Started:** _____________  
**Completed:** _____________

---

## Phase 3: Tooling & Minor Updates (Week 4)

### ⏳ P3: TypeScript 5.7 → 6.0 (ALL SERVICES) - WAIT FOR STABLE
- [ ] **Monitor:** TypeScript 6.0 stable release announcement
- [ ] **Review:** Release notes and breaking changes
- [ ] **Decide:** Upgrade to 6.0 or wait for 7.0 (Rust-based)
- [ ] **Pre-flight:** Test compile all services on current version
- [ ] **Upgrade:** All 5 services simultaneously
- [ ] **Test:** API service compiles
- [ ] **Test:** Web service compiles
- [ ] **Test:** Worker service compiles
- [ ] **Test:** Scheduler service compiles
- [ ] **Test:** Landing service compiles
- [ ] **Test:** No new TypeScript errors
- [ ] **Test:** Type inference still accurate
- [ ] **Deploy:** Staging
- [ ] **Deploy:** Production
- [ ] **Status:** ⏳ Waiting for Stable Release

**Target Date:** _____________  
**Assigned To:** _____________

---

### 🟢 P3: Minor Package Updates (Batch)

#### API Service Minor Updates
- [ ] uuid 11.0.5 → 13.0.0
- [ ] helmet → latest
- [ ] cors → latest
- [ ] morgan → latest
- [ ] winston → latest
- [ ] dotenv → latest
- [ ] express-rate-limit → latest
- [ ] express-validator → latest
- [ ] bullmq → latest
- [ ] ioredis → latest
- [ ] sharp → latest
- [ ] swagger-jsdoc → latest
- [ ] swagger-ui-express → latest
- [ ] nodemailer → latest
- [ ] nodemon → latest (dev)
- [ ] cross-env → latest (dev)
- [ ] ts-node → latest (dev)

**Batch Test:**
- [ ] All dependencies install without conflicts
- [ ] TypeScript compiles
- [ ] Dev server starts
- [ ] API endpoints respond
- [ ] No runtime errors

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

#### Worker Service Minor Updates
- [ ] bullmq → latest
- [ ] winston → latest
- [ ] dotenv → latest
- [ ] ioredis → latest
- [ ] uuid 11.0.5 → 13.0.0
- [ ] nodemon → latest (dev)
- [ ] ts-node → latest (dev)

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

#### Scheduler Service Minor Updates
- [ ] dotenv → latest
- [ ] winston → latest
- [ ] nodemailer → latest
- [ ] nodemon → latest (dev)
- [ ] ts-node → latest (dev)

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

#### Web Service Minor Updates
- [ ] sharp → latest
- [ ] axios → latest
- [ ] lodash → latest

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

### 🟢 P3: Azure SDK Updates
- [ ] @azure/identity → Check and update if available
- [ ] @azure/storage-blob → Check and update if available
- [ ] ✅ @azure/ai-form-recognizer (Already latest: 5.1.0)

**Test:**
- [ ] Blob storage upload/download works
- [ ] Form Recognizer OCR works
- [ ] Identity authentication succeeds

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## E2E Testing Validation

After ALL Phase 1-3 upgrades complete:

### Playwright E2E Suite
- [ ] `tests/e2e/e2e-login.spec.ts` - Passes
- [ ] `tests/e2e/invoice-workflow.spec.ts` - Passes
- [ ] `tests/e2e/daily-log-workflow.spec.ts` - Passes
- [ ] `tests/e2e/compliance-workflow.spec.ts` - Passes
- [ ] Full suite run with no failures

### Manual Testing
- [ ] **Review Queue** - Three-pane layout renders
- [ ] **Review Queue** - Keyboard shortcuts (Y/N/arrows) work
- [ ] **Review Queue** - Bounding boxes display correctly
- [ ] **Review Queue** - Confidence colors correct (amber/blue)
- [ ] **Document Upload** - Invoice processing end-to-end
- [ ] **Document Upload** - Daily log processing end-to-end
- [ ] **Document Upload** - Compliance doc processing end-to-end
- [ ] **Approval/Reject** - State changes persist
- [ ] **Audit Logs** - Review queue actions logged
- [ ] **Exports** - Report generation works
- [ ] **Alerts** - Compliance scheduler sends emails
- [ ] **Performance** - No regressions in response times

---

## Deployment Checklist

### Staging Deployment
- [ ] All Phase 1 upgrades tested individually
- [ ] All Phase 2 upgrades tested individually
- [ ] All Phase 3 upgrades tested as batch
- [ ] Full E2E suite passes (0 failures)
- [ ] Manual smoke tests pass
- [ ] Performance benchmarks acceptable
- [ ] No errors in Application Insights (24h monitoring)
- [ ] Database migrations successful (if any)
- [ ] Rollback procedure tested and documented

**Staging Approval:**
- [ ] Tech Lead Sign-off: _____________ Date: _____________
- [ ] QA Sign-off: _____________ Date: _____________

---

### Production Deployment
- [ ] Staging validation complete (minimum 48 hours)
- [ ] Backup of current production state
- [ ] Docker images built and tagged
- [ ] Database backup completed
- [ ] Maintenance window scheduled (if needed)
- [ ] Team on standby for monitoring
- [ ] Rollback plan accessible
- [ ] Deployment runbook reviewed

**Production Deployment:**
- [ ] Deployed by: _____________ Date: _____________ Time: _____________
- [ ] Initial health checks pass
- [ ] User acceptance testing (UAT) pass
- [ ] 24-hour monitoring period (no critical issues)
- [ ] 7-day monitoring period (no degradation)

**Production Approval:**
- [ ] Tech Lead Sign-off: _____________ Date: _____________
- [ ] Product Owner Sign-off: _____________ Date: _____________

---

## Blockers & Issues

### Known Blockers (From AUDIT.md)
These should be resolved BEFORE starting Phase 1 upgrades:

- [ ] ❌ **P0 Blocker #1:** Alert idempotency broken
  - File: `apps/scheduler/index.ts` + `apps/api/services/complianceAlertService.ts`
  - Issue: Inconsistent MongoDB queries, alerts can resend
  - Status: ⬜ Not Fixed | 🟡 In Progress | ✅ Fixed

- [ ] ❌ **P0 Blocker #2:** Duplicate scheduler implementations
  - Files: `apps/scheduler/index.ts` (cron) and `apps/api/services/complianceScheduler.ts` (BullMQ)
  - Issue: Both send alerts, only one should be active
  - Status: ⬜ Not Fixed | 🟡 In Progress | ✅ Fixed

- [ ] ❌ **P0 Blocker #3:** Review queue audit logging missing
  - File: `apps/api/routes/reviewQueue.ts`
  - Issue: `auditLoggingService` not imported, approve/reject not logged
  - Status: ⬜ Not Fixed | 🟡 In Progress | ✅ Fixed

**Recommendation:** ✋ Fix these P0 blockers FIRST, then proceed with upgrades.

---

### Upgrade-Specific Issues

| Issue | Service | Severity | Status | Resolution |
|-------|---------|----------|--------|------------|
| | | | | |
| | | | | |
| | | | | |

---

## Performance Benchmarks

Record before/after metrics:

### API Response Times
| Endpoint | Before (ms) | After (ms) | Change |
|----------|-------------|------------|--------|
| GET /api/health | | | |
| GET /api/projects | | | |
| POST /api/documents/upload | | | |
| GET /api/review-queue | | | |

### Build Times
| Service | Before (s) | After (s) | Change |
|---------|------------|-----------|--------|
| apps/api | | | |
| apps/web | | | |
| apps/worker | | | |
| apps/scheduler | | | |
| apps/landing | | | |

### Document Processing
| Document Type | Before (s) | After (s) | Change |
|---------------|------------|-----------|--------|
| Invoice OCR | | | |
| Daily Log OCR | | | |
| Compliance Doc OCR | | | |

---

## Rollback Log

If rollbacks are needed, document here:

| Date/Time | Service | Reason | Actions Taken | Success? |
|-----------|---------|--------|---------------|----------|
| | | | | |
| | | | | |

---

## Post-Upgrade Maintenance

### Immediate (Week 4)
- [ ] Update SETUP.md with new version requirements
- [ ] Update DEPLOYMENT.md with new build steps
- [ ] Update README.md tech stack section
- [ ] Update AGENTS.md if needed
- [ ] Document lessons learned
- [ ] Share upgrade report with team

### Short-term (Month 1)
- [ ] Monitor Application Insights for anomalies
- [ ] Run security audit: `npm audit` across all services
- [ ] Check for new patch releases
- [ ] Review Dependabot alerts (if enabled)

### Long-term (Quarterly)
- [ ] Q2 2026: Review TypeScript 7 release (Rust-based)
- [ ] Q3 2026: Check Next.js 16 production readiness
- [ ] Q4 2026: Annual full-stack upgrade review

---

## Key Metrics

### Success Criteria
- [ ] ✅ All 23 upgrades completed
- [ ] ✅ Zero production incidents related to upgrades
- [ ] ✅ Performance benchmarks improved or maintained
- [ ] ✅ E2E tests 100% passing
- [ ] ✅ No critical security vulnerabilities
- [ ] ✅ Team trained on new versions

### Actual Results
- **Total Upgrades Completed:** _____ / 23
- **Production Incidents:** _____
- **Performance Change:** _____ (% improvement/regression)
- **E2E Test Pass Rate:** _____ %
- **Time to Complete:** _____ days (estimated 20-30 days)

---

## Team Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tech Lead | | | |
| Backend Engineer | | | |
| Frontend Engineer | | | |
| QA Lead | | | |
| DevOps Engineer | | | |
| Product Owner | | | |

---

**Document Version:** 1.0  
**Created:** February 12, 2026  
**Last Updated:** _____________  
**Status:** 📋 Planning | 🚀 In Progress | ✅ Complete

---

## Quick Commands Reference

```powershell
# Check outdated packages
npm outdated --prefix apps/api
npm outdated --prefix apps/web
npm outdated --prefix apps/worker
npm outdated --prefix apps/scheduler
npm outdated --prefix apps/landing

# Start infrastructure
docker-compose -f docker-compose.services.yml up -d

# Start all services
npm run dev

# Run E2E tests
npx playwright test

# Build all services
npm run build

# Check for security issues
npm audit --prefix apps/api
```

---

**Need Help?** Refer to:
- [UPGRADE_RECOMMENDATIONS_2026.md](./UPGRADE_RECOMMENDATIONS_2026.md) - Detailed analysis
- [UPGRADE_MIGRATION_SCRIPTS.md](./UPGRADE_MIGRATION_SCRIPTS.md) - Step-by-step commands
- [AUDIT.md](../AUDIT.md) - P0 blockers to fix first
