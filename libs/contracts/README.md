# @docflow-360/contracts

Shared TypeScript interfaces, types, and Zod schemas for the docflow-360 monorepo.

## Purpose

Per the 2026 End-to-End AI Solution Playbook, shared contracts are **allowed and encouraged** to:
- Maintain type safety across service boundaries
- Define clear API contracts
- Avoid business logic coupling (only types/schemas)

## What's Included

- **Common types**: `ObjectId`, `Timestamps`, `PaginationParams`, `ApiResponse`
- **Document types**: `Invoice`, `DailyLog`, `ComplianceDocument`, `DocumentStatus`
- **Auth types**: `User`, `AuthTokenPayload`, `LoginRequest`, `LoginResponse`
- **API types**: `HealthCheckResponse`
- **Zod schemas**: Validation schemas for documents and users

## Usage

```typescript
import type { Invoice, DocumentStatus } from '@docflow-360/contracts';
import { documentStatusSchema } from '@docflow-360/contracts';

// Use types
const invoice: Invoice = { ... };

// Use Zod schemas for validation
const result = documentStatusSchema.parse('pending');
```

## What NOT to Include

❌ Business logic (e.g., `calculateInvoiceTotal()`)
❌ Service implementations
❌ Database models (those stay in apps)

✅ Only interfaces, types, and validation schemas

