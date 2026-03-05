# CLAUDE.md - constructflow-ai
**Domain**: constructflow-ai.shtrial.com

## Project Overview
NestJS API + Next.js web + DO Postgres stack. Construction operations and workflow automation.

## Architecture & Conventions
- `apps/api/`: Consolidated API and AI logic.
- `apps/web/`: Frontend.
- Docker-first environment. 

## Coding Rules
- Use `docker compose` for orchestration. 
- When generating SQL/Prisma/SQLAlchemy models, use `pgvector` for embeddings.
- Ensure all AI inference calls hit the appropriate tiers (e.g., text-embedding-3-large for RAG).

## Common Commands
- Dev: `docker compose up --build`
