# Worklighter — Construction Operations Automation Engine

Worklighter automates document processing workflows for the construction industry. It ingests invoices, daily logs, and compliance documents (COIs), extracts structured data via OCR + LLM, routes items through a rules-based review queue, and produces exportable audit reports.

> **Status:** ✅ MVP complete — All P0 blockers resolved and ready for Alpha deployment.

---

## Architecture

```
┌─────────────┐
│  Web (Next)  │
└──────┬───────┘
       │                 │
       └────── API ──────┘   (Express + TypeScript)
               │
       ┌───────┼───────────┐
       │       │           │
    MongoDB   Redis     Azure
    (Cosmos)  (BullMQ)  (Blob, OCR, OpenAI)
               │
       ┌───────┴───────┐
       │               │
    Worker         Scheduler
  (BullMQ jobs)   (node-cron)
```

Five independent services communicate exclusively over REST and shared infrastructure:

| Service | Stack | Purpose |
|---|---|---|
| **`apps/api`** | Express 4 · TypeScript | REST API, workflow orchestration, rules engine |
| **`apps/web`** | Next.js 15 · App Router · Tailwind · Redux | Review Queue UI, Admin Dashboard (33 routes) |
| **`apps/worker`** | BullMQ · TypeScript | Background OCR, document extraction, email processing |
| **`apps/scheduler`** | node-cron · TypeScript | Compliance alerts, weekly summaries, queue health |

### Infrastructure

- **MongoDB 7.x** (Azure Cosmos DB w/ MongoDB API in prod) — 20+ collections
- **Redis 7.x** — BullMQ job queues (document-processing, email-ingestion, export-generation)
- **Azure Blob Storage** — uploaded PDFs/images
- **Azure Form Recognizer** — invoice OCR (95%+ accuracy)
- **Azure OpenAI (GPT-4)** — LLM-based data extraction
- **Azure Application Insights** — monitoring

---

## Core Workflows

1. **Invoices → Threshold Approvals** — upload/OCR → vendor matching → duplicate detection → threshold routing → review queue → approve/reject → CSV export
2. **Daily Logs → WC Audit** — upload/OCR → worker fuzzy matching → WC code suggestions → review queue → export WC audit report
3. **Compliance / COI → Expiration Tracking** — upload/OCR → contractor matching → expiration detection → status tracking (ACTIVE/EXPIRING/EXPIRED) → scheduled alerts

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- Docker & Docker Compose (for infrastructure)

### 1. Install Dependencies

```bash
# From repo root — installs deps for every service
npm run install:all
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB, Redis, JWT, Azure, and OpenAI credentials
```

### 3. Start Infrastructure

```bash
# MongoDB + Redis via Docker
npm run infra:up
```

### 4. Run Services

```bash
# All services concurrently
npm run dev

# Or individually
npm run dev:core-api        # http://localhost:3000
npm run dev:frontend        # http://localhost:3001
```

### Docker (full stack)

```bash
docker-compose up -d        # all services + MongoDB + Redis
docker-compose logs -f      # tail logs
docker-compose down         # stop everything
```

---

## Project Structure

```
worklighter/
├── apps/
│   ├── api/              # Express backend (REST API, services, routes)
│   ├── web/              # Next.js 15 frontend (App Router)
│   ├── worker/           # BullMQ background job processor
│   └── scheduler/        # node-cron scheduled tasks
├── docker/               # Dockerfiles + nginx config
├── tests/
│   └── e2e/              # Playwright end-to-end tests
├── .github/workflows/    # CI/CD pipeline (lint, build, test, Docker, security)
├── docker-compose.yml            # Full-stack orchestration
├── docker-compose.services.yml   # Infrastructure only (MongoDB + Redis)
└── .env.example                  # Environment variable template
```

---

## Testing

```bash
# E2E tests (Playwright — requires API + Web running)
npx playwright test

# See TESTING.md for full workflow test procedures
```

CI runs on every push to `main`/`develop`: lint → build → unit tests → E2E (with MongoDB + Redis service containers) → Docker image builds → security scanning.

---

## Deployment

Targets **Microsoft Azure** — Azure Container Apps (serverless) or AKS.

Estimated cost: **$165–290/mo** (startup) · **$500–1,500/mo** (production).

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full Azure provisioning and deployment guide.

---

## Documentation

| Document | Description |
|---|---|
| [SETUP.md](./SETUP.md) | Local development setup, commands reference, troubleshooting |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Azure deployment guide (Container Apps, Cosmos DB, Redis, etc.) |
| [TESTING.md](./TESTING.md) | End-to-end testing procedures for all three workflows |
| [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) | 10 ADRs covering cloud, database, OCR, queue, and frontend choices |
| [AGENTS.md](./AGENTS.md) | Agent instructions and project overview for AI assistants |

---

## License

Proprietary — all rights reserved.
