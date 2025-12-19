#!/bin/bash
set -e

# PostgreSQL Setup Script for OrchardCore
# This script initializes the PostgreSQL database with the required user and database

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
DB_PASSWORD="orchardpassword"
POSTGRES_USER="postgres"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PostgreSQL Setup for OrchardCore${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Check if database container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo -e "${RED}Error: Database container '${DB_CONTAINER}' is not running.${NC}"
    echo -e "${YELLOW}Please start the containers first:${NC}"
    echo -e "${YELLOW}  docker-compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo -e "${GREEN}✓ Database container is running${NC}"
echo ""

# Wait for PostgreSQL to be ready
echo -e "${BLUE}Waiting for PostgreSQL to be ready...${NC}"
MAX_TRIES=30
COUNT=0
while [ $COUNT -lt $MAX_TRIES ]; do
    if docker exec $DB_CONTAINER pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    COUNT=$((COUNT + 1))
    if [ $COUNT -eq $MAX_TRIES ]; then
        echo -e "${RED}Error: PostgreSQL did not become ready in time${NC}"
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo ""

# Check if user already exists
echo -e "${BLUE}Checking if user '${DB_USER}' exists...${NC}"
USER_EXISTS=$(docker exec $DB_CONTAINER psql -U $DB_USER -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" 2>/dev/null || echo "")

if [ "$USER_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠ User '${DB_USER}' already exists${NC}"
    read -p "Do you want to drop and recreate the user? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Dropping existing user...${NC}"
        docker exec $DB_CONTAINER psql -U $DB_USER -c "DROP USER IF EXISTS ${DB_USER};" > /dev/null
        echo -e "${GREEN}✓ User dropped${NC}"
        USER_EXISTS=""
    fi
fi

if [ -z "$USER_EXISTS" ]; then
    echo -e "${BLUE}Creating user '${DB_USER}'...${NC}"
    docker exec $DB_CONTAINER psql -U $DB_USER -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" > /dev/null
    echo -e "${GREEN}✓ User '${DB_USER}' created${NC}"
else
    echo -e "${YELLOW}⚠ Keeping existing user${NC}"
fi
echo ""

# Check if database already exists
echo -e "${BLUE}Checking if database '${DB_NAME}' exists...${NC}"
DB_EXISTS=$(docker exec $DB_CONTAINER psql -U $DB_USER -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null || echo "")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠ Database '${DB_NAME}' already exists${NC}"
    read -p "Do you want to drop and recreate the database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Dropping existing database...${NC}"
        # Terminate existing connections
        docker exec $DB_CONTAINER psql -U $DB_USER -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${DB_NAME}';" > /dev/null 2>&1 || true
        docker exec $DB_CONTAINER psql -U $DB_USER -c "DROP DATABASE IF EXISTS ${DB_NAME};" > /dev/null
        echo -e "${GREEN}✓ Database dropped${NC}"
        DB_EXISTS=""
    fi
fi

if [ -z "$DB_EXISTS" ]; then
    echo -e "${BLUE}Creating database '${DB_NAME}'...${NC}"
    docker exec $DB_CONTAINER psql -U $DB_USER -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" > /dev/null
    echo -e "${GREEN}✓ Database '${DB_NAME}' created${NC}"
else
    echo -e "${YELLOW}⚠ Keeping existing database${NC}"
fi
echo ""

# Grant privileges
echo -e "${BLUE}Granting privileges...${NC}"
docker exec $DB_CONTAINER psql -U $DB_USER -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" > /dev/null
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO ${DB_USER};" > /dev/null
echo -e "${GREEN}✓ Privileges granted${NC}"
echo ""

# Verify setup
echo -e "${BLUE}Verifying setup...${NC}"

# Test connection as orcharduser
if docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ User can connect to database${NC}"
else
    echo -e "${RED}✗ User cannot connect to database${NC}"
    exit 1
fi

# Get PostgreSQL version
PG_VERSION=$(docker exec $DB_CONTAINER psql -U $DB_USER -tAc "SELECT version();" | head -1)
echo -e "${GREEN}✓ PostgreSQL version: ${PG_VERSION}${NC}"
echo ""

# Display connection information
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${BLUE}Connection Details:${NC}"
echo -e "  Host:     localhost (or db from Docker network)"
echo -e "  Port:     5432"
echo -e "  Database: ${DB_NAME}"
echo -e "  Username: ${DB_USER}"
echo -e "  Password: ${DB_PASSWORD}"
echo ""
echo -e "${BLUE}Connection String:${NC}"
echo -e "  ${YELLOW}Host=db;Database=${DB_NAME};Username=${DB_USER};Password=${DB_PASSWORD}${NC}"
echo ""
echo -e "${BLUE}To verify the setup, run:${NC}"
echo -e "  ${YELLOW}./scripts/verify-postgres.sh${NC}"
echo ""
echo -e "${BLUE}To connect manually:${NC}"
echo -e "  ${YELLOW}docker exec -it ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}${NC}"
echo ""
