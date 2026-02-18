# DocFlow 360 Engine

Automated financial reconciliation that keeps humans in control.

## For Operations Leaders

- `Logic, not just OCR`: reconcile invoice vs PO vs receipt with deterministic checks.
- `Confidence routing`: low-confidence and high-risk outcomes route to human review queues.
- `Controlled posting`: high-value actions require explicit approvals before export.
- [View Product Spec](./docs/product-spec.md) | [View Demo Script](./docs/demo-script.md)

DocFlow 360 automates document processing workflows with extraction, reconciliation, reason-coded exceptions, and auditable approvals.

**Built with the 2026 End-to-End AI Solution Playbook**: Azure-first, Nx-orchestrated monorepo, centralized AI runtime, shared libraries, and observability-first architecture.

> **Status:** ✅ P0 complete — Nx integration, shared libraries, CI/CD with affected-only builds, database strategy documented (ADR-011)

---

## Architecture

```
┌─────────────┐
│ Web (Next16)│
└──────┬───────┘
       │
       └────── API ──────┐   (Express → NestJS migration planned)
               │          │
       ┌───────┼──────────┴─────┐
       │       │                │
    MongoDB  Redis      Azure AI Runtime
   (Cosmos)  (BullMQ)   (Model Tiers, Tools,
       │       │          Grounding, Evals)
       │       │                │
   ┌───┼───────┴────────┐      │
   │   │                │      │
Worker  Scheduler    Azure Services
                     (Blob, OCR, OpenAI)
```

**Six independent services** in Nx-orchestrated monorepo with shared libraries:

| Service | Stack | Purpose |
|---|---|---|
| **`apps/api`** | Express 5 · TypeScript (NestJS migration planned) | REST API, workflow orchestration, rules engine |
| **`apps/web`** | Next.js 16 · React 19 · App Router · Tailwind | Review Queue UI, Admin Dashboard |
| **`apps/ai-runtime`** | NestJS/Fastify · TypeScript (planned) | Model tier routing, tool registry, grounding, evals |
| **`apps/worker`** | BullMQ · TypeScript | Background OCR, document extraction, email processing |
| **`apps/scheduler`** | node-cron · TypeScript | Compliance alerts, weekly summaries, queue health |

**Shared Libraries** (per 2026 playbook):
- **`libs/contracts`** — TypeScript interfaces, Zod schemas, OpenAPI specs
- **`libs/observability`** — Logging, W3C Trace Context, AI/tool telemetry
- **`libs/tooling-config`** — Shared ESLint, Prettier, tsconfig

### Infrastructure

- **MongoDB 7.x** (Azure Cosmos DB w/ MongoDB API) — 20+ collections. See ADR-011 for rationale vs PostgreSQL.
- **Redis 7.x** (Azure Managed Redis) — BullMQ job queues (document-processing, email-ingestion, export-generation)
- **Azure Blob Storage** — uploaded PDFs/images
- **Azure Form Recognizer** — invoice OCR (95%+ accuracy)
- **Azure OpenAI** — Model tier routing (Tier A: premium, Tier B: fast) via ai-runtime
- **Azure Application Insights** — OpenTelemetry + W3C Trace Context
- **Nx** — Task orchestration, affected-only builds, caching

---

## Core Workflows

1. **Invoices → Threshold Approvals** — upload/OCR → vendor matching → duplicate detection → threshold routing → review queue → approve/reject → CSV export
2. **Daily Logs → WC Audit** — upload/OCR → worker fuzzy matching → WC code suggestions → review queue → export WC audit report
3. **Compliance / COI → Expiration Tracking** — upload/OCR → contractor matching → expiration detection → status tracking (ACTIVE/EXPIRING/EXPIRED) → scheduled alerts

---

## Getting Started (Fresh Clone → Run in 5 Minutes)

### Prerequisites

- **Node.js ≥ 20** (LTS recommended)
- **pnpm ≥ 9** (install: `npm install -g pnpm@9`)
- **Docker & Docker Compose** (for local MongoDB + Redis)

### 1️⃣ Clone and Install

```bash
git clone https://github.com/sh-pendoah/docflow-360.git
cd docflow-360

# Install all dependencies (root + apps + libs)
pnpm install
```

### 2️⃣ Configure Environment

```bash
cp .env.example .env
# Edit .env with your:
# - MongoDB connection (or use Docker default)
# - Redis connection (or use Docker default)
# - JWT secret
# - Azure credentials (Blob Storage, Form Recognizer, OpenAI)
```

### 3️⃣ Start Infrastructure

```bash
# Start MongoDB + Redis via Docker
pnpm infra:up

# Verify services are healthy
docker ps  # Should show docflow-360-mongodb and docflow-360-redis
```

### 4️⃣ Build All Apps

```bash
# Build all apps using Nx (respects dependency order)
pnpm build

# Or build only what's affected by your changes
pnpm build:affected
```

### 5️⃣ Run Services

**Option A: All services together**
```bash
pnpm dev
```

**Option B: Individual services**
```bash
# In separate terminals:
pnpm dev:api         # → http://localhost:3000
pnpm dev:web         # → http://localhost:3001
pnpm dev:worker      # Background processing
pnpm dev:scheduler   # Scheduled tasks
```

### 6️⃣ Verify

- API: `curl http://localhost:3000/health`
- Web: Open http://localhost:3001 in browser
- MongoDB: `docker exec -it docflow-360-mongodb mongosh -u admin -p password`
- Redis: `docker exec -it docflow-360-redis redis-cli ping`

---

## Docker (Full Stack)

```bash
# Full stack (all services + MongoDB + Redis)
docker-compose up -d

# Tail logs
docker-compose logs -f

# Stop everything
docker-compose down

# Infrastructure only (for local dev with pnpm dev)
docker-compose -f docker-compose.infra.yml up -d
```

---

## Project Structure (2026 Playbook)

```
docflow-360/
├── apps/                          # Deployable services
│   ├── api/                       # Express → NestJS REST API
│   ├── web/                       # Next.js 16 + React 19 frontend
│   ├── ai-runtime/                # Centralized AI service (planned)
│   ├── worker/                    # BullMQ background processor
│   └── scheduler/                 # node-cron scheduled tasks
├── libs/                          # Shared libraries (2026 playbook)
│   ├── contracts/                 # TypeScript types, Zod schemas
│   ├── observability/             # Logging, tracing, telemetry
│   └── tooling-config/            # ESLint, Prettier, tsconfig
├── docker/                        # Dockerfiles (Dockerfile.<app>)
├── tests/e2e/                     # Playwright E2E tests
├── .github/
│   ├── workflows/ci.yml           # CI/CD with Nx affected + path triggers
│   └── copilot-instructions.md    # AI coding assistant guidelines
├── .vscode/tasks.json             # Standardized build/test tasks
├── nx.json                        # Nx workspace configuration
├── pnpm-workspace.yaml            # pnpm workspace definition
├── docker-compose.yml             # Full-stack orchestration
├── docker-compose.infra.yml       # Infrastructure only (MongoDB + Redis)
└── .env.example                   # Environment variable template
```

---

## Nx Commands (Task Orchestration)

## Testing

```bash
# E2E tests (Playwright — requires API + Web running)
pnpm test:e2e

# Or directly
npx playwright test

# See TESTING.md for full workflow test procedures
```

**CI/CD**: Runs on every push with path-based triggers + Nx affected execution:
- Lint affected projects
- Build affected projects
- Test affected projects  
- E2E tests (with MongoDB + Redis service containers)
- Docker image builds (main/develop only)
- Security scanning (pnpm audit + optional Snyk)

---

## Deployment

Targets **Microsoft Azure** — Azure Container Apps (serverless) or AKS.

Estimated cost: **$165–290/mo** (startup) · **$500–1,500/mo** (production).

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full Azure provisioning and deployment guide.

---

## Documentation

| Document | Description |
|---|---|
| [AGENTS.md](./AGENTS.md) | **Repo constitution**: 2026 playbook alignment, tech stack, conventions, AI runtime strategy |
| [SETUP.md](./SETUP.md) | Local development setup, commands reference, troubleshooting |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Azure deployment guide (Container Apps, Cosmos DB, Redis, etc.) |
| [TESTING.md](./TESTING.md) | End-to-end testing procedures for all three workflows |
| [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) | 11 ADRs covering cloud, database, OCR, AI runtime, and frontend choices |
| [.github/copilot-instructions.md](./.github/copilot-instructions.md) | GitHub Copilot coding guidelines and playbook principles |
| [docs/product-spec.md](./docs/product-spec.md) | Trust-first product blueprint (DocFlow 360) |
| [docs/demo-script.md](./docs/demo-script.md) | 2-minute demo choreography for risk and cost buyers |
| [docs/trust-primitives.md](./docs/trust-primitives.md) | Release checklist for evidence, policy, sovereign mode, budget, HITL, observability, evals |

---

## Key Playbook Compliance (2026)

✅ **Defaults win**: Every deviation from defaults documented in ADRs (e.g., ADR-011 for MongoDB)
✅ **Azure-first**: All services target Azure PaaS (Container Apps, Cosmos DB, Managed Redis, OpenAI)
✅ **ONE AI Runtime**: Centralized ai-runtime service for all AI calls (implementation in progress)
✅ **Nx orchestration**: Affected-only builds, task caching, dependency graph
✅ **Shared libraries**: Contracts, observability, tooling config (no shared business logic)
✅ **W3C Trace Context**: OpenTelemetry + distributed tracing (libs/observability)
✅ **pnpm workspace**: Modern package management with workspace support
✅ **Path-based CI/CD**: GitHub Actions triggers only affected paths, Nx runs affected tasks

---

## License

Proprietary — all rights reserved.


