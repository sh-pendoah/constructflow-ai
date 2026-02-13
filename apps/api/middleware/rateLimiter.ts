import { Request, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { logger } from '../config/logger';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many requests from this IP, please try again later.',
    });
  },
});

/**
 * Auth rate limiter (stricter)
 * 5 requests per 15 minutes per IP for login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: false,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(
      `Auth rate limit exceeded for IP: ${req.ip}, path: ${req.path}`
    );
    res.status(429).json({
      message:
        'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    });
  },
});

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per hour per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many requests for this operation, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(
      `Strict rate limit exceeded for IP: ${req.ip}, path: ${req.path}`
    );
    res.status(429).json({
      message:
        'Rate limit exceeded for this operation. Please try again later.',
    });
  },
});

/**
 * Upload rate limiter
 * 20 uploads per hour per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many upload requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Upload rate limit exceeded. Please try again after 1 hour.',
    });
  },
});

/**
 * API key rate limiter (more generous for authenticated API access)
 * 1000 requests per 15 minutes per API key
 */
export const apiKeyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'API rate limit exceeded, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use API key from header if present, otherwise fall back to IP with IPv6 subnet handling
    const apiKey = req.headers['x-api-key'];
    if (typeof apiKey === 'string') {
      return apiKey;
    }
    // Use ipKeyGenerator helper to properly handle IPv6 addresses
    return ipKeyGenerator(req.ip || 'unknown', 56);
  },
  handler: (req: Request, res: Response) => {
    logger.warn(
      `API key rate limit exceeded for: ${req.headers['x-api-key'] || req.ip}`
    );
    res.status(429).json({
      message: 'API rate limit exceeded. Please try again later.',
    });
  },
});

/**
 * Create a custom rate limiter with specified options
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn(`Custom rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        message: options.message || 'Rate limit exceeded.',
      });
    },
  });
};
