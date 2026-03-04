import { Router, Request, Response } from 'express';

const router: Router = Router();

/**
 * @swagger
 * /api/ai/health:
 *   get:
 *     summary: AI runtime health check
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: AI runtime is healthy
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    service: 'docflow-360-ai-runtime',
    traceparent: _req.header('traceparent') ?? null,
    tracestate: _req.header('tracestate') ?? null
  });
});

/**
 * @swagger
 * /api/ai/route:
 *   post:
 *     summary: AI routing decision
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Routing decision
 */
router.post('/route', (req: Request, res: Response) => {
  res.status(200).json({
    decision: 'ALLOW',
    reason_code: 'AI_RUNTIME_ROUTE_OK',
    traceparent: req.header('traceparent') ?? null,
    tracestate: req.header('tracestate') ?? null
  });
});

export default router;
