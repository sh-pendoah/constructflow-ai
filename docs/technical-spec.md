# Technical Spec

## Required App Boundary
- pps/api
- pps/ai-runtime
- optional: pps/web, pps/worker, pps/scheduler, pps/ingestion

## Runtime Contract
- /health endpoint in API and AI runtime
- Trace propagation via 	raceparent and 	racestate
- Governance config validated from gov-config.yaml

## Governance Envelope
- decision: allow | deny | degrade | escalate
- eason_code: deterministic machine-readable code
- policy_version: active policy identifier
- 	race_id: request correlation key

## Testing
- 	ests/golden-smoke.ps1 enforces release blockers + health endpoint presence
