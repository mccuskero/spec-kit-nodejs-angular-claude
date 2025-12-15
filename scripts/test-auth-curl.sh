#!/bin/bash

# Quick curl test for Orchard Core authentication
# Usage: ./test-auth-curl.sh [username] [password]

USERNAME=${1:-admin}
PASSWORD=${2:-Admin123!}

echo "Testing authentication with:"
echo "  Username: $USERNAME"
echo "  Password: $PASSWORD"
echo "  Client ID: angular-app"
echo ""
echo "Running curl command..."
echo ""

curl -X POST http://localhost:8080/connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=$USERNAME&password=$PASSWORD&client_id=angular-app&scope=openid profile roles" \
  -w "\n\nHTTP Status: %{http_code}\n" 
  
#| python3 -m json.tool 2>/dev/null || cat

echo ""
echo "====================================="
echo "If you see 'invalid_client' error:"
echo "  → The OpenID application 'angular-app' needs to be created in Orchard Core"
echo ""
echo "If you see 'invalid_grant' error:"
echo "  → Username or password is incorrect"
echo ""
echo "If you see 'unsupported_grant_type' error:"
echo "  → Password grant flow is not enabled for the client"
echo ""
echo "Run './scripts/verify-orchard-auth.sh' for detailed diagnostics"
echo "====================================="
