# DocFlow 360 AI Runtime

This service is the single boundary for all LLM calls in `docflow-360`.

## Endpoints
- `GET /health`
- `POST /v1/ai/route`

## Trace Contract
This service accepts and forwards W3C headers:
- `traceparent`
- `tracestate`
