# nodejs-test-claude Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-13

## Active Technologies
- TypeScript 5.0+ (frontend), C# .NET 10 (backend via Orchard Core) + Angular 20+, Angular Forms (ReactiveFormsModule), Angular Router, Angular HttpClient, Orchard Core Content Management APIs, Orchard Core Identity (authentication) (002-user-dashboard)
- Orchard Core content repository (PostgreSQL), Session Storage (navigation state persistence) (002-user-dashboard)
- Docker & Docker Compose for containerization

- TypeScript 5.0+ (frontend), C# .NET 10 (backend via Orchard Core) + Angular 20+, Angular Forms (ReactiveFormsModule), Angular Router, Angular HttpClient, Orchard Core Identity APIs (001-login-screen)

## Project Structure

```text
src/
tests/
```

## Commands

# Development
npm test && npm run lint

# Docker - Single Dockerfile with NODE_ENV control
docker-compose up -d          # Start in development mode (NODE_ENV=development)
docker-compose -f docker-compose.prod.yml up -d  # Start in production mode
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker-compose logs -f frontend  # View frontend logs
docker-compose build          # Rebuild containers
docker-compose exec frontend printenv NODE_ENV  # Check current environment

# PostgreSQL Setup (run after first docker-compose up)
./scripts/setup-postgres.sh   # Initialize database for OrchardCore
./scripts/verify-postgres.sh  # Verify database setup
./scripts/reset-postgres.sh   # Reset database (destructive!)

## Code Style

TypeScript 5.0+ (frontend), C# .NET 10 (backend via Orchard Core): Follow standard conventions

## Recent Changes
- PostgreSQL Setup Scripts: Added automated scripts for database initialization (setup-postgres.sh, verify-postgres.sh, reset-postgres.sh)
- Single Dockerfile Architecture: Removed Dockerfile.dev, now using NODE_ENV to control dev/prod modes
- Environment Configuration: Uses environment.ts (dev) or environment.prod.ts (prod) based on NODE_ENV
- Production Support: Added docker-compose.prod.yml for production deployments
- API Proxy: Configured proxy.conf.json for development API routing
- Docker Development Mode: Frontend runs with hot reload, source mounted as volume
- .NET 10: Using .NET 10 for OrchardCore backend
- Backend port changed to 8080
- 002-user-dashboard: Added TypeScript 5.0+ (frontend), C# .NET 10 (backend via Orchard Core) + Angular 20+, Angular Forms (ReactiveFormsModule), Angular Router, Angular HttpClient, Orchard Core Content Management APIs, Orchard Core Identity (authentication)

- 001-login-screen: Added TypeScript 5.0+ (frontend), C# .NET 10 (backend via Orchard Core) + Angular 20+, Angular Forms (ReactiveFormsModule), Angular Router, Angular HttpClient, Orchard Core Identity APIs

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
