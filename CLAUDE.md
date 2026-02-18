# CLAUDE.md -- docflow-360 Agent Instructions

**Product:** docflow-360 -- Construction Operations Automation Engine
**Domain:** docflow-360.shtrial.com
**GitHub:** sh-pendoah/docflow-360 (local folder: perrygoals)
**Status:** Demo / Technical Showcase

## What This Is

docflow-360 automates document processing workflows for the construction
industry. It ingests invoices, daily logs, and compliance documents (COIs),
extracts structured data via OCR + LLM, routes items through a rules-based
review queue, and produces exportable audit reports.

## Monorepo Structure

```
perrygoals/
  apps/web/          Frontend
  apps/api/          Backend API
  apps/ai-runtime/   AI orchestration (OCR + LLM extraction)
  libs/              Shared libraries
  .github/workflows/ CI/CD pipelines
```

## Key Features

- Document ingestion (invoices, daily logs, COIs)
- OCR + LLM structured data extraction
- Rules-based review queue
- Exportable audit reports

## Build Commands

```bash
pnpm install && pnpm dev
pnpm build && pnpm test && pnpm lint
```

## Rules

- Route AI calls through ai-runtime
- Use env vars for model names
- Keep apps independently deployable
- No secrets in source code
- Validate all extracted data against schemas before storage


