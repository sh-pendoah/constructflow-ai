import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { redis } from '../config/redis';
import { azureBlobStorageService } from '../services/azureBlobStorageService';

const router: Router = Router();

// Liveness probe — fast check that the process is alive and not deadlocked.
// ACA / k8s calls this repeatedly; it must never depend on external services.
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Readiness probe — checks whether this instance can serve traffic.
// Fails if any required dependency is unavailable; ACA removes the replica from the LB.
router.get('/ready', async (_req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  let redisStatus = 'disconnected';
  try {
    await redis.ping();
    redisStatus = 'connected';
  } catch {
    redisStatus = 'disconnected';
  }

  const ready = mongoStatus === 'connected' && redisStatus === 'connected';

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    dependencies: {
      mongodb: mongoStatus,
      redis: redisStatus,
    },
  });
});

// Full health check — includes non-critical dependencies (blob storage).
// Used by monitoring dashboards and smoke tests; not used as a probe.
router.get('/', async (_req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  let redisStatus = 'disconnected';
  try {
    await redis.ping();
    redisStatus = 'connected';
  } catch {
    redisStatus = 'disconnected';
  }

  // Check Azure Blob Storage health
  const blobStorageHealth = await azureBlobStorageService.healthCheck();

  const healthy = mongoStatus === 'connected' && redisStatus === 'connected' && blobStorageHealth.healthy;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
      blobStorage: {
        status: blobStorageHealth.healthy ? 'connected' : 'disconnected',
        provider: blobStorageHealth.provider,
        message: blobStorageHealth.message,
      },
    },
  });
});

export default router;

