#!/bin/bash

echo "Testing Folder Update via Content API..."
echo ""

# Get authentication token
echo "1. Getting authentication token..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8080/connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=admin&password=Admin123!&client_id=angular-app")

TOKEN=$(echo $TOKEN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "Failed to get authentication token."
  echo "Response: $TOKEN_RESPONSE"
  exit 1
fi

echo "✓ Authentication successful"
echo ""

# First, get an existing folder ID
echo "2. Querying for an existing folder..."
FOLDER_ID="$1"

if [ -z "$FOLDER_ID" ]; then
  echo "Error: Please provide a folder ID as the first argument"
  echo "Usage: ./test-update-folder.sh <folder-id>"
  exit 1
fi

echo "Folder ID: $FOLDER_ID"
echo ""

# Get the folder details first
echo "3. Getting folder details with GET..."
GET_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/content/$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "GET Response:"
echo "$GET_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$GET_RESPONSE"
echo ""

# Test OPTIONS to see what methods are allowed
echo "4. Testing OPTIONS to see allowed methods..."
OPTIONS_RESPONSE=$(curl -s -i -X OPTIONS "http://localhost:8080/api/content/$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN" 2>&1)

echo "OPTIONS Response Headers:"
echo "$OPTIONS_RESPONSE" | grep -i "allow:"
echo ""

# Try PUT request
echo "5. Testing PUT request..."
PUT_PAYLOAD='{
  "ContentItemId": "'"$FOLDER_ID"'",
  "MediaItems": [
    {
      "path": "/media/test/file.jpg",
      "name": "file.jpg",
      "url": "http://localhost:8080/media/test/file.jpg",
      "size": 12345,
      "mimeType": "image/jpeg"
    }
  ]
}'

PUT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "http://localhost:8080/api/content/$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PUT_PAYLOAD")

HTTP_STATUS=$(echo "$PUT_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$PUT_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "HTTP Status: $HTTP_STATUS"
echo "Response Body:"
echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

# Try PATCH as alternative
echo "6. Testing PATCH request as alternative..."
PATCH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PATCH "http://localhost:8080/api/content/$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PUT_PAYLOAD")

HTTP_STATUS=$(echo "$PATCH_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$PATCH_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "HTTP Status: $HTTP_STATUS"
echo "Response Body:"
echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

echo "Done!"
