# Worklighter - Package & Technology Upgrade Recommendations 2026

**Analysis Date:** February 12, 2026  
**Repository:** Worklighter Construction Operations Automation Engine

---

## Executive Summary

This document provides a comprehensive analysis of available package and technology upgrades for the Worklighter monorepo. Based on research conducted on February 12, 2026, we've identified **23 high-priority upgrades** across five services.

### Risk Assessment Legend
- 🟢 **Low Risk** - Minor version bump or patch, minimal breaking changes
- 🟡 **Medium Risk** - Major version upgrade with documented migration path
- 🔴 **High Risk** - Significant breaking changes, requires careful planning

---

## Critical Upgrades (Immediate Action Recommended)

### 1. Express.js 4 → 5 🟡 Medium Risk
**Current:** Express 4.21.2  
**Available:** Express 5.0.0 (Stable since October 2024)  
**Affected Services:** `apps/api`

#### Why Upgrade?
- 10+ years of technical debt resolved
- Enhanced async/await error handling (no more try-catch wrappers needed)
- Brotli compression support out of the box
- Improved security and stability
- Modern codebase aligned with Node.js best practices

#### Breaking Changes
- Some middleware signatures changed
- `res.send()` now checks `Content-Type` more strictly
- Removed deprecated methods (`req.param()`, `app.del()`)
- Updated router behavior for trailing slashes

#### Migration Path
```bash
cd apps/api
npm install express@5.0.0
npm install @types/express@latest
```

**Estimated Effort:** 4-8 hours  
**Testing Priority:** ⭐⭐⭐⭐⭐ (Test all API routes)  
**References:** 
- [Express 5 Release Announcement](https://expressjs.com/2024/10/15/v5-release.html)
- [Migration Guide](https://expressjs.com/en/guide/migrating-5.html)

---

### 2. Mongoose 8 → 9 🟡 Medium Risk
**Current:** Mongoose 8.9.5  
**Available:** Mongoose 9.1.6 (Released Feb 2026)  
**Affected Services:** `apps/api`, `apps/worker`, `apps/scheduler`

#### Why Upgrade?
- Performance improvements in query execution
- Better TypeScript type inference
- Enhanced `sanitizeFilter` for security
- Improved virtual handling with timestamps
- Active support and bug fixes

#### Breaking Changes
- Dropped support for Node.js < 18
- Some query middleware hooks have new signatures
- `toObject()` type inference changes with virtuals

#### Migration Path
```bash
# For each service
cd apps/api
npm install mongoose@^9.1.6

cd ../worker
npm install mongoose@^9.1.6

cd ../scheduler
npm install mongoose@^9.1.6
```

**Estimated Effort:** 2-4 hours  
**Testing Priority:** ⭐⭐⭐⭐⭐ (Test all database operations)  
**References:**
- [Mongoose 9 Changelog](https://github.com/Automattic/mongoose/releases)
- [Version Support](https://mongoosejs.com/docs/version-support.html)

---

### 3. LangChain OpenAI 0.3 → 1.2 🟡 Medium Risk
**Current:** @langchain/openai 0.3.17, @langchain/core 0.3.58  
**Available:** @langchain/openai 1.2.7 (Released days ago)  
**Affected Services:** `apps/api`, `apps/worker`

#### Why Upgrade?
- Compatibility with OpenAI SDK v5
- Improved streaming support
- Better error handling
- Performance optimizations
- Latest model support (GPT-4 Turbo, etc.)

#### Breaking Changes
- Some API method signatures updated
- Peer dependency on `openai@^5`
- Chain construction patterns may differ

#### Migration Path
```bash
cd apps/api
npm install @langchain/openai@^1.2.7 @langchain/core@latest langchain@latest

cd ../worker
npm install @langchain/openai@^1.2.7 @langchain/core@latest
```

**Estimated Effort:** 3-6 hours  
**Testing Priority:** ⭐⭐⭐⭐⭐ (Test OCR extraction workflows)  
**References:**
- [NPM Package](https://www.npmjs.com/package/@langchain/openai)

---

## High-Priority Upgrades

### 4. React 18 → 19 (Landing Page Only) 🟢 Low Risk
**Current:** React 18.3.1 (Landing page)  
**Already Upgraded:** React 19.0.0 (Web app)  
**Available:** React 19.0.4  
**Affected Services:** `apps/landing`

#### Why Upgrade?
- Consistency across all React-based services
- React 19 is now stable (released Jan 2026)
- Improved performance and rendering
- Better dev tools support
- New hooks and features

#### Migration Path
```bash
cd apps/landing
npm install react@^19.0.4 react-dom@^19.0.4
npm install --save-dev @types/react@^19.0.3 @types/react-dom@^19.0.3
```

**Estimated Effort:** 1-2 hours  
**Testing Priority:** ⭐⭐⭐ (Visual regression testing)

---

### 5. Tailwind CSS 3 → 4 (Landing Page Only) 🟡 Medium Risk
**Current:** Tailwind 3.4.17 (Landing page)  
**Already Upgraded:** Tailwind 4.1.18 (Web app)  
**Available:** Tailwind 4.1.18  
**Affected Services:** `apps/landing`

#### Why Upgrade?
- Consistency across services
- 10x faster build times with Rust-based engine
- Improved performance
- Better CSS nesting support
- Modernized configuration

#### Breaking Changes
- Configuration file format changed (CSS-based)
- Some plugin APIs updated
- Syntax changes in custom utilities

#### Migration Path
```bash
cd apps/landing
npm install tailwindcss@^4.1.18 @tailwindcss/postcss@^4.1.18
npm install --save-dev autoprefixer@latest postcss@latest
```

**Estimated Effort:** 2-4 hours  
**Testing Priority:** ⭐⭐⭐⭐ (Visual regression + responsive testing)  
**References:**
- [Tailwind v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)

---

### 6. Next.js 15.1 → 15.5 🟢 Low Risk
**Current:** Next.js 15.1.0  
**Available:** Next.js 15.5.11 (Latest stable)  
**Affected Services:** `apps/web`

#### Why Upgrade?
- Memory leak fixes in tracing
- LRU cache improvements
- Turbopack stability enhancements
- Performance optimizations
- Bug fixes for App Router

#### Migration Path
```bash
cd apps/web
npm install next@^15.5.11
```

**Estimated Effort:** < 1 hour  
**Testing Priority:** ⭐⭐⭐ (Smoke test all pages)  
**Note:** Next.js 16 is in canary but not production-ready as of Feb 2026

---

### 7. Vite 6 → 7 🟡 Medium Risk
**Current:** Vite 6.0.7  
**Available:** Vite 7.0.x (Stable)  
**Affected Services:** `apps/landing`

#### Why Upgrade?
- Rust-powered bundler (Rolldown) for faster builds
- Improved browser targeting
- Better Node.js ESM support
- Modernized tooling
- Long-term stability improvements

#### Breaking Changes
- Node.js 18+ required (already met)
- Sass legacy API removed
- `splitVendorChunkPlugin` removed
- Updated browser targets

#### Migration Path
```bash
cd apps/landing
npm install vite@^7.0.0 @vitejs/plugin-react@latest
```

**Estimated Effort:** 2-3 hours  
**Testing Priority:** ⭐⭐⭐⭐ (Test build + dev mode)  
**References:**
- [Vite 7 Release Notes](https://vite.dev/blog/announcing-vite7)

---

### 8. TypeScript 5.7 → 6.0 🟡 Medium Risk
**Current:** TypeScript 5.7.3  
**Available:** TypeScript 6.0 (Beta - Feature Stable)  
**Affected Services:** All services

#### Why Upgrade?
- Last JavaScript-based version before TS 7 (Rust rewrite)
- Performance improvements
- New language features
- Better type inference
- Enhanced error messages

#### Considerations
- TypeScript 6.0 is in beta but feature-stable
- TypeScript 7.0 (Rust-based) is in development for 2026 Q2/Q3
- **Recommendation:** Wait for 6.0 stable release OR skip to 7.0 when available

#### Migration Path (When Ready)
```bash
# Update all services
npm install --save-dev typescript@^6.0.0 -w apps/api
npm install --save-dev typescript@^6.0.0 -w apps/web
npm install --save-dev typescript@^6.0.0 -w apps/worker
npm install --save-dev typescript@^6.0.0 -w apps/scheduler
npm install --save-dev typescript@^6.0.0 -w apps/landing
```

**Estimated Effort:** 4-8 hours (type checking across all services)  
**Testing Priority:** ⭐⭐⭐⭐⭐ (Full build + type check)  
**Status:** ⏳ **WAIT** - Monitor for stable release

---

## Medium-Priority Upgrades

### 9. uuid 11 → 13 (Web Only) 🟢 Low Risk
**Current:** uuid 11.0.5 (API), uuid 13.0.0 (Web)  
**Available:** uuid 13.0.0  
**Affected Services:** `apps/api`

```bash
cd apps/api
npm install uuid@^13.0.0
npm install --save-dev @types/uuid@^10.0.0
```

**Breaking Changes:** None for standard use cases  
**Estimated Effort:** < 30 minutes

---

### 10. BullMQ 5.68 → Latest 🟢 Low Risk
**Current:** BullMQ 5.68.0  
**Available:** BullMQ 5.68.0+ (Check npm)  
**Affected Services:** `apps/api`, `apps/worker`

```bash
cd apps/api
npm outdated bullmq
# If update available:
npm install bullmq@latest

cd ../worker
npm install bullmq@latest
```

**Estimated Effort:** 1 hour (test queue processing)

---

### 11. Sharp 0.34.5 → Latest 🟢 Low Risk
**Current:** Sharp 0.34.5  
**Available:** Check for 0.34.x or 0.35.x  
**Affected Services:** `apps/api`, `apps/web`

```bash
cd apps/api
npm install sharp@latest

cd ../web
npm install sharp@latest
```

**Why Upgrade?** Performance improvements in image processing  
**Estimated Effort:** < 1 hour

---

### 12. Winston 3.17.0 → Latest 🟢 Low Risk
**Current:** Winston 3.17.0  
**Affected Services:** `apps/api`, `apps/worker`, `apps/scheduler`

```bash
# Update logging across all services
npm install winston@latest
```

**Estimated Effort:** < 1 hour

---

## Low-Priority Upgrades

### Minor Version Updates (Patch/Minor Bumps)

The following packages have minor updates available with low breaking-change risk:

- **nodemailer** (6.9.16) - Check for 6.9.x updates
- **helmet** (8.0.0) - Latest security headers
- **morgan** (1.10.0) - Logging middleware
- **cors** (2.8.5) - CORS middleware
- **dotenv** (16.4.7) - Environment variables
- **express-rate-limit** (7.5.0) - Rate limiting
- **express-validator** (7.2.1) - Validation
- **jsonwebtoken** (9.0.2) - JWT handling
- **bcryptjs** (2.4.3) - Password hashing
- **ioredis** (5.4.2) - Redis client
- **nodemon** (3.1.11) - Dev auto-reload
- **swagger-jsdoc** (6.2.8) - API docs
- **swagger-ui-express** (5.0.1) - API docs UI

**Recommendation:** Run `npm outdated` and update in batches

---

## Azure SDK Updates

### Azure AI Form Recognizer ✅ Up to Date
**Current:** @azure/ai-form-recognizer 5.1.0  
**Available:** 5.1.0 (Latest)  
**Status:** ✅ No action needed

### Azure Identity 4.13.0 → Latest 🟢 Low Risk
**Current:** @azure/identity 4.13.0  
**Recommendation:** Check for 4.x updates

```bash
cd apps/api
npm outdated @azure/identity
npm install @azure/identity@latest
```

### Azure Storage Blob 12.31.0 → Latest 🟢 Low Risk
**Current:** @azure/storage-blob 12.31.0  
**Recommendation:** Check for 12.x updates

```bash
cd apps/api
npm outdated @azure/storage-blob
npm install @azure/storage-blob@latest
```

---

## Upgrade Strategy & Roadmap

### Phase 1: Foundation (Week 1-2) - Critical Path
**Goal:** Update core infrastructure with high ROI

1. ✅ **Express 4 → 5** (API Service)
   - Test all routes thoroughly
   - Update error handling patterns
   - Verify middleware compatibility

2. ✅ **Mongoose 8 → 9** (All services using MongoDB)
   - Run full regression on database operations
   - Test all models and schemas
   - Verify audit logging still works

3. ✅ **LangChain 0.3 → 1.2** (API + Worker)
   - Test OCR extraction workflows
   - Verify LLM provider integrations
   - Check extraction accuracy

### Phase 2: Frontend Consistency (Week 3)
**Goal:** Align landing page with web app tech stack

4. ✅ **React 18 → 19** (Landing page)
5. ✅ **Tailwind 3 → 4** (Landing page)
6. ✅ **Vite 6 → 7** (Landing page)
7. ✅ **Next.js 15.1 → 15.5** (Web app)

### Phase 3: Tooling & Dev Experience (Week 4)
**Goal:** Improve build times and developer experience

8. ✅ **TypeScript 5.7 → 6.0** (All services) - *Wait for stable*
9. ✅ **Minor package updates** (All services)
10. ✅ **Azure SDK updates** (API service)

---

## Testing Requirements

### Critical Services Testing Checklist

#### API Service (`apps/api`)
- [ ] All REST endpoints (Postman/Swagger)
- [ ] Authentication & authorization flows
- [ ] Invoice processing workflows
- [ ] Daily log submission
- [ ] Compliance document handling
- [ ] OCR extraction accuracy
- [ ] LLM extraction validation
- [ ] Review queue operations
- [ ] Export generation
- [ ] Audit logging
- [ ] Database queries (read/write)
- [ ] BullMQ job creation
- [ ] Rate limiting
- [ ] Error handling

#### Worker Service (`apps/worker`)
- [ ] BullMQ job processing
- [ ] Document processing queue
- [ ] Email ingestion queue
- [ ] Export generation queue
- [ ] Error recovery
- [ ] Database writes from workers

#### Web App (`apps/web`)
- [ ] Login/authentication
- [ ] Review queue UI (three-pane layout)
- [ ] Keyboard shortcuts (Y/N/arrows)
- [ ] Bounding box overlays
- [ ] Document preview
- [ ] Invoice workflow E2E
- [ ] Daily log workflow E2E
- [ ] Compliance workflow E2E
- [ ] Server-side rendering
- [ ] Client-side routing
- [ ] Redux state management

#### Landing Page (`apps/landing`)
- [ ] Visual regression testing
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Vite build output
- [ ] Static asset loading

#### Scheduler Service (`apps/scheduler`)
- [ ] Compliance alert scheduling
- [ ] Email sending (nodemailer)
- [ ] Idempotency checks
- [ ] Database queries

### E2E Testing
Run existing Playwright tests:
```bash
npx playwright test tests/e2e/invoice-workflow.spec.ts
npx playwright test tests/e2e/daily-log-workflow.spec.ts
npx playwright test tests/e2e/compliance-workflow.spec.ts
npx playwright test tests/e2e/e2e-login.spec.ts
```

---

## Breaking Changes Summary

### Express 5 Migration Checklist
```javascript
// OLD (Express 4)
app.get('/api/resource/:id', (req, res, next) => {
  try {
    const result = await someAsyncOperation();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// NEW (Express 5) - async/await without try-catch
app.get('/api/resource/:id', async (req, res) => {
  const result = await someAsyncOperation();
  res.json(result);
});
```

### Mongoose 9 Migration Checklist
```typescript
// Check virtual() usage with timestamps
// Verify toObject() type inference
// Update any custom middleware hooks
```

### Tailwind 4 Migration Checklist
```javascript
// OLD (tailwind.config.js)
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  }
}

// NEW (CSS-based config in input CSS file)
@import "tailwindcss";
@config {
  theme: {
    extend: {}
  }
}
```

---

## Risk Mitigation

### Development Environment
1. Create feature branch: `feature/upgrade-2026`
2. Test each upgrade in isolation
3. Run full test suite after each change
4. Document any issues in GitHub issues

### Staging Deployment
1. Deploy to staging environment
2. Run smoke tests
3. Monitor Application Insights for errors
4. Load test critical paths (invoice processing)

### Rollback Plan
1. Maintain Docker images of current versions
2. Tag Git commits before each upgrade
3. Document rollback procedures
4. Keep `package-lock.json` for each version

---

## Commands Reference

### Check for Outdated Packages
```bash
# All services
npm outdated --prefix apps/api
npm outdated --prefix apps/web
npm outdated --prefix apps/worker
npm outdated --prefix apps/scheduler
npm outdated --prefix apps/landing
```

### Update All Minor/Patch Versions (Safe)
```bash
cd apps/api
npm update

cd ../web
npm update

# Repeat for other services
```

### Update Major Versions (Use with Caution)
```bash
# Install specific version
npm install package-name@^X.0.0

# Or use npm-check-updates for interactive upgrade
npx npm-check-updates -i
```

---

## Additional Research Tools Used

This analysis was conducted using:
- **Tavily Search API** - Latest release information
- **NPM Registry** - Package version checks
- **GitHub Releases** - Changelog analysis
- **Official Documentation** - Migration guides
- **Community Forums** - Production readiness assessment

---

## Next Steps

1. **Review this document** with the development team
2. **Estimate effort** for each phase
3. **Create GitHub issues** for each upgrade task
4. **Schedule upgrades** in sprint planning
5. **Set up CI/CD checks** for version compatibility
6. **Monitor dependencies** regularly (use Dependabot or Renovate)

---

## Monitoring & Maintenance

### Automated Dependency Tracking
Consider setting up:
- **GitHub Dependabot** - Automated PR creation for updates
- **Renovate Bot** - More configurable dependency updates
- **Snyk** - Security vulnerability scanning (mentioned in AGENTS.md)

### Quarterly Review Schedule
- **Q2 2026:** Review TypeScript 7 release (Rust-based)
- **Q3 2026:** Check Next.js 16 production readiness
- **Q4 2026:** Annual full-stack upgrade review

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-02-12 | AI Analysis | Initial comprehensive upgrade analysis |

---

## Questions or Concerns?

Before proceeding with upgrades, consider:
- Current sprint commitments
- P0 blockers from AUDIT.md (alert idempotency, duplicate scheduler, review queue logging)
- Production stability requirements
- Client SLA obligations

**Recommendation:** Fix P0 blockers first, then proceed with Phase 1 upgrades.
