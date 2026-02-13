import cors from 'cors';
import express, { Express } from 'express';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';
import './config/redis';
import swaggerSpec from './config/swagger';
import './services/documentProcessing';
import './services/emailIngestion';
// NOTE: complianceScheduler import removed - scheduler handled by apps/scheduler service (P0.2 fix)
// import { scheduleComplianceChecks } from './services/complianceScheduler';
import { errorHandler } from './middleware/errorHandler';
import { authLimiter, generalLimiter } from './middleware/rateLimiter';
import approvalRuleRoutes from './routes/approval-rules';
import authRoutes from './routes/auth';
import coiVendorRoutes from './routes/coi-vendors';
import complianceRoutes from './routes/compliance';
import contractorRoutes from './routes/contractors';
import costCodeRoutes from './routes/cost-codes';
import dailyLogRoutes from './routes/daily-logs';
import documentRoutes from './routes/documents';
import exportRoutes from './routes/exports';
import healthRoutes from './routes/health';
import invoiceRoutes from './routes/invoices';
import jobRoutes from './routes/jobs';
import projectRoutes from './routes/projects';
import reviewQueueRoutes from './routes/reviewQueue';
import wcCodeRoutes from './routes/wc-codes';

const app: Express = express();

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: config.maxFileSize }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } })
);

// Apply rate limiting to all routes
app.use('/api/', generalLimiter);

// Static files for uploads
app.use('/uploads', express.static(config.uploadDir));

// API Documentation - Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.get(
  '/api-docs',
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Worklighter API Documentation',
    customfavIcon: '/favicon.ico',
  })
);

// Swagger JSON endpoint
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes); // Stricter rate limit for auth
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/cost-codes', costCodeRoutes);
app.use('/api/wc-codes', wcCodeRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/coi-vendors', coiVendorRoutes);
app.use('/api/approval-rules', approvalRuleRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/daily-logs', dailyLogRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/review-queue', reviewQueueRoutes);
app.use('/api/exports', exportRoutes);

// Root
app.get('/', (_req, res) => {
  res.json({
    service: 'Worklight Core API',
    version: '1.0.0',
    env: config.env,
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    health: '/api/health',
  });
});

// Error handler
app.use(errorHandler);

// Start server
async function start() {
  await connectDatabase();

  // NOTE: Compliance checks are handled by the dedicated scheduler service (apps/scheduler)
  // The BullMQ-based scheduler below is disabled to prevent duplicate alerts (P0.2 fix)
  // Keep the cron-based scheduler in apps/scheduler/index.ts as the single source of truth
  // await scheduleComplianceChecks(); // DISABLED - use apps/scheduler instead

  app.listen(config.port, () => {
    logger.info(`Core API running on port ${config.port} [${config.env}]`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
