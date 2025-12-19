# Environment Setup Guide

This project uses a **single Dockerfile** for both development and production environments, controlled by the `NODE_ENV` environment variable.

## How It Works

### Single Dockerfile Architecture
The frontend uses one `Dockerfile` that adapts its behavior based on `NODE_ENV`:

- **Development Mode** (`NODE_ENV=development`):
  - Runs Angular development server (`ng serve`)
  - Loads `environment.ts` configuration
  - Enables hot reload for code changes
  - Uses proxy configuration for API routing
  - Serves on port 80

- **Production Mode** (`NODE_ENV=production`):
  - Builds optimized Angular application (`ng build --configuration production`)
  - Loads `environment.prod.ts` configuration
  - Serves static files with `serve` package
  - Minified and optimized bundles
  - Serves on port 80

### Entrypoint Script
The `frontend/entrypoint.sh` script checks `NODE_ENV` at container startup and executes the appropriate command:

```bash
if [ "$NODE_ENV" = "production" ]; then
    npm run build --configuration production
    serve -s dist/frontend/browser -l 80
else
    npm start -- --host 0.0.0.0 --port 80
fi
```

## Environment Files

### Development: `environment.ts`
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

- Uses **relative URLs** (`/api`, `/connect/token`)
- Proxied through Angular dev server to backend container
- Configured in `proxy.conf.json`

### Production: `environment.prod.ts`
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

- Uses **absolute URLs** pointing to production API
- No proxy needed (direct API calls)

## Running in Different Environments

### Development Environment (Default)

Using `docker-compose.yml`:

```bash
# Start development environment
docker-compose up -d

# Access at http://localhost:4200
```

Configuration in `docker-compose.yml`:
```yaml
frontend:
  environment:
    - NODE_ENV=development
  volumes:
    - ./frontend:/app
    - /app/node_modules
  ports:
    - "4200:80"
```

**Features:**
- Hot reload enabled (file changes auto-reload)
- Source code mounted as volume
- API proxy to backend container
- Fast rebuild times

### Production Environment

Using `docker-compose.prod.yml`:

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Access at http://localhost:80
```

Configuration in `docker-compose.prod.yml`:
```yaml
frontend:
  environment:
    - NODE_ENV=production
  # No volumes (built into image)
  ports:
    - "80:80"
```

**Features:**
- Optimized build (minified, tree-shaken)
- No hot reload (static files)
- Smaller image size
- Production-ready performance

## Switching Between Environments

### Method 1: Use Different Compose Files

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Method 2: Override NODE_ENV

```bash
# Override in docker-compose.yml temporarily
docker-compose up -d -e NODE_ENV=production

# Or modify docker-compose.yml:
services:
  frontend:
    environment:
      - NODE_ENV=production  # Change this line
```

### Method 3: Environment File

Create `.env` file in project root:

```env
# Development
NODE_ENV=development

# Or Production
# NODE_ENV=production
```

Then run:
```bash
docker-compose up -d
```

## Rebuilding After Changes

### After Code Changes (Development)
No rebuild needed! Hot reload handles it automatically.

### After Configuration Changes
```bash
# Rebuild frontend container
docker-compose down
docker-compose build frontend
docker-compose up -d
```

### Switching Environments
```bash
# Stop current environment
docker-compose down

# Rebuild with new NODE_ENV
docker-compose build frontend

# Start with new environment
docker-compose up -d
```

## Verifying Current Environment

### Check Frontend Logs
```bash
docker-compose logs frontend | head -20
```

**Development mode output:**
```
Starting in DEVELOPMENT mode...
Running Angular dev server on port 80...
✔ Compiled successfully
[HPM] Proxy created: /api  -> http://backend:80
```

**Production mode output:**
```
Starting in PRODUCTION mode...
Building Angular application...
✔ Browser application bundle generation complete
Installing serve package...
Serving production build on port 80...
```

### Check Container Environment
```bash
docker-compose exec frontend env | grep NODE_ENV
```

### Check Running Processes
```bash
# Development - should show 'ng serve'
docker-compose exec frontend ps aux | grep ng

# Production - should show 'serve'
docker-compose exec frontend ps aux | grep serve
```

## Troubleshooting

### Wrong Environment Loading

**Problem:** Frontend using production config in development mode (or vice versa)

**Solution:**
```bash
# 1. Check NODE_ENV
docker-compose exec frontend printenv NODE_ENV

# 2. Rebuild container
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d

# 3. Verify logs
docker-compose logs frontend | grep "Starting in"
```

### API Calls Failing in Development

**Problem:** API calls going to production URL

**Solution:**
- Ensure `NODE_ENV=development` in docker-compose.yml
- Verify proxy is active: `docker-compose logs frontend | grep HPM`
- Check `environment.ts` uses relative URLs

### Build Failing in Production

**Problem:** Production build fails or doesn't start

**Solution:**
```bash
# Check build logs
docker-compose -f docker-compose.prod.yml logs frontend

# Try manual build
docker-compose exec frontend npm run build --configuration production

# Verify environment
docker-compose exec frontend printenv NODE_ENV
```

## Best Practices

1. **Always specify NODE_ENV explicitly** in docker-compose files
2. **Use development mode for local development** (faster, hot reload)
3. **Test production builds locally** before deploying
4. **Keep environment files in sync** with required configuration
5. **Don't commit sensitive data** to environment files (use .env instead)

## Summary

| Aspect | Development | Production |
|--------|-------------|------------|
| NODE_ENV | `development` | `production` |
| Server | `ng serve` | `serve` (static) |
| Config File | `environment.ts` | `environment.prod.ts` |
| URLs | Relative (`/api`) | Absolute (`https://...`) |
| Hot Reload | ✅ Yes | ❌ No |
| Build | Live compilation | Pre-built |
| Volume Mount | ✅ Yes | ❌ No |
| Port | 4200:80 | 80:80 |
| API Proxy | ✅ Yes | ❌ No |
