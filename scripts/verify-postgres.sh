#!/bin/bash
set -e

# PostgreSQL Verification Script
# This script verifies that the PostgreSQL database is properly configured for OrchardCore

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
echo -e "${BLUE}PostgreSQL Verification${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Track if all tests pass
ALL_TESTS_PASSED=true

# Test 1: Check if Docker is running
echo -e "${BLUE}[1/8] Checking if Docker is running...${NC}"
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker is running${NC}"
else
    echo -e "${RED}✗ Docker is not running${NC}"
    ALL_TESTS_PASSED=false
fi
echo ""

# Test 2: Check if database container is running
echo -e "${BLUE}[2/8] Checking if database container is running...${NC}"
if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo -e "${GREEN}✓ Container '${DB_CONTAINER}' is running${NC}"
else
    echo -e "${RED}✗ Container '${DB_CONTAINER}' is not running${NC}"
    ALL_TESTS_PASSED=false
fi
echo ""

# Test 3: Check if PostgreSQL is ready
echo -e "${BLUE}[3/8] Checking if PostgreSQL is ready...${NC}"
if docker exec $DB_CONTAINER pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not ready${NC}"
    ALL_TESTS_PASSED=false
fi
echo ""

# Test 4: Check if user exists
echo -e "${BLUE}[4/8] Checking if user '${DB_USER}' exists...${NC}"
USER_EXISTS=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" 2>/dev/null || echo "")

if [ "$USER_EXISTS" = "1" ]; then
    echo -e "${GREEN}✓ User '${DB_USER}' exists${NC}"
else
    echo -e "${RED}✗ User '${DB_USER}' does not exist${NC}"
    ALL_TESTS_PASSED=false
fi
echo ""

# Test 5: Check if database exists
echo -e "${BLUE}[5/8] Checking if database '${DB_NAME}' exists...${NC}"
DB_EXISTS=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null || echo "")
if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${GREEN}✓ Database '${DB_NAME}' exists${NC}"
else
    echo -e "${RED}✗ Database '${DB_NAME}' does not exist${NC}"
    ALL_TESTS_PASSED=false
fi
echo ""

# Test 6: Check if user can connect to database
echo -e "${BLUE}[6/8] Testing user connection to database...${NC}"
if docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ User can connect to database${NC}"
else
    echo -e "${RED}✗ User cannot connect to database${NC}"
    ALL_TESTS_PASSED=false
fi
echo ""

# Test 7: Check database owner
echo -e "${BLUE}[7/8] Checking database ownership...${NC}"
DB_OWNER=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -tAc "SELECT pg_catalog.pg_get_userbyid(d.datdba) FROM pg_catalog.pg_database d WHERE d.datname = '${DB_NAME}';" 2>/dev/null | tr -d '[:space:]')
if [ "$DB_OWNER" = "$DB_USER" ]; then
    echo -e "${GREEN}✓ Database owned by '${DB_USER}'${NC}"
else
    echo -e "${YELLOW}⚠ Database owned by '${DB_OWNER}' (expected '${DB_USER}')${NC}"
fi
echo ""

# Test 8: Check user privileges
echo -e "${BLUE}[8/8] Checking user privileges...${NC}"
PRIVILEGES=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -tAc "SELECT has_database_privilege('${DB_USER}', '${DB_NAME}', 'CREATE');" 2>/dev/null | tr -d '[:space:]')
if [ "$PRIVILEGES" = "t" ]; then
    echo -e "${GREEN}✓ User has CREATE privilege on database${NC}"
else
    echo -e "${RED}✗ User does not have CREATE privilege on database${NC}"
    ALL_TESTS_PASSED=false
fi
echo ""

# Get additional information
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Database Information${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# PostgreSQL version
PG_VERSION=$(docker exec $DB_CONTAINER psql -U $POSTGRES_USER -tAc "SELECT version();" 2>/dev/null | head -1 || echo "Unknown")
echo -e "${BLUE}PostgreSQL Version:${NC} $PG_VERSION"

# Database size
DB_SIZE=$(docker exec $DB_CONTAINER psql -U $POSTGRES_USER -tAc "SELECT pg_size_pretty(pg_database_size('${DB_NAME}'));" 2>/dev/null | tr -d '[:space:]' || echo "Unknown")
echo -e "${BLUE}Database Size:${NC} $DB_SIZE"

# Number of tables
TABLE_COUNT=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d '[:space:]' || echo "Unknown")
echo -e "${BLUE}Number of Tables:${NC} $TABLE_COUNT"

# Connection count
CONNECTION_COUNT=$(docker exec $DB_CONTAINER psql -U $POSTGRES_USER -tAc "SELECT COUNT(*) FROM pg_stat_activity WHERE datname='${DB_NAME}';" 2>/dev/null | tr -d '[:space:]' || echo "Unknown")
echo -e "${BLUE}Active Connections:${NC} $CONNECTION_COUNT"
echo ""

# Display connection string
echo -e "${BLUE}Connection String:${NC}"
echo -e "  ${YELLOW}Host=db;Database=${DB_NAME};Username=${DB_USER};Password=${DB_PASSWORD}${NC}"
echo ""

# Final result
echo -e "${BLUE}========================================${NC}"
if [ "$ALL_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${GREEN}PostgreSQL is ready for OrchardCore${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo -e "${YELLOW}Run './scripts/setup-postgres.sh' to fix issues${NC}"
    EXIT_CODE=1
fi
echo -e "${BLUE}========================================${NC}"
echo ""

exit $EXIT_CODE
