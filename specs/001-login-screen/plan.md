# Implementation Plan: Login Screen

**Branch**: `001-login-screen` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-login-screen/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a secure login screen for ETS-CMS that integrates with existing Orchard Core authentication services. The login screen will provide username and password input fields with show/hide password toggle functionality, client-side validation, and a "Forgot Password?" link placeholder for future password recovery. Upon successful authentication, users will be redirected to the dashboard. The implementation must follow security best practices including generic error messages, HTTPS-only transmission, and session management via Orchard Core.

## Technical Context

**Language/Version**: TypeScript 5.0+ (frontend), C# .NET 8+ (backend via Orchard Core)
**Primary Dependencies**: Angular 16+, Angular Forms (ReactiveFormsModule), Angular Router, Angular HttpClient, Orchard Core Identity APIs
**Storage**: N/A (authentication state managed by Orchard Core session/JWT tokens)
**Testing**: Jasmine/Karma (unit tests), Cypress (e2e tests) per Constitution Principle II
**Target Platform**: Web browsers (desktop, tablet, mobile), HTTPS-only communications
**Project Type**: Web application - Frontend module within Angular app
**Performance Goals**: Login form loads in < 3 seconds, authentication response in < 2 seconds, password toggle responds in < 100ms
**Constraints**: Must integrate with existing Orchard Core at `./3rd-party/orchard-core`, HTTPS-only, 40% test coverage minimum (Alpha phase), responsive design (1024px+ primary target)
**Scale/Scope**: Single-page login form, approximately 2-3 components, 1-2 services, 4-5 unit tests, 2-3 e2e tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Security First ✅ PASS

- **Authentication**: Login integrates with Orchard Core Identity/JWT authentication - no custom auth
- **No Direct DB Access**: Frontend communicates only via Orchard Core REST APIs
- **Secrets Management**: No secrets in frontend code - all auth handled by backend
- **HTTPS Only**: Enforced at infrastructure level for all authentication requests
- **Testing**: Will include tests for 401/403 responses on authentication failures

**Status**: Compliant. All authentication delegated to Orchard Core.

### Principle II: Comprehensive Testing ✅ PASS

- **Test Coverage**: Target 40% minimum (Alpha phase)
- **Test Types**: Unit tests (Jasmine/Karma), e2e tests (Cypress)
- **CI/CD**: Tests must pass before merge (will be configured)
- **Coverage Reporting**: Will generate coverage reports per build

**Planned Tests**:
- Unit: Login component, authentication service, form validation, password toggle
- Integration: Orchard Core API communication
- E2E: Successful login flow, failed login flow, validation errors

**Status**: Compliant. Test plan meets 40% Alpha threshold.

### Principle III: Modularity and Separation of Concerns ✅ PASS

- **Module Independence**: Login is a self-contained Angular feature module at `frontend/src/app/modules/login/`
- **API Communication**: Only via Orchard Core REST endpoints - no tight coupling
- **Service Separation**: Authentication service handles all API calls, components handle only UI

**Status**: Compliant. Login module is independently testable and deployable.

### Principle IV: Scalability and Extensibility ✅ PASS

- **Independent Deployment**: Frontend module can be deployed independently
- **API Contract**: Uses standard Orchard Core authentication endpoints - backend changes won't break frontend
- **Future Extensibility**: Forgot Password link placeholder enables future password reset without architectural changes

**Status**: Compliant. Standard REST API integration supports future enhancements.

### Principle V: Consistency and Documentation ✅ PASS

- **Module README**: Will create `frontend/src/app/modules/login/README.md` documenting functionality and setup
- **Linting**: Will follow ESLint configuration (`.eslintrc.json`)
- **Formatting**: Will follow EditorConfig (`.editorconfig`)
- **API Documentation**: Orchard Core endpoints documented in contracts/

**Status**: Compliant. Documentation and tooling standards will be met.

### Overall Constitution Compliance: ✅ ALL GATES PASSED

No violations. No complexity justifications required.

---

**Post-Design Re-evaluation** (after Phase 1):

All principles remain compliant after completing research, data models, and API contracts:
- ✅ Security First: Orchard Core API contract confirmed, HTTPS enforced, JWT token management designed
- ✅ Comprehensive Testing: Test strategy defined in research.md, unit/e2e test structures planned
- ✅ Modularity: Data models and services fully decoupled, clear API boundaries in contracts/
- ✅ Scalability: Standard REST API contracts allow backend changes without frontend impact
- ✅ Documentation: quickstart.md, research.md, data-model.md, contracts/ all complete

**Result**: Constitution compliance maintained through design phase.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   └── app/
│       ├── modules/
│       │   └── login/                    # Login feature module
│       │       ├── components/
│       │       │   ├── login-form/       # Main login form component
│       │       │   │   ├── login-form.component.ts
│       │       │   │   ├── login-form.component.html
│       │       │   │   ├── login-form.component.scss
│       │       │   │   └── login-form.component.spec.ts
│       │       │   └── password-toggle/  # Password show/hide toggle component
│       │       │       ├── password-toggle.component.ts
│       │       │       ├── password-toggle.component.html
│       │       │       ├── password-toggle.component.scss
│       │       │       └── password-toggle.component.spec.ts
│       │       ├── services/
│       │       │   └── auth.service.ts    # Authentication API service
│       │       │   └── auth.service.spec.ts
│       │       ├── routing/
│       │       │   └── login-routing.module.ts
│       │       ├── models/
│       │       │   ├── login-request.model.ts
│       │       │   └── auth-response.model.ts
│       │       ├── login.module.ts
│       │       └── README.md
│       └── core/
│           └── interceptors/
│               └── auth.interceptor.ts    # HTTP interceptor for auth tokens
│
├── cypress/
│   └── e2e/
│       └── login.cy.ts                   # End-to-end login tests
│
└── environments/
    ├── environment.ts                     # Dev: Orchard Core API URL
    └── environment.prod.ts                # Prod: Orchard Core API URL

3rd-party/
└── orchard-core/                         # Existing Orchard Core deployment
    └── docker-compose.yml
```

**Structure Decision**: Web application (Option 2 - frontend/backend). This feature implements only the frontend login module. The backend authentication is provided by existing Orchard Core at `./3rd-party/orchard-core`. The login module follows Angular feature module pattern with components, services, routing, and models subdirectories as specified in the constitution's folder structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations. All gates passed.
