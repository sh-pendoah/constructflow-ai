# GEMINI.md -- docflow-360 Agent Instructions (Gemini)

> Repository: sh-pendoah/docflow-360 (local: perrygoals)
> Domain: docflow-360.shtrial.com | Status: Demo

## What This Is

docflow-360 automates construction document processing -- OCR + LLM extraction
of invoices, daily logs, and compliance docs with rules-based review queues.

## Stack

| Component | Technology |
|---|---|
| Frontend | React + Tailwind |
| Backend | API service |
| AI | OCR + LLM extraction pipeline |
| Database | PostgreSQL |
| Deployment | DigitalOcean App Platform |

## Commands

```bash
pnpm install && pnpm dev
pnpm build && pnpm test && pnpm lint
```

## Rules

- Route AI through ai-runtime, use env vars for model names
- Validate extracted data against schemas before storage
- Keep apps independent, no secrets in source


