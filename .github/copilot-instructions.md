# GitHub Copilot Instructions for Worklighter

## Project Context

Worklighter is a Construction Operations Automation Engine built following the **2026 End-to-End AI Solution Playbook** (Azure-first, multi-app, agent-ready). This is an Nx-orchestrated monorepo with independent services under `apps/` and shared libraries under `libs/`.

## Core Principles (Always Follow)

### 1. Defaults Win
- Every major tech choice has a default from the 2026 playbook
- Deviations require a 1-page ADR in `ARCHITECTURE_DECISIONS.md`
- When suggesting alternatives, always explain why the default doesn't work

### 2. Azure-First
- Prefer Azure PaaS services (Container Apps, Cosmos DB, Azure OpenAI, etc.)
- Only suggest Azure-compatible alternatives if they don't create ops debt
- Use Azure SDK patterns and best practices

### 3. ONE AI Runtime
- ALL AI/LLM calls MUST route through `apps/ai-runtime/` service
- Never suggest direct OpenAI SDK usage in other services
- Use model tiers (A/B/C/D), not hardcoded model names

### 4. Shared Code Policy
**Allowed** in `libs/`:
- Contracts (OpenAPI, Zod, TypeScript interfaces)
- Observability (logging, tracing, telemetry)
- Tooling config (ESLint, Prettier, tsconfig)

**Not allowed**:
- Shared business logic between apps
- Cross-app imports of services or models

## Tech Stack Defaults

### Frontend
- **Default**: Next.js 16 + React 19 (App Router, Server Components)
- Tailwind CSS for styling (no CSS modules)
- Redux Toolkit for state (minimal), React Query for data fetching
- TypeScript strict mode

### Backend
- **Default**: NestJS for domain services, Fastify for hot paths
- Currently Express 4 (migration in progress)
- TypeScript strict mode, no `any` types

### Database
- **Current**: MongoDB 7.x via Azure Cosmos DB for MongoDB API
- **Playbook Default**: Azure Database for PostgreSQL
- **Note**: ADR-002 justifies MongoDB choice; review ongoing

### Caching/Queues
- Redis 7.x / Azure Managed Redis
- BullMQ for job queues

### Compute
- Azure Container Apps (default)
- Azure Functions for event-driven glue

### Observability
- OpenTelemetry + W3C Trace Context
- Azure Application Insights
- AI call telemetry (model tier, latency, tokens, cost)
- Tool call telemetry (name, duration, status)

## Code Generation Guidelines

### When Generating TypeScript Code

1. **Always use strict mode**
   ```typescript
   // Good
   function processInvoice(data: InvoiceData): ProcessedInvoice {
     // ...
   }
   
   // Bad - no any types
   function processInvoice(data: any): any {
     // ...
   }
   ```

2. **Follow existing patterns**
   - Check `apps/api/services/` for service patterns
   - Check `apps/api/routes/` for route patterns
   - Check `apps/web/app/` for Next.js App Router conventions

3. **Use async/await** (not callbacks)
   ```typescript
   // Good
   const result = await someAsyncOperation();
   
   // Bad
   someAsyncOperation((err, result) => { /* ... */ });
   ```

4. **Import from shared libs correctly**
   ```typescript
   // Good - shared contracts
   import type { InvoiceSchema } from '@worklighter/contracts';
   import { logger } from '@worklighter/observability';
   
   // Bad - cross-app business logic
   import { invoiceService } from '../../api/services/invoiceService';
   ```

### When Generating AI-Related Code

1. **Always route through ai-runtime**
   ```typescript
   // Good
   const response = await fetch('http://ai-runtime:3002/v1/chat', {
     method: 'POST',
     body: JSON.stringify({ messages, tier: 'B' })
   });
   
   // Bad - direct OpenAI call
   const response = await openai.chat.completions.create({...});
   ```

2. **Use model tiers, not model names**
   ```typescript
   // Good
   { tier: 'A' } // Premium reasoning
   { tier: 'B' } // Fast/cheap
   
   // Bad
   { model: 'gpt-4' } // Hardcoded model name
   ```

3. **Include telemetry**
   ```typescript
   const span = trace.getTracer('app').startSpan('ai-extract-invoice');
   try {
     const result = await aiRuntime.extract(data);
     span.setAttribute('ai.tokens', result.usage.tokens);
     span.setAttribute('ai.tier', 'B');
     return result;
   } finally {
     span.end();
   }
   ```

### When Generating Tests

1. **Follow existing patterns**
   - E2E tests in `tests/e2e/` using Playwright
   - Unit tests co-located with code (if they exist)

2. **Include AI/tool telemetry assertions**
   ```typescript
   expect(span.attributes['ai.tier']).toBe('B');
   expect(span.attributes['tool.name']).toBe('extract-invoice');
   ```

### When Suggesting Database Queries

1. **Use Mongoose for MongoDB**
   ```typescript
   // Good - Mongoose
   const invoice = await Invoice.findById(id);
   
   // Bad - Raw MongoDB driver
   const invoice = await db.collection('invoices').findOne({_id: id});
   ```

2. **Consider aggregation for complex queries**
   ```typescript
   const results = await Invoice.aggregate([
     { $match: { status: 'pending' } },
     { $group: { _id: '$vendor', total: { $sum: '$amount' } } }
   ]);
   ```

## Common Pitfalls to Avoid

### ❌ Don't Do This

1. **Direct AI calls from non-runtime services**
   ```typescript
   // BAD - in apps/api/
   import OpenAI from 'openai';
   const openai = new OpenAI();
   ```

2. **Hardcoded model names**
   ```typescript
   // BAD
   model: 'gpt-4-turbo-preview'
   ```

3. **Shared business logic across apps**
   ```typescript
   // BAD - in libs/shared-logic/
   export function calculateInvoiceTotal() { ... }
   ```

4. **Importing services across apps**
   ```typescript
   // BAD - in apps/web/
   import { invoiceService } from '../../api/services/invoiceService';
   ```

5. **CSS modules or styled-components**
   ```typescript
   // BAD
   import styles from './Component.module.css';
   // Use Tailwind instead
   <div className="flex items-center justify-between p-4">
   ```

### ✅ Do This Instead

1. **Route AI calls through runtime**
   ```typescript
   const response = await aiRuntimeClient.chat({
     messages,
     tier: 'B',
     tools: ['extract-invoice']
   });
   ```

2. **Use tier configuration**
   ```typescript
   // In apps/ai-runtime/config/model-tiers.ts
   export const MODEL_TIERS = {
     A: { provider: 'azure-openai', deployment: 'gpt-4', ... },
     B: { provider: 'azure-openai', deployment: 'gpt-35-turbo', ... }
   };
   ```

3. **Share contracts, not logic**
   ```typescript
   // In libs/contracts/
   export interface Invoice {
     id: string;
     vendor: string;
     total: number;
   }
   ```

4. **Use REST API for cross-app communication**
   ```typescript
   // In apps/web/
   const invoice = await fetch('/api/invoices/123').then(r => r.json());
   ```

5. **Use Tailwind utilities**
   ```typescript
   <div className="flex items-center space-x-4 rounded-lg bg-white p-6 shadow">
   ```

## Nx-Specific Guidance

### When Adding Dependencies

```bash
# Install to specific app
cd apps/api && pnpm add express

# Install to root (workspace-wide dev tools)
pnpm add -D -w typescript

# Never add to wrong location
```

### When Building/Testing

```bash
# Build single app
npx nx build api

# Build affected by changes
npx nx affected --target=build

# Test all
npx nx run-many --target=test --all
```

### When Creating New App

```bash
# Follow convention
apps/<app-name>/
├── src/
├── package.json
├── project.json  # Nx config
├── tsconfig.json
└── Dockerfile

# Add to nx.json projects
# Add Dockerfile as docker/Dockerfile.<app-name>
```

## Quick Reference

### File Locations
- API routes: `apps/api/routes/`
- API services: `apps/api/services/`
- AI runtime: `apps/ai-runtime/`
- Web pages: `apps/web/app/`
- Contracts: `libs/contracts/`
- Observability: `libs/observability/`
- ADRs: `ARCHITECTURE_DECISIONS.md`
- Agent instructions: `AGENTS.md`

### Environment Variables
- Check `.env.example` for canonical list
- Per-app `.env` files: `apps/<app>/.env`
- Never commit `.env` files

### Docker
- Dockerfiles: `docker/Dockerfile.<app>`
- Infra only: `docker-compose.infra.yml`
- Full stack: `docker-compose.yml`

### CI/CD
- Workflows: `.github/workflows/`
- Uses path triggers + Nx affected
- Builds only changed apps and dependencies

## When in Doubt

1. Check `AGENTS.md` for comprehensive repo guide
2. Check `ARCHITECTURE_DECISIONS.md` for existing ADRs
3. Check existing code patterns before creating new ones
4. Ask if deviation from playbook defaults is justified
5. Prefer duplication over tight coupling between apps
