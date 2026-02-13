/**
 * OpenTelemetry tracing setup
 * 
 * Per 2026 playbook: Use W3C Trace Context for distributed tracing
 * across all services.
 */

import { trace, Span, SpanStatusCode } from '@opentelemetry/api';

/**
 * Get the active tracer for the service
 */
export function getTracer(serviceName: string) {
  return trace.getTracer(serviceName);
}

/**
 * Extract trace context from HTTP headers (W3C Trace Context)
 */
export interface TraceContext {
  traceId: string;
  spanId: string;
  traceFlags: string;
}

export function extractTraceContext(headers: Record<string, string | undefined>): TraceContext | null {
  const traceparent = headers['traceparent'];
  if (!traceparent) {
    return null;
  }

  // traceparent format: 00-{trace-id}-{span-id}-{trace-flags}
  const parts = traceparent.split('-');
  if (parts.length !== 4) {
    return null;
  }

  return {
    traceId: parts[1],
    spanId: parts[2],
    traceFlags: parts[3],
  };
}

/**
 * Create traceparent header value from trace context
 */
export function createTraceparent(ctx: TraceContext): string {
  return `00-${ctx.traceId}-${ctx.spanId}-${ctx.traceFlags}`;
}

/**
 * Mark span as error
 */
export function recordError(span: Span, error: Error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
}
