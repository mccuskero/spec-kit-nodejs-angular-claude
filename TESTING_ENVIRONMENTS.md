# Testing Environment Configuration

Quick guide to test that the NODE_ENV-based environment switching is working correctly.

## Test 1: Development Mode

### Start Development Environment
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### Verify Development Mode
```bash
# 1. Check NODE_ENV
docker-compose exec frontend printenv NODE_ENV
# Expected: development

# 2. Check startup logs
docker-compose logs frontend | head -10
# Expected: "Starting in DEVELOPMENT mode..."
# Expected: "Running Angular dev server on port 80..."

# 3. Check for proxy
docker-compose logs frontend | grep HPM
# Expected: [HPM] Proxy created: /api  -> http://backend:80
# Expected: [HPM] Proxy created: /connect  -> http://backend:80

# 4. Check running process
docker-compose exec frontend ps aux | grep ng
# Expected: ng serve process running
```

### Test Hot Reload
```bash
# 1. Open browser to http://localhost:4200

# 2. Edit a file
echo "// Test change" >> frontend/src/app/app.ts

# 3. Watch logs
docker-compose logs -f frontend
# Expected: See compilation messages and "Compiled successfully"

# 4. Browser should auto-refresh
```

### Test API Proxy
```bash
# Open browser console at http://localhost:4200
# Try login or API call
# Network tab should show:
# - Request to: http://localhost:4200/connect/token
# - NOT to: https://api.ets-cms.com/connect/token
```

## Test 2: Production Mode

### Start Production Environment
```bash
docker-compose down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Verify Production Mode
```bash
# 1. Check NODE_ENV
docker-compose -f docker-compose.prod.yml exec frontend printenv NODE_ENV
# Expected: production

# 2. Check startup logs
docker-compose -f docker-compose.prod.yml logs frontend | head -10
# Expected: "Starting in PRODUCTION mode..."
# Expected: "Building Angular application..."
# Expected: "Serving production build on port 80..."

# 3. Check for NO proxy
docker-compose -f docker-compose.prod.yml logs frontend | grep HPM
# Expected: No output (no proxy in production)

# 4. Check running process
docker-compose -f docker-compose.prod.yml exec frontend ps aux | grep serve
# Expected: serve process running (NOT ng serve)
```

### Test Production Build
```bash
# 1. Open browser to http://localhost:80

# 2. Check browser console
# Should see minified code in network tab

# 3. Check API calls (will fail without actual prod backend)
# Network tab should show:
# - Request to: https://api.ets-cms.com/connect/token
# - NOT to: http://localhost:80/connect/token
```

### Test No Hot Reload
```bash
# 1. Edit a file
echo "// Test change" >> frontend/src/app/app.ts

# 2. Check logs
docker-compose -f docker-compose.prod.yml logs -f frontend
# Expected: No compilation messages (static files)

# 3. Browser should NOT auto-refresh
# 4. Changes should NOT appear (need rebuild)
```

## Test 3: Switching Environments

### Switch from Dev to Prod
```bash
# Stop dev
docker-compose down

# Start prod
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml exec frontend printenv NODE_ENV
```

### Switch from Prod to Dev
```bash
# Stop prod
docker-compose -f docker-compose.prod.yml down

# Start dev
docker-compose up -d

# Verify
docker-compose exec frontend printenv NODE_ENV
```

## Test 4: Environment Files

### Check Development Environment File
```bash
# Read environment.ts
cat frontend/src/environments/environment.ts
```

Expected content:
```typescript
export const environment = {
  production: false,
  apiBaseUrl: '',
  orchardCoreApiUrl: '/api',
  orchardApiUrl: '/api/content',
  orchardGraphQLUrl: '/api/graphql',
  tokenUrl: '/connect/token',
  clientId: 'angular-app'
};
```

**Key points:**
- `production: false`
- Relative URLs (starting with `/`)
- Empty `apiBaseUrl`

### Check Production Environment File
```bash
# Read environment.prod.ts
cat frontend/src/environments/environment.prod.ts
```

Expected content:
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.ets-cms.com',
  orchardCoreApiUrl: 'https://api.ets-cms.com/api',
  orchardApiUrl: 'https://api.ets-cms.com/api/content',
  orchardGraphQLUrl: 'https://api.ets-cms.com/api/graphql',
  tokenUrl: 'https://api.ets-cms.com/connect/token',
  clientId: 'angular-app'
};
```

**Key points:**
- `production: true`
- Absolute URLs (starting with `https://`)
- Full domain in `apiBaseUrl`

## Test 5: Proxy Configuration

### Check Proxy Config
```bash
cat frontend/proxy.conf.json
```

Expected content:
```json
{
  "/api": {
    "target": "http://backend:80",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/connect": {
    "target": "http://backend:80",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Note:** Proxy only works in development mode.

## Test 6: Entrypoint Script

### Check Script Content
```bash
cat frontend/entrypoint.sh
```

### Test Script Logic
```bash
# Development
docker-compose exec frontend sh -c 'if [ "$NODE_ENV" = "production" ]; then echo "PROD"; else echo "DEV"; fi'
# Expected: DEV

# Production
docker-compose -f docker-compose.prod.yml exec frontend sh -c 'if [ "$NODE_ENV" = "production" ]; then echo "PROD"; else echo "DEV"; fi'
# Expected: PROD
```

## Common Issues and Solutions

### Issue: Wrong environment loading

**Symptom:** API calls going to wrong URL

**Check:**
```bash
# Check NODE_ENV
docker-compose exec frontend printenv NODE_ENV

# Check startup mode
docker-compose logs frontend | grep "Starting in"
```

**Solution:**
```bash
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### Issue: No hot reload in development

**Symptom:** Changes not appearing

**Check:**
```bash
# Verify volumes are mounted
docker-compose exec frontend ls -la /app/src
# Should show your source files

# Check NODE_ENV
docker-compose exec frontend printenv NODE_ENV
# Should be: development
```

**Solution:**
```bash
docker-compose restart frontend
```

### Issue: Production build failing

**Symptom:** Container starts but crashes

**Check:**
```bash
# View build logs
docker-compose -f docker-compose.prod.yml logs frontend
```

**Solution:**
```bash
# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## Success Criteria

✅ Development mode:
- NODE_ENV=development
- ng serve running
- Hot reload working
- Proxy active (/api → backend:80)
- Uses environment.ts
- Port 4200 accessible

✅ Production mode:
- NODE_ENV=production
- serve running (not ng serve)
- No hot reload
- No proxy (direct URLs)
- Uses environment.prod.ts
- Port 80 accessible
- Minified bundles

✅ Both modes:
- Correct entrypoint script executed
- Logs show correct "Starting in X mode"
- Environment file matches mode
- API calls go to correct destination
