# Rebuilding Frontend After Entrypoint Fix

## What Was Fixed

The Dockerfile has been updated to properly handle the `entrypoint.sh` file:

1. **Installed `dos2unix`** - Converts Windows line endings (CRLF) to Unix line endings (LF)
2. **Explicit copy** - Copies `entrypoint.sh` separately before other files
3. **Line ending fix** - Runs `dos2unix entrypoint.sh` to ensure proper format
4. **Proper permissions** - Sets executable permissions with `chmod +x`
5. **Updated shebang** - Changed from `#!/bin/sh` to `#!/bin/bash` for consistency
6. **Added `set -e`** - Script exits on first error

## Rebuild Steps

### Option 1: Rebuild Frontend Only

```bash
# Stop containers
docker-compose down

# Remove old frontend image
docker rmi nodejs-test-claude-frontend

# Rebuild frontend (no cache to ensure fresh build)
docker-compose build --no-cache frontend

# Start services
docker-compose up -d

# Verify
docker-compose logs frontend | head -20
```

### Option 2: Full Clean Rebuild

```bash
# Stop everything
docker-compose down

# Remove all project containers and images
docker-compose rm -f
docker rmi nodejs-test-claude-frontend nodejs-test-claude-backend

# Rebuild everything
docker-compose build --no-cache

# Start services
docker-compose up -d

# Verify
docker-compose logs frontend | head -20
```

### Option 3: Nuclear Option (If Still Having Issues)

```bash
# Stop all containers
docker-compose down -v

# Prune everything Docker
docker system prune -a --volumes

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## Verification

After rebuilding, verify the entrypoint is working:

### 1. Check Container Started Successfully
```bash
docker-compose ps
```

You should see `nodejs-test-claude-frontend` with status `Up`.

### 2. Check Logs for Startup Message
```bash
docker-compose logs frontend | head -20
```

**Expected output:**
```
Starting in DEVELOPMENT mode...
Running Angular dev server on port 80...
✔ Compiled successfully
[HPM] Proxy created: /api  -> http://backend:80
```

### 3. Verify Entrypoint File Permissions
```bash
docker-compose exec frontend ls -la /app/entrypoint.sh
```

**Expected output:**
```
-rwxr-xr-x    1 node     node           XXX Dec 15 XX:XX /app/entrypoint.sh
```

Note the `x` flags indicating executable permissions.

### 4. Check Line Endings
```bash
docker-compose exec frontend file /app/entrypoint.sh
```

**Expected output:**
```
/app/entrypoint.sh: Bourne-Again shell script, ASCII text executable
```

Should NOT say "with CRLF line terminators".

### 5. Test Environment Variable
```bash
docker-compose exec frontend printenv NODE_ENV
```

**Expected output:**
```
development
```

## Common Issues and Solutions

### Issue: Still getting "permission denied"

**Solution:**
```bash
# Rebuild with no cache
docker-compose build --no-cache frontend
docker-compose up -d
```

### Issue: "exec format error"

**Cause:** Line endings are still wrong (Windows CRLF)

**Solution:**
```bash
# Fix line endings locally first
dos2unix frontend/entrypoint.sh

# Or on Mac/Linux:
sed -i 's/\r$//' frontend/entrypoint.sh

# Then rebuild
docker-compose build --no-cache frontend
docker-compose up -d
```

### Issue: entrypoint.sh not found

**Cause:** File not copied into image

**Check:**
```bash
docker-compose build frontend 2>&1 | grep entrypoint
```

**Solution:**
```bash
# Ensure file exists
ls -la frontend/entrypoint.sh

# Rebuild
docker-compose build --no-cache frontend
```

### Issue: Container starts then exits

**Check logs:**
```bash
docker-compose logs frontend
```

**Common causes:**
- npm packages not installed
- Port 80 already in use
- Syntax error in entrypoint.sh

**Solution:**
```bash
# Check for errors in logs
docker-compose logs frontend

# Rebuild
docker-compose build --no-cache frontend
docker-compose up -d
```

## Success Checklist

After rebuild, verify all of these:

- [ ] Container starts without errors: `docker-compose ps`
- [ ] Logs show "Starting in DEVELOPMENT mode": `docker-compose logs frontend | grep "Starting"`
- [ ] Entrypoint file has execute permissions: `docker-compose exec frontend ls -la /app/entrypoint.sh`
- [ ] NODE_ENV is set correctly: `docker-compose exec frontend printenv NODE_ENV`
- [ ] Frontend accessible at http://localhost:4200
- [ ] Hot reload working (edit file, see changes)
- [ ] API proxy active: `docker-compose logs frontend | grep HPM`

## Quick Test

```bash
# Rebuild and test in one go
docker-compose down && \
docker-compose build --no-cache frontend && \
docker-compose up -d && \
sleep 5 && \
docker-compose logs frontend | head -20
```

If you see "Starting in DEVELOPMENT mode..." and no errors, you're good to go! 🎉
