# AGENTS.md — docflow-360

## Project Overview

docflow-360 is a **Construction Operations Automation Engine** that processes invoices, daily logs, and compliance documents (COIs) through OCR, LLM extraction, rules-based review queues, and exportable audit reports. It targets Microsoft Azure for production deployment.

**Built following the 2026 End-to-End AI Solution Playbook**: Azure-first, multi-app, agent-ready architecture with Nx orchestration, shared libraries for contracts/observability/tooling, and a dedicated AI runtime service.

## Repository Layout

This is an **Nx-orchestrated monorepo** with independent deployable services under `apps/` and shared libraries under `libs/`. Each app has its own `package.json`, build pipeline, and Dockerfile. Services communicate via REST APIs and shared infrastructure (MongoDB/Redis). Nx enables affected-only builds and task caching.

```
apps/
├── api/              — Express (migrating to NestJS) + TypeScript backend (REST API)
├── web/              — Next.js 16 + React 19 frontend (Tailwind, Redux, React Query)
├── ai-runtime/       — Centralized AI service (model routing, tools, grounding, evals)
├── worker/           — BullMQ background job processor (OCR, extraction)
└── scheduler/        — node-cron scheduled tasks (compliance alerts, summaries)
libs/
├── contracts/        — Shared TypeScript interfaces, OpenAPI schemas, Zod validators
├── observability/    — Logging, tracing (W3C Trace Context), telemetry helpers
└── tooling-config/   — Shared ESLint, Prettier, tsconfig configurations
docker/
├── Dockerfile.api
├── Dockerfile.web
├── Dockerfile.ai-runtime
├── Dockerfile.worker
├── Dockerfile.scheduler
└── nginx.conf
tests/e2e/            — Playwright E2E specs (invoice, daily-log, compliance, login)
.github/workflows/    — CI/CD with path triggers + Nx affected execution
nx.json               — Nx configuration for task orchestration
pnpm-workspace.yaml   — pnpm workspace configuration
```

## Tech Stack (2026 Playbook Aligned)

- **Language:** TypeScript (strict mode, no `any` in new code)
- **Backend (Default):** NestJS for domain services, Fastify for hot paths (Express 4 currently, migrating)
- **Frontend (Default):** Next.js 16 + React 19 (App Router, Server Components, Tailwind CSS, Redux Toolkit, React Query)
- **AI Runtime:** Centralized service with model tier routing, tool registry, grounding, memory, evals
- **Database:** MongoDB 7.x via Azure Cosmos DB for MongoDB API (ADR-002; playbook default is PostgreSQL - see review)
- **Cache:** Redis 7.x / Azure Managed Redis (BullMQ queues: document-processing, email-ingestion, export-generation)
- **Azure Services:** Container Apps (compute), Blob Storage, Form Recognizer (OCR), Document Intelligence, Azure OpenAI (model tiers), Application Insights
- **Observability:** OpenTelemetry + W3C Trace Context, AI/tool call telemetry
- **Testing:** Playwright (E2E), tests live in `tests/e2e/`
- **Orchestration:** Nx for task execution, caching, affected-only builds
- **Package Manager:** pnpm (default per 2026 playbook)
- **CI/CD:** GitHub Actions with path triggers + Nx affected execution, Docker image builds, security scanning

## Conventions

### 2026 Playbook Operating Principles
- **Defaults win**: Every major tech choice has a default. Deviations require a 1-page ADR explaining the constraint, the solution, and new operational risks.
- **Azure-first, Azure-compatible only**: Prefer Azure PaaS; accept Azure-compatible tech only if it doesn't create ops debt.
- **ONE AI Runtime**: All AI calls (chat, RAG, tools, agents) route through `apps/ai-runtime/`. No direct OpenAI calls from other services.
- **Model tiers, not model names**: Route by policy (Tier A: premium reasoning, Tier B: fast/cheap, Tier C: code-specialist, Tier D: embedding).

### Code Style
- TypeScript strict mode everywhere.
- ESLint + Prettier for consistency (shared config in `libs/tooling-config/`).
- No cross-service imports of business logic — only shared contracts, observability, and tooling.
- Express routes live in `apps/api/routes/`, business logic in `apps/api/services/`.
- Frontend pages follow Next.js App Router file conventions under `apps/web/app/`.
- Tailwind CSS for all styling (no CSS modules or styled-components).

### Shared Code Policy (2026 Update)
**Allowed shared libraries** (in `libs/`):
- **contracts**: OpenAPI/Zod schemas, TypeScript interfaces
- **observability**: logging/tracing helpers, telemetry utilities
- **tooling-config**: ESLint, Prettier, tsconfig presets

**Not allowed**:
- Shared domain/business logic (must be behind API boundary or published as versioned internal package with ADR)

### Environment
- All secrets and configuration via environment variables (see `.env.example`).
- Never commit `.env` files.
- OCR and LLM providers are selectable via `OCR_PROVIDER` and `LLM_PROVIDER` env vars (supports mock providers for local dev).

### Database
- Mongoose schemas/models live alongside the API service.
- MongoDB collections are document-centric (nested arrays for workers, line items, exceptions).
- **NOTE**: Current MongoDB choice documented in ADR-002. Playbook default is Azure Database for PostgreSQL. Migration path under review.

### Docker
- `docker-compose.infra.yml` — infrastructure only (MongoDB + Redis) for local dev.
- `docker-compose.yml` — full stack (all services + infrastructure).
- Dockerfiles follow pattern: `docker/Dockerfile.<app>` (e.g., `docker/Dockerfile.api`, `docker/Dockerfile.ai-runtime`).
- Apps use `env_file: apps/<app>/.env` in compose files.

## Key Domain Concepts

- **Review Queue** — central UI for human review of OCR-extracted documents. Three-pane layout (list, preview with bounding box overlays, detail panel). Keyboard shortcuts: Y (approve), N (reject), arrow keys (navigate).
- **Rules Engine** — deterministic threshold checks. LLM extracts data; rules engine decides routing. No LLM-based approval decisions (see ADR-007).
- **Bounding Boxes** — OCR extraction results include coordinates. Displayed as overlays on document preview, color-coded by confidence (amber <70%, blue ≥70%).
- **Compliance Alerts** — scheduler checks document expiration dates at windows of 30/15/7/0 days and sends notifications. Idempotent with 24h guard (P0 fixed).
- **Audit Logging** — `auditLoggingService` records document lifecycle events. Comprehensive coverage implemented (P0 fixed).
- **AI Runtime** — centralized service for all AI operations. Model tier routing, tool registry with JSON schemas, grounding & evidence packs, session/long-term memory with audit trail, evals framework.

## P0 Blockers Status

All three critical P0 blockers have been **resolved**:

1. ✅ **Alert idempotency** — Fixed with unified query logic and 24h guard in `apps/scheduler/index.ts` and `apps/api/services/complianceAlertService.ts`.
2. ✅ **Duplicate scheduler** — BullMQ scheduler disabled, cron-based scheduler active (single source of truth).
3. ✅ **Review queue audit logging** — Added to all endpoints (`approve`, `reject`, `corrections`) in `apps/api/routes/reviewQueue.ts`.

See commit history and `ARCHITECTURE_DECISIONS.md` for implementation details.

## Development Commands

**Package manager**: pnpm (default per 2026 playbook)

```bash
pnpm install              # Install root and workspace dependencies
pnpm dev                  # Start all services concurrently
pnpm dev:api              # API only — http://localhost:3000
pnpm dev:web              # Web only — http://localhost:3001
pnpm dev:ai-runtime       # AI runtime only — http://localhost:3002
pnpm infra:up             # Start MongoDB + Redis (Docker)
pnpm infra:down           # Stop infrastructure
pnpm build                # Build all apps using Nx
pnpm build:affected       # Build only affected apps (Nx)
pnpm test                 # Run all tests
pnpm test:affected        # Test only affected apps (Nx)
pnpm lint                 # Lint all apps
pnpm lint:affected        # Lint only affected apps (Nx)
npx playwright test       # Run E2E tests (requires API + Web running)
```

**Nx commands** (task orchestration):
```bash
npx nx build api          # Build single app
npx nx run-many --target=build --all  # Build all apps
npx nx affected --target=build        # Build only affected by changes
npx nx graph              # View dependency graph
```

## Working with This Repo

- **Before editing a service**, read its `package.json` and `project.json` (Nx config) to understand available scripts and dependencies.
- **Shared code policy**: Only share contracts, observability, and tooling config in `libs/`. No shared business logic. Duplication is preferred over tight coupling.
- **AI calls**: ALL AI/LLM calls must route through `apps/ai-runtime/` service. Direct OpenAI SDK usage in other services is prohibited.
- **Provider abstraction** — OCR and LLM providers are behind interfaces. When adding a new provider, follow the existing pattern in `apps/api/services/ocrService.ts`.
- **Nx affected builds**: CI/CD uses `nx affected` to build/test only changed apps and their dependencies. Path-based triggers in GitHub Actions provide fast-gate filtering.
- **Environment variables** — always check `.env.example` for the canonical list. Add new vars there when introducing new configuration.
- **Model tiers, not names**: Configure model tiers (A/B/C/D) in AI runtime, not hardcoded model names (e.g., "gpt-4"). See `apps/ai-runtime/config/model-tiers.ts`.
- **ADRs for deviations**: Any deviation from playbook defaults (e.g., MongoDB over PostgreSQL) requires a 1-page ADR in `ARCHITECTURE_DECISIONS.md`.

## Cursor Cloud specific instructions

### Infrastructure
- **Docker is required** for local infrastructure (MongoDB 7.0 + Redis 7). Start with `pnpm infra:up` (uses `docker-compose.infra.yml`). Ensure Docker daemon is running first.
- In Cursor Cloud VMs (Docker-in-Docker), Docker needs `fuse-overlayfs` storage driver and `iptables-legacy`. The Docker daemon must be started manually (`sudo dockerd &`) before running `pnpm infra:up`.
- After starting Docker, grant socket access: `sudo chmod 666 /var/run/docker.sock`.

### Environment files
- Copy `.env.example` to `.env` at the repo root. The API loads env from the repo root via `apps/api/config/index.ts` (relative path `../../../../.env`).
- Each app also has its own `.env.example`; copy those to `.env` for per-app config. Set `OCR_PROVIDER=mock` and `LLM_PROVIDER=mock` to avoid needing Azure credentials.

### Running services
- Standard dev commands are in the root `package.json` — see the "Development Commands" section above.
- **API** (`pnpm dev:api`): Express 5 server on port 3000. Requires MongoDB + Redis running. Connects automatically on startup.
- **Web** (`pnpm dev:web`): Next.js 16 dev server on port 3001. Warnings about `turbopack` experimental key and deprecated `middleware` convention are expected and harmless.
- **Critical**: The web frontend's `NEXT_PUBLIC_API_URL` env var must point to the API port (3000), not the web port (3001). If the Cursor Cloud VM pre-injects a different value for this env var, it will override the `.env` file value because dotenv does not override existing env vars. Fix by explicitly exporting the correct value (matching `apps/web/.env.example`) before starting the web dev server, or prefix the dev command with the env var assignment, for example:
  - **Inline for a single run**: `NEXT_PUBLIC_API_URL=http://localhost:3000 pnpm dev:web`
  - **Export then run**:
    ```bash
    export NEXT_PUBLIC_API_URL=http://localhost:3000
    pnpm dev:web
    ```
- **Seed data**: Run `cd apps/api && npx tsx scripts/seed.ts` to create a Demo Tenant and admin user (`demo@docflow-360.com` / `password123`).

### Known pre-existing issues
- **ESLint**: `pnpm lint` fails because ESLint 10 requires flat config (`eslint.config.js`) but the repo only has legacy `.eslintrc.js` in `libs/tooling-config/`. The `api` lint target references `src/` but source files are in the root of `apps/api/`.
- **Web build** (`next build`): Fails with `_global-error` prerender `useContext` error. Dev mode (`next dev`) works fine.
- **Web UI login/register forms**: If `NEXT_PUBLIC_API_URL` is set to the wrong port (e.g. 3001 instead of 3000), the frontend sends auth calls to itself, causing 404s. See the "Critical" note above for the fix.
