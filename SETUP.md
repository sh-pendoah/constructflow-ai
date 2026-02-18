# docflow-360 - Independent Services with Shared Dev Harness

## ✅ Setup Complete!

Your docflow-360 services directory has been successfully organized. Three **independent services** now live together with a shared development harness and orchestration layer.

---

## 📍 Current Structure

```
docflow-360/
├── apps/
│   ├── web/                    # Next.js web application
│   ├── landing/                # Vite landing page React app
│   ├── api/                    # Express.js backend service
│   ├── worker/                 # Background job processor
│   └── scheduler/              # Scheduled tasks service
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.landing-page
│   ├── Dockerfile.core-api
│   └── nginx.conf
├── scripts/
│   ├── install-all.ps1        # Install deps for all services
│   ├── dev-all.ps1            # Run all services in dev
│   ├── dev-infra.ps1          # Start MongoDB + Redis
│   ├── build-prod.ps1         # Build all for production
│   ├── build-docker.ps1       # Build Docker images
│   └── status.ps1             # Check service status
├── docker-compose.yml         # Full stack orchestration
├── docker-compose.services.yml # Infrastructure only
├── package.json               # Root orchestration scripts
├── .env.example              # Environment template
├── README.md                 # Main documentation
└── SETUP.md                  # This file
```

---

## 🚀 Next Steps

### 1. Install Dependencies

```bash
npm run install:all
# or manually:
# - npm install (root)
# - cd apps/web && npm install
# - cd apps/landing && npm install
# - cd apps/api && npm install
# - cd apps/worker && npm install
# - cd apps/scheduler && npm install
```

### 2. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit with your settings:
# - MongoDB credentials
# - API URLs
# - JWT secrets
# - API keys (OpenAI, Azure, etc.)
```

### 3. Start Development

**Option A: Local Development (all services run locally)**

```bash
# Terminal 1: Start infrastructure
npm run infra:up

# Terminal 2: Run all services
npm run dev

# OR run each individually:
npm run dev:frontend        # http://localhost:3001
npm run dev:landing-page    # http://localhost:5173
npm run dev:core-api        # http://localhost:3000
```

**Option B: Docker Development**

```bash
npm run compose:up
npm run compose:logs
```

---

## 📦 Services Reference

### Frontend (Next.js)

- **Location**: `apps/web/`
- **Port**: 3001 (dev) / 3000 (prod)
- **Build**: `npm run build:staging` or `npm run build:production`
- **Run**: `npm run dev:staging` or `npm start`
- **Features**: React 19, Redux, Next.js 16, Tailwind CSS

### Landing Page (Vite)

- **Location**: `apps/landing/`
- **Port**: 5173 (dev) / 80 (nginx)
- **Build**: `npm run build`
- **Run**: `npm run dev`
- **Features**: Vite, React 18, Tailwind CSS, static site

### Core API (Express)

- **Location**: `apps/api/`
- **Port**: 3000
- **Build**: `npm run build:staging`, `npm run build:prod`, `npm run build:uat`
- **Run**: `npm run dev:local`, `npm run dev:staging`, `npm start`
- **Features**: Express 4, MongoDB, Redis, LangChain AI, file upload, email

### Worker Service

- **Location**: `apps/worker/`
- **Purpose**: Background job processing (OCR, document extraction)
- **Build**: `npm run build`
- **Run**: `npm run dev`

### Scheduler Service

- **Location**: `apps/scheduler/`
- **Purpose**: Scheduled tasks (compliance alerts, email summaries)
- **Build**: `npm run build`
- **Run**: `npm run dev`

---

## 🔌 Service Communication

Services communicate **exclusively through REST APIs**:

```
Frontend          Landing Page
    ↓                   ↓
    └─── Core API ──────┘
            ↓
    ┌──────┴──────────┬────────────┐
    ↓                 ↓            ↓
MongoDB            Redis        External APIs
```

**Important**: No cross-service imports. Each service is completely independent.

---

## 🐳 Docker Deployment

### Build Images

```bash
# Individual builds
docker build -f docker/Dockerfile.frontend -t docflow-360-frontend .
docker build -f docker/Dockerfile.landing-page -t docflow-360-landing-page .
docker build -f docker/Dockerfile.core-api -t docflow-360-core-api .

# Or use the script:
.\scripts\build-docker.ps1
```

### Run with Docker Compose

```bash
# Full stack (all services + infra)
docker-compose up -d

# Infrastructure only (MongoDB, Redis)
docker-compose -f docker-compose.services.yml up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔧 Useful Commands

```bash
# Install dependencies for all services
npm run install:all

# Development mode - run all services
npm run dev

# Individual service development
npm run dev:frontend
npm run dev:landing-page
npm run dev:core-api

# Infrastructure
npm run infra:up          # Start MongoDB + Redis
npm run infra:down        # Stop infrastructure
npm run infra:logs        # View infrastructure logs

# Building for production
npm run build
npm run build:frontend
npm run build:landing-page
npm run build:core-api

# Docker Compose
npm run compose:up        # Full stack
npm run compose:down      # Stop everything
npm run compose:logs      # View logs

# Check service status
.\scripts\status.ps1
```

---

## � CI/CD & Deployment Strategy

### Path-Based Triggers for Independent Deployments

Each service has its own deployment pipeline triggered by changes to its directory:

**GitHub Actions Example:**

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend
on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'
      - 'docker/Dockerfile.frontend'
      - '.github/workflows/deploy-frontend.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and deploy frontend
        run: |
          docker build -f docker/Dockerfile.frontend -t docflow-360-frontend:${{ github.sha }} .
          # Push to registry, deploy to K8s, etc.
```

Repeat similar workflows for:

- `landing-page` (trigger on `apps/landing/**`)
- `core-api` (trigger on `apps/api/**`)
- `worker` (trigger on `apps/worker/**`)
- `scheduler` (trigger on `apps/scheduler/**`)

**Benefits:**

- ✅ Only affected services are rebuilt and deployed
- ✅ Services can have different release cycles
- ✅ No coordination needed between services
- ✅ Faster deployments (only what changed)

---

## �🔐 Security Notes

- **Never commit `.env`** - it contains secrets
- Copy `.env.example` to `.env` and fill in local values
- Use strong JWT secrets in production
- Rotate MongoDB/Redis passwords regularly
- Store API keys securely (use environment variables)

---

## 💾 Environment Variables Quick Reference

| Variable                | Default                | Service  | Purpose                |
| ----------------------- | ---------------------- | -------- | ---------------------- |
| `NODE_ENV`              | staging                | core-api | Deployment environment |
| `MONGO_URI`             | localhost:27017        | core-api | MongoDB connection     |
| `REDIS_URL`             | redis://localhost:6379 | core-api | Redis cache            |
| `JWT_SECRET`            | -                      | core-api | JWT signing secret     |
| `NEXT_PUBLIC_API_URL`   | http://localhost:3000  | frontend | Backend API endpoint   |
| `OPENAI_API_KEY`        | -                      | core-api | OpenAI LLM access      |
| `AZURE_STORAGE_ACCOUNT` | -                      | core-api | Azure blob storage     |

---

## 🚨 Common Issues & Solutions

### Port already in use

```bash
# Change in .env
CORE_API_PORT=3001
FRONTEND_PORT=3002
LANDING_PAGE_PORT=5174
```

### MongoDB connection failed

```bash
# Ensure infrastructure is running:
npm run infra:up

# Check MongoDB is healthy:
docker ps  # should see "docflow-360-mongodb (healthy)"
```

### Clear everything and start fresh

```bash
# Stop services
npm run compose:down
npm run infra:down

# Clean build cache
rm -r apps/*/node_modules
rm -r apps/*/.next apps/*/dist apps/*/build

# Reset
npm run install:all
npm run infra:up
npm run dev
```

---

## 📚 Documentation

- **README.md** - Main monorepo documentation
- **apps/web/README.md** - Frontend-specific
- **apps/landing/README.md** - Landing page-specific
- **apps/api/README.md** - Backend-specific
- **.env.example** - All environment variables

---

## 🎯 Development Best Practices

1. **Independence**: Each service can be developed, tested, and deployed independently
2. **No shared code**: Changes in one service don't affect others
3. **API communication**: Services talk through REST APIs only
4. **Isolated dependencies**: Each service manages its own package.json
5. **Infrastructure sharing**: Databases and caches are shared but services are not

---

## 📊 Quick Health Check

```bash
# All services running and healthy?
.\scripts\status.ps1

# Example healthy output:
# CONTAINER ID   IMAGE             STATUS
# ...           docflow-360-frontend   Up (healthy)
# ...           docflow-360-landing    Up (healthy)
# ...           docflow-360-core-api   Up (healthy)
# ...           docflow-360-mongodb    Up (healthy)
# ...           docflow-360-redis      Up (healthy)
```

---

## 🎓 Architecture Philosophy

This implements **Independent Services with Shared Dev Harness**:

### What This IS:

- ✅ **Multiple independent services** - Each has its own codebase, dependencies, and deployment
- ✅ **Path-based CI/CD triggers** - Each service deploys independently
- ✅ **Shared dev orchestration** - Docker Compose + npm scripts for local convenience
- ✅ **API-only communication** - No cross-service code imports
- ✅ **Flat structure** - Clear, maintainable organization
- ✅ **Independent versioning** - Each service manages its own versions

### What This ISN'T:

- ❌ NOT a traditional monorepo (no workspace management)
- ❌ NOT a monolith (each service is completely independent)
- ❌ NOT coordinated deployments (services deploy separately)

**Result**: Services are truly independent, each has its own deployment pipeline, and development remains convenient.

---

**Questions or issues?** Check the individual service READMEs for detailed information.
