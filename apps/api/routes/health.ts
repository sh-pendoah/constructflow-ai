import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { redis } from '../config/redis';
import { azureBlobStorageService } from '../services/azureBlobStorageService';

const router: Router = Router();

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

