# Implementation Plan: User Dashboard

**Branch**: `002-user-dashboard` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-user-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a two-panel dashboard interface for authenticated users featuring a collapsible navigation menu (30% width) and main workspace (70% width). The dashboard provides navigation between Shared Blog, File, and Change Logs sections, with repository location toggle (Local/Shared) and folder-based file management capabilities. Built on Angular 16+ with Orchard Core backend integration.

## Technical Context

**Language/Version**: TypeScript 5.0+ (frontend), C# .NET 8+ (backend via Orchard Core)
**Primary Dependencies**: Angular 16+, Angular Forms (ReactiveFormsModule), Angular Router, Angular HttpClient, Orchard Core Content Management APIs, Orchard Core Identity (authentication)
**Storage**: Orchard Core content repository (SQL Server/PostgreSQL), Session Storage (navigation state persistence)
**Testing**: Jasmine/Karma (Angular unit tests), Cypress (E2E tests), xUnit (backend Orchard Core module tests)
**Target Platform**: Desktop/laptop browsers (Chrome, Firefox, Safari, Edge) - minimum 1024px width
**Project Type**: Web application (Angular frontend + Orchard Core backend)
**Performance Goals**: Page transitions <2s, navigation collapse animation <300ms, workspace content load <2s, initial dashboard load <3s
**Constraints**: Navigation menu must remain accessible (always toggleable), folder hierarchy limited to 10 levels, responsive from 1024px to 4K, repository toggle affects all sections globally
**Scale/Scope**: 5 user stories, 20 functional requirements, 3 major navigation sections, hierarchical folder structure with CRUD operations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Security First

- **Authentication**: Dashboard is protected route requiring valid JWT token from login (001-login-screen)
- **Authorization**: All API calls to Orchard Core Content Management APIs use authenticated HttpClient with JWT interceptor
- **No Direct DB Access**: Frontend communicates ONLY via Orchard Core REST APIs
- **Session Management**: Navigation state persisted in browser session storage (not sensitive data)

**Compliance**: PASS - All endpoints authenticated via existing auth.service.ts from 001-login-screen

### ✅ II. Comprehensive Testing

- **Unit Tests**: Angular component tests (Jasmine/Karma) for dashboard layout, navigation menu, workspace components
- **Integration Tests**: Service tests for API communication with Orchard Core
- **E2E Tests**: Cypress tests for complete user flows (navigation, folder creation, repository toggle)
- **Coverage Target**: Alpha phase (40% minimum) - established in constitution roadmap

**Compliance**: PASS - Testing strategy aligns with constitution Phase coverage requirements

### ✅ III. Modularity and Separation of Concerns

- **Frontend Module**: Dashboard feature module under `/frontend/src/app/modules/dashboard/` (per constitution folder structure)
- **Backend Integration**: Uses existing Orchard Core Content Management APIs (no custom backend service required for dashboard itself)
- **Component Separation**: Navigation menu, workspace, header as distinct components
- **Service Layer**: Dashboard service for state management, content service for folder/file operations

**Compliance**: PASS - Follows Angular feature module pattern defined in constitution v1.1.1

### ✅ IV. Scalability and Extensibility

- **Lazy Loading**: Dashboard module lazy-loaded via app-routing.module.ts
- **Extensibility**: New sections (beyond Shared Blog, File, Change Logs) can be added without breaking existing navigation
- **Independent Deployment**: Frontend changes do not require backend redeployment (API contracts remain stable)
- **Future Considerations**: Mobile optimization deferred to future iteration (per spec assumptions)

**Compliance**: PASS - Designed for extensibility without architectural changes

### ✅ V. Consistency and Documentation

- **README**: Dashboard module README documenting components, routing, state management
- **Linting**: ESLint with TypeScript configuration (inherited from frontend setup)
- **Code Style**: SCSS for styling, Angular style guide compliance
- **API Documentation**: Orchard Core Content Management API endpoints documented in contracts/

**Compliance**: PASS - Will include module-level README and follow established conventions

**GATE STATUS**: ✅ APPROVED - All constitutional principles satisfied. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-user-dashboard/
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
│   ├── app/
│   │   ├── modules/
│   │   │   ├── login/                    # Existing (001-login-screen)
│   │   │   └── dashboard/                # NEW - This feature
│   │   │       ├── components/
│   │   │       │   ├── dashboard-container/
│   │   │       │   │   ├── dashboard-container.component.ts
│   │   │       │   │   ├── dashboard-container.component.html
│   │   │       │   │   ├── dashboard-container.component.scss
│   │   │       │   │   └── dashboard-container.component.spec.ts
│   │   │       │   ├── navigation-menu/
│   │   │       │   │   ├── navigation-menu.component.ts
│   │   │       │   │   ├── navigation-menu.component.html
│   │   │       │   │   ├── navigation-menu.component.scss
│   │   │       │   │   └── navigation-menu.component.spec.ts
│   │   │       │   ├── workspace/
│   │   │       │   │   ├── workspace.component.ts
│   │   │       │   │   ├── workspace.component.html
│   │   │       │   │   ├── workspace.component.scss
│   │   │       │   │   └── workspace.component.spec.ts
│   │   │       │   ├── content-section/              # File management section
│   │   │       │   │   ├── content-section.component.ts
│   │   │       │   │   ├── content-section.component.html
│   │   │       │   │   ├── content-section.component.scss
│   │   │       │   │   └── content-section.component.spec.ts
│   │   │       │   ├── folder-list/                  # Table view with selection & actions
│   │   │       │   │   ├── folder-list.component.ts
│   │   │       │   │   ├── folder-list.component.html
│   │   │       │   │   ├── folder-list.component.scss
│   │   │       │   │   └── folder-list.component.spec.ts
│   │   │       │   ├── folder-dialog/                # Create/edit folder dialog
│   │   │       │   │   ├── folder-dialog.component.ts
│   │   │       │   │   ├── folder-dialog.component.html
│   │   │       │   │   ├── folder-dialog.component.scss
│   │   │       │   │   └── folder-dialog.component.spec.ts
│   │   │       │   ├── breadcrumb/                   # Folder navigation breadcrumb
│   │   │       │   │   ├── breadcrumb.component.ts
│   │   │       │   │   ├── breadcrumb.component.html
│   │   │       │   │   ├── breadcrumb.component.scss
│   │   │       │   │   └── breadcrumb.component.spec.ts
│   │   │       │   └── header/
│   │   │       │       ├── dashboard-header.component.ts
│   │   │       │       ├── dashboard-header.component.html
│   │   │       │       ├── dashboard-header.component.scss
│   │   │       │       └── dashboard-header.component.spec.ts
│   │   │       ├── services/
│   │   │       │   ├── dashboard-state.service.ts      # Navigation state, repository selection
│   │   │       │   ├── dashboard-state.service.spec.ts
│   │   │       │   ├── content.service.ts              # Folder/content CRUD via Orchard Core
│   │   │       │   └── content.service.spec.ts
│   │   │       ├── routing/
│   │   │       │   └── dashboard-routing.module.ts
│   │   │       ├── models/
│   │   │       │   ├── dashboard-state.model.ts
│   │   │       │   ├── navigation-section.model.ts
│   │   │       │   ├── folder.model.ts
│   │   │       │   └── content-item.model.ts
│   │   │       ├── dashboard.module.ts
│   │   │       └── README.md
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts          # Existing - protects dashboard route
│   │   │   └── services/
│   │   └── app-routing.module.ts          # Updated - add dashboard lazy route
│   └── environments/
│       ├── environment.ts                  # API_BASE_URL for Orchard Core
│       └── environment.prod.ts
└── cypress/
    └── e2e/
        └── dashboard.cy.ts                 # NEW - Dashboard E2E tests

backend/
└── 3rd-party/orchard-core/                 # Existing - provides Content Management APIs
```

**Structure Decision**: Web application structure following constitution v1.1.1. Dashboard is a new Angular feature module under `frontend/src/app/modules/dashboard/`. Backend requirements satisfied by existing Orchard Core Content Management APIs - no custom backend service needed. Component hierarchy: DashboardContainer (parent) → NavigationMenu + Workspace + DashboardHeader (children).

## File Management Implementation Details

### File List Table Component

The `folder-list` component provides comprehensive file/folder management with:

**Table Structure**:
- **Columns**: Select (checkbox), Name (with icon), Author, Last Updated, Type, Size, Status (badge), Actions (dropdown)
- **Selection**: Multi-select via checkboxes with "Select All" in header
- **Visual Feedback**: Selected rows highlighted with blue background (#e3f2fd)
- **Responsive**: Hides Author column on tablets (<1200px), hides Type/Size on mobile (<768px)

**Features**:
- Row click on Name navigates into folder
- Checkbox selection for bulk operations
- Status badges (Published=green, Draft=gray)
- File type detection from MIME type or extension
- Human-readable file sizes (B, KB, MB, GB, TB)

### Bulk Actions Toolbar

Appears when items are selected:
- **Location**: Above file list table
- **Display**: Selection count + action buttons
- **Actions**: Publish, Unpublish, Delete
- **Behavior**: Executes on all selected items, clears selection after completion
- **Styling**: Blue background (#e3f2fd) to indicate active selection state

### Individual Action Dropdown

Per-row action menu (⋮ button):
- **Options**: Edit, Publish/Unpublish (conditional), Delete
- **Conditional Display**: Shows "Publish" for unpublished items, "Unpublish" for published
- **Styling**: Delete option in red, separated by border
- **Interaction**: Dropdown appears on hover/click, positions to avoid overflow

### File Operations Service

**ContentService** methods:
1. **Query**: `queryFolders()` - GraphQL `folder` query to Orchard Core
2. **Create**: `createFolder()`, `createFile()` - POST /api/content
3. **Update**: `updateFile()` - PUT /api/content/{id}
4. **Delete**: `deleteFile()` - DELETE /api/content/{id}
5. **Publish**: `publishFile()`, `unpublishFile()` - Update published property
6. **Bulk**: `bulkAction()` - forkJoin multiple operations in parallel
7. **Utilities**: `formatFileSize()`, `getFileType()` - Format display values

### GraphQL Integration

**Issue Discovered**: Orchard Core GraphQL limitations
- ❌ No `contentItems` (plural) query
- ✅ Has `folder` query specifically for Folder content type
- ❌ No mutations support (use REST API)

**Solution**:
```graphql
query QueryFolders {
  folder(first: 100) {
    contentItemId
    displayText
    owner
    author
    createdUtc
    modifiedUtc
    published
  }
}
```

**Limitations**:
- Client-side filtering for parent folder (no containedPart in where clause)
- Client-side filtering for repository (no taxonomyPart in where clause)
- Acceptable for <100 items; scale with pagination if needed

### REST API Endpoints

**Working**:
- `POST /api/content` - Create folders/files (with ContentType in body)
- `PUT /api/content/{id}` - Update items
- `DELETE /api/content/{id}` - Delete items
- `POST /api/graphql` - Query folders via GraphQL

**Not Working**:
- `GET /api/content?contentType=Folder` - 405 Method Not Allowed
- `POST /api/content/Folder` - 405 Method Not Allowed
- GraphQL mutations - Not supported by Orchard Core

### Data Models

**Enhanced Models**:
```typescript
ContentItem {
  contentItemId: string;
  contentType: string;
  displayText: string;
  owner: string;
  author?: string;              // NEW
  createdUtc: Date;
  modifiedUtc: Date;
  published: boolean;
  contentSize?: number;         // NEW - file size in bytes
  mimeType?: string;            // NEW - file MIME type
  fileExtension?: string;       // NEW - file extension
  containedPart: ContainedPart;
  taxonomyPart: TaxonomyPart;
}

CreateFileRequest {
  displayText: string;
  repository: string;
  parentFolderId: string;
  contentType?: string;
  fileData?: any;
}

BulkActionRequest {
  contentItemIds: string[];
  action: 'publish' | 'unpublish' | 'delete';
}
```

### Component Interaction Flow

1. **User selects File section** → Workspace loads ContentSectionComponent
2. **ContentSectionComponent** calls ContentService.queryFolders()
3. **ContentService** sends GraphQL query to Orchard Core
4. **Orchard Core** returns folder array
5. **FolderListComponent** displays folders/files in table
6. **User selects items** → Selection state updated in component
7. **Bulk Actions Toolbar** appears with action buttons
8. **User clicks Publish** → ContentService.bulkAction() called
9. **ContentService** uses forkJoin to execute parallel REST API calls
10. **List refreshes** after successful completion

### Performance Considerations

- **Lazy Loading**: Dashboard module lazy-loaded
- **Parallel Operations**: Bulk actions use forkJoin
- **Client-Side Filtering**: Acceptable for <100 items
- **Virtual Scrolling**: Not implemented (future enhancement if needed)
- **Caching**: Not implemented (future enhancement if needed)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations detected. All constitutional principles are satisfied.*
