# Docker Setup Guide

This project uses Docker and Docker Compose to run the full stack application including:
- PostgreSQL database
- OrchardCore backend (.NET 10)
- Angular frontend (Angular 20+)

**Key Feature:** Single Dockerfile for both development and production, controlled by `NODE_ENV` environment variable.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Build and start all services (Development Mode):**
   ```bash
   docker-compose up -d
   ```

2. **Initialize PostgreSQL database (first time only):**
   ```bash
   ./scripts/setup-postgres.sh
   ./scripts/verify-postgres.sh
   ```

   This creates the `orchardcore` database with user `orcharduser`.
   See [scripts/README-POSTGRES.md](scripts/README-POSTGRES.md) for details.

3. **Access the applications:**
   - Frontend (Angular): http://localhost:4200
   - Backend (OrchardCore): http://localhost:8080
   - Database (PostgreSQL): localhost:5432

4. **View logs:**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f frontend
   docker-compose logs -f backend
   docker-compose logs -f db
   ```

5. **Stop all services:**
   ```bash
   docker-compose down
   ```

## Services

### Frontend (Angular)
- **Port:** 4200 (dev) or 80 (prod)
- **Container:** nodejs-test-claude-frontend
- **Build context:** `./frontend`
- **Dockerfile:** Single `Dockerfile` for both dev and prod
- **Environment Control:** `NODE_ENV` variable (development or production)

**Development Mode** (`NODE_ENV=development`):
- Runs `ng serve` with hot reload
- Source code mounted as volume for live updates
- Changes automatically trigger rebuild and browser refresh
- API Proxy via `proxy.conf.json` → forwards `/api/*` and `/connect/*` to backend
- Uses `environment.ts` with relative URLs

**Production Mode** (`NODE_ENV=production`):
- Builds optimized production bundle
- Serves static files with `serve` package
- Uses `environment.prod.ts` with absolute URLs
- No hot reload, no volume mounts
- Optimized for performance

### Backend (OrchardCore)
- **Port:** 8080
- **Container:** nodejs-test-claude-backend
- **Build context:** `./3rd-Party/OrchardCore`
- Uses .NET 10 SDK and runtime
- Connects to PostgreSQL database
- Running in Development environment

### Database (PostgreSQL)
- **Port:** 5432
- **Container:** nodejs-test-claude-db
- **Image:** postgres:16-alpine
- **Credentials:**
  - Database: `orchardcore`
  - User: `orcharduser`
  - Password: `orchardpassword`
- Data persisted in Docker volume `postgres_data`

## Useful Commands

### Rebuild containers after code changes:
```bash
docker-compose build
docker-compose up -d
```

### Rebuild specific service:
```bash
docker-compose build frontend
docker-compose up -d frontend
```

### Stop and remove all containers, networks, and volumes:
```bash
docker-compose down -v
```

### Execute commands in running containers:
```bash
# Access frontend container shell
docker-compose exec frontend sh

# Access backend container shell
docker-compose exec backend sh

# Access database
docker-compose exec db psql -U orcharduser -d orchardcore
```

### View container status:
```bash
docker-compose ps
```

## Development vs Production

This project uses a **single Dockerfile** that adapts based on the `NODE_ENV` environment variable.

### Development Mode (Default - `docker-compose.yml`)

```bash
# Start development environment
docker-compose up -d
```

Configuration:
```yaml
frontend:
  environment:
    - NODE_ENV=development
  volumes:
    - ./frontend:/app  # Source mounted for hot reload
  ports:
    - "4200:80"
```

**Features:**
- Hot reload enabled
- Fast development iteration
- API proxy to backend
- Uses `environment.ts`

### Production Mode (`docker-compose.prod.yml`)

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d
```

Configuration:
```yaml
frontend:
  environment:
    - NODE_ENV=production
  # No volumes
  ports:
    - "80:80"
```

**Features:**
- Optimized production build
- Minified bundles
- Uses `environment.prod.ts`
- Production-ready performance

### Switching Environments

```bash
# Stop current environment
docker-compose down

# Change NODE_ENV in docker-compose.yml or use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Or override temporarily
docker-compose up -d -e NODE_ENV=production
```

See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed information.

## Development Workflow

### Frontend Development with Hot Reload (Recommended)
The default docker-compose setup provides hot reload:

```bash
# Start all services
docker-compose up -d

# Watch frontend logs to see rebuilds
docker-compose logs -f frontend

# Edit files in ./frontend and see changes automatically
```

### Alternative: Local Frontend Development
If you prefer running frontend locally without Docker:

```bash
cd frontend
npm install
npm start
```

And only run backend + database in Docker:
```bash
docker-compose up -d backend db
```

### Backend Development
For backend development, you can run the frontend and database in Docker and run the backend locally:

```bash
docker-compose up -d db
cd 3rd-Party/OrchardCore/src/OrchardCore.Cms.Web
dotnet run
```

## Troubleshooting

### API calls going to wrong URL (production instead of development)
If you see errors like `POST https://api.ets-cms.com/connect/token net::ERR_NAME_NOT_RESOLVED`:

1. The frontend is using production environment instead of development
2. Rebuild the frontend container:
   ```bash
   docker-compose down
   docker-compose build frontend
   docker-compose up -d
   ```
3. Verify in logs that proxy is active:
   ```bash
   docker-compose logs frontend | grep HPM
   ```
   You should see:
   ```
   [HPM] Proxy created: /api  -> http://backend:80
   [HPM] Proxy created: /connect  -> http://backend:80
   ```

### Port already in use
If you get port binding errors, another application might be using the ports. You can either:
1. Stop the conflicting application
2. Change the ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "4201:80"  # Use port 4201 instead of 4200
   ```

### Database connection issues
If the backend can't connect to the database:
1. Check database is healthy: `docker-compose ps`
2. Check database logs: `docker-compose logs db`
3. Restart the backend: `docker-compose restart backend`

### Frontend can't reach backend
If API calls fail:
1. Check backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify nginx configuration in `frontend/nginx.conf`

### Rebuild from scratch
If you encounter persistent issues:
```bash
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

## Environment Variables

You can customize the setup by creating a `.env` file in the root directory:

```env
# Database
POSTGRES_DB=orchardcore
POSTGRES_USER=orcharduser
POSTGRES_PASSWORD=orchardpassword

# Frontend port
FRONTEND_PORT=4200

# Backend port
BACKEND_PORT=5000
```

Then update `docker-compose.yml` to use these variables:
```yaml
environment:
  POSTGRES_DB: ${POSTGRES_DB}
  POSTGRES_USER: ${POSTGRES_USER}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```
