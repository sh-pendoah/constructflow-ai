import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

// Connection options for BullMQ (avoids type conflicts)
export const redisConnection = {
  host: new URL(config.redisUrl).hostname,
  port: parseInt(new URL(config.redisUrl).port || '6379', 10),
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
};

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});
