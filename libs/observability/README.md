# @worklighter/observability

Shared observability utilities for the Worklighter monorepo: logging, tracing, and telemetry.

## Purpose

Per the 2026 End-to-End AI Solution Playbook:
- All services must emit **structured logs** with correlation IDs
- All services must support **W3C Trace Context** for distributed tracing
- All AI and tool calls must include **telemetry** (model tier, latency, tokens, cost, outcome)

## What's Included

- **Logger**: Winston-based structured logging with `createLogger()` and `logWithTrace()`
- **Tracing**: OpenTelemetry helpers with `getTracer()`, `extractTraceContext()`, `recordError()`
- **Telemetry**: AI call and tool call telemetry with `recordAiCall()` and `recordToolCall()`

## Usage

### Logging

```typescript
import { logger, createLogger } from '@worklighter/observability';

logger.info('Processing invoice', { invoiceId: '123' });

const childLogger = createLogger({ service: 'invoice-processor' });
childLogger.error('Failed to extract', { error: 'OCR timeout' });
```

### Tracing

```typescript
import { getTracer, extractTraceContext, recordError } from '@worklighter/observability';

const tracer = getTracer('api-service');
const span = tracer.startSpan('process-document');

try {
  // ... work
} catch (error) {
  recordError(span, error);
} finally {
  span.end();
}

// Extract from HTTP headers
const ctx = extractTraceContext(req.headers);
```

### Telemetry

```typescript
import { recordAiCall, recordToolCall } from '@worklighter/observability';

// AI call telemetry
recordAiCall(span, {
  tier: 'B',
  provider: 'azure-openai',
  deployment: 'gpt-35-turbo',
  promptTokens: 150,
  completionTokens: 200,
  totalTokens: 350,
  latencyMs: 1250,
  outcome: 'success',
});

// Tool call telemetry
recordToolCall(span, {
  name: 'extract-invoice',
  durationMs: 3500,
  status: 'success',
  sideEffect: 'READ_ONLY',
});
```
