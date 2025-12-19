#!/bin/bash
set -e

# PostgreSQL Reset Script
# This script drops the database and user, allowing for a clean reinstall

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_CONTAINER="nodejs-test-claude-db"
DB_NAME="orchardcore"
DB_USER="orcharduser"
POSTGRES_USER="postgres"

echo -e "${RED}========================================${NC}"
echo -e "${RED}PostgreSQL Database Reset${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠ WARNING: This will delete all data!${NC}"
echo -e "${YELLOW}⚠ This action cannot be undone!${NC}"
echo ""
echo -e "This will:"
echo -e "  - Drop database '${DB_NAME}'"
echo -e "  - Drop user '${DB_USER}'"
echo -e "  - Remove all tables and data"
echo ""
read -p "Are you sure you want to continue? (yes/NO): " -r
echo

if [ "$REPLY" != "yes" ]; then
    echo -e "${BLUE}Reset cancelled${NC}"
    exit 0
fi

echo -e "${YELLOW}Double-checking... Type 'DELETE' to confirm:${NC} "
read -r CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    echo -e "${BLUE}Reset cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Starting reset...${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check if database container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo -e "${RED}Error: Database container is not running${NC}"
    echo -e "${YELLOW}Start containers first: docker-compose up -d${NC}"
    exit 1
fi

# Terminate existing connections
echo -e "${BLUE}Terminating existing connections...${NC}"
docker exec $DB_CONTAINER psql -U $POSTGRES_USER -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${DB_NAME}';" > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Connections terminated${NC}"
echo ""

# Drop database
echo -e "${BLUE}Dropping database '${DB_NAME}'...${NC}"
if docker exec $DB_CONTAINER psql -U $POSTGRES_USER -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null | grep -q 1; then
    docker exec $DB_CONTAINER psql -U $POSTGRES_USER -c "DROP DATABASE IF EXISTS ${DB_NAME};" > /dev/null
    echo -e "${GREEN}✓ Database '${DB_NAME}' dropped${NC}"
else
    echo -e "${YELLOW}⚠ Database '${DB_NAME}' does not exist${NC}"
fi
echo ""

# Drop user
echo -e "${BLUE}Dropping user '${DB_USER}'...${NC}"
if docker exec $DB_CONTAINER psql -U $POSTGRES_USER -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" 2>/dev/null | grep -q 1; then
    docker exec $DB_CONTAINER psql -U $POSTGRES_USER -c "DROP USER IF EXISTS ${DB_USER};" > /dev/null
    echo -e "${GREEN}✓ User '${DB_USER}' dropped${NC}"
else
    echo -e "${YELLOW}⚠ User '${DB_USER}' does not exist${NC}"
fi
echo ""

# Verify cleanup
echo -e "${BLUE}Verifying cleanup...${NC}"
DB_EXISTS=$(docker exec $DB_CONTAINER psql -U $POSTGRES_USER -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null || echo "")
USER_EXISTS=$(docker exec $DB_CONTAINER psql -U $POSTGRES_USER -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" 2>/dev/null || echo "")

if [ -z "$DB_EXISTS" ] && [ -z "$USER_EXISTS" ]; then
    echo -e "${GREEN}✓ Cleanup successful${NC}"
else
    echo -e "${RED}✗ Cleanup may be incomplete${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Reset completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${BLUE}To set up the database again, run:${NC}"
echo -e "  ${YELLOW}./scripts/setup-postgres.sh${NC}"
echo ""
