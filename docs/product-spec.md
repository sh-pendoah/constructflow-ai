# DocFlow 360

## Product Spec
- Tagline: Financial logic factory with multi-way match and human-in-the-loop approvals.
- Buyer: CFO / Controller / COO
- Primary MVP flow: Upload PO+invoice+receipt -> detect discrepancies -> route HITL -> approve override with evidence trail.

## Trust Primitives
- Evidence trail with citations and trace ID
- Policy controls with deterministic reason codes
- Budget guard with degrade/block modes
- Immutable audit events
- W3C trace context (	raceparent, 	racestate)

## Release Blockers
- No legacy slugs in paths or content
- pps/ai-runtime exists and is required for AI calls
- 	ests/golden-smoke.ps1 passes
