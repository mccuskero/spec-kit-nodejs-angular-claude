#!/bin/bash

echo "Testing Get Folder Content Item via /api/content endpoint..."
echo ""

# Check if folder ID was provided
if [ -z "$1" ]; then
  echo "Error: Please provide a folder content item ID as the first argument"
  echo "Usage: ./test-get-folder-content.sh <folder-content-item-id>"
  exit 1
fi

FOLDER_ID="$1"

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

# Get folder content item
echo "2. Getting folder content item: $FOLDER_ID"
echo "Endpoint: GET http://localhost:8080/api/content/$FOLDER_ID"
echo ""

GET_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "http://localhost:8080/api/content/$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

# Extract HTTP status
HTTP_STATUS=$(echo "$GET_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$GET_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "HTTP Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✓ Successfully retrieved folder content item!"
  echo ""
  echo "Response (formatted):"
  echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
  echo ""

  # Extract and display specific fields
  echo "=== Key Fields ==="
  echo "ContentItemId: $(echo "$RESPONSE_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('contentItemId', 'N/A'))" 2>/dev/null)"
  echo "DisplayText: $(echo "$RESPONSE_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('displayText', 'N/A'))" 2>/dev/null)"
  echo "ContentType: $(echo "$RESPONSE_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('contentType', 'N/A'))" 2>/dev/null)"
  echo "Published: $(echo "$RESPONSE_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('published', 'N/A'))" 2>/dev/null)"
  echo ""

  # Check for MediaItems field
  MEDIA_ITEMS=$(echo "$RESPONSE_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); items=data.get('MediaItems', []); print(f'{len(items)} items' if items else 'No MediaItems field')" 2>/dev/null)
  echo "MediaItems: $MEDIA_ITEMS"

  if [ "$MEDIA_ITEMS" != "No MediaItems field" ] && [ "$MEDIA_ITEMS" != "0 items" ]; then
    echo ""
    echo "=== MediaItems Details ==="
    echo "$RESPONSE_BODY" | python3 -c "
import sys, json
data = json.load(sys.stdin)
media_items = data.get('MediaItems', [])
for i, item in enumerate(media_items, 1):
    print(f'  Item {i}:')
    print(f'    Name: {item.get(\"name\", \"N/A\")}')
    print(f'    Path: {item.get(\"path\", \"N/A\")}')
    print(f'    URL: {item.get(\"url\", \"N/A\")}')
    print(f'    Size: {item.get(\"size\", \"N/A\")} bytes')
    print(f'    MimeType: {item.get(\"mimeType\", \"N/A\")}')
    print()
" 2>/dev/null
  fi

elif [ "$HTTP_STATUS" = "404" ]; then
  echo "✗ Folder not found (404)"
  echo "Content item ID '$FOLDER_ID' does not exist"
elif [ "$HTTP_STATUS" = "401" ]; then
  echo "✗ Unauthorized (401)"
  echo "Authentication token may be invalid or expired"
else
  echo "✗ Request failed with status $HTTP_STATUS"
  echo ""
  echo "Response:"
  echo "$RESPONSE_BODY"
fi

echo ""
echo "Done!"
