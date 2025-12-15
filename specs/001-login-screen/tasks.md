---

description: "Task list for Login Screen implementation"
---

# Tasks: Login Screen

**Input**: Design documents from `/specs/001-login-screen/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are included per Constitution Principle II requirement for 40% minimum coverage (Alpha phase).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/app/modules/login/`
- **Tests**: `frontend/src/app/modules/login/**/*.spec.ts` (unit), `cypress/e2e/login.cy.ts` (e2e)
- Paths shown below use Angular feature module structure per constitution

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic module structure

- [ ] T001 Create login module directory structure at frontend/src/app/modules/login/ with subdirectories: components/, services/, routing/, models/
- [ ] T002 [P] Create login.module.ts Angular module file in frontend/src/app/modules/login/
- [ ] T003 [P] Create login-routing.module.ts routing configuration in frontend/src/app/modules/login/routing/
- [ ] T004 [P] Add login module to app-routing.module.ts with lazy loading configuration
- [ ] T005 [P] Configure environment.ts with Orchard Core API URL (http://localhost:5000/api)
- [ ] T006 [P] Configure environment.prod.ts with production Orchard Core API URL

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create LoginRequest interface in frontend/src/app/modules/login/models/login-request.model.ts
- [ ] T008 [P] Create AuthResponse interface with UserInfo and AuthErrorCode types in frontend/src/app/modules/login/models/auth-response.model.ts
- [ ] T009 [P] Create AuthState interface in frontend/src/app/core/models/auth-state.model.ts (if core/models doesn't exist, create it)
- [ ] T010 Create AuthService skeleton in frontend/src/app/modules/login/services/auth.service.ts with login(), logout(), getToken(), isAuthenticated() methods
- [ ] T011 Add HttpClientModule to app.module.ts imports if not already present
- [ ] T012 Add ReactiveFormsModule to login.module.ts imports
- [ ] T013 Verify Orchard Core is running at ./3rd-party/orchard-core by testing docker-compose up -d and curl http://localhost:5000/api/health

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Successful Login (Priority: P1) 🎯 MVP

**Goal**: Implement core authentication flow with username/password login and dashboard redirect

**Independent Test**: Create test user in Orchard Core, navigate to login screen, enter valid credentials, verify redirection to dashboard

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Create login-form.component.spec.ts unit test file with test suite setup in frontend/src/app/modules/login/components/login-form/
- [ ] T015 [P] [US1] Write unit test: form validation - empty username shows error after touch
- [ ] T016 [P] [US1] Write unit test: form validation - empty password shows error after touch
- [ ] T017 [P] [US1] Write unit test: submit button disabled when form invalid
- [ ] T018 [P] [US1] Write unit test: onSubmit() calls authService.login() with form values
- [ ] T019 [P] [US1] Create auth.service.spec.ts unit test file in frontend/src/app/modules/login/services/
- [ ] T020 [P] [US1] Write unit test: login() makes POST request to /api/Users/login with credentials
- [ ] T021 [P] [US1] Write unit test: login() stores token on successful response
- [ ] T022 [P] [US1] Write unit test: login() updates isAuthenticated$ BehaviorSubject on success
- [ ] T023 [US1] Create login.cy.ts e2e test file in cypress/e2e/ (depends on T014-T022 completion to know what to test)
- [ ] T024 [P] [US1] Write e2e test: successful login flow - enter credentials, click login, verify dashboard redirect
- [ ] T025 [P] [US1] Write e2e test: login form allows Enter key submission

**Verify tests FAIL** before proceeding to implementation

### Implementation for User Story 1

- [ ] T026 [P] [US1] Create login-form.component.ts in frontend/src/app/modules/login/components/login-form/ with FormGroup and FormBuilder
- [ ] T027 [P] [US1] Create login-form.component.html template with username and password input fields
- [ ] T028 [P] [US1] Create login-form.component.scss styles with centered login card layout
- [ ] T029 [US1] Implement ngOnInit() to initialize reactive form with username and password controls with Validators.required (depends on T026)
- [ ] T030 [US1] Implement onSubmit() method to call AuthService.login() and handle success/error responses (depends on T029)
- [ ] T031 [US1] Add form validation error messages in template that display after field touched (depends on T027, T029)
- [ ] T032 [US1] Implement AuthService.login() to POST credentials to Orchard Core /api/Users/login endpoint in frontend/src/app/modules/login/services/auth.service.ts
- [ ] T033 [US1] Implement token storage logic in AuthService.storeToken() using localStorage with key 'ets_cms_auth_token' (depends on T032)
- [ ] T034 [US1] Implement AuthService.isAuthenticated() to check if valid token exists (depends on T033)
- [ ] T035 [US1] Add Router.navigate(['/dashboard']) on successful login in login-form.component.ts (depends on T030, T032)
- [ ] T036 [US1] Register LoginFormComponent in login.module.ts declarations (depends on T026)
- [ ] T037 [US1] Update login-routing.module.ts to route '' to LoginFormComponent (depends on T036)

**Verify all US1 tests PASS** before marking story complete

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 3 - Failed Login Attempt (Priority: P1)

**Goal**: Implement error handling for authentication failures with generic security messages

**Independent Test**: Enter invalid credentials, verify generic error message appears without revealing which field was incorrect

**Note**: Implementing US3 before US2 because both are P1, but error handling is more critical than password toggle

### Tests for User Story 3

- [ ] T038 [P] [US3] Write unit test in login-form.component.spec.ts: shows generic error message on 401 response
- [ ] T039 [P] [US3] Write unit test in login-form.component.spec.ts: error message does not reveal username vs password failure
- [ ] T040 [P] [US3] Write unit test in login-form.component.spec.ts: error message clears when user starts typing
- [ ] T041 [P] [US3] Write unit test in auth.service.spec.ts: handles 401 error and returns error in Observable
- [ ] T042 [P] [US3] Write unit test in auth.service.spec.ts: handles 423 (account locked) error with specific message
- [ ] T043 [P] [US3] Write unit test in auth.service.spec.ts: handles network errors (status 0)
- [ ] T044 [P] [US3] Write e2e test in login.cy.ts: failed login shows error message
- [ ] T045 [P] [US3] Write e2e test in login.cy.ts: user can retry login after error

**Verify tests FAIL** before proceeding

### Implementation for User Story 3

- [ ] T046 [P] [US3] Add errorMessage property to login-form.component.ts with initial value null
- [ ] T047 [US3] Implement error handling in onSubmit() to catch authentication errors and set errorMessage (depends on T046)
- [ ] T048 [US3] Create getErrorMessage() method that maps HTTP status codes to user-friendly messages in login-form.component.ts (depends on T047)
- [ ] T049 [US3] Add error alert div in login-form.component.html that displays errorMessage with role="alert" (depends on T046)
- [ ] T050 [US3] Style error alert with red background and border in login-form.component.scss (depends on T049)
- [ ] T051 [US3] Add form.valueChanges subscription in login-form.component.ts to clear errorMessage when user types (depends on T046)
- [ ] T052 [US3] Update AuthService.login() to use catchError operator and map errors to AuthError structure (depends on T048)
- [ ] T053 [US3] Test error handling with invalid credentials against Orchard Core API (manual verification)

**Verify all US3 tests PASS**

**Checkpoint**: Error handling complete - users receive secure, helpful feedback on failed login

---

## Phase 5: User Story 2 - Password Visibility Toggle (Priority: P2)

**Goal**: Implement show/hide password toggle for better UX

**Independent Test**: Enter text in password field, click toggle button, verify password becomes visible/hidden

### Tests for User Story 2

- [ ] T054 [P] [US2] Write unit test in login-form.component.spec.ts: password field type is 'password' by default
- [ ] T055 [P] [US2] Write unit test in login-form.component.spec.ts: togglePasswordVisibility() changes showPassword boolean
- [ ] T056 [P] [US2] Write unit test in login-form.component.spec.ts: password field type changes to 'text' when showPassword is true
- [ ] T057 [P] [US2] Write unit test in login-form.component.spec.ts: password is transmitted securely regardless of showPassword state
- [ ] T058 [P] [US2] Write e2e test in login.cy.ts: clicking toggle button shows password text
- [ ] T059 [P] [US2] Write e2e test in login.cy.ts: clicking toggle again hides password

**Verify tests FAIL**

### Implementation for User Story 2

- [ ] T060 [P] [US2] Add showPassword boolean property to login-form.component.ts with initial value false
- [ ] T061 [US2] Implement togglePasswordVisibility() method in login-form.component.ts (depends on T060)
- [ ] T062 [US2] Update password input in login-form.component.html to use [type]="showPassword ? 'text' : 'password'" binding (depends on T060)
- [ ] T063 [US2] Add password toggle button in login-form.component.html with click handler calling togglePasswordVisibility() (depends on T061, T062)
- [ ] T064 [US2] Add eye icon (👁️) for show and eye-slash icon (👁️‍🗨️) for hide in toggle button template (depends on T063)
- [ ] T065 [US2] Style password input container with position:relative and toggle button with position:absolute in login-form.component.scss (depends on T063)
- [ ] T066 [US2] Add aria-label to toggle button for accessibility: "Show password" / "Hide password" (depends on T063)
- [ ] T067 [US2] Add keyboard focus styles to toggle button in login-form.component.scss (depends on T065)

**Verify all US2 tests PASS**

**Checkpoint**: Password visibility toggle complete and accessible

---

## Phase 6: User Story 4 - Forgot Password Access (Priority: P3)

**Goal**: Add "Forgot Password?" link placeholder for future functionality

**Independent Test**: Verify link is visible and clicking it shows "coming soon" message (no backend implementation needed)

### Tests for User Story 4

- [ ] T068 [P] [US4] Write unit test in login-form.component.spec.ts: forgot password link renders in template
- [ ] T069 [P] [US4] Write unit test in login-form.component.spec.ts: clicking forgot password link shows "coming soon" message
- [ ] T070 [P] [US4] Write e2e test in login.cy.ts: forgot password link is visible and clickable

**Verify tests FAIL**

### Implementation for User Story 4

- [ ] T071 [P] [US4] Add onForgotPassword() method in login-form.component.ts that sets errorMessage to "Password reset coming soon"
- [ ] T072 [US4] Add forgot password link in login-form.component.html below submit button with click handler (depends on T071)
- [ ] T073 [US4] Style forgot password link with center alignment and blue color in login-form.component.scss (depends on T072)
- [ ] T074 [US4] Add hover underline effect to forgot password link in login-form.component.scss (depends on T073)

**Verify all US4 tests PASS**

**Checkpoint**: All user stories complete and independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T075 [P] Add isLoading property to login-form.component.ts with loading spinner during authentication
- [ ] T076 [P] Disable submit button when isLoading is true or form is invalid
- [ ] T077 [P] Add CSS loading spinner or "Signing in..." text in submit button when loading
- [ ] T078 [P] Create README.md in frontend/src/app/modules/login/ documenting module purpose and usage
- [ ] T079 [P] Add responsive styles for mobile devices (< 768px) in login-form.component.scss
- [ ] T080 [P] Add tablet styles (768px - 1024px) with max-width constraints in login-form.component.scss
- [ ] T081 [P] Ensure all form elements have proper ARIA labels and tab order
- [ ] T082 [P] Test keyboard navigation (Tab order: username → password → remember me → submit)
- [ ] T083 Run ng lint on login module and fix any linting errors
- [ ] T084 Run code coverage report: ng test --code-coverage --include='**/*login*' and verify ≥ 40% coverage
- [ ] T085 Run all e2e tests: ng e2e --spec='**/login.cy.ts' and verify all pass
- [ ] T086 Manual testing: Test login on Chrome, Firefox, Safari browsers
- [ ] T087 Manual testing: Test login on mobile device (iOS or Android)
- [ ] T088 Verify quickstart.md instructions work end-to-end by following steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US3 (Phase 4): Can start after Foundational - Integrates with US1 but independently testable
  - US2 (Phase 5): Can start after Foundational - Enhances US1 but independently testable
  - US4 (Phase 6): Can start after Foundational - Independent of all other stories
- **Polish (Phase 7)**: Depends on at least US1 completion (can run while other stories are in progress)

### User Story Dependencies

- **User Story 1 (P1)**: CRITICAL - Must complete first as it's the MVP
- **User Story 3 (P1)**: Can start after Foundational, builds on US1 but independently testable
- **User Story 2 (P2)**: Can start after Foundational, enhances US1 password field
- **User Story 4 (P3)**: Completely independent, can be done anytime after Foundational

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services (already in Foundational phase)
- Services before components
- Components before templates
- Templates before styles
- Integration testing last

### Parallel Opportunities

- **Setup tasks (Phase 1)**: All tasks marked [P] can run in parallel (T002-T006)
- **Foundational tasks (Phase 2)**: T007-T009 (models), T013 (Orchard verification) can run in parallel
- **User Story Tests**: All tests within a story marked [P] can run in parallel
  - US1: T014-T022, T024-T025
  - US3: T038-T045
  - US2: T054-T059
  - US4: T068-T070
- **User Story Implementation**: Some tasks within stories can run in parallel (marked [P])
- **Polish tasks**: Most tasks in Phase 7 (T075-T082) can run in parallel

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all unit test creation for User Story 1 together:
# T014-T022 can all be created in parallel

# Then launch e2e tests:
# T024-T025 can be created in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T013) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T014-T037)
4. **STOP and VALIDATE**: Test User Story 1 independently with real Orchard Core backend
5. Deploy/demo if ready - this is a minimal viable login screen

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T014-T037) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 3 (T038-T053) → Test error handling → Deploy/Demo
4. Add User Story 2 (T054-T067) → Test password toggle → Deploy/Demo
5. Add User Story 4 (T068-T074) → Test forgot password link → Deploy/Demo
6. Add Polish (T075-T088) → Final testing and refinement → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T013)
2. Once Foundational is done:
   - Developer A: User Story 1 (T014-T037) - PRIORITY
   - Developer B: User Story 3 (T038-T053) - Can start simultaneously
   - Developer C: User Story 2 (T054-T067) - Can start simultaneously
   - Developer D: User Story 4 (T068-T074) - Can start simultaneously
3. Stories complete and integrate independently
4. Team collaborates on Polish (T075-T088)

### Test-First Workflow (REQUIRED)

For each user story:
1. Write ALL tests for the story (marked as test tasks)
2. Run tests - VERIFY THEY FAIL (red)
3. Implement minimum code to make tests pass (green)
4. Refactor while keeping tests green
5. Mark story complete only when all tests pass

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability (US1, US2, US3, US4)
- Each user story should be independently completable and testable
- **Verify tests fail before implementing** (TDD red-green-refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Constitution Compliance**: Target 40% test coverage (Alpha phase) - verify with T084

---

## Task Summary

**Total Tasks**: 88
- Setup (Phase 1): 6 tasks
- Foundational (Phase 2): 7 tasks (BLOCKING)
- User Story 1 (P1): 24 tasks (12 tests + 12 implementation)
- User Story 3 (P1): 16 tasks (8 tests + 8 implementation)
- User Story 2 (P2): 14 tasks (6 tests + 8 implementation)
- User Story 4 (P3): 7 tasks (3 tests + 4 implementation)
- Polish & Cross-Cutting: 14 tasks

**Parallel Opportunities**: 45+ tasks can run in parallel (marked with [P])

**Independent Test Criteria**:
- US1: Login with valid credentials → dashboard redirect
- US3: Login with invalid credentials → generic error message
- US2: Click password toggle → password visibility changes
- US4: Forgot password link → "coming soon" message

**Suggested MVP Scope**: Phase 1-3 only (User Story 1) = 37 tasks

**Constitution Compliance**: Tests included per Principle II (40% minimum coverage)
