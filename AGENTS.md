# AGENTS.md - constructflow-ai

## Overview
Construction operations and workflow automation. Built with a Docker-first containerized harness.

## Architecture & Infrastructure
- **Single Backend**: `apps/api` (AI runtime is in-process; no separate AI service unless it's a background worker).
- **Frontend**: `apps/web` (Next.js/React).
- **Infra**: Docker-first. Shared DigitalOcean PostgreSQL + pgvector, DO Spaces. Environment variables sourced via `.env` mapped from `master.env`.

## Commands (File-Scoped & Docker-First)
- **Run local stack**: `docker compose up --build`
- **Install deps**: `pnpm install`
- **Lint/Test**: `pnpm --filter api run lint` (or web)

## Coding Standards & Boundaries
- STRICT TypeScript, no `any`.

- DO NOT edit `master.env`. Modify local `.env` via `scripts/generate-repo-env.ps1`.
- DO NOT provision new infrastructure clusters. Always use shared Postgres/Spaces.
