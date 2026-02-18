/**
 * @docflow-360/contracts
 * 
 * Shared TypeScript interfaces, types, and Zod schemas for docflow-360 monorepo.
 * These contracts are used across all apps for type safety and API contracts.
 * 
 * Per 2026 playbook: Shared contracts are allowed (and encouraged) to maintain
 * type safety across service boundaries without coupling business logic.
 */

// Common types
export * from './types/common';

// Document types
export * from './types/documents';

// User and auth types
export * from './types/auth';

// API response types
export * from './types/api';

// Zod schemas for validation
export * from './schemas/document-schemas';
export * from './schemas/user-schemas';

