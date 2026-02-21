/**
 * k6 Performance Baseline — docflow-360 API
 * §8.5 Baseline load tests for critical endpoints
 *
 * Run locally:
 *   k6 run tests/performance/k6-health.js
 *
 * Run in CI:
 *   K6_API_BASE=http://localhost:3000 k6 run tests/performance/k6-health.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const healthLatency = new Trend('health_latency_ms');
const readyLatency = new Trend('ready_latency_ms');

const BASE_URL = __ENV.K6_API_BASE || 'http://localhost:3000';

export const options = {
  // §8.5 Performance regression thresholds — these define the SLO baseline.
  // If any threshold is breached, k6 exits with a non-zero code → CI fails.
  thresholds: {
    // 99th percentile response time must stay under 500ms
    http_req_duration: ['p(99)<500'],
    // Error rate must stay below 1%
    error_rate: ['rate<0.01'],
    // Health endpoints must always respond under 200ms at p95
    health_latency_ms: ['p(95)<200'],
    ready_latency_ms: ['p(95)<200'],
  },

  scenarios: {
    // Steady-state load: 20 VUs for 30 seconds
    steady_state: {
      executor: 'constant-vus',
      vus: 20,
      duration: '30s',
      exec: 'steadyState',
    },
    // Spike: ramp up to 100 VUs to verify the service doesn't degrade under pressure
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '10s', target: 100 },
        { duration: '10s', target: 0 },
      ],
      exec: 'spikeLoad',
      startTime: '35s',  // run after steady state completes
    },
  },
};

/**
 * Steady-state scenario: poll liveness + readiness at a realistic rate.
 */
export function steadyState() {
  const liveRes = http.get(`${BASE_URL}/health/live`);
  healthLatency.add(liveRes.timings.duration);
  errorRate.add(liveRes.status !== 200);
  check(liveRes, {
    'liveness 200': (r) => r.status === 200,
    'liveness body ok': (r) => r.json('status') === 'alive',
  });

  const readyRes = http.get(`${BASE_URL}/health/ready`);
  readyLatency.add(readyRes.timings.duration);
  errorRate.add(readyRes.status !== 200 && readyRes.status !== 503);
  check(readyRes, {
    'readiness responded': (r) => r.status === 200 || r.status === 503,
  });

  sleep(0.5);
}

/**
 * Spike scenario: hammer the liveness probe to ensure it stays fast under load.
 * This is the probe Azure Container Apps uses to route traffic — must never slow down.
 */
export function spikeLoad() {
  const res = http.get(`${BASE_URL}/health/live`);
  healthLatency.add(res.timings.duration);
  errorRate.add(res.status !== 200);
  check(res, {
    'liveness 200 under spike': (r) => r.status === 200,
  });

  sleep(0.1);
}
