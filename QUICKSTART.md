# Quick Start Guide

## Prerequisites
- Docker Desktop installed and running
- Docker Compose installed

## Environment Modes

This project uses a **single Dockerfile** with `NODE_ENV` to control development vs production mode:
- **Development:** `NODE_ENV=development` (default in `docker-compose.yml`)
- **Production:** `NODE_ENV=production` (use `docker-compose.prod.yml`)

## Starting Development Environment

### 1. Build and start all services
```bash
# First time setup or after configuration changes
docker-compose build

# Start all services
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- OrchardCore backend on port 8080
- Angular frontend on port 4200 (with hot reload, API proxy, `environment.ts`)

### 2. Initialize PostgreSQL Database (First Time Only)

After the containers are running, initialize the database:

```bash
# Run the setup script
./scripts/setup-postgres.sh

# Verify the setup
./scripts/verify-postgres.sh
```

This creates:
- Database: `orchardcore`
- User: `orcharduser`
- Password: `orchardpassword`

**Note:** The backend will automatically create OrchardCore tables on first run.

### 3. View logs (optional)
```bash
# All services
docker-compose logs -f

# Just frontend
docker-compose logs -f frontend

# Just backend
docker-compose logs -f backend
```

### 4. Access the applications

- **Frontend:** http://localhost:4200
  - Angular development server with hot reload
  - Changes to code in `./frontend` will auto-reload

- **Backend:** http://localhost:8080
  - OrchardCore API
  - Running in Development mode

- **Database:** localhost:5432
  - Database: `orchardcore`
  - User: `orcharduser`
  - Password: `orchardpassword`

## Development Workflow

### Making Frontend Changes
1. Edit any file in `./frontend/src/`
2. Save the file
3. The frontend container will detect the change and rebuild
4. Your browser will automatically refresh (if you have the page open)

### Viewing Real-time Logs
```bash
docker-compose logs -f frontend
```

You'll see output like:
```
✔ Compiled successfully
✔ Browser application bundle generation complete
```

### Stopping the Environment
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

## Troubleshooting

### Frontend not rebuilding on changes?
```bash
# Restart the frontend service
docker-compose restart frontend
```

### Port already in use?
Check if another service is using ports 4200, 8080, or 5432:
```bash
# On macOS/Linux
lsof -i :4200
lsof -i :8080
lsof -i :5432

# On Windows
netstat -ano | findstr :4200
netstat -ano | findstr :8080
netstat -ano | findstr :5432
```

### Need to rebuild containers?
```bash
# Rebuild all
docker-compose build

# Rebuild just frontend
docker-compose build frontend

# Rebuild and start
docker-compose up -d --build
```

### Database connection issues?
```bash
# Check database health
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Clean slate restart
```bash
# Stop everything and remove volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## Starting Production Environment

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Access at http://localhost:80
```

Production mode:
- Uses `environment.prod.ts` (absolute URLs to `https://api.ets-cms.com`)
- Optimized build (minified, tree-shaken)
- No hot reload or volume mounts
- Serves on port 80

## Verifying Environment Mode

Check which mode is running:

```bash
# Check NODE_ENV
docker-compose exec frontend printenv NODE_ENV

# Check logs for startup message
docker-compose logs frontend | head -5
```

You should see either:
- `Starting in DEVELOPMENT mode...` or
- `Starting in PRODUCTION mode...`

## Next Steps

1. Open http://localhost:4200 in your browser (development)
2. Start editing files in `./frontend/src/app/`
3. Watch your changes appear automatically
4. Check backend API at http://localhost:8080

For more detailed information:
- [README.Docker.md](README.Docker.md) - Comprehensive Docker guide
- [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) - Detailed environment configuration
