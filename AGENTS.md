# AGENTS.md — Worklighter

## Project Overview

Worklighter is a **Construction Operations Automation Engine** that processes invoices, daily logs, and compliance documents (COIs) through OCR, LLM extraction, rules-based review queues, and exportable audit reports. It targets Microsoft Azure for production deployment.

## Repository Layout

This is a **flat monorepo with independent services** — no workspace manager (no Turborepo/Nx/Lerna). Each service under `apps/` has its own `package.json`, build pipeline, and Dockerfile. Services communicate exclusively via REST APIs and shared MongoDB/Redis infrastructure.

```
apps/api/         — Express 4 + TypeScript backend (REST API, services, routes)
apps/web/         — Next.js 15 + App Router frontend (Tailwind, Redux)
apps/landing/     — Vite + React 18 static landing page
apps/worker/      — BullMQ background job processor (OCR, extraction)
apps/scheduler/   — node-cron scheduled tasks (compliance alerts, summaries)
docker/           — Dockerfiles (core-api, frontend, landing-page) + nginx.conf
tests/e2e/        — Playwright E2E specs (invoice, daily-log, compliance, login)
.github/workflows/ci.yml — CI/CD pipeline
```

## Tech Stack

- **Language:** TypeScript (strict mode, no `any` in new code)
- **Backend:** Express 4, Mongoose ODM, BullMQ, node-cron
- **Frontend:** Next.js 15 (App Router, Server Components), React 19, Tailwind CSS, Redux Toolkit, React Query
- **Landing:** Vite + React 18 + Tailwind CSS
- **Database:** MongoDB 7.x (Azure Cosmos DB w/ MongoDB API in production)
- **Cache / Queues:** Redis 7.x (BullMQ queues: document-processing, email-ingestion, export-generation)
- **Azure Services:** Blob Storage, Form Recognizer (invoice OCR), Document Intelligence (general OCR), OpenAI GPT-4 (LLM extraction), Application Insights
- **Testing:** Playwright (E2E), tests live in `tests/e2e/`
- **CI/CD:** GitHub Actions — lint, build, unit tests, E2E (with MongoDB + Redis service containers), Docker image builds, security scanning (npm audit, optional Snyk)

## Conventions

### Code Style
- TypeScript strict mode everywhere.
- ESLint + Prettier for consistency.
- No cross-service imports — each service is fully independent.
- Express routes live in `apps/api/routes/`, business logic in `apps/api/services/`.
- Frontend pages follow Next.js App Router file conventions under `apps/web/app/`.
- Tailwind CSS for all styling (no CSS modules or styled-components).

### Environment
- All secrets and configuration via environment variables (see `.env.example`).
- Never commit `.env` files.
- OCR and LLM providers are selectable via `OCR_PROVIDER` and `LLM_PROVIDER` env vars (supports mock providers for local dev).

### Database
- Mongoose schemas/models live alongside the API service.
- MongoDB collections are document-centric (nested arrays for workers, line items, exceptions).
- No SQL — all queries use Mongoose / MongoDB aggregation framework.

### Docker
- `docker-compose.yml` — full stack (all 5 services + MongoDB + Redis).
- `docker-compose.services.yml` — infrastructure only (MongoDB + Redis) for local dev.
- Dockerfiles are in `docker/` (core-api, frontend, landing-page) and `apps/worker/Dockerfile`, `apps/scheduler/Dockerfile`.

## Key Domain Concepts

- **Review Queue** — central UI for human review of OCR-extracted documents. Three-pane layout (list, preview with bounding box overlays, detail panel). Keyboard shortcuts: Y (approve), N (reject), arrow keys (navigate).
- **Rules Engine** — deterministic threshold checks. LLM extracts data; rules engine decides routing. No LLM-based approval decisions.
- **Bounding Boxes** — OCR extraction results include coordinates. Displayed as overlays on document preview, color-coded by confidence (amber <70%, blue ≥70%).
- **Compliance Alerts** — scheduler checks document expiration dates at windows of 30/15/7/0 days and sends notifications. Must be idempotent (see known issues).
- **Audit Logging** — `auditLoggingService` records document lifecycle events. Currently partial coverage (see AUDIT.md).

## Known Issues (P0 Blockers)

Refer to [AUDIT.md](./AUDIT.md) for full details. The three critical blockers before Alpha:

1. **Alert idempotency broken** — `apps/scheduler/index.ts` + `apps/api/services/complianceAlertService.ts` use inconsistent MongoDB queries; scheduler restart can resend alerts.
2. **Duplicate scheduler implementations** — both `apps/scheduler/index.ts` (cron) and `apps/api/services/complianceScheduler.ts` (BullMQ) send compliance alerts. Only one should be active.
3. **Review queue audit logging missing** — `auditLoggingService` exists but is not imported in `apps/api/routes/reviewQueue.ts`; approve/reject/corrections actions are not logged.

## Development Commands

```bash
npm run install:all       # Install deps for all services
npm run dev               # Start all services concurrently
npm run dev:core-api      # API only — http://localhost:3000
npm run dev:frontend      # Web only — http://localhost:3001
npm run dev:landing-page  # Landing only — http://localhost:5173
npm run infra:up          # Start MongoDB + Redis (Docker)
npm run infra:down        # Stop infrastructure
npm run build             # Build all services
npx playwright test       # Run E2E tests (requires API + Web running)
```

## Working with This Repo

- **Before editing a service**, read its `package.json` to understand available scripts and dependencies.
- **No shared code libraries** exist between services. If logic needs to be reused, it is duplicated (by design — see ADR-006).
- **Provider abstraction** — OCR and LLM providers are behind interfaces. When adding a new provider, follow the existing pattern in `apps/api/services/ocrService.ts`.
- **When fixing P0 issues**, consult the specific file references in AUDIT.md for exact line numbers.
- **Environment variables** — always check `.env.example` for the canonical list. Add new vars there when introducing new configuration.
