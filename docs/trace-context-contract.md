# Trace Context Contract

This repo enforces W3C trace context propagation end-to-end.

Required headers:
- 	raceparent
- 	racestate

Minimum path:
- UI/client -> API -> ai-runtime -> tool execution

Operational rule:
- Every audit and policy decision event must include the active trace id.
