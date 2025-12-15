#!/bin/bash

echo "Testing Folder Creation API..."
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

# Test creating a folder via REST API
echo "2. Testing POST /api/content/Folder..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/content/Folder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP_STATUS:%{http_code}" \
  -d '{
    "DisplayText": "Test Folder",
    "Published": true,
    "TaxonomyPart": {
      "Repository": ["Local"]
    },
    "ListPart": {}
  }')

echo "$CREATE_RESPONSE"
echo ""

# Test creating via /api/content (generic endpoint)
echo "3. Testing POST /api/content with ContentType..."
CREATE_RESPONSE2=$(curl -s -X POST http://localhost:8080/api/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP_STATUS:%{http_code}" \
  -d '{
    "ContentType": "Folder",
    "DisplayText": "Test Folder 2",
    "Published": true,
    "TaxonomyPart": {
      "Repository": ["Local"]
    },
    "ListPart": {}
  }')

echo "$CREATE_RESPONSE2"
echo ""

# Test listing existing content types
echo "4. Testing GET /api/content to see available content..."
curl -s -X GET "http://localhost:8080/api/content?contentType=Folder&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool

echo ""
echo "Done!"
