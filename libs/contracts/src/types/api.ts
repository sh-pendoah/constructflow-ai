/**
 * API-related types
 */

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
    aiRuntime?: 'connected' | 'disconnected';
  };
}
