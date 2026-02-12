# Worklighter - Upgrade Migration Scripts

**Companion to:** UPGRADE_RECOMMENDATIONS_2026.md  
**Date:** February 12, 2026

---

## Quick Start - Phase 1 Upgrades

This guide provides copy-paste commands for executing the recommended upgrades.

### Prerequisites

```powershell
# Backup current state
git checkout -b feature/upgrade-2026-phase1
git add .
git commit -m "Pre-upgrade snapshot - Feb 2026"

# Ensure clean working directory
git status

# Stop all running services
docker-compose down

# Backup package-lock files
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item "apps/api/package-lock.json" "apps/api/package-lock.json.backup-$timestamp"
Copy-Item "apps/web/package-lock.json" "apps/web/package-lock.json.backup-$timestamp"
Copy-Item "apps/worker/package-lock.json" "apps/worker/package-lock.json.backup-$timestamp"
Copy-Item "apps/scheduler/package-lock.json" "apps/scheduler/package-lock.json.backup-$timestamp"
Copy-Item "apps/landing/package-lock.json" "apps/landing/package-lock.json.backup-$timestamp"
```

---

## Phase 1: Core Infrastructure Upgrades

### 1A. Express 4 → 5 (API Service)

```powershell
# Navigate to API service
Set-Location apps/api

# Check current version
npm list express

# Upgrade Express and types
npm install express@5.0.0
npm install --save-dev @types/express@latest

# Verify installation
npm list express

# Return to root
Set-Location ../..
```

**Test Commands:**
```powershell
# Start API service
npm run dev:core-api

# In another terminal, test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"test123"}'

# Check for errors in console
```

**Code Changes Required:**

Update error handling in routes (optional optimization):

```typescript
// apps/api/routes/*.ts

// BEFORE (Express 4 pattern - still works in Express 5)
router.get('/resource/:id', async (req, res, next) => {
  try {
    const result = await service.getResource(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// AFTER (Express 5 - auto error handling)
router.get('/resource/:id', async (req, res) => {
  const result = await service.getResource(req.params.id);
  res.json(result);
});
```

Audit middleware:
```powershell
# Search for deprecated patterns
Select-String -Path "apps/api/routes/*.ts" -Pattern "req\.param\("
Select-String -Path "apps/api/middleware/*.ts" -Pattern "app\.del\("
```

---

### 1B. Mongoose 8 → 9 (All DB Services)

```powershell
# Update API service
Set-Location apps/api
npm install mongoose@^9.1.6
Set-Location ../..

# Update Worker service
Set-Location apps/worker
npm install mongoose@^9.1.6
Set-Location ../..

# Update Scheduler service
Set-Location apps/scheduler
npm install mongoose@^9.1.6
Set-Location ../..

# Verify versions
npm list mongoose --prefix apps/api
npm list mongoose --prefix apps/worker
npm list mongoose --prefix apps/scheduler
```

**Test Commands:**
```powershell
# Start MongoDB
docker-compose -f docker-compose.services.yml up -d mongodb

# Start API service
npm run dev:core-api

# Test database operations
curl http://localhost:3000/api/projects
curl http://localhost:3000/api/invoices
curl http://localhost:3000/api/daily-logs

# Check Mongoose connection logs
# Look for "Mongoose connected to MongoDB" in console
```

**Code Changes Required:**

Check for deprecated patterns:
```powershell
# Search for potential issues
Select-String -Path "apps/api/models/*.ts" -Pattern "\.toObject\(\)"
Select-String -Path "apps/api/models/*.ts" -Pattern "timestamp.*virtual"
```

No breaking changes expected for your current usage patterns, but verify:
- All models compile without TypeScript errors
- Queries return expected results
- Virtuals work correctly
- Audit logging captures database operations

---

### 1C. LangChain 0.3 → 1.2 (AI Services)

```powershell
# Update API service
Set-Location apps/api
npm install @langchain/openai@^1.2.7 @langchain/core@latest langchain@latest
Set-Location ../..

# Update Worker service
Set-Location apps/worker
npm install @langchain/openai@^1.2.7 @langchain/core@latest
Set-Location ../..

# Verify versions
npm list @langchain/openai --prefix apps/api
npm list @langchain/openai --prefix apps/worker
```

**Test Commands:**
```powershell
# Start infrastructure
docker-compose -f docker-compose.services.yml up -d

# Start API + Worker
npm run dev:core-api
# In another terminal
cd apps/worker
npm run dev

# Test OCR extraction (requires Azure credentials)
# Upload a test invoice through the web UI or:
curl http://localhost:3000/api/documents/upload -Method POST -Headers @{"Authorization"="Bearer YOUR_TOKEN"} -Form @{file=Get-Item "test-invoice.pdf"}

# Monitor worker logs for extraction results
```

**Code Changes Required:**

Verify LLM service integration:
```powershell
# Check OCR service usage
code apps/api/services/ocrService.ts
code apps/api/services/llmService.ts

# Look for any deprecated imports or methods
Select-String -Path "apps/api/services/*.ts" -Pattern "from \"langchain\""
```

Potential adjustments:
```typescript
// apps/api/services/llmService.ts
// Ensure imports are from correct packages

// BEFORE
import { OpenAI } from "langchain/llms/openai";

// AFTER (if needed)
import { ChatOpenAI } from "@langchain/openai";
```

---

## Phase 2: Frontend Consistency Upgrades

### 2A. React 18 → 19 (Landing Page)

```powershell
Set-Location apps/landing

# Check current version
npm list react react-dom

# Upgrade React
npm install react@^19.0.4 react-dom@^19.0.4

# Upgrade types
npm install --save-dev @types/react@^19.0.3 @types/react-dom@^19.0.3

Set-Location ../..
```

**Test Commands:**
```powershell
Set-Location apps/landing

# Development mode
npm run dev
# Visit http://localhost:5173

# Production build test
npm run build
npm run preview

Set-Location ../..
```

**Visual Testing Checklist:**
- [ ] Hero section renders
- [ ] Navigation works
- [ ] All interactive elements responsive
- [ ] No console errors
- [ ] Images load correctly
- [ ] Animations smooth

---

### 2B. Tailwind CSS 3 → 4 (Landing Page)

```powershell
Set-Location apps/landing

# Upgrade Tailwind and dependencies
npm install tailwindcss@^4.1.18 @tailwindcss/postcss@^4.1.18
npm install --save-dev autoprefixer@latest postcss@latest

Set-Location ../..
```

**Configuration Migration:**

Create new Tailwind 4 config:

```javascript
// apps/landing/tailwind.config.js - UPDATE THIS FILE

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update PostCSS config if needed:
```javascript
// apps/landing/postcss.config.js

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**Test Commands:**
```powershell
Set-Location apps/landing

# Clear Tailwind cache
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

# Rebuild
npm run build

# Test dev mode
npm run dev

Set-Location ../..
```

**Visual Regression Testing:**
- [ ] All Tailwind classes still work
- [ ] Custom colors preserved
- [ ] Responsive breakpoints correct
- [ ] Dark mode (if applicable)
- [ ] Hover states
- [ ] Animations

---

### 2C. Vite 6 → 7 (Landing Page)

```powershell
Set-Location apps/landing

# Upgrade Vite
npm install vite@^7.0.0 @vitejs/plugin-react@latest

Set-Location ../..
```

**Configuration Check:**

Verify `vite.config.ts`:
```typescript
// apps/landing/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist'
  }
})
```

**Test Commands:**
```powershell
Set-Location apps/landing

# Clean build
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run build

# Check build output
Get-ChildItem dist -Recurse

# Test dev server
npm run dev

# Test preview
npm run preview

Set-Location ../..
```

---

### 2D. Next.js 15.1 → 15.5 (Web App)

```powershell
Set-Location apps/web

# Upgrade Next.js
npm install next@^15.5.11

# Verify
npm list next

Set-Location ../..
```

**Test Commands:**
```powershell
Set-Location apps/web

# Clean Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Development mode
npm run dev
# Visit http://localhost:3001

# Production build test
npm run build
npm run start

Set-Location ../..
```

**Smoke Test Checklist:**
- [ ] Login page loads
- [ ] Dashboard renders
- [ ] Review queue loads
- [ ] Can navigate between pages
- [ ] No console errors
- [ ] API calls work
- [ ] Server-side rendering works

---

## Phase 3: Tooling Upgrades

### 3A. TypeScript 5.7 → 6.0 (WAIT FOR STABLE)

**Status:** ⏳ Monitoring for stable release

When TypeScript 6.0 is stable:

```powershell
# Update all services
$services = @("api", "web", "worker", "scheduler", "landing")

foreach ($service in $services) {
    Write-Host "Updating TypeScript in apps/$service..."
    Set-Location "apps/$service"
    npm install --save-dev typescript@^6.0.0
    Set-Location ../..
}

# Verify all services compile
npm run build --prefix apps/api
npm run build --prefix apps/web
npm run build --prefix apps/worker
npm run build --prefix apps/scheduler
npm run build --prefix apps/landing
```

---

### 3B. Minor Package Updates (Safe Batch)

```powershell
# API Service - Safe updates
Set-Location apps/api

npm install uuid@^13.0.0
npm install helmet@latest
npm install cors@latest
npm install morgan@latest
npm install winston@latest
npm install dotenv@latest
npm install express-rate-limit@latest
npm install express-validator@latest
npm install bullmq@latest
npm install ioredis@latest
npm install sharp@latest
npm install swagger-jsdoc@latest
npm install swagger-ui-express@latest
npm install nodemailer@latest

# Dev dependencies
npm install --save-dev nodemon@latest cross-env@latest ts-node@latest

Set-Location ../..

# Worker Service
Set-Location apps/worker
npm install bullmq@latest winston@latest dotenv@latest ioredis@latest uuid@^13.0.0
npm install --save-dev nodemon@latest ts-node@latest
Set-Location ../..

# Scheduler Service
Set-Location apps/scheduler
npm install dotenv@latest winston@latest nodemailer@latest
npm install --save-dev nodemon@latest ts-node@latest
Set-Location ../..

# Web Service
Set-Location apps/web
npm install sharp@latest axios@latest lodash@latest
Set-Location ../..
```

---

### 3C. Azure SDK Updates

```powershell
Set-Location apps/api

# Check for updates
npm outdated @azure/identity
npm outdated @azure/storage-blob
npm outdated @azure/ai-form-recognizer

# Update if available
npm install @azure/identity@latest
npm install @azure/storage-blob@latest
# @azure/ai-form-recognizer is already at 5.1.0 (latest)

Set-Location ../..
```

---

## Comprehensive Testing After Upgrades

### Full Stack Start

```powershell
# Start infrastructure
docker-compose -f docker-compose.services.yml up -d

# Wait for MongoDB and Redis to be ready
timeout /t 10

# Start all services
npm run dev
```

### E2E Testing

```powershell
# In a new terminal (with all services running)
npx playwright test tests/e2e/e2e-login.spec.ts --headed
npx playwright test tests/e2e/invoice-workflow.spec.ts --headed
npx playwright test tests/e2e/daily-log-workflow.spec.ts --headed
npx playwright test tests/e2e/compliance-workflow.spec.ts --headed

# Full suite
npx playwright test
```

### Manual Testing Checklist

#### API Service
```powershell
# Health check
curl http://localhost:3000/api/health

# Authentication
curl http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"admin@example.com","password":"admin123"}'

# Protected endpoint (use token from login)
$token = "YOUR_JWT_TOKEN"
curl http://localhost:3000/api/projects -Headers @{"Authorization"="Bearer $token"}
```

#### Web App
1. Visit http://localhost:3001
2. Login with test credentials
3. Navigate to Review Queue
4. Test keyboard shortcuts (Y, N, arrows)
5. Upload a test document
6. Verify bounding boxes display
7. Approve/reject a document
8. Check audit logs

#### Landing Page
1. Visit http://localhost:5173
2. Verify all sections load
3. Test responsive design (resize browser)
4. Check all links work
5. Verify CTAs functional

---

## Rollback Procedures

### Rollback Single Service

```powershell
# Example: Rollback API service
Set-Location apps/api

# Restore package.json and package-lock.json from git
git checkout package.json package-lock.json

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install

# Rebuild
npm run build

Set-Location ../..
```

### Rollback All Changes

```powershell
# Reset to pre-upgrade state
git reset --hard HEAD~1

# Reinstall all dependencies
npm run install:all

# Restart services
docker-compose down
docker-compose up -d
```

### Rollback with Backup

```powershell
# Find backup timestamp
$backups = Get-ChildItem apps/*/package-lock.json.backup-*
$backups | Select-Object Name, LastWriteTime

# Restore specific backup
$timestamp = "20260212-143000"
Copy-Item "apps/api/package-lock.json.backup-$timestamp" "apps/api/package-lock.json"

# Reinstall
Set-Location apps/api
Remove-Item -Recurse -Force node_modules
npm install
Set-Location ../..
```

---

## Troubleshooting

### TypeScript Compilation Errors

```powershell
# Clean build artifacts
Remove-Item -Recurse -Force apps/*/dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps/*/build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps/*/.next -ErrorAction SilentlyContinue

# Rebuild TypeScript
npm run build --prefix apps/api
```

### Mongoose Connection Issues

```powershell
# Check MongoDB is running
docker ps | Select-String mongodb

# Check connection string
Select-String -Path "apps/api/.env" -Pattern "MONGO"

# Test connection directly
# In MongoDB container
docker exec -it worklighter-mongodb-1 mongosh
```

### BullMQ Job Processing Failures

```powershell
# Check Redis is running
docker ps | Select-String redis

# Check worker logs
Set-Location apps/worker
npm run dev

# Monitor Redis queues
docker exec -it worklighter-redis-1 redis-cli
> KEYS *
> LLEN bull:document-processing:wait
```

### Next.js Build Failures

```powershell
Set-Location apps/web

# Clear all caches
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache

# Reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Try build again
npm run build

Set-Location ../..
```

### Tailwind CSS Not Working

```powershell
Set-Location apps/landing

# Check config files exist
Test-Path tailwind.config.js
Test-Path postcss.config.js

# Clear Vite cache
Remove-Item -Recurse -Force node_modules/.cache

# Rebuild
npm run build

Set-Location ../..
```

---

## Performance Benchmarks

After upgrades, run these benchmarks to ensure no regressions:

### API Response Times

```powershell
# Using PowerShell Measure-Command
Measure-Command { curl http://localhost:3000/api/health }
Measure-Command { curl http://localhost:3000/api/projects -Headers @{"Authorization"="Bearer $token"} }
```

### Build Times

```powershell
# API build
Measure-Command { npm run build --prefix apps/api }

# Web build
Measure-Command { npm run build --prefix apps/web }

# Landing build
Measure-Command { npm run build --prefix apps/landing }
```

### Worker Processing

```powershell
# Time a document processing job
# Upload document and measure time to completion
# Expected: < 30 seconds for typical invoice
```

---

## Post-Upgrade Documentation

Update these files after successful upgrade:

```powershell
# Update SETUP.md with new version requirements
code SETUP.md

# Update DEPLOYMENT.md if Docker images changed
code DEPLOYMENT.md

# Update README.md with new tech stack versions
code README.md

# Consider updating AGENTS.md
code AGENTS.md
```

---

## Maintenance Schedule

After completing upgrades, set up recurring maintenance:

### Weekly
- Check for security updates: `npm audit`
- Review Dependabot PRs (if enabled)

### Monthly
- Run `npm outdated` on all services
- Review changelogs of critical dependencies
- Test updates in staging

### Quarterly
- Major version upgrade review
- Performance benchmarking
- Security audit

---

## Additional Resources

- [Express.js 5 Migration Guide](https://expressjs.com/en/guide/migrating-5.html)
- [Mongoose 9 Upgrade Guide](https://mongoosejs.com/docs/migrating_to_9.html)
- [Next.js Upgrade Guide](https://nextjs.org/docs/upgrading)
- [Tailwind CSS v4 Guide](https://tailwindcss.com/docs/upgrade-guide)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [LangChain.js Migration](https://js.langchain.com/docs/how_to/migrate)

---

## Support

If you encounter issues during migration:

1. Check this troubleshooting guide
2. Review package-specific migration documentation
3. Search GitHub issues for the package
4. Rollback to previous version if critical
5. Document the issue for team review

---

**Document Version:** 1.0  
**Last Updated:** February 12, 2026  
**Next Review:** March 12, 2026 (or after TypeScript 6.0 stable release)
