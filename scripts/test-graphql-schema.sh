#!/bin/bash

echo "Testing GraphQL Schema..."
echo ""

# Get authentication token first
echo "0. Getting authentication token..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8080/connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=admin&password=Admin123!&client_id=angular-app")

TOKEN=$(echo $TOKEN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "Failed to get authentication token. Response:"
  echo $TOKEN_RESPONSE | python3 -m json.tool
  exit 1
fi

echo "✓ Authentication successful"
echo ""

# Test basic schema
echo "1. Testing basic schema availability..."
curl -s -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ __schema { queryType { name } } }"}' \
  | python3 -m json.tool

echo ""
echo "2. Checking available mutations..."
curl -s -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ __schema { mutationType { fields { name description } } } }"}' \
  | python3 -m json.tool

echo ""
echo "3. Introspecting contentItems query..."
curl -s -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ __type(name: \"Query\") { fields { name args { name type { name kind ofType { name } } } } } }"}' \
  | python3 -m json.tool | grep -A 10 "contentItems"

echo ""
echo "Done!"
