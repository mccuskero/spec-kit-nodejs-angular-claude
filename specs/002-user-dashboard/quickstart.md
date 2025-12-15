# Quickstart Guide: User Dashboard Development

**Feature**: User Dashboard
**Branch**: 002-user-dashboard
**Last Updated**: 2025-12-13

## Purpose

This quickstart guide enables developers to set up a local development environment for the user dashboard feature in under 30 minutes. It covers all prerequisites, Orchard Core configuration, Angular setup, and verification steps.

---

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Angular CLI**: v16.0.0 or higher
- **Git**: v2.30.0 or higher
- **Docker**: v20.10 or higher (for Orchard Core)
- **Docker Compose**: v2.0 or higher

### Verify Installations

```bash
node --version    # Should be >= v18.0.0
npm --version     # Should be >= v9.0.0
ng version        # Should be >= Angular CLI 16.0.0
git --version     # Should be >= v2.30.0
docker --version  # Should be >= v20.10
docker-compose --version  # Should be >= v2.0
```

### Install Missing Tools

```bash
# Install Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Angular CLI globally
npm install -g @angular/cli@16

# Install Docker (follow official docs for your OS)
# macOS: https://docs.docker.com/desktop/install/mac-install/
# Linux: https://docs.docker.com/engine/install/
# Windows: https://docs.docker.com/desktop/install/windows-install/
```

---

## Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone <repository-url>
cd nodejs-test-claude

# Checkout the dashboard feature branch
git checkout 002-user-dashboard

# Verify you're on the correct branch
git branch
# Output should show: * 002-user-dashboard
```

---

## Step 2: Orchard Core Backend Setup

### Start Orchard Core via Docker

```bash
# Navigate to Orchard Core directory
cd 3rd-Party/OrchardCore

# Start Orchard Core container
docker-compose up -d

# Verify container is running
docker-compose ps
# Should show OrchardCore container with status "Up"

# View logs (optional)
docker-compose logs -f
```

**Expected Output**: Orchard Core should be running at `http://localhost:5000`

### Initial Orchard Core Configuration

1. **Open browser**: Navigate to `http://localhost:5000`

2. **Setup wizard** (first-time only):
   - **Site name**: "ETS-CMS" (or your preferred name)
   - **Recipe**: Select "Blank Site"
   - **Database**: Use default SQLite (or configure SQL Server/PostgreSQL)
   - **Admin username**: `admin`
   - **Admin password**: `Admin123!` (or secure password - save it!)
   - **Admin email**: `admin@example.com`

3. **Enable required modules**:
   ```
   Admin Panel → Configuration → Features

   Enable the following modules:
   ✓ Content Management (OrchardCore.ContentManagement)
   ✓ Lists (OrchardCore.Lists)
   ✓ Taxonomies (OrchardCore.Taxonomies)
   ✓ OpenID Connect (OrchardCore.OpenId)
   ✓ GraphQL (OrchardCore.Apis.GraphQL)

   Click "Enable" for each module
   ```

4. **Create Repository Taxonomy**:
   ```
   Admin Panel → Content → Taxonomies → New Taxonomy

   Name: "Repository"
   Terms:
     - Local
     - Shared

   Save Taxonomy
   ```

5. **Create Folder Content Type**:
   ```
   Admin Panel → Content → Content Definition → Content Types → New Type

   Name: "Folder"
   Display Name: "Folder"

   Add Parts:
     ✓ Title Part
     ✓ List Part (configure: allow Document, Image, Folder)
     ✓ Taxonomy Part (link to "Repository" taxonomy)
     ✓ Contained Part

   Settings:
     ✓ Creatable: Yes
     ✓ Listable: Yes
     ✓ Securable: Yes

   Save Content Type
   ```

6. **Configure OpenID Client**:
   ```
   Admin Panel → Security → OpenID Connect → Applications → New Application

   Client ID: angular-app
   Display Name: Angular Dashboard
   Type: Public
   Grant Types: ✓ Password
   Allowed Scopes: openid, profile, roles

   Save Application
   ```

### Verify Orchard Core Setup

```bash
# Test authentication endpoint
curl -X POST http://localhost:5000/connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=admin&password=Admin123!&client_id=angular-app&scope=openid profile roles"

# Expected: JSON response with access_token
```

---

## Step 3: Angular Frontend Setup

### Install Dependencies

```bash
# Navigate to frontend directory
cd ../../frontend

# Install npm packages
npm install

# Verify installation
npm list @angular/core @angular/animations @angular/router
# Should show Angular 16.x versions
```

### Configure Environment Variables

```bash
# Edit environment files
nano src/environments/environment.ts
```

**Contents** (environment.ts):

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000',
  orchardApiUrl: 'http://localhost:5000/api/content',
  orchardGraphQLUrl: 'http://localhost:5000/api/graphql',
  tokenUrl: 'http://localhost:5000/connect/token',
  clientId: 'angular-app'
};
```

**Contents** (environment.prod.ts):

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-production-api.com',
  orchardApiUrl: 'https://your-production-api.com/api/content',
  orchardGraphQLUrl: 'https://your-production-api.com/api/graphql',
  tokenUrl: 'https://your-production-api.com/connect/token',
  clientId: 'angular-app'
};
```

### Start Development Server

```bash
# Start Angular dev server
npm start

# Or explicitly:
ng serve --port 4200 --open

# Expected output:
# ** Angular Live Development Server is listening on localhost:4200 **
# ✔ Compiled successfully
```

**Browser should open** at `http://localhost:4200`

---

## Step 4: Verify Complete Setup

### 1. Test Login Flow

```
1. Navigate to http://localhost:4200
2. You should see the login screen (from 001-login-screen feature)
3. Enter credentials:
   Username: admin
   Password: Admin123!
4. Click "Login"
5. You should be redirected to the dashboard
```

### 2. Test Dashboard Layout

After successful login, verify:

- [ ] **Header visible**: Username "admin", user icon, logout button in top-left
- [ ] **Navigation menu visible**: Left sidebar with buttons:
  - Shared Blog
  - Content
  - Change Logs
- [ ] **Repository selector visible**: Radio buttons for "Local" and "Shared Repository"
- [ ] **Workspace visible**: Right panel (70% width) showing content area
- [ ] **Collapse toggle works**: Click collapse button → menu shrinks to icons only

### 3. Test Navigation

```
1. Click "Shared Blog" → Workspace updates
2. Click "Content" → Workspace updates
3. Click "Change Logs" → Workspace updates
4. Verify URL changes: /dashboard/shared-blog, /dashboard/content, etc.
5. Refresh page (F5) → Should stay on current section (state persists)
```

### 4. Test Repository Toggle

```
1. Click "Content" section
2. Toggle repository from "Local" to "Shared Repository"
3. Verify workspace content updates (filters by repository)
4. Refresh page → Repository selection should persist
```

### 5. Test Folder Operations (if implemented)

```
1. Navigate to "Content" section
2. Click "Add Folder" button
3. Enter folder name: "Test Folder"
4. Select repository: "Local"
5. Click "Create"
6. Verify folder appears in content list
7. Click folder to open it
8. Verify breadcrumb shows: Home > Test Folder
```

---

## Step 5: Development Workflow

### Running Tests

```bash
# Frontend unit tests
cd frontend
npm test

# Frontend E2E tests
npm run e2e

# Watch mode (auto-rerun on changes)
npm test -- --watch
```

### Code Quality Checks

```bash
# Linting
npm run lint

# Fix auto-fixable linting issues
npm run lint -- --fix

# Format code (if Prettier configured)
npm run format
```

### Building for Production

```bash
# Production build
npm run build

# Output: frontend/dist/
# Serve with static file server or Orchard Core
```

### Common Development Tasks

#### Hot Reload

Angular dev server automatically reloads on file changes. If it doesn't:

```bash
# Restart dev server
# Press Ctrl+C to stop
npm start
```

#### Clear Cache

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Reset Orchard Core Database

```bash
# Stop containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Restart (will trigger setup wizard again)
docker-compose up -d
```

---

## Troubleshooting

### Issue: Orchard Core not starting

**Symptoms**: `docker-compose up -d` fails or container exits immediately

**Solutions**:

```bash
# Check logs
docker-compose logs

# Common fix: Port 5000 already in use
# Stop conflicting process or change port in docker-compose.yml

# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Angular fails to start

**Symptoms**: `npm start` throws errors

**Solutions**:

```bash
# Verify Node.js version
node --version
# Must be >= v18.0.0

# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Update Angular CLI
npm install -g @angular/cli@16
```

### Issue: CORS errors in browser console

**Symptoms**: `Access-Control-Allow-Origin` errors when calling Orchard API

**Solution**: Configure CORS in Orchard Core

```csharp
// In Orchard Core Startup.cs or appsettings.json
{
  "OrchardCore": {
    "AllowedOrigins": ["http://localhost:4200"]
  }
}
```

Restart Orchard Core container after configuration change.

### Issue: Authentication fails (401 Unauthorized)

**Symptoms**: Login succeeds but API calls return 401

**Solutions**:

```bash
# Verify JWT token is stored
# Open browser DevTools → Application → Local Storage
# Check for key: jwt_token

# Test token manually
curl -X GET http://localhost:5000/api/content \
  -H "Authorization: Bearer {your-token-here}"

# If token expired, clear and re-login
localStorage.clear()
```

### Issue: State not persisting across refresh

**Symptoms**: Refreshing page loses navigation section or repository selection

**Solutions**:

```javascript
// Check browser storage in DevTools → Application
// Session Storage should have: dashboard_session
// Local Storage should have: dashboard_preferences

// If missing, verify DashboardStateService effect() is running
// Add console.log in effect to debug
```

### Issue: Folder creation fails

**Symptoms**: "Add Folder" returns 400 Bad Request

**Solutions**:

```bash
# Verify Folder content type exists in Orchard
# Admin Panel → Content → Content Definition → Folder

# Check required fields in API request
# Must include: DisplayText, Published: true, TaxonomyPart, ListPart

# Test directly with curl
curl -X POST http://localhost:5000/api/content/Folder \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "DisplayText": "Test",
    "Published": true,
    "TaxonomyPart": {"Repository": ["Local"]},
    "ListPart": {}
  }'
```

---

## Next Steps

### For Developers

1. **Review Architecture**:
   - Read `/specs/002-user-dashboard/plan.md`
   - Review `/specs/002-user-dashboard/data-model.md`
   - Check API contracts in `/specs/002-user-dashboard/contracts/`

2. **Implement Features**:
   - Follow `/specs/002-user-dashboard/tasks.md` (generated via `/speckit.tasks`)
   - Create feature branch: `git checkout -b feature/dashboard-navigation`
   - Implement → Test → Commit → PR

3. **Add Tests**:
   - Unit tests for all services and components
   - E2E tests for user flows (Cypress)
   - Aim for 40% coverage (Alpha phase requirement)

### For Testers

1. **Manual Testing**:
   - Follow test scenarios in `/specs/002-user-dashboard/spec.md`
   - Document bugs in issue tracker
   - Verify acceptance criteria for each user story

2. **Automated Testing**:
   - Run E2E test suite: `npm run e2e`
   - Review test results
   - Add new test cases for edge scenarios

### For Product Owners

1. **Review Deliverables**:
   - Dashboard layout matches spec (30/70 split, collapsible menu)
   - All navigation sections accessible
   - Repository toggle functional
   - Folder management operational

2. **Acceptance Testing**:
   - User Story 1: Dashboard layout ✓
   - User Story 2: Navigation ✓
   - User Story 3: User profile access ✓
   - User Story 4: Logout ✓
   - User Story 5: Folder management ✓

---

## Useful Commands Reference

```bash
# Frontend (Angular)
npm start                    # Start dev server
npm test                     # Run unit tests
npm run e2e                  # Run E2E tests
npm run build                # Production build
npm run lint                 # Check code quality

# Backend (Orchard Core)
docker-compose up -d         # Start Orchard Core
docker-compose down          # Stop Orchard Core
docker-compose logs -f       # View logs
docker-compose restart       # Restart services

# Git
git status                   # Check current status
git checkout 002-user-dashboard  # Switch to feature branch
git pull origin 002-user-dashboard  # Get latest changes
git add .                    # Stage changes
git commit -m "message"      # Commit changes
git push origin 002-user-dashboard  # Push to remote

# Database (Orchard Core SQLite)
# Database file location: 3rd-Party/OrchardCore/App_Data/Sites/Default/yessql.db
# Use SQLite browser to inspect: https://sqlitebrowser.org/
```

---

## Additional Resources

### Documentation

- **Angular Official Docs**: https://angular.dev
- **Orchard Core Docs**: https://docs.orchardcore.net
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **RxJS Documentation**: https://rxjs.dev

### Tutorials

- **Angular Animations**: https://angular.dev/guide/animations
- **Angular Signals**: https://angular.dev/guide/signals
- **Orchard Core Content Management**: https://docs.orchardcore.net/en/latest/reference/modules/ContentManagement/

### Community

- **Angular Discord**: https://discord.gg/angular
- **Orchard Core GitHub**: https://github.com/OrchardCMS/OrchardCore
- **Stack Overflow**: Tag questions with `angular`, `orchard-core`, `typescript`

---

## Health Check Endpoints

After setup, verify all systems operational:

```bash
# Frontend health (should return Angular app)
curl http://localhost:4200

# Backend health (Orchard Core)
curl http://localhost:5000

# Authentication endpoint
curl -X POST http://localhost:5000/connect/token \
  -d "grant_type=password&username=admin&password=Admin123!&client_id=angular-app"

# Content API (requires auth token)
curl http://localhost:5000/api/content \
  -H "Authorization: Bearer {token}"

# GraphQL endpoint (requires auth token)
curl -X POST http://localhost:5000/api/graphql \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ contentItems { contentItemId } }"}'
```

**Expected**: All endpoints should return 200 OK (or 401 if auth required and not provided)

---

**Quickstart Status**: ✅ Complete
**Estimated Setup Time**: 20-30 minutes
**Support**: Contact development team or open issue in repository

---

*Last verified*: 2025-12-13 | *Next review*: After implementation completion
