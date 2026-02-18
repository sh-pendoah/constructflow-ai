# Trust Primitives Checklist

Use this checklist for every new feature, demo, and release.

## The 7 Trust Primitives

1. Evidence trail
- Every decision includes citations or source references.
- Every user-facing answer has a trace ID.
- Audit exports include timestamp, actor, input, output, and policy version.

2. Policy controls
- Allowed and blocked actions are explicit.
- Refusals include machine-readable reason codes.
- Policy version is visible in runtime metadata.

3. Sovereign mode
- Active region profile is visible.
- Cross-region egress is blocked by policy when sovereign mode is enabled.
- Storage, model endpoint, and vector endpoint are region-bound.

4. Budget guard
- Daily and per-tenant budget limits are configurable.
- Fallback model chain is defined and tested.
- Kill switch stops high-cost routes gracefully.

5. Exception handling
- Human-in-the-loop queues exist for uncertain or high-risk actions.
- SLA timers and owner assignment are visible.
- Escalation paths are deterministic.

6. Observability
- p50/p95 latency, error rate, and tool-call telemetry are captured.
- Logs are structured and trace-correlated.
- Audit logs can be exported.

7. Eval gate
- PR and nightly eval suites run automatically.
- Minimum thresholds block release if unmet.
- Hallucination, refusal correctness, and safety regressions are tracked.

## Minimum release rule

A release is not product-grade unless at least 5 of 7 trust primitives are demonstrably active in UI and logs.
