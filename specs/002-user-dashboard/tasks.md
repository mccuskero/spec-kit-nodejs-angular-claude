# Implementation Tasks: User Dashboard

**Feature**: User Dashboard
**Branch**: `002-user-dashboard`
**Generated**: 2025-12-13
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md) | **Data Model**: [data-model.md](./data-model.md)

---

## Task Summary

| Phase | User Story | Task Count | Independent Test |
|-------|------------|------------|------------------|
| Phase 1 | Setup | 8 tasks | Environment verification |
| Phase 2 | Foundational | 7 tasks | Auth guard, routing, state service tests |
| Phase 3 | US1 - Dashboard Layout (P1) | 12 tasks | Layout, header, collapse/expand |
| Phase 4 | US2 - Navigation Menu (P1) | 10 tasks | Section navigation, repository toggle |
| Phase 5 | US5 - Folder Management (P1) | 14 tasks | Folder CRUD, breadcrumbs, content list |
| Phase 6 | US3 - Profile Access (P2) | 4 tasks | User icon navigation |
| Phase 7 | US4 - Logout (P2) | 5 tasks | Session termination, redirect |
| Phase 8 | Polish & Integration | 8 tasks | E2E tests, performance, documentation |
| **Total** | **5 user stories** | **68 tasks** | **8 test milestones** |

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Goal**: Deliver core dashboard functionality for immediate user value.

**MVP Includes**:
- Phase 1: Setup ✓
- Phase 2: Foundational ✓
- Phase 3: User Story 1 - Dashboard Layout ✓
- Phase 4: User Story 2 - Navigation Menu ✓

**MVP Test Criteria**:
- User can log in and see dashboard with collapsible navigation
- User can navigate between Shared Blog, File, Change Logs sections
- User can toggle repository location (Local/Shared)
- Navigation state persists across page refresh

**Post-MVP**:
- Phase 5: Folder Management (core content feature)
- Phase 6-7: Profile and Logout (account management)
- Phase 8: Polish (performance, E2E, docs)

### Incremental Delivery

1. **Week 1**: Setup + Foundational + US1 (Dashboard Layout)
2. **Week 2**: US2 (Navigation) + Begin US5 (Folder CRUD)
3. **Week 3**: Complete US5 + US3/US4 (Profile/Logout)
4. **Week 4**: Polish, E2E testing, performance optimization

---

## Dependency Graph

### User Story Completion Order

```
Setup (Phase 1)
  ↓
Foundational (Phase 2) ← MUST COMPLETE BEFORE USER STORIES
  ↓
┌─────────────────────────────────────────────────┐
│  P1 Stories (Can run in parallel after Phase 2) │
├─────────────────────────────────────────────────┤
│  US1: Dashboard Layout (Phase 3)                │
│  US2: Navigation Menu (Phase 4)                 │
│  US5: Folder Management (Phase 5)               │
└─────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────┐
│  P2 Stories (Can run in parallel)               │
├─────────────────────────────────────────────────┤
│  US3: Profile Access (Phase 6)                  │
│  US4: Logout (Phase 7)                          │
└─────────────────────────────────────────────────┘
  ↓
Polish & Integration (Phase 8)
```

### Critical Path

**Blocking Dependencies**:
1. Phase 1 (Setup) blocks everything
2. Phase 2 (Foundational) blocks all user stories
3. US1 (Layout) should complete before US2 (Navigation) for UI consistency
4. US2 (Navigation) should complete before US5 (Folder Management) for workspace routing

**Parallel Opportunities** (marked with [P]):
- Within each phase, tasks marked [P] can run concurrently
- US3 and US4 are fully independent and can run in parallel
- Component and service implementations often parallelizable

---

## Phase 1: Setup & Environment

**Goal**: Initialize project structure, install dependencies, configure Orchard Core.

**Prerequisites**: Repository cloned, Docker installed, Node.js 18+, Angular CLI 16+

**Success Criteria**:
- ✓ Angular dev server starts successfully
- ✓ Orchard Core running on port 5000
- ✓ Can authenticate and receive JWT token
- ✓ All required Orchard modules enabled

### Tasks

- [ ] T001 Verify Node.js version >= 18.0.0 and npm >= 9.0.0
- [ ] T002 Install Angular CLI globally: `npm install -g @angular/cli@16`
- [ ] T003 Navigate to frontend/ and run `npm install` to install dependencies
- [ ] T004 Install @angular/animations: `npm install @angular/animations@^16.0.0`
- [ ] T005 Install @angular/cdk: `npm install @angular/cdk@^16.0.0`
- [ ] T006 Start Orchard Core via Docker: `cd 3rd-Party/OrchardCore && docker-compose up -d`
- [ ] T007 Configure Orchard Core: Enable modules (ContentManagement, Lists, Taxonomies, OpenId, GraphQL) via Admin UI at http://localhost:5000
- [ ] T008 Create Repository taxonomy in Orchard with terms "Local" and "Shared", create Folder content type with TitlePart, ListPart, TaxonomyPart, ContainedPart

**Independent Test**: Run `npm start` → should start on port 4200. Visit http://localhost:5000 → should see Orchard admin panel.

---

## Phase 2: Foundational Infrastructure

**Goal**: Establish shared services, routing, guards, and state management before implementing user stories.

**Prerequisites**: Phase 1 complete

**Success Criteria**:
- ✓ Dashboard route protected by auth guard
- ✓ State service can persist navigation state to session storage
- ✓ Lazy loading configured for dashboard module
- ✓ All unit tests for foundational services passing

### Tasks

- [ ] T009 [P] Import BrowserAnimationsModule in frontend/src/app/app.config.ts or app.module.ts after BrowserModule
- [ ] T010 [P] Create TypeScript models in frontend/src/app/modules/dashboard/models/dashboard-state.model.ts with DashboardState, NavigationSection, RepositoryLocation interfaces
- [ ] T011 [P] Create frontend/src/app/modules/dashboard/models/navigation-section.model.ts with NavigationMenuItem interface
- [ ] T012 [P] Create frontend/src/app/modules/dashboard/models/folder.model.ts with Folder, ContainedPart, ListPart, TaxonomyPart interfaces
- [ ] T013 [P] Create frontend/src/app/modules/dashboard/models/content-item.model.ts with ContentItem interface
- [ ] T014 Create DashboardStateService in frontend/src/app/modules/dashboard/services/dashboard-state.service.ts using Signal-based state management with session storage persistence
- [ ] T015 Write unit tests for DashboardStateService in frontend/src/app/modules/dashboard/services/dashboard-state.service.spec.ts testing state updates, session storage persistence, and restoration

**Independent Test**: `npm test` → DashboardStateService tests pass. Create instance of DashboardStateService → verify default state loads correctly.

---

## Phase 3: User Story 1 - Dashboard Layout (P1)

**User Story**: A user successfully logs in and lands on the dashboard, which displays a collapsible navigation menu on the left (30% width) and a main workspace on the right (70% width). The user can see their username and user icon in the top header, access navigation options, and toggle the navigation menu to maximize workspace.

**Why P1**: Foundational layout that all other dashboard functionality depends on.

**Prerequisites**: Phase 2 complete

**Success Criteria**:
- ✓ Dashboard displays two-panel layout (30/70 split)
- ✓ Navigation menu can collapse/expand with smooth animation (<300ms)
- ✓ Header shows username, user icon, logout button
- ✓ Layout responsive from 1024px to 4K

**Acceptance Scenarios**:
1. User logs in → sees navigation menu (30% width) and workspace (70% width)
2. Click collapse button → menu collapses to icons only (~5% width), workspace expands
3. Click expand button → menu expands to full labels, workspace returns to 70%
4. Header visible with username, user icon, logout button in top-left

### Tasks

- [ ] T016 [US1] Create dashboard module file frontend/src/app/modules/dashboard/dashboard.module.ts with declarations for all dashboard components
- [ ] T017 [US1] Create dashboard routing in frontend/src/app/modules/dashboard/routing/dashboard-routing.module.ts with lazy loading configuration
- [ ] T018 [P] [US1] Update app routing in frontend/src/app/app-routing.module.ts to add lazy-loaded dashboard route with auth guard protection
- [ ] T019 [P] [US1] Create DashboardContainerComponent in frontend/src/app/modules/dashboard/components/dashboard-container/dashboard-container.component.ts with flexbox layout and animation triggers for sidebarState and workspaceState
- [ ] T020 [P] [US1] Create dashboard container template in frontend/src/app/modules/dashboard/components/dashboard-container/dashboard-container.component.html with two-panel layout structure
- [ ] T021 [P] [US1] Create dashboard container styles in frontend/src/app/modules/dashboard/components/dashboard-container/dashboard-container.component.scss with flexbox, absolute positioning, will-change, transform for GPU acceleration, responsive breakpoints
- [ ] T022 [P] [US1] Create DashboardHeaderComponent in frontend/src/app/modules/dashboard/components/header/dashboard-header.component.ts to display username, user icon, logout button
- [ ] T023 [P] [US1] Create dashboard header template in frontend/src/app/modules/dashboard/components/header/dashboard-header.component.html with header elements
- [ ] T024 [P] [US1] Create dashboard header styles in frontend/src/app/modules/dashboard/components/header/dashboard-header.component.scss
- [ ] T025 [US1] Wire up collapse/expand toggle in DashboardContainerComponent to update sidebarState ('expanded'/'collapsed') and persist to localStorage
- [ ] T026 [US1] Write unit test for DashboardContainerComponent in frontend/src/app/modules/dashboard/components/dashboard-container/dashboard-container.component.spec.ts testing toggle functionality and state persistence
- [ ] T027 [US1] Write unit test for DashboardHeaderComponent in frontend/src/app/modules/dashboard/components/header/dashboard-header.component.spec.ts testing header elements render correctly

**Independent Test**:
1. Run `npm start` → navigate to http://localhost:4200/dashboard
2. Verify two-panel layout visible
3. Click collapse toggle → menu collapses smoothly in <300ms
4. Verify header shows username, user icon, logout button
5. Refresh page → verify collapse state persists

---

## Phase 4: User Story 2 - Navigation Menu Interaction (P1)

**User Story**: A user can navigate between different sections of the application (Shared Blog, File, Change Logs) by clicking navigation menu buttons, and can switch the file location context between Local and Shared Repository using a radio button selector.

**Why P1**: Navigation is critical for accessing all major features.

**Prerequisites**: Phase 3 complete (layout exists)

**Success Criteria**:
- ✓ Navigation menu displays buttons for Shared Blog, File, Change Logs
- ✓ Clicking navigation button updates workspace and highlights active section
- ✓ Repository radio buttons toggle between Local and Shared
- ✓ Repository selection persists across navigation section changes
- ✓ Navigation state persists across page refresh

**Acceptance Scenarios**:
1. Click "Shared Blog" → workspace displays Shared Blog view
2. Click "Content" → workspace displays Content view
3. Click "Change Logs" → workspace displays Change Logs view
4. Toggle repository from Local to Shared → workspace content updates
5. Active section visually highlighted in navigation menu

### Tasks

- [ ] T028 [P] [US2] Create NavigationMenuComponent in frontend/src/app/modules/dashboard/components/navigation-menu/navigation-menu.component.ts with navigation buttons and repository radio selector
- [ ] T029 [P] [US2] Create navigation menu template in frontend/src/app/modules/dashboard/components/navigation-menu/navigation-menu.component.html with buttons for Shared Blog, File, Change Logs and radio buttons for Local/Shared Repository
- [ ] T030 [P] [US2] Create navigation menu styles in frontend/src/app/modules/dashboard/components/navigation-menu/navigation-menu.component.scss with active state highlighting, collapsed/expanded icon display
- [ ] T031 [P] [US2] Create WorkspaceComponent in frontend/src/app/modules/dashboard/components/workspace/workspace.component.ts with router-outlet for section content
- [ ] T032 [P] [US2] Create workspace template in frontend/src/app/modules/dashboard/components/workspace/workspace.component.html
- [ ] T033 [P] [US2] Create workspace styles in frontend/src/app/modules/dashboard/components/workspace/workspace.component.scss
- [ ] T034 [US2] Wire NavigationMenuComponent to DashboardStateService to update currentSection on button click and repositoryLocation on radio button change
- [ ] T035 [US2] Implement router navigation in NavigationMenuComponent to navigate to section routes (/dashboard/shared-blog, /dashboard/file, /dashboard/change-logs)
- [ ] T036 [US2] Add visual highlighting for active section in navigation menu using DashboardStateService.currentSection signal
- [ ] T037 [US2] Write unit test for NavigationMenuComponent in frontend/src/app/modules/dashboard/components/navigation-menu/navigation-menu.component.spec.ts testing navigation button clicks, repository toggle, active state highlighting

**Independent Test**:
1. Navigate to dashboard
2. Click each navigation button → verify workspace updates and URL changes
3. Verify active section highlighted in menu
4. Toggle repository selector → verify state updates
5. Refresh page → verify navigation section and repository selection persist

---

## Phase 5: User Story 5 - Content Folder and File Management (P1)

**User Story**: When a user is in the File section, they can create folders to organize their files and add file items within those folders, enabling hierarchical file organization.

**Why P1**: Core file management capability - File section provides no value without folder creation.

**Prerequisites**: Phase 4 complete (navigation to File section functional)

**Success Criteria**:
- ✓ "Add Folder" button visible in File section
- ✓ Folder creation dialog validates folder name
- ✓ Folders appear in content list after creation
- ✓ Can navigate into folders and see breadcrumb trail
- ✓ "Add Content" button appears when inside a folder
- ✓ Breadcrumb shows current location up to 10 levels deep

**Acceptance Scenarios**:
1. In File section → click "Add Folder" → prompted for folder name → folder created
2. Folder displayed in content list
3. Open folder → see "Add Content" button
4. Add content in folder → content appears in folder view
5. Breadcrumb navigation shows current path

### Tasks

- [ ] T038 [P] [US5] Create ContentService in frontend/src/app/modules/dashboard/services/content.service.ts with methods: createFolder(), queryFolders(), queryContent(), buildBreadcrumb() using Orchard Core API endpoints
- [ ] T039 [P] [US5] Create BreadcrumbItem model interface in frontend/src/app/modules/dashboard/models/breadcrumb-item.model.ts
- [ ] T040 [US5] Implement createFolder() in ContentService to POST /api/content/Folder with DisplayText, Published=true, TaxonomyPart.Repository, ListPart, optional ContainedPart
- [ ] T041 [US5] Implement queryFolders() in ContentService using GraphQL to query folders by repository and optional parent folder ID
- [ ] T042 [US5] Implement buildBreadcrumb() in ContentService to recursively fetch parent folders up to 10 levels and return BreadcrumbItem array
- [ ] T043 [P] [US5] Create folder creation dialog/modal component (or inline form) in File workspace for capturing folder name with validation (1-255 chars, alphanumeric + spaces/hyphens/underscores)
- [ ] T044 [P] [US5] Create folder list display component in File workspace showing folders with folder icons, display text, and click handlers to navigate into folder
- [ ] T045 [P] [US5] Create breadcrumb navigation component to display current folder path with clickable breadcrumb items to navigate up hierarchy
- [ ] T046 [US5] Wire "Add Folder" button in File workspace to open folder creation dialog, call ContentService.createFolder(), refresh folder list on success
- [ ] T047 [US5] Implement folder navigation: clicking folder updates DashboardState.breadcrumbPath, queries child content, updates workspace view
- [ ] T048 [US5] Implement breadcrumb click navigation: clicking breadcrumb item navigates to that folder level, updates breadcrumbPath
- [ ] T049 [US5] Add client-side validation for folder name (non-empty, valid characters) and folder depth (max 10 levels) before API call
- [ ] T050 [US5] Write unit tests for ContentService in frontend/src/app/modules/dashboard/services/content.service.spec.ts using HttpClientTestingModule to mock API calls
- [ ] T051 [US5] Write unit test for folder creation flow: mock ContentService, verify dialog opens, folder created, list refreshed

**Independent Test**:
1. Navigate to File section
2. Click "Add Folder" → enter folder name "Test Folder" → submit
3. Verify folder appears in content list
4. Click folder to open it
5. Verify breadcrumb shows "Home > Test Folder"
6. Create subfolder → verify breadcrumb updates to "Home > Test Folder > Subfolder"
7. Click "Home" in breadcrumb → verify navigation back to root

---

## Phase 6: User Story 3 - User Profile Access (P2)

**User Story**: A user can access their user profile settings by clicking on their user icon in the top header, allowing them to manage personal information, change password, and configure preferences.

**Why P2**: Important for account management but secondary to core navigation and content.

**Prerequisites**: Phase 3 complete (header with user icon exists)

**Success Criteria**:
- ✓ User icon in header is clickable with hover effect
- ✓ Clicking user icon navigates to /profile route
- ✓ Navigating back to dashboard returns to previously active section

**Acceptance Scenarios**:
1. Hover over user icon → see visual indicator (cursor change, hover effect)
2. Click user icon → navigate to user profile screen
3. Navigate back → return to previously active dashboard section

### Tasks

- [ ] T052 [P] [US3] Add click handler to user icon in DashboardHeaderComponent to navigate to /profile route using Angular Router
- [ ] T053 [P] [US3] Add hover styles to user icon in dashboard-header.component.scss (cursor: pointer, hover effect)
- [ ] T054 [US3] Update DashboardStateService to store lastActiveSection before profile navigation and restore on return
- [ ] T055 [US3] Write unit test for user icon click navigation in dashboard-header.component.spec.ts

**Independent Test**:
1. Navigate to dashboard → verify user icon visible in header
2. Hover over icon → verify cursor changes and hover effect appears
3. Click icon → verify navigation to /profile
4. Navigate back → verify dashboard returns to previously active section

**Note**: User profile screen implementation is out of scope for this feature (assumed to exist from separate specification).

---

## Phase 7: User Story 4 - Logout Functionality (P2)

**User Story**: A user can securely log out of the application by clicking the logout button in the top header, which terminates their session and redirects them to the login screen.

**Why P2**: Security feature for session termination, lower priority than core functionality.

**Prerequisites**: Phase 3 complete (header with logout button exists)

**Success Criteria**:
- ✓ Logout button terminates session (clears JWT tokens)
- ✓ Logout redirects to login screen
- ✓ After logout, browser back button does not access dashboard (session invalid)
- ✓ Logout completes in < 3 seconds

**Acceptance Scenarios**:
1. Click "Logout" → session terminated, redirected to login screen
2. After logout, press browser back button → redirected to login (session invalid)
3. Logout clears all authentication tokens and session data

### Tasks

- [ ] T056 [P] [US4] Add logout() method to AuthService (from 001-login-screen) in frontend/src/app/modules/login/services/auth.service.ts to clear JWT tokens and session data
- [ ] T057 [P] [US4] Update DashboardHeaderComponent to call AuthService.logout() on logout button click
- [ ] T058 [US4] Implement logout button click handler in DashboardHeaderComponent to call logout() and navigate to /login
- [ ] T059 [US4] Clear session storage (dashboard state) on logout in addition to JWT tokens
- [ ] T060 [US4] Write unit test for logout flow in dashboard-header.component.spec.ts: verify AuthService.logout() called, router navigates to /login

**Independent Test**:
1. Log in to dashboard
2. Click "Logout" button
3. Verify redirection to login screen occurs
4. Verify JWT tokens cleared from localStorage
5. Press browser back button → verify redirect to login (not dashboard)
6. Try navigating directly to /dashboard → verify redirect to login

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: E2E testing, performance validation, documentation, and final polish.

**Prerequisites**: All user stories (US1-US5) complete

**Success Criteria**:
- ✓ All E2E tests passing (Cypress)
- ✓ 40% code coverage achieved (Alpha phase requirement)
- ✓ Performance metrics met (page transitions <2s, animations <300ms)
- ✓ README and module documentation complete

### Tasks

- [ ] T061 [P] Write E2E test for dashboard layout in frontend/cypress/e2e/dashboard.cy.ts testing two-panel layout, collapse/expand animation, header elements
- [ ] T062 [P] Write E2E test for navigation flow: click each navigation button, verify workspace updates, verify repository toggle
- [ ] T063 [P] Write E2E test for folder management: create folder, navigate into folder, verify breadcrumb, create subfolder
- [ ] T064 [P] Write E2E test for user profile access: click user icon, verify navigation to profile, navigate back
- [ ] T065 [P] Write E2E test for logout: click logout, verify redirect to login, verify session cleared, verify back button redirects to login
- [ ] T066 Run code coverage report: `npm test -- --code-coverage` → verify >= 40% coverage
- [ ] T067 Performance validation: use Chrome DevTools Performance panel to verify collapse/expand animation < 300ms, page transitions < 2s, no layout thrashing
- [ ] T068 Create module README in frontend/src/app/modules/dashboard/README.md documenting components, services, routing, state management, usage examples

**Independent Test**:
1. Run `npm run e2e` → all Cypress tests pass
2. Run `npm test -- --code-coverage` → coverage report shows >= 40%
3. Open dashboard in Chrome DevTools Performance → record collapse/expand → verify < 300ms
4. Navigate between sections → verify < 2s transitions
5. Review README.md → verify comprehensive module documentation

---

## Parallel Execution Examples

### Within Phase 3 (US1 - Dashboard Layout)

**Can run in parallel** (marked with [P]):
- T019-T021: DashboardContainerComponent (component + template + styles)
- T022-T024: DashboardHeaderComponent (component + template + styles)

**Sequential**:
- T016-T018 must complete first (module + routing setup)
- T025 depends on T019 (wiring toggle to component)
- T026-T027 depend on respective components

**Team allocation example**:
- Developer A: T019-T021 (DashboardContainer)
- Developer B: T022-T024 (DashboardHeader)
- Developer C: T016-T018 (Module setup)
→ Merge after all complete → Developer A does T025-T027

### Within Phase 5 (US5 - Folder Management)

**Can run in parallel**:
- T038-T042: ContentService implementation (one developer)
- T043-T045: UI components (folder dialog, folder list, breadcrumb) - three developers

**Sequential**:
- T046-T048 depend on both service (T038-T042) and UI (T043-T045) complete
- T049-T051 are final testing/validation tasks

**Team allocation example**:
- Developer A: T038-T042 (ContentService)
- Developer B: T043 (Folder creation dialog)
- Developer C: T044 (Folder list display)
- Developer D: T045 (Breadcrumb component)
→ After merge: Developer A does T046-T048 (wiring)
→ Developer B does T049-T051 (validation & tests)

---

## Testing Checklist

### Unit Tests (Jasmine/Karma)

Target: 40% code coverage minimum (Alpha phase)

**Services**:
- [ ] DashboardStateService: state updates, persistence, restoration
- [ ] ContentService: API calls (mocked with HttpClientTestingModule), breadcrumb logic

**Components**:
- [ ] DashboardContainerComponent: toggle functionality, state persistence
- [ ] NavigationMenuComponent: button clicks, repository toggle, active highlighting
- [ ] DashboardHeaderComponent: user icon click, logout button click
- [ ] WorkspaceComponent: router-outlet integration
- [ ] Folder creation dialog: validation, API call on submit
- [ ] Folder list: display, click navigation
- [ ] Breadcrumb: display, click navigation

### Integration Tests

**Not required for Alpha phase** but recommended:
- [ ] Full state flow: login → navigate → toggle repository → logout → login → state restored
- [ ] Folder CRUD full cycle: create → list → navigate → breadcrumb → delete

### E2E Tests (Cypress)

**Phase 8 tasks** - covers complete user flows:
- [ ] T061: Dashboard layout and collapse/expand
- [ ] T062: Navigation and repository toggle
- [ ] T063: Folder management full workflow
- [ ] T064: User profile access
- [ ] T065: Logout and session termination

---

## Performance Validation Criteria

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| Navigation menu collapse/expand | < 300ms | Chrome DevTools Performance panel |
| Page transitions (section navigation) | < 2s | Manual testing + Lighthouse |
| Initial dashboard load | < 3s | Lighthouse, Network tab |
| Workspace content load | < 2s | Network tab, GraphQL query time |
| Animation frame rate | 60fps (16.6ms/frame) | Performance panel during animation |
| Repository toggle content update | < 2s | Manual testing |

**Performance task**: T067 validates all metrics

---

## Definition of Done

**For each task**:
- [ ] Code written following Angular style guide
- [ ] TypeScript strict mode compliance (no `any` types)
- [ ] Unit tests written (if applicable)
- [ ] Linting passes: `npm run lint`
- [ ] Builds successfully: `ng build`
- [ ] Peer reviewed (if team environment)

**For each user story phase**:
- [ ] All tasks in phase complete
- [ ] Acceptance scenarios from spec.md verified
- [ ] Independent test criteria passed
- [ ] Unit tests passing
- [ ] No regressions in existing features

**For overall feature**:
- [ ] All 8 phases complete (68 tasks)
- [ ] E2E tests passing
- [ ] 40% code coverage achieved
- [ ] Performance metrics met
- [ ] README documentation complete
- [ ] Spec.md acceptance scenarios verified
- [ ] Ready for integration testing with other features

---

## Risk Mitigation

### High-Risk Areas

1. **Orchard Core Integration**:
   - **Risk**: Folder content type misconfiguration breaks hierarchy
   - **Mitigation**: T008 validates Folder content type, test in Phase 5 before bulk implementation
   - **Fallback**: Detailed quickstart.md (already generated) has step-by-step Orchard setup

2. **Animation Performance**:
   - **Risk**: Layout thrashing causes stuttering animation
   - **Mitigation**: T021 includes will-change and GPU acceleration CSS, T067 validates performance
   - **Fallback**: Use CSS transitions instead of Angular animations if performance issues

3. **State Persistence**:
   - **Risk**: Session storage quota exceeded or data corruption
   - **Mitigation**: T014 implements validation and fallback to defaults, store only IDs not full objects
   - **Fallback**: Degrade gracefully to default state if restoration fails

4. **Breadcrumb Recursion**:
   - **Risk**: Deep folder hierarchy causes slow breadcrumb builds
   - **Mitigation**: T042 enforces 10-level depth limit, client-side caching in T045
   - **Fallback**: Lazy-load breadcrumb on demand instead of pre-computing

### Dependencies on External Systems

**Orchard Core**:
- Required modules: ContentManagement, Lists, Taxonomies, OpenId, GraphQL
- **Mitigation**: T007 validates module enablement, quickstart.md provides detailed setup
- **Verification**: Can test Orchard independently via curl (see quickstart.md health checks)

**Authentication (001-login-screen)**:
- AuthService must exist and provide JWT tokens
- **Mitigation**: Reuse existing service, T009 verifies auth guard integration
- **Verification**: Phase 2 tests auth guard before user story implementation

---

## Success Metrics

### Code Quality

- **Coverage**: >= 40% (T066)
- **Linting**: Zero errors (`npm run lint`)
- **TypeScript**: Strict mode, no `any` types
- **Build**: Zero warnings (`ng build --configuration production`)

### Performance

- **Animation**: < 300ms collapse/expand (T067)
- **Navigation**: < 2s section transitions (T067)
- **Load Time**: < 3s initial dashboard load (T067)
- **Responsiveness**: Functional 1024px to 4K (T021 responsive CSS)

### User Acceptance

All acceptance scenarios from spec.md verified:
- **US1**: 4 scenarios (T026 unit test, T061 E2E test)
- **US2**: 5 scenarios (T037 unit test, T062 E2E test)
- **US3**: 3 scenarios (T055 unit test, T064 E2E test)
- **US4**: 3 scenarios (T060 unit test, T065 E2E test)
- **US5**: 5 scenarios (T051 unit test, T063 E2E test)

### MVP Delivery

**Week 1-2 Target**:
- Phases 1-4 complete (Setup + Foundational + US1 + US2)
- User can navigate dashboard, toggle repository, see different sections
- **Value Delivered**: Functional dashboard navigation ready for content integration

**Week 3 Target**:
- Phase 5 complete (US5 - Folder Management)
- User can create folders, navigate hierarchy, see breadcrumbs
- **Value Delivered**: Complete content management workflow

**Week 4 Target**:
- Phases 6-8 complete (US3, US4, Polish)
- Profile access, logout, E2E tests, performance validated
- **Value Delivered**: Production-ready dashboard feature

---

## Notes

- **Tests Optional**: Unit tests are recommended for 40% coverage but not strictly required if development time is constrained. E2E tests (T061-T065) are higher priority for validating user flows.
- **Backend Setup**: T007-T008 are manual Orchard Core configuration tasks. Refer to quickstart.md for detailed step-by-step instructions.
- **Parallel Development**: Phases 3-5 (P1 stories) can theoretically run in parallel after Phase 2, but US1 (layout) should complete first for UI consistency.
- **Component Library**: Consider using Angular Material for UI components (dialogs, buttons) if available, but spec does not require it. Current tasks assume custom components.
- **Accessibility**: Not explicitly in spec but recommended - add ARIA labels, keyboard navigation (add 3-5 tasks if accessibility required).

---

**Generated By**: `/speckit.tasks` command
**Last Updated**: 2025-12-13
**Total Tasks**: 68
**Estimated Effort**: 3-4 weeks (1 developer) or 2 weeks (team of 3-4)

---

## Quick Reference: File Paths

### Models (T010-T013)
- `frontend/src/app/modules/dashboard/models/dashboard-state.model.ts`
- `frontend/src/app/modules/dashboard/models/navigation-section.model.ts`
- `frontend/src/app/modules/dashboard/models/folder.model.ts`
- `frontend/src/app/modules/dashboard/models/content-item.model.ts`
- `frontend/src/app/modules/dashboard/models/breadcrumb-item.model.ts`

### Services (T014, T038)
- `frontend/src/app/modules/dashboard/services/dashboard-state.service.ts`
- `frontend/src/app/modules/dashboard/services/content.service.ts`

### Components
- `frontend/src/app/modules/dashboard/components/dashboard-container/` (T019-T021)
- `frontend/src/app/modules/dashboard/components/header/` (T022-T024)
- `frontend/src/app/modules/dashboard/components/navigation-menu/` (T028-T030)
- `frontend/src/app/modules/dashboard/components/workspace/` (T031-T033)

### Routing (T017-T018)
- `frontend/src/app/modules/dashboard/routing/dashboard-routing.module.ts`
- `frontend/src/app/app-routing.module.ts`

### Tests
- `frontend/src/app/modules/dashboard/**/*.spec.ts` (unit tests)
- `frontend/cypress/e2e/dashboard.cy.ts` (E2E tests)

### Documentation
- `frontend/src/app/modules/dashboard/README.md` (T068)
