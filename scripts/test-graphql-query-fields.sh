#!/bin/bash

echo "Testing GraphQL Query Fields..."
echo ""

# Get authentication token
echo "1. Getting authentication token..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8080/connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=admin&password=Admin123!&client_id=angular-app")

TOKEN=$(echo $TOKEN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "Failed to get authentication token."
  exit 1
fi

echo "✓ Authentication successful"
echo ""

# Check available Query fields
echo "2. Checking available Query fields..."
curl -s -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ __type(name: \"Query\") { fields { name description } } }"}' \
  | python3 -m json.tool

echo ""
echo "Done!"
