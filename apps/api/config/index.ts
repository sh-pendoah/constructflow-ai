import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'local';

// Load .env from repo root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  env,
  port: parseInt(process.env.CORE_API_PORT || '3000', 10),

  // MongoDB
  mongoUri:
    process.env.MONGO_URI ||
    `mongodb://${process.env.MONGO_USER || 'admin'}:${process.env.MONGO_PASSWORD || 'password'}@localhost:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DB || 'docflow-360'}?authSource=admin`,

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // File uploads
  maxFileSize: process.env.MAX_FILE_SIZE || '50mb',
  uploadDir: process.env.UPLOAD_DIR || '/tmp/uploads',

  // Email
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },
  emailFrom: process.env.EMAIL_FROM || 'noreply@shtrial.com',

  // Azure OpenAI (primary LLM provider)
  azureOpenAI: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-03-01-preview',
  },

  // LLM Provider Selection
  llmProvider: process.env.LLM_PROVIDER || 'azure-openai',

  // Legacy OpenAI settings (deprecated - use Azure OpenAI instead)
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiChatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o',
  openaiEmbeddingModel:
    process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-large',

  // Google Auth
  googleClientId:
    process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '',
  googleClientSecret:
    process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // CORS
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:5173',
      ],
};

