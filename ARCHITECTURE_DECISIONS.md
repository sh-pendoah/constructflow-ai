# Architecture Decision Records (ADRs)

This document captures key architectural decisions made during the development of Worklighter Construction Operations Automation Engine.

## Table of Contents
1. [ADR-001: Azure as Primary Cloud Provider](#adr-001-azure-as-primary-cloud-provider)
2. [ADR-002: MongoDB over PostgreSQL](#adr-002-mongodb-over-postgresql)
3. [ADR-003: Azure Form Recognizer for Invoice OCR](#adr-003-azure-form-recognizer-for-invoice-ocr)
4. [ADR-004: BullMQ for Job Queues](#adr-004-bullmq-for-job-queues)
5. [ADR-005: Email-Based Document Ingestion](#adr-005-email-based-document-ingestion)
6. [ADR-006: Monorepo Structure with Independent Services](#adr-006-monorepo-structure-with-independent-services)
7. [ADR-007: Rules Engine over LLM-Based Routing](#adr-007-rules-engine-over-llm-based-routing)
8. [ADR-008: Azure Blob Storage for Documents](#adr-008-azure-blob-storage-for-documents)
9. [ADR-009: TypeScript for Backend Services](#adr-009-typescript-for-backend-services)
10. [ADR-010: Next.js 15 for Frontend](#adr-010-nextjs-15-for-frontend)

---

## ADR-001: Azure as Primary Cloud Provider

**Date**: 2024-01-15  
**Status**: Accepted  
**Decision Makers**: Technical Lead, CTO

### Context

Need to select a cloud provider for hosting the Worklighter platform with comprehensive AI/ML capabilities for document processing.

### Decision

We will use Microsoft Azure as the primary cloud provider.

### Rationale

**Why Azure:**
1. **Best-in-Class AI Services**:
   - Azure Form Recognizer: Industry-leading pre-built models for invoices/receipts
   - Azure OpenAI: Access to GPT-4 for LLM extraction
   - Azure Document Intelligence: General OCR with high accuracy
   - Cognitive Services: Complete AI/ML toolkit

2. **Enterprise Integration**:
   - Native integration with Microsoft 365 (Outlook, SharePoint, OneDrive)
   - Microsoft Graph API for email ingestion
   - Azure AD for enterprise authentication

3. **Cost-Effectiveness**:
   - Serverless options (Container Apps, Cosmos DB Serverless)
   - Pay-per-use pricing for AI services
   - No upfront infrastructure costs
   - Free tier for development

4. **Compliance & Security**:
   - SOC 2, HIPAA, ISO 27001 certifications
   - Region-specific data residency
   - Built-in DDoS protection
   - Azure Key Vault for secrets management

5. **Construction Industry Fit**:
   - Many construction companies already use Microsoft 365
   - Familiar ecosystem for IT departments
   - Strong partnership network

**Alternatives Considered:**
- **AWS**: More market share, but higher complexity and cost for AI services
- **GCP**: Excellent AI capabilities, but smaller construction industry presence
- **Multi-cloud**: Too complex for MVP, considered for V2

### Consequences

**Positive:**
- Access to best-in-class AI services
- Easier customer onboarding (existing Azure/M365 customers)
- Comprehensive PaaS offerings reduce operational overhead
- Strong security and compliance posture

**Negative:**
- Vendor lock-in risk (mitigated by abstraction layers)
- Some services have regional limitations
- Learning curve for Azure-specific services

**Mitigation Strategies:**
- Abstract OCR/LLM providers behind interfaces
- Document alternative provider implementations
- Use open standards (Docker, Kubernetes) where possible
- Regular multi-cloud architecture reviews

### Notes

- Azure Form Recognizer accuracy (95%+) was a key deciding factor
- Azure OpenAI's GPT-4 access provides competitive advantage
- Customer feedback confirms Microsoft ecosystem preference

---

## ADR-002: MongoDB over PostgreSQL

**Date**: 2024-01-18  
**Status**: Accepted  
**Decision Makers**: Technical Lead, Backend Team

### Context

Need to select a database for storing documents, workflow data, and structured business entities (invoices, daily logs, compliance docs).

### Decision

We will use MongoDB (via Azure Cosmos DB with MongoDB API) as the primary database.

### Rationale

**Why MongoDB:**
1. **Schema Flexibility**:
   - Document types vary significantly (invoices, logs, compliance)
   - Extracted OCR data has variable structure
   - Easy to add new fields without migrations
   - Native JSON storage matches API responses

2. **Nested Documents**:
   - Workers array in daily logs
   - Line items in invoices
   - Exceptions array in review queue
   - Eliminates complex joins

3. **Horizontal Scalability**:
   - Sharding built-in for multi-tenant growth
   - Automatic partition key distribution
   - Handles high write volume (OCR results)

4. **Azure Cosmos DB Benefits**:
   - MongoDB API for compatibility
   - Serverless pricing model
   - Global distribution
   - Automatic indexing
   - 99.999% SLA

5. **Developer Experience**:
   - Mongoose ODM for TypeScript
   - Rich query language
   - Aggregation framework for reporting
   - Easy to prototype and iterate

**Alternatives Considered:**
- **PostgreSQL**: Better for complex joins and ACID transactions, but overkill for document-centric workflows
- **DynamoDB**: Good scalability, but harder query model and AWS lock-in

### Consequences

**Positive:**
- Fast development velocity
- Easy schema evolution
- Good fit for document-centric data
- Cost-effective serverless option

**Negative:**
- Less strict data consistency (eventual consistency)
- More complex aggregations than SQL
- Need to manage relationships manually
- Potential data duplication

**Mitigation Strategies:**
- Use Mongoose schema validation
- Implement data consistency checks
- Document relationship patterns
- Regular data quality audits

### Notes

- Cosmos DB Serverless = $0.25/million RU + $0.25/GB storage
- MongoDB's aggregation framework sufficient for reporting needs
- Can add PostgreSQL later for specialized analytics if needed

---

## ADR-003: Azure Form Recognizer for Invoice OCR

**Date**: 2024-01-20  
**Status**: Accepted  
**Decision Makers**: Technical Lead, AI/ML Team

### Context

Need high-accuracy OCR for extracting structured data from invoices, receipts, and other construction documents.

### Decision

We will use Azure Form Recognizer with pre-built invoice models as the primary OCR provider, with Azure Document Intelligence as fallback.

### Rationale

**Why Form Recognizer:**
1. **Pre-trained Models**:
   - Invoice model trained on 1000+ formats
   - 95%+ field extraction accuracy
   - Automatic table extraction (line items)
   - No training data required

2. **Structured Output**:
   - Automatic field detection (vendor, date, total)
   - Confidence scores per field
   - Bounding box coordinates
   - JSON format ready for processing

3. **Cost-Effective**:
   - $0.01-0.05 per page (vs $0.10+ for alternatives)
   - Only pay for what you process
   - No minimum commitment
   - Free tier: 500 pages/month

4. **Performance**:
   - < 3 seconds per page average
   - Batch processing support
   - 99.9% uptime SLA
   - Async API for large documents

5. **Integration**:
   - Native Azure SDK
   - REST API with language SDKs
   - Webhook callbacks
   - Easy to test and monitor

**Alternatives Considered:**
- **Google Vision/Document AI**: Good accuracy, but no pre-built invoice model
- **AWS Textract**: Comparable, but more expensive and less accurate on invoices
- **Mindee**: Specialized solution, but requires separate vendor relationship

### Consequences

**Positive:**
- Highest invoice extraction accuracy in market
- Reduced manual review queue volume (20-30% reduction)
- Fast processing times
- Easy integration with Azure ecosystem

**Negative:**
- Azure-specific (vendor lock-in)
- Limited customization of pre-built models
- Some regional availability restrictions
- Cost scales with volume

**Mitigation Strategies:**
- Implement provider abstraction layer
- Support fallback to Document Intelligence
- Monitor accuracy and costs
- Cache results to avoid reprocessing

### Notes

- Tested on 100 sample invoices: 94.3% field accuracy
- Significant accuracy improvement over generic OCR (70-80%)
- Custom model training available if needed (V2 feature)

---

## ADR-004: BullMQ for Job Queues

**Date**: 2024-01-22  
**Status**: Accepted  
**Decision Makers**: Backend Team, DevOps

### Context

Need a reliable job queue system for asynchronous processing of OCR, LLM extraction, and export generation.

### Decision

We will use BullMQ (built on Redis) for job queue management.

### Rationale

**Why BullMQ:**
1. **Redis-Based**:
   - Proven reliability and performance
   - Atomic operations for job processing
   - Pub/sub for real-time updates
   - Easy monitoring with Redis CLI

2. **Features**:
   - Priority queues
   - Delayed jobs
   - Job retries with exponential backoff
   - Job progress tracking
   - Rate limiting
   - Job events (completed, failed, etc.)

3. **TypeScript Support**:
   - First-class TypeScript definitions
   - Type-safe job data
   - Modern async/await API
   - Active development

4. **Scalability**:
   - Horizontal scaling of workers
   - Multiple queue support
   - Efficient memory usage
   - Handle 1000s of jobs/second

5. **Observability**:
   - BullBoard UI for monitoring
   - Job metrics and statistics
   - Easy debugging
   - Health checks

**Alternatives Considered:**
- **AWS SQS**: Good, but AWS lock-in and limited features
- **Azure Service Bus**: Enterprise features, but overkill and more expensive
- **Celery**: Python-only, not suitable for Node.js
- **Bee Queue**: Simpler, but lacks features we need

### Consequences

**Positive:**
- Reliable job processing
- Easy to scale workers
- Good monitoring capabilities
- Low operational overhead

**Negative:**
- Redis dependency
- Memory-based (need persistence config)
- No built-in dead letter queue
- Limited job priority levels

**Mitigation Strategies:**
- Configure Redis persistence (AOF + RDB)
- Implement manual dead letter queue
- Monitor Redis memory usage
- Use Azure Cache for Redis in production

### Notes

- Redis persistence essential for production (data loss risk)
- BullBoard provides free monitoring UI
- Easy to add more queues for new workflows

---

## ADR-005: Email-Based Document Ingestion

**Date**: 2024-01-25  
**Status**: Accepted  
**Decision Makers**: Product, Technical Lead

### Context

Need a document ingestion mechanism that requires zero behavior change for field teams.

### Decision

We will use dedicated email addresses (logs@, invoices@, compliance@) as the primary document ingestion mechanism.

### Rationale

**Why Email:**
1. **Zero Behavior Change**:
   - Field teams already email documents
   - No app installation required
   - No training needed
   - Works on any device

2. **Universal Compatibility**:
   - Every phone has email
   - Works with attachments (PDF, JPEG, HEIC)
   - No data/wifi required (cellular)
   - Cross-platform (iOS, Android)

3. **Multi-Tenant Routing**:
   - Email patterns for tenant identification:
     - Plus addressing: `invoices+companyA@domain.com`
     - Subdomain: `companyA-logs@domain.com`
   - Automatic workflow classification
   - Easy to add new companies

4. **Audit Trail**:
   - Email headers for metadata
   - Timestamp from email server
   - Sender information
   - Subject line for context

5. **Integration Options**:
   - Microsoft Graph API (Outlook/O365)
   - Gmail API
   - IMAP/POP3 fallback
   - Webhooks for real-time processing

**Alternatives Considered:**
- **Mobile App**: High friction, requires app store approval, maintenance
- **Web Upload**: Requires login, not field-friendly
- **SMS/MMS**: Limited file size, expensive, no metadata
- **Dropbox/Drive**: Requires account, folder structure confusion

### Consequences

**Positive:**
- Immediate adoption (no behavior change)
- Works with existing infrastructure
- Reliable delivery (email is mature)
- Good user experience

**Negative:**
- Email can have delays (minutes)
- Spam/security concerns
- Limited file size (25MB typical)
- Harder to implement real-time features

**Mitigation Strategies:**
- Implement spam filtering
- Support large files via cloud links
- Add web upload as secondary option
- Monitor email delivery times

### Notes

- Customer interviews strongly preferred email approach
- 90%+ of current documents arrive via email
- Microsoft Graph API preferred for enterprise customers

---

## ADR-006: Monorepo Structure with Independent Services

**Date**: 2024-01-28  
**Status**: Accepted  
**Decision Makers**: Technical Lead, DevOps

### Context

Need to organize codebase for multiple services (API, Worker, Scheduler, Frontend) with shared types but independent deployments.

### Decision

We will use a monorepo structure with independent service packages under `/apps` directory.

### Rationale

**Why Monorepo:**
1. **Code Sharing**:
   - Share TypeScript interfaces
   - Common utilities and helpers
   - Consistent linting/formatting
   - Single version of dependencies

2. **Atomic Changes**:
   - Update API and Worker together
   - Refactor models across services
   - Single PR for cross-service features
   - Easy to verify breaking changes

3. **Developer Experience**:
   - Single `git clone`
   - Unified build scripts
   - Consistent tooling
   - Easy cross-service debugging

4. **Deployment Flexibility**:
   - Each service has own Dockerfile
   - Independent scaling
   - Deploy services separately
   - No runtime coupling

**Our Structure:**
```
worklight/
├── apps/
│   ├── api/          # Express API server
│   ├── worker/       # BullMQ job processor
│   ├── scheduler/    # Cron jobs
│   ├── web/          # Next.js frontend
│   └── landing/      # Marketing site
├── shared/           # (Future) Shared packages
└── docs/             # Documentation
```

**Alternatives Considered:**
- **Polyrepo**: Separate repo per service (harder to maintain consistency)
- **Shared Package**: Publish shared types to npm (unnecessary overhead)
- **Git Submodules**: Complex, error-prone

### Consequences

**Positive:**
- Easy code reuse
- Consistent development experience
- Simplified dependency management
- Faster cross-service changes

**Negative:**
- Larger repo size
- Potential for tight coupling
- Longer CI/CD pipelines
- All services visible to all developers

**Mitigation Strategies:**
- Strict service boundaries
- Independent Dockerfiles
- Selective CI/CD (only build changed services)
- Code ownership via CODEOWNERS

### Notes

- No shared `/packages` directory yet (only share via imports)
- Each service truly independent (own package.json)
- Local schema definitions to avoid coupling (see scheduler)

---

## ADR-007: Rules Engine over LLM-Based Routing

**Date**: 2024-02-01  
**Status**: Accepted  
**Decision Makers**: Technical Lead, AI/ML Team

### Context

Need to route documents to review queue or auto-approve based on various factors (confidence, duplicates, thresholds, compliance).

### Decision

We will use a deterministic rules engine for routing decisions, NOT LLM-based classification.

### Rationale

**Why Rules Engine:**
1. **Predictability**:
   - Deterministic outcomes
   - Easy to test
   - Explainable decisions
   - No hallucinations

2. **Cost**:
   - Zero per-request cost
   - No API calls
   - Instant evaluation
   - Scales infinitely

3. **Reliability**:
   - No API downtime risk
   - No rate limits
   - Consistent latency
   - Offline capable

4. **Auditability**:
   - Clear rule trail
   - Easy compliance reporting
   - Transparent to users
   - Regulatory friendly

5. **Business Logic**:
   - Invoice thresholds (PM vs Owner approval)
   - Duplicate detection
   - Confidence thresholds
   - Expiration windows (30/15/7/0 days)
   - All are deterministic rules

**LLM Use Cases (What We DO Use LLMs For):**
- Text extraction from OCR
- Field classification
- Vendor name normalization
- Workers comp code suggestions
- NOT routing decisions

**Alternatives Considered:**
- **LLM-based routing**: Too unpredictable, expensive, slow
- **ML classification**: Overkill, requires training data
- **Hardcoded if/else**: Too rigid, considered for simple rules

### Consequences

**Positive:**
- Fast, reliable routing
- Easy to debug
- Low cost
- Predictable behavior

**Negative:**
- More code to maintain
- Rules can become complex
- Need to update code for new rules
- No learning from data

**Mitigation Strategies:**
- Rules engine abstraction
- Comprehensive rule tests
- Rule versioning
- Consider rule UI for non-developers (V2)

### Notes

- Rules documented in rulesEngine.ts (~850 lines)
- 15+ exception types defined
- Priority calculation algorithm
- LLM suggestions displayed but not auto-applied

---

## ADR-008: Azure Blob Storage for Documents

**Date**: 2024-02-05  
**Status**: Accepted  
**Decision Makers**: Technical Lead, DevOps

### Context

Need scalable, cost-effective storage for documents (PDFs, images) with secure access and metadata support.

### Decision

We will use Azure Blob Storage for all document storage with container-based organization.

### Rationale

**Why Azure Blob Storage:**
1. **Scalability**:
   - Petabyte-scale storage
   - Automatic replication
   - No provisioning required
   - Pay-per-GB pricing

2. **Cost-Effective**:
   - Hot tier: $0.0184/GB/month
   - Cool tier: $0.01/GB/month
   - Archive tier: $0.00099/GB/month
   - Lifecycle policies for automatic tiering

3. **Security**:
   - SAS tokens for temporary access
   - Encryption at rest
   - Private endpoints
   - RBAC integration

4. **Features**:
   - Metadata tagging
   - Blob versioning
   - Soft delete
   - Change feed
   - Static website hosting

5. **Integration**:
   - Native SDK for Node.js
   - Azure Container Apps integration
   - CDN support
   - Easy backup to Azure Backup

**Container Strategy:**
```
documents/      # General documents
pdfs/          # Normalized PDFs
images/        # Converted images (JPEG from HEIC)
exports/       # Generated reports
```

**Alternatives Considered:**
- **Local filesystem**: Not scalable, no replication, hard to backup
- **AWS S3**: Good, but not in Azure ecosystem
- **Azure Files**: More expensive, designed for SMB/NFS not object storage

### Consequences

**Positive:**
- Unlimited scalability
- Cost-effective storage
- Good security model
- Easy integration

**Negative:**
- Azure-specific API
- SAS token management
- Eventual consistency
- Cost for egress

**Mitigation Strategies:**
- Abstract behind storage interface
- Mock storage for development
- CDN for frequently accessed files
- Lifecycle policies to minimize costs

### Notes

- Mock storage implementation for local development
- Automatic cleanup of temp files after upload
- SAS URLs expire after 60 minutes by default
- Container-level access control

---

## ADR-009: TypeScript for Backend Services

**Date**: 2024-02-08  
**Status**: Accepted  
**Decision Makers**: Technical Lead, Backend Team

### Context

Need to choose programming language for backend API, Worker, and Scheduler services.

### Decision

We will use TypeScript for all backend services.

### Rationale

**Why TypeScript:**
1. **Type Safety**:
   - Catch errors at compile time
   - Better IDE support
   - Self-documenting code
   - Easier refactoring

2. **JavaScript Ecosystem**:
   - NPM package ecosystem
   - Node.js performance
   - Async/await native support
   - JSON-first (matches MongoDB)

3. **Developer Productivity**:
   - IntelliSense in editors
   - Automatic completions
   - Jump-to-definition
   - Inline documentation

4. **Maintainability**:
   - Clear interfaces and contracts
   - Easier onboarding
   - Less runtime errors
   - Better code reviews

5. **Azure SDK Support**:
   - First-class TypeScript support
   - Type definitions included
   - Examples in TypeScript
   - Active development

**Alternatives Considered:**
- **JavaScript**: Faster development, but less safe
- **Python**: Great for AI/ML, but slower performance and worse Azure SDK support
- **Go**: Fast, but smaller ecosystem and harder Azure integration
- **C#**: Excellent Azure support, but less suitable for rapid iteration

### Consequences

**Positive:**
- Type-safe codebase
- Better developer experience
- Fewer runtime errors
- Good Azure SDK support

**Negative:**
- Build step required
- Slightly slower development
- Learning curve for non-TS developers
- Dependency on TypeScript compiler

**Mitigation Strategies:**
- Use strict TypeScript settings
- Document common patterns
- Provide TypeScript training
- Use ts-node for development

### Notes

- TypeScript 5.7+ for latest features
- Strict mode enabled
- No `any` types in new code
- ESLint + Prettier for consistency

---

## ADR-010: Next.js 15 for Frontend

**Date**: 2024-02-10  
**Status**: Accepted  
**Decision Makers**: Frontend Team, Technical Lead

### Context

Need to choose frontend framework for Review Queue UI and Admin Portal.

### Decision

We will use Next.js 15 with App Router for the frontend application.

### Rationale

**Why Next.js 15:**
1. **React Ecosystem**:
   - Large developer community
   - Rich component ecosystem
   - Excellent documentation
   - Industry standard

2. **Performance**:
   - Server-side rendering
   - Automatic code splitting
   - Image optimization
   - Fast refresh in development

3. **App Router**:
   - File-based routing
   - Server components
   - Streaming SSR
   - Parallel data fetching

4. **Developer Experience**:
   - TypeScript support
   - Hot module replacement
   - Built-in CSS support
   - API routes (unused but available)

5. **Deployment**:
   - Vercel optimization
   - Container-friendly
   - Static export option
   - Easy CDN integration

**Tech Stack:**
- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **React Query**: Data fetching
- **Redux Toolkit**: State management (minimal usage)

**Alternatives Considered:**
- **Create React App**: Deprecated, no SSR
- **Vite + React**: Good, but more manual setup
- **Angular**: Too opinionated, steeper learning curve
- **Vue**: Smaller ecosystem, less enterprise adoption

### Consequences

**Positive:**
- Modern developer experience
- Good performance out-of-box
- Rich ecosystem
- Easy deployment

**Negative:**
- Framework lock-in
- Build complexity
- Version churn
- Some features are experimental

**Mitigation Strategies:**
- Document migration path if needed
- Use stable features only
- Keep dependencies updated
- Test thoroughly before upgrading

### Notes

- App Router preferred over Pages Router
- Server components used where appropriate
- Client components for interactive UI
- Tailwind for rapid styling

---

## Future ADRs

Topics to document:
- ADR-012: Compliance Alert Windows (30/15/7/0 days)
- ADR-013: Multi-Tenant Data Isolation Strategy
- ADR-014: Export Format Selection (CSV vs XLSX vs PDF)
- ADR-015: Webhook Event Schema Design
- ADR-016: Error Handling and Retry Strategies
- ADR-017: Logging and Monitoring Approach (partially covered in libs/observability)
- ADR-018: CI/CD Pipeline Design (partially implemented with Nx + path triggers)
- ADR-019: Testing Strategy (Unit, Integration, E2E)
- ADR-020: Security and Authentication Model
- ADR-021: AI Runtime Model Tier Strategy
- ADR-022: Tool Registry and Side-Effect Classification

---

## Review Process

ADRs should be:
1. Proposed in PR with ADR document
2. Reviewed by relevant stakeholders
3. Discussed in architecture review meeting
4. Accepted/rejected with rationale
5. Updated as implementation evolves

**Template for new ADRs:**
```markdown
## ADR-XXX: Title

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded
**Decision Makers**: Names

### Context
What problem are we solving?

### Decision
What did we decide?

### Rationale
Why did we decide this? What alternatives did we consider?

### Consequences
What are the positive and negative outcomes?

### Notes
Additional context and links
```

---

## ADR-011: MongoDB vs PostgreSQL Database Strategy (2026 Review)

**Date**: 2026-02-13  
**Status**: Accepted (with review cycle planned)  
**Decision Makers**: Technical Lead, CTO

### Context

The 2026 End-to-End AI Solution Playbook designates **Azure Database for PostgreSQL** as the default database for new applications. Worklighter currently uses **MongoDB 7.x via Azure Cosmos DB for MongoDB API** (documented in ADR-002 from 2024).

Need to evaluate:
1. Whether the original MongoDB justification remains valid
2. Migration cost/benefit to PostgreSQL
3. 2026 playbook compliance

### Decision

We will **continue using MongoDB via Azure Cosmos DB for MongoDB API** with the following justifications and review criteria.

### Rationale

**Why MongoDB remains appropriate:**

1. **Document-Centric Workload (Primary Justification)**:
   - Invoice line items: Nested arrays with variable structure
   - Daily log workers: Nested arrays of worker entries
   - Compliance documents: Variable field sets per document type
   - OCR extraction results: Variable structure with confidence scores + bounding boxes
   - Review queue exceptions: Nested array of rule violations
   - PostgreSQL JSONB would require manual schema management for these patterns

2. **Schema Evolution Velocity**:
   - OCR extraction adds new fields regularly (new invoice formats, new log templates)
   - Compliance document types expand (new COI types, new license formats)
   - MongoDB's schemaless model reduces migration overhead
   - Current velocity: 2-3 schema changes per month

3. **Azure Cosmos DB Benefits**:
   - Azure-native (meets playbook's Azure-first requirement)
   - Serverless pricing aligns with MVP stage
   - MongoDB API provides full compatibility
   - Global distribution for future multi-region needs
   - Automatic indexing and scaling

4. **Migration Cost vs Benefit**:
   - ~12 Mongoose models with complex nested schemas
   - ~150+ aggregation pipelines for reporting
   - ~50+ existing queries across API/Worker/Scheduler
   - Estimated migration: 4-6 weeks + testing
   - **Cost > Benefit** at current stage

**Why this deviation from playbook default is justified:**

Per 2026 playbook § 0.1: Deviations require written justification answering:
1. **What constraint the default fails**: PostgreSQL with JSONB doesn't efficiently handle deeply nested, variable-structure document arrays without complex schema management
2. **Why the exception solves it**: MongoDB's native document model matches our data patterns exactly
3. **What new operational risks we're accepting**: Azure Cosmos DB for MongoDB has feature gaps vs full MongoDB (no $lookup across databases, limited aggregation operators), but we don't use those features

### Consequences

**Positive:**
- Continue with proven, working data model
- Avoid 4-6 week migration during MVP phase
- Azure Cosmos DB is Azure-native (playbook compliant)
- Serverless pricing reduces costs during low-usage periods

**Negative:**
- Non-default choice requires ongoing justification
- MongoDB expertise less common than PostgreSQL
- Azure Cosmos DB for MongoDB has limitations vs full MongoDB
- Future PostgreSQL adoption requires migration

**Mitigation Strategies:**
- Review decision annually or when workload changes significantly
- Document MongoDB usage patterns in AGENTS.md
- Maintain query abstraction layer for potential future migration
- Consider PostgreSQL for new bounded contexts (e.g., analytics, user management if split out)

### Review Criteria (Annual Assessment)

Re-evaluate MongoDB choice if any of these conditions change:

1. **Workload shift**: If document patterns become more relational (e.g., complex joins dominate)
2. **Team expertise**: If PostgreSQL expertise significantly exceeds MongoDB expertise
3. **Azure Cosmos DB limitations**: If we hit feature gaps that block critical functionality
4. **Cost structure**: If Cosmos DB costs exceed PostgreSQL at scale (review at 1M+ documents)
5. **Playbook evolution**: If 2027+ playbook elevates PostgreSQL requirement from "default" to "mandatory"

### Next Review Date

**2027-02-13** or when reaching 1 million documents, whichever comes first.

### Notes

- Azure Cosmos DB for MongoDB vCore is now GA (2026), providing full MongoDB 6.0+ compatibility if needed
- MongoDB Atlas on Azure is also Azure-compatible (but adds vendor complexity)
- This ADR supersedes the original ADR-002 rationale with 2026 playbook context

---

