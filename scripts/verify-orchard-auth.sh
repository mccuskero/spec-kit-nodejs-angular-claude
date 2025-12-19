#!/bin/bash

# Orchard Core Authentication Verification Script
# Tests OpenID Connect configuration and authentication

set -e

ORCHARD_URL="http://localhost:8080"
CLIENT_ID="angular-app"

echo "======================================"
echo "Orchard Core Auth Verification"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if Orchard Core is running
echo "1. Checking Orchard Core availability..."
if curl -s -o /dev/null -w "%{http_code}" "$ORCHARD_URL" | grep -q "200\|302"; then
    echo -e "${GREEN}✓${NC} Orchard Core is running at $ORCHARD_URL"
else
    echo -e "${RED}✗${NC} Orchard Core is not accessible at $ORCHARD_URL"
    exit 1
fi
echo ""

# Step 2: Check OpenID Discovery endpoint
echo "2. Checking OpenID Connect configuration..."
if curl -s "$ORCHARD_URL/.well-known/openid-configuration" | grep -q "token_endpoint"; then
    echo -e "${GREEN}✓${NC} OpenID Connect is configured"

    # Check grant types
    GRANT_TYPES=$(curl -s "$ORCHARD_URL/.well-known/openid-configuration" | python3 -c "import sys, json; print(json.load(sys.stdin)['grant_types_supported'])" 2>/dev/null || echo "[]")
    echo "  Supported grant types: $GRANT_TYPES"

    if echo "$GRANT_TYPES" | grep -q "password"; then
        echo -e "  ${GREEN}✓${NC} Password grant type is supported"
    else
        echo -e "  ${RED}✗${NC} Password grant type is NOT supported"
        echo ""
        echo -e "${YELLOW}ACTION REQUIRED:${NC}"
        echo "  1. Go to $ORCHARD_URL/Admin"
        echo "  2. Navigate to: Security → OpenID Connect → Applications"
        echo "  3. Create or edit 'angular-app' application"
        echo "  4. Enable 'Allow Password Flow' checkbox"
        echo "  5. Add 'password' to Grant Types"
        echo ""
        exit 1
    fi
else
    echo -e "${RED}✗${NC} OpenID Connect is not configured"
    echo ""
    echo -e "${YELLOW}ACTION REQUIRED:${NC}"
    echo "  1. Go to $ORCHARD_URL/Admin"
    echo "  2. Navigate to: Configuration → Features"
    echo "  3. Enable 'OpenID' module (OrchardCore.OpenId)"
    echo ""
    exit 1
fi
echo ""

# Step 3: Prompt for credentials
#echo "3. Testing authentication..."
#read -p "Enter username [admin]: " USERNAME
# USERNAME=${USERNAME:-admin}
USERNAME=admin

#read -sp "Enter password: " PASSWORD
#echo ""
#echo ""
PASSWORD=Admin123!

# Step 4: Test authentication
echo "Attempting login..."
RESPONSE=$(curl -s -X POST "$ORCHARD_URL/connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password&username=$USERNAME&password=$PASSWORD&client_id=$CLIENT_ID&scope=openid profile roles")

# this will display the token
# echo $(curl -s -X POST "$ORCHARD_URL/connect/token" \
#    -H "Content-Type: application/x-www-form-urlencoded" \
#    -d "grant_type=password&username=$USERNAME&password=$PASSWORD&client_id=$CLIENT_ID&scope=openid profile roles")

# Check response
if echo "$RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓${NC} Authentication successful!"
    echo ""
    echo "Access Token (first 50 chars):"
    echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'][:50] + '...')" 2>/dev/null
    echo ""
    echo "Token Type:"
    echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token_type'])" 2>/dev/null
    echo ""
    echo "Expires In:"
    echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['expires_in'], 'seconds')" 2>/dev/null
    echo ""
    echo -e "${GREEN}======================================"
    echo "All checks passed!"
    echo "======================================${NC}"
    exit 0
else
    echo -e "${RED}✗${NC} Authentication failed"
    echo ""
    echo "Error Response:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    echo ""

    # Check for specific errors
    if echo "$RESPONSE" | grep -q "invalid_client"; then
        echo -e "${YELLOW}Error: Client not configured${NC}"
        echo "The 'angular-app' client is not registered in Orchard Core."
        echo ""
        echo -e "${YELLOW}ACTION REQUIRED:${NC}"
        echo "  1. Go to $ORCHARD_URL/Admin"
        echo "  2. Navigate to: Security → OpenID Connect → Applications"
        echo "  3. Click 'Add Application'"
        echo "  4. Configure:"
        echo "     - Client ID: angular-app"
        echo "     - Display Name: Angular Dashboard"
        echo "     - Type: Public"
        echo "     - Allow Password Flow: ✓ CHECKED"
        echo "     - Grant Types: password"
        echo "     - Allowed Scopes: openid, profile, roles"
        echo "  5. Click 'Save'"
        echo ""
    elif echo "$RESPONSE" | grep -q "invalid_grant"; then
        echo -e "${YELLOW}Error: Invalid credentials${NC}"
        echo "The username or password is incorrect."
        echo ""
        echo "Verify your credentials and try again."
        echo ""
    elif echo "$RESPONSE" | grep -q "unsupported_grant_type"; then
        echo -e "${YELLOW}Error: Password grant not enabled${NC}"
        echo "The 'password' grant type is not enabled for the client."
        echo ""
        echo -e "${YELLOW}ACTION REQUIRED:${NC}"
        echo "  1. Go to $ORCHARD_URL/Admin"
        echo "  2. Navigate to: Security → OpenID Connect → Applications"
        echo "  3. Edit the 'angular-app' application"
        echo "  4. Enable 'Allow Password Flow' checkbox"
        echo "  5. Add 'password' to Grant Types"
        echo ""
    fi

    exit 1
fi
