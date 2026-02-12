import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { config } from './config';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';
import './config/redis';
import './services/documentProcessing';
import './services/emailIngestion';
import { scheduleComplianceChecks } from './services/complianceScheduler';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter, authLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import documentRoutes from './routes/documents';
import healthRoutes from './routes/health';
import jobRoutes from './routes/jobs';
import costCodeRoutes from './routes/cost-codes';
import wcCodeRoutes from './routes/wc-codes';
import coiVendorRoutes from './routes/coi-vendors';
import approvalRuleRoutes from './routes/approval-rules';
import invoiceRoutes from './routes/invoices';
import dailyLogRoutes from './routes/daily-logs';
import complianceRoutes from './routes/compliance';
import reviewQueueRoutes from './routes/reviewQueue';
import exportRoutes from './routes/exports';
import contractorRoutes from './routes/contractors';

const app = express();

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: config.maxFileSize }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Apply rate limiting to all routes
app.use('/api/', generalLimiter);

// Static files for uploads
app.use('/uploads', express.static(config.uploadDir));

// API Documentation - Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Worklighter API Documentation',
  customfavIcon: '/favicon.ico',
}));

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
  
  // Schedule compliance checks
  await scheduleComplianceChecks();

  app.listen(config.port, () => {
    logger.info(`Core API running on port ${config.port} [${config.env}]`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
