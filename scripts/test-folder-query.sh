#!/bin/bash

echo "Testing Folder GraphQL Query..."
echo ""

# Get authentication token
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

# Check FolderWhereInput type
echo "1. Checking FolderWhereInput fields..."
curl -s -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ __type(name: \"FolderWhereInput\") { inputFields { name description } } }"}' \
  | python3 -m json.tool

echo ""
echo "2. Testing simple folder query (get all folders)..."
curl -s -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ folder { contentItemId displayText createdUtc modifiedUtc published } }"}' \
  | python3 -m json.tool

echo ""
echo "Done!"
