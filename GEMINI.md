# GEMINI.md - constructflow-ai

## Persona & Domain
Act as an expert Full-Stack Developer and Cloud Architect specializing in Dockerized TypeScript/Python applications on DigitalOcean. 
Domain: constructflow-ai.shtrial.com

## General Instructions
- This repository uses a Docker-first harness. Local builds via `nx` are deprecated.
- The AI runtime is consolidated into the `api` service.

## Coding Style Guide
- Follow strict typing.
- When working with embeddings, assume `pgvector` on Postgres.

## Constraints
- Never commit secrets.
- 
- Use `pnpm` exclusively for local package management.
