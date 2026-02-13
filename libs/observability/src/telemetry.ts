/**
 * AI and tool call telemetry helpers
 * 
 * Per 2026 playbook: All AI calls and tool invocations must be instrumented
 * with telemetry (model tier, latency, tokens, cost, outcome).
 */

import { Span } from '@opentelemetry/api';

export interface AiCallTelemetry {
  tier: 'A' | 'B' | 'C' | 'D';
  provider: string;
  deployment?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  cost?: number;
  outcome: 'success' | 'error' | 'timeout';
  errorMessage?: string;
}

export function recordAiCall(span: Span, telemetry: AiCallTelemetry) {
  span.setAttributes({
    'ai.tier': telemetry.tier,
    'ai.provider': telemetry.provider,
    'ai.deployment': telemetry.deployment || 'unknown',
    'ai.prompt_tokens': telemetry.promptTokens,
    'ai.completion_tokens': telemetry.completionTokens,
    'ai.total_tokens': telemetry.totalTokens,
    'ai.latency_ms': telemetry.latencyMs,
    'ai.cost': telemetry.cost || 0,
    'ai.outcome': telemetry.outcome,
    'ai.error_message': telemetry.errorMessage || '',
  });
}

export interface ToolCallTelemetry {
  name: string;
  durationMs: number;
  status: 'success' | 'error';
  idempotencyKey?: string;
  sideEffect: 'READ_ONLY' | 'MUTATING' | 'EXTERNAL';
  errorMessage?: string;
}

export function recordToolCall(span: Span, telemetry: ToolCallTelemetry) {
  span.setAttributes({
    'tool.name': telemetry.name,
    'tool.duration_ms': telemetry.durationMs,
    'tool.status': telemetry.status,
    'tool.idempotency_key': telemetry.idempotencyKey || '',
    'tool.side_effect': telemetry.sideEffect,
    'tool.error_message': telemetry.errorMessage || '',
  });
}
