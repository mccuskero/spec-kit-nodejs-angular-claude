<!--
═══════════════════════════════════════════════════════════════════════════════
SYNC IMPACT REPORT - Constitution Update
═══════════════════════════════════════════════════════════════════════════════

Version Change: 1.1.0 → 1.1.1
Date: 2025-12-13
Type: PATCH - Clarification and refinement of frontend folder structure

SECTIONS MODIFIED:
- Folder Structure: Enhanced frontend structure with detailed module organization

CHANGES SUMMARY:
- Expanded frontend/src/app/ structure to show feature modules organization
- Added modules/ subdirectory with 5 feature modules:
  * login - Authentication screen
  * dashboard - User content overview
  * user-profile - User settings management
  * content-management - Content CRUD operations
  * taxonomy-management - Vocabulary and taxonomy management
- Each module follows Angular feature module pattern:
  * components/ - Screen components
  * services/ - Feature-specific logic
  * routing/ - Module routing configuration
  * models/ - TypeScript interfaces
- Added app-routing.module.ts for lazy loading coordination

RATIONALE FOR VERSION BUMP:
- This is a PATCH bump because it clarifies existing structure without changing principles
- No new requirements added - just detailed specification of the folder layout
- Backward compatible - existing structure still valid, now more precisely defined

TEMPLATE CONSISTENCY STATUS:
✅ plan-template.md - No updates needed (uses general structure)
✅ spec-template.md - No updates needed
✅ tasks-template.md - Task file paths will now reference specific modules
✅ agent-file-template.md - No updates needed
✅ checklist-template.md - No updates needed

FOLLOW-UP ACTIONS:
- None - This is a documentation refinement

PREVIOUS UPDATES:
═══════════════════════════════════════════════════════════════════════════════
Version Change: 1.0.0 → 1.1.0
Date: 2025-12-13
Type: MINOR - Material expansion of testing guidance

MODIFIED PRINCIPLES:
- Principle II (Comprehensive Testing)
  OLD: Static 40% coverage target
  NEW: Evolving coverage roadmap (40% → 60% → 80% across release phases)

CHANGES SUMMARY:
- Added "Coverage Roadmap" subsection to Principle II
- Defined three phases: Alpha (40%), Beta (60%), Production (80%)
- Established measurement criteria and exemptions policy
- Created continuous quality improvement expectation
═══════════════════════════════════════════════════════════════════════════════
Version Change: INITIAL → 1.0.0
Date: 2025-12-13
Type: Initial Constitution Ratification

PRINCIPLES DEFINED:
1. Security First - Authentication, no direct DB access, secrets management
2. Comprehensive Testing - Automated testing, CI/CD gates, 40% coverage target
3. Modularity and Separation of Concerns - Independent services, REST API only
4. Scalability and Extensibility - Independent deployment, future microservices
5. Consistency and Documentation - READMEs, linting, formatting standards

SECTIONS ADDED:
- High-Level Architecture (system overview, backend components)
- Folder Structure (detailed directory tree for frontend/backend)
- Technology Stack (Frontend: Angular/TypeScript, Backend: C#/Orchard Core)
- Deployment & Environment (configuration, deployment, versioning, logging)
- Governance (architectural review, PR standards, living document policy)
═══════════════════════════════════════════════════════════════════════════════
-->

# Orchard Core Polyglot Application Constitution

## Overview

This document defines the foundational principles, architecture, and structural framework for the Custom Orchard Core–based polyglot application called ETS-CMS

The project comprises two primary layers:
- **Frontend:** Angular-based user interface built with Node.js/JavaScript/TypeScript
- **Backend:** Modular C# services built atop Orchard Core, with components for authentication, content management, and taxonomy

**Orchard Core Location:** `./3rd-party/orchard-core` (deployed via existing `docker-compose.yml`)

---

## Core Principles

### I. Security First

All endpoints MUST authenticate via Orchard Identity or token-based authentication (JWT). No direct database connections from the frontend are allowed. Secrets and credentials MUST be stored in environment variables, never in source code.

**Rationale:** Security is non-negotiable in a CMS-based application handling user authentication and content management. Direct database access from frontend creates multiple attack vectors. Environment-based secrets enable secure CI/CD and deployment workflows.

**Testing Requirement:** All API endpoints require authentication tests; unauthorized access attempts must return 401/403 status codes.

### II. Comprehensive Testing

Both frontend and backend require automated tests (unit, integration, and end-to-end). All merges to main branch MUST pass CI/CD testing. ETS-CMS follows an evolving test coverage policy that demonstrates continuous quality improvement across release phases.

**Rationale:** A polyglot stack (Angular + C#/Orchard Core) requires rigorous testing to catch integration issues early. The phased coverage approach balances velocity with quality, allowing rapid initial development while establishing progressively higher quality standards as the product matures.

**Testing Requirement:**
- Backend: xUnit/NUnit for unit tests, integration tests for Orchard Core modules
- Frontend: Jasmine/Karma for unit tests, Cypress for e2e tests
- CI/CD pipeline MUST block merges if tests fail
- Coverage reports MUST be generated for every build

**Coverage Roadmap** (Continuous Quality Improvement):

| Phase | Minimum Coverage | Trigger | Enforcement |
|-------|-----------------|---------|-------------|
| **Alpha** (Current) | 40% | Initial development through first internal release | CI warning if below threshold |
| **Beta** | 60% | First external user testing / public beta release | CI blocks merge if below threshold |
| **Production** | 80% | Production release / GA availability | CI blocks merge if below threshold |

**Measurement Criteria:**
- Coverage measured as combined line coverage across frontend and backend codebases
- Separate coverage reports maintained for frontend (JavaScript/TypeScript) and backend (C#)
- Each service MUST meet the phase-appropriate threshold independently
- Legacy code without tests: Document as technical debt, plan remediation

**Exemptions Policy:**
- Code generated by frameworks (Orchard Core scaffolding, Angular CLI generated files) exempt from coverage calculation
- Configuration files, DTOs, and simple models may be exempt if they contain no business logic
- All exemptions MUST be documented in `.coveragerc` or equivalent configuration file with justification

**Phase Transition Requirements:**
Before transitioning to a higher phase, the project MUST:
1. Meet the new coverage threshold for at least 2 consecutive sprints
2. Document all exempted code with clear justification
3. Update CI/CD pipeline to enforce the new threshold
4. Conduct a coverage quality review (not just quantity - tests must be meaningful)

### III. Modularity and Separation of Concerns

Each backend service (e.g., Auth, CMS, Taxonomy) operates as an independent project under `/backend/services/`. The frontend communicates ONLY through the official Orchard Core REST API layer.

**Rationale:** Modular architecture enables independent development, testing, and deployment of services. API-only communication enforces clear contracts and prevents tight coupling between frontend and backend implementation details.

**Testing Requirement:** Contract tests MUST verify API interfaces remain stable across service updates.

### IV. Scalability and Extensibility

Frontend and backend MUST be deployable independently. The backend MUST support future microservices (e.g., analytics, media management) without requiring frontend changes.

**Rationale:** Independent deployment enables faster iteration cycles and reduces deployment risk. Extensibility design accommodates future requirements without architectural rewrites.

**Design Requirement:** All new services MUST expose REST APIs; frontend MUST NOT assume specific backend implementation.

### V. Consistency and Documentation

Every module MUST include a README describing functionality, dependencies, and API endpoints. Code MUST follow shared linting and formatting guidelines.

**Rationale:** Polyglot projects require extra documentation discipline to maintain team velocity. Consistent tooling (ESLint for TypeScript, StyleCop/EditorConfig for C#) reduces cognitive load during code reviews.

**Documentation Requirement:**
- Each service: README with purpose, endpoints, local setup
- Shared guidelines: `.editorconfig`, `eslint.config.js`, `.csharpierrc`

---

## High-Level Architecture

### System Overview

```
┌─────────────────────────┐
│  Frontend (Angular)     │
│  - TypeScript/SCSS      │
│  - Components/Services  │
└───────────┬─────────────┘
            │
       HTTPS REST API
            │
┌───────────▼─────────────┐
│  Backend (Orchard Core) │
│  + C# Services          │
│  ┌───────────────────┐  │
│  │ Auth Service      │  │
│  │ CMS Service       │  │
│  │ Taxonomy Service  │  │
│  │ API Gateway       │  │
│  └───────────────────┘  │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  Storage Layer          │
│  - SQL Server/Postgres  │
│  - File Storage         │
│  - Taxonomy Repository  │
└─────────────────────────┘
```

### Backend Components

**Orchard Core Services** (provided by framework):
- **Auth Service:** Manages login, token issuance, and Orchard Core identity integration
- **Content Management Service:** Handles file CRUD operations via Orchard Core content APIs

**Custom Services** (project-specific):
- **Taxonomy Service:** Manages tagging, hierarchical categories, and taxonomy frameworks for content classification
- **Gateway/API Layer:** Unifies backend services into a RESTful interface consumed by the Angular frontend

Each component communicates internally via HTTP APIs. Future consideration: message buses (Kafka/RabbitMQ) for async operations.

---

## Folder Structure

```
/
├── 3rd-party/
│   └── orchard-core/          # Orchard Core deployment (docker-compose.yml)
│
├── frontend/                   # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/       # Feature modules (lazy-loaded)
│   │   │   │   ├── login/
│   │   │   │   │   ├── components/    # Login screen components
│   │   │   │   │   ├── services/      # Authentication logic
│   │   │   │   │   ├── routing/       # Login module routes
│   │   │   │   │   ├── models/        # Auth-related TypeScript interfaces
│   │   │   │   │   └── login.module.ts
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── components/    # Dashboard screen components
│   │   │   │   │   ├── services/      # Dashboard data handling
│   │   │   │   │   ├── routing/       # Dashboard routes
│   │   │   │   │   ├── models/        # Dashboard data models
│   │   │   │   │   └── dashboard.module.ts
│   │   │   │   ├── user-profile/
│   │   │   │   │   ├── components/    # Profile settings components
│   │   │   │   │   ├── services/      # User profile management
│   │   │   │   │   ├── routing/       # Profile routes
│   │   │   │   │   ├── models/        # User profile interfaces
│   │   │   │   │   └── user-profile.module.ts
│   │   │   │   ├── content-management/
│   │   │   │   │   ├── components/    # Content CRUD components
│   │   │   │   │   ├── services/      # Content service (add, edit, delete, search, filter)
│   │   │   │   │   ├── routing/       # Content management routes
│   │   │   │   │   ├── models/        # Content item interfaces
│   │   │   │   │   └── content-management.module.ts
│   │   │   │   └── taxonomy-management/
│   │   │   │       ├── components/    # Taxonomy and vocabulary components
│   │   │   │       ├── services/      # Taxonomy creation and management
│   │   │   │       ├── routing/       # Taxonomy routes
│   │   │   │       ├── models/        # Taxonomy and vocabulary interfaces
│   │   │   │       └── taxonomy-management.module.ts
│   │   │   ├── shared/        # Shared components, directives, pipes
│   │   │   │   ├── components/
│   │   │   │   ├── directives/
│   │   │   │   └── pipes/
│   │   │   ├── core/          # Singleton services, guards, interceptors
│   │   │   │   ├── services/
│   │   │   │   ├── guards/
│   │   │   │   └── interceptors/
│   │   │   ├── app.component.ts
│   │   │   ├── app.module.ts
│   │   │   └── app-routing.module.ts  # Main routing (lazy loading configuration)
│   │   ├── assets/            # Static assets (images, fonts, etc.)
│   │   └── styles/            # Global styles
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── angular.json
│   ├── package.json
│   └── README.md
│
├── backend/                    # Backend root directory
│   ├── OrchardCoreApp/         # Orchard Core main app
│   │   ├── CmsCore/
│   │   ├── Modules/
│   │   └── Themes/
│   ├── services/
│   │   └── TaxonomyService/
│   │       ├── TaxonomyService.csproj
│   │       ├── Controllers/
│   │       ├── Models/
│   │       └── README.md
│   ├── shared/
│   │   ├── Utilities/
│   │   └── CommonModels/
│   ├── tests/
│   │   ├── UnitTests/
│   │   └── IntegrationTests/
│   ├── Backend.sln
│   └── README.md
│
├── docs/                       # Documentation (architecture, workflows)
│   └── architecture/           # Architectural decision records
│
├── scripts/                    # Deployment, migrations, setup scripts
│
├── .env.example
└── constitution.md             # This file (symlink to .specify/memory/constitution.md)
```

**Frontend Module Pattern:**

Each feature module is self-contained and follows Angular best practices:
- **components/**: UI components specific to the feature
- **services/**: Business logic and data handling for the feature
- **routing/**: Route definitions and navigation logic
- **models/**: TypeScript interfaces and types
- **[feature].module.ts**: Feature module definition with lazy loading support

**Module Descriptions:**
- **login**: Authentication screen with username/password input
- **dashboard**: User content overview with summary statistics
- **user-profile**: User settings management (username, password, preferences)
- **content-management**: Content CRUD operations with search and filtering
- **taxonomy-management**: Vocabulary creation and hierarchical taxonomy management

**Note:** The folder structure supports independent deployment (frontend/backend separation) while maintaining clear service boundaries within the backend. Frontend uses Angular's modular architecture with lazy loading for optimal performance.

---

## Technology Stack

### Frontend

- **Language:** TypeScript/JavaScript
- **Framework:** Angular (v16+)
- **Package Manager:** npm or yarn
- **Testing:** Jasmine, Karma (unit), Cypress (e2e)
- **Build Tool:** Angular CLI
- **Auth Library:** OAuth2/JWT Interceptor via Angular HttpClient
- **Styling:** SCSS
- **Linting:** ESLint with TypeScript support

### Backend

- **Language:** C# (target .NET 8 or higher)
- **Framework:** [Orchard Core CMS](https://orchardcore.net/)
- **Architecture:** Modular microservices with REST APIs
- **Authentication:** Orchard Identity + JWT
- **Database:** SQL Server or PostgreSQL
- **ORM:** Entity Framework Core
- **Testing:** xUnit or NUnit
- **Logging:** Serilog with structured logging
- **API Documentation:** Swagger/OpenAPI (recommended)

### Infrastructure

- **Containerization:** Docker (Orchard Core via docker-compose.yml)
- **Orchestration:** Kubernetes or Azure App Service (production)
- **CI/CD:** GitHub Actions or Azure DevOps (to be determined)
- **Observability:** OpenTelemetry (future), Serilog (immediate)

---

## Deployment & Environment

### 1. Environment Configuration

- Required environment variables are defined in `.env.example` and MUST NOT be committed with secrets
- Each service loads environment-specific configs (e.g., `ASPNETCORE_ENVIRONMENT`, `DB_CONNECTION_STRING`)
- Frontend environment files: `environment.ts` (dev), `environment.prod.ts` (prod)
- Backend configuration: `appsettings.json`, `appsettings.Development.json`, `appsettings.Production.json`

**Critical Variables:**
- `DB_CONNECTION_STRING`: Database connection (backend)
- `JWT_SECRET`: Token signing key (backend)
- `API_BASE_URL`: Backend API endpoint (frontend)
- `ORCHARD_ADMIN_PASSWORD`: Initial admin password (deployment only)

### 2. Deployment Guidelines

- **Frontend:** Builds to `/frontend/dist` and is served via NGINX or Orchard Core static file middleware
- **Backend services:** Deploy as independent Docker containers on Kubernetes or Azure App Service
- **Orchard Core:** Deployed via `docker-compose.yml` in `./3rd-party/orchard-core`
- **Database migrations:** Executed via EF Core migrations before service startup

**Deployment Sequence:**
1. Database migrations
2. Backend services (Orchard Core first, then custom services)
3. Frontend build and deployment
4. Health checks and smoke tests

### 3. Versioning and Migration

- **Semantic versioning (MAJOR.MINOR.PATCH)** applies to all services
- **Database migrations:** Tracked via EF Core migrations, committed under `/backend/scripts/migrations`
- **API versioning:** Use URL versioning (`/api/v1/`, `/api/v2/`) for breaking changes
- **Breaking changes:** MUST be documented and communicated before deployment

**Version Bump Policy:**
- MAJOR: Breaking API changes, incompatible schema changes
- MINOR: New features, backward-compatible API additions
- PATCH: Bug fixes, non-breaking improvements

### 4. Logging and Observability

- Each service MUST use structured logging (Serilog for C#, Angular logging service for frontend)
- Log levels: ERROR (always), WARN (production), INFO (staging), DEBUG (development)
- Metrics exported via OpenTelemetry when available
- Frontend errors captured and sent to backend logging endpoint

**Required Log Data:**
- Timestamp (ISO 8601)
- Service name and version
- Request ID (correlation across services)
- User ID (if authenticated)
- Error stack traces (ERROR level only)

---

## Governance

### Amendment Process

1. All major design changes require architectural review approval
2. PRs modifying this constitution MUST:
   - Include rationale for the change
   - Update the version number according to semantic versioning
   - Update dependent templates (plan, spec, tasks)
   - Be approved by at least one project maintainer
3. This constitution is a living document—updated only through approved pull requests

### Compliance and Review

- PRs MUST follow established code style and naming conventions
- Code reviews MUST verify compliance with constitution principles
- Complexity that violates principles (e.g., direct DB access) MUST be justified in plan.md Complexity Tracking table
- Constitution violations without justification block PR approval

### Principle Conflicts

- When principles conflict (e.g., Modularity vs. Simplicity), document trade-offs in architectural decision records (ADRs) under `/docs/architecture/`
- Security First takes precedence over all other principles
- Testing requirements can be deferred only with explicit technical debt tracking

---

**Version**: 1.1.1 | **Ratified**: 2025-12-13 | **Last Amended**: 2025-12-13
