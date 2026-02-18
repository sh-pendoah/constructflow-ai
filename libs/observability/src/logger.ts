/**
 * Structured logging with Winston
 * 
 * Per 2026 playbook: All services must emit structured logs with correlation IDs
 */

import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: process.env.SERVICE_NAME || 'docflow-360' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

/**
 * Create a child logger with additional metadata
 */
export function createLogger(meta: Record<string, unknown>) {
  return logger.child(meta);
}

/**
 * Add trace context to log metadata
 */
export function logWithTrace(traceId: string, spanId: string, message: string, meta?: Record<string, unknown>) {
  logger.info(message, {
    traceId,
    spanId,
    ...meta,
  });
}

