# PostgreSQL Setup Scripts

Scripts for initializing and managing the PostgreSQL database for OrchardCore.

## Prerequisites

1. Docker and Docker Compose installed and running
2. Database container started:
   ```bash
   docker-compose up -d db
   ```

## Available Scripts

### 1. `setup-postgres.sh` - Initialize Database

Sets up the PostgreSQL database with the required user and database for OrchardCore.

**What it does:**
- Creates database user `orcharduser` with password `orchardpassword`
- Creates database `orchardcore`
- Grants necessary privileges
- Verifies the setup

**Usage:**
```bash
./scripts/setup-postgres.sh
```

**Features:**
- ✅ Checks if Docker is running
- ✅ Waits for PostgreSQL to be ready
- ✅ Interactive prompts if database/user already exists
- ✅ Verifies connection after setup
- ✅ Color-coded output for easy reading

**Safe to run multiple times** - will prompt before overwriting existing data.

---

### 2. `verify-postgres.sh` - Verify Setup

Verifies that the PostgreSQL database is properly configured for OrchardCore.

**What it checks:**
1. Docker is running
2. Database container is running
3. PostgreSQL is ready
4. User `orcharduser` exists
5. Database `orchardcore` exists
6. User can connect to database
7. Database ownership
8. User privileges

**Usage:**
```bash
./scripts/verify-postgres.sh
```

**Output includes:**
- PostgreSQL version
- Database size
- Number of tables
- Active connections
- Connection string

**Exit codes:**
- `0` - All tests passed
- `1` - Some tests failed

---

### 3. `reset-postgres.sh` - Reset Database

**⚠️ DESTRUCTIVE OPERATION** - Drops the database and user, removing all data.

**What it does:**
- Terminates existing connections
- Drops database `orchardcore`
- Drops user `orcharduser`
- Verifies cleanup

**Usage:**
```bash
./scripts/reset-postgres.sh
```

**Safety features:**
- Requires typing "yes" to confirm
- Requires typing "DELETE" for double confirmation
- Shows warning messages
- Cannot be undone

**Use cases:**
- Starting fresh with OrchardCore setup
- Cleaning up test data
- Fixing corrupted database

---

## Quick Start Guide

### First Time Setup

1. Start the database container:
   ```bash
   docker-compose up -d db
   ```

2. Run the setup script:
   ```bash
   ./scripts/setup-postgres.sh
   ```

3. Verify the setup:
   ```bash
   ./scripts/verify-postgres.sh
   ```

4. Start the backend:
   ```bash
   docker-compose up -d backend
   ```

### Troubleshooting Setup

If the setup fails or you encounter issues:

1. Check container logs:
   ```bash
   docker-compose logs db
   ```

2. Verify container is running:
   ```bash
   docker-compose ps
   ```

3. Reset and try again:
   ```bash
   ./scripts/reset-postgres.sh
   ./scripts/setup-postgres.sh
   ```

---

## Database Connection Details

### From Docker Containers (Backend)
```
Host=db
Database=orchardcore
Username=orcharduser
Password=orchardpassword
Port=5432
```

**Connection String:**
```
Host=db;Database=orchardcore;Username=orcharduser;Password=orchardpassword
```

### From Host Machine (Development)
```
Host=localhost
Database=orchardcore
Username=orcharduser
Password=orchardpassword
Port=5432
```

**Connection String:**
```
Host=localhost;Database=orchardcore;Username=orcharduser;Password=orchardpassword
```

---

## Manual Database Operations

### Connect to PostgreSQL as postgres user
```bash
docker exec -it nodejs-test-claude-db psql -U postgres
```

### Connect to orchardcore database as orcharduser
```bash
docker exec -it nodejs-test-claude-db psql -U orcharduser -d orchardcore
```

### Run SQL commands
```bash
# List databases
docker exec nodejs-test-claude-db psql -U postgres -c "\l"

# List users
docker exec nodejs-test-claude-db psql -U postgres -c "\du"

# List tables in orchardcore
docker exec nodejs-test-claude-db psql -U orcharduser -d orchardcore -c "\dt"

# Check database size
docker exec nodejs-test-claude-db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('orchardcore'));"
```

### Backup Database
```bash
# Create backup
docker exec nodejs-test-claude-db pg_dump -U orcharduser orchardcore > orchardcore_backup.sql

# Restore backup
cat orchardcore_backup.sql | docker exec -i nodejs-test-claude-db psql -U orcharduser -d orchardcore
```

---

## Common Issues and Solutions

### Issue: "Container is not running"

**Solution:**
```bash
docker-compose up -d db
# Wait a few seconds
./scripts/setup-postgres.sh
```

### Issue: "PostgreSQL is not ready"

**Solution:**
```bash
# Wait for PostgreSQL to start (can take 10-30 seconds)
docker-compose logs -f db
# Look for "database system is ready to accept connections"
```

### Issue: "User already exists"

**Solution:**
The setup script will prompt you to drop and recreate. Choose:
- `y` to drop and recreate
- `n` to keep existing and continue

### Issue: "Database already exists"

**Solution:**
Same as above - the script will prompt you.

### Issue: "Permission denied" for scripts

**Solution:**
```bash
# Make scripts executable
chmod +x scripts/setup-postgres.sh
chmod +x scripts/verify-postgres.sh
chmod +x scripts/reset-postgres.sh
```

### Issue: Connection from backend fails

**Check:**
1. Database is initialized:
   ```bash
   ./scripts/verify-postgres.sh
   ```

2. Connection string in `docker-compose.yml`:
   ```yaml
   - ConnectionStrings__DefaultConnection=Host=db;Database=orchardcore;Username=orcharduser;Password=orchardpassword
   ```

3. Backend container is on same network:
   ```bash
   docker network inspect nodejs-test-claude_app-network
   ```

---

## Script Workflow

### Normal Setup Flow
```
┌─────────────────────┐
│ docker-compose up   │
│    -d db           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ setup-postgres.sh   │
│  - Create user      │
│  - Create database  │
│  - Grant privileges │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ verify-postgres.sh  │
│  - Run tests        │
│  - Show status      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ docker-compose up   │
│    -d backend       │
└─────────────────────┘
```

### Reset Flow
```
┌─────────────────────┐
│ reset-postgres.sh   │
│  - Drop database    │
│  - Drop user        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ setup-postgres.sh   │
│  (Fresh setup)      │
└─────────────────────┘
```

---

## Environment Variables

You can override the default credentials using environment variables:

```bash
# Set custom credentials
export DB_NAME=mydb
export DB_USER=myuser
export DB_PASSWORD=mypassword

# Run setup
./scripts/setup-postgres.sh
```

**Note:** Current scripts use hardcoded values. To use environment variables, modify the scripts to read from env vars.

---

## Integration with OrchardCore

After running `setup-postgres.sh`, OrchardCore will:

1. Detect the database is ready
2. Run initial migrations
3. Create OrchardCore tables
4. Set up the admin user

**First-time OrchardCore setup:**
1. Navigate to: http://localhost:8080
2. Follow the setup wizard
3. Database connection is already configured
4. Create your admin user
5. Select features to enable

---

## Best Practices

1. **Always verify after setup:**
   ```bash
   ./scripts/setup-postgres.sh
   ./scripts/verify-postgres.sh
   ```

2. **Backup before reset:**
   ```bash
   docker exec nodejs-test-claude-db pg_dump -U orcharduser orchardcore > backup.sql
   ./scripts/reset-postgres.sh
   ```

3. **Check logs if issues:**
   ```bash
   docker-compose logs db
   docker-compose logs backend
   ```

4. **Use reset for clean slate:**
   - Don't manually delete data
   - Use `reset-postgres.sh` for clean removal
   - Then run `setup-postgres.sh` again

---

## Additional Resources

- [PostgreSQL Docker Documentation](https://hub.docker.com/_/postgres)
- [OrchardCore Documentation](https://docs.orchardcore.net/)
- [PostgreSQL SQL Commands](https://www.postgresql.org/docs/current/sql-commands.html)

---

## Support

If you encounter issues:

1. Check this README
2. Run `verify-postgres.sh` for diagnostics
3. Check Docker logs: `docker-compose logs db`
4. Try resetting and setting up again
5. Check OrchardCore logs: `docker-compose logs backend`
