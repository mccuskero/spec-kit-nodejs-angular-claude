#!/bin/bash

echo "Testing File Upload and Folder Update (3-Stage Approach)..."
echo ""
echo "This script demonstrates the proper way to add media to a folder:"
echo "  1. Upload file to Media API"
echo "  2. Retrieve existing folder content item"
echo "  3. Update the folder with the new media item via PUT"
echo ""

# Check arguments
FOLDER_ID="$1"
FILE_PATH="${2:-./scripts/data/sunset.JPG}"

if [ -z "$FOLDER_ID" ]; then
  echo "Usage: ./test-add-file.sh <folder-content-item-id> [file-path]"
  echo ""
  echo "Arguments:"
  echo "  folder-content-item-id  The ContentItemId of the folder to add the file to"
  echo "  file-path               Path to the file to upload (default: ./scripts/data/sunset.JPG)"
  echo ""
  exit 1
fi

# Check if the file exists
if [ ! -f "$FILE_PATH" ]; then
  echo "Error: File not found at $FILE_PATH"
  exit 1
fi

# Get authentication token
echo "=== Stage 0: Authentication ==="
echo "Getting authentication token..."
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

# ============================================================================
# STAGE 1: Upload file to Media API
# ============================================================================
echo "=== Stage 1: Upload File to Media API ==="
echo "Uploading: $FILE_PATH"
echo "Endpoint: POST http://localhost:8080/api/media"
echo ""

UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:8080/api/media \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$FILE_PATH" \
  -w "\nHTTP_STATUS:%{http_code}")

# Extract HTTP status
HTTP_STATUS=$(echo "$UPLOAD_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
UPLOAD_BODY=$(echo "$UPLOAD_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" != "200" ] && [ "$HTTP_STATUS" != "201" ]; then
  echo "✗ File upload failed with status $HTTP_STATUS"
  echo "Response: $UPLOAD_BODY"
  exit 1
fi

echo "✓ File uploaded successfully"
echo ""

# Parse the uploaded media info
# Expected response format: { "path": "/media/...", "name": "...", "url": "...", "size": ..., "mimeType": "..." }
echo "Upload Response:"
echo "$UPLOAD_BODY" | python3 -m json.tool 2>/dev/null || echo "$UPLOAD_BODY"
echo ""

# Extract media info for later use
MEDIA_PATH=$(echo "$UPLOAD_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('path', ''))" 2>/dev/null)
MEDIA_NAME=$(echo "$UPLOAD_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('name', ''))" 2>/dev/null)
MEDIA_URL=$(echo "$UPLOAD_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('url', ''))" 2>/dev/null)
MEDIA_SIZE=$(echo "$UPLOAD_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('size', 0))" 2>/dev/null)
MEDIA_MIME=$(echo "$UPLOAD_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('mimeType', ''))" 2>/dev/null)

echo "Extracted media info:"
echo "  Path: $MEDIA_PATH"
echo "  Name: $MEDIA_NAME"
echo "  URL: $MEDIA_URL"
echo "  Size: $MEDIA_SIZE"
echo "  MimeType: $MEDIA_MIME"
echo ""

# ============================================================================
# STAGE 2: Retrieve existing folder content item
# ============================================================================
echo "=== Stage 2: Retrieve Existing Folder Content Item ==="
echo "Folder ID: $FOLDER_ID"
echo "Endpoint: GET http://localhost:8080/api/content/$FOLDER_ID"
echo ""

GET_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "http://localhost:8080/api/content/$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

HTTP_STATUS=$(echo "$GET_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
FOLDER_BODY=$(echo "$GET_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" != "200" ]; then
  echo "✗ Failed to retrieve folder content item"
  if [ "$HTTP_STATUS" = "404" ]; then
    echo "Folder with ID '$FOLDER_ID' not found"
  fi
  echo "Response: $FOLDER_BODY"
  exit 1
fi

echo "✓ Folder content item retrieved successfully"
echo ""

echo "Current Folder Content:"
echo "$FOLDER_BODY" | python3 -m json.tool 2>/dev/null || echo "$FOLDER_BODY"
echo ""

# ============================================================================
# STAGE 3: Update folder with new media item via PUT
# ============================================================================
echo "=== Stage 3: Update Folder with New Media Item via PUT ==="
echo ""

# Use Python to update the content item JSON with the new media item
UPDATED_CONTENT=$(python3 << EOF
import sys
import json

# Parse the existing folder content
folder_data = json.loads('''$FOLDER_BODY''')

# New media item to add
new_media_item = {
    "path": "$MEDIA_PATH",
    "name": "$MEDIA_NAME",
    "url": "$MEDIA_URL",
    "size": int("$MEDIA_SIZE") if "$MEDIA_SIZE".isdigit() else 0,
    "mimeType": "$MEDIA_MIME"
}

# Check if MediaPart exists, if not create it
# OrchardCore typically uses a structure like: { "MediaPart": { "MediaField": { "Paths": [...] } } }
# or it might be stored as MediaItems directly

# Try different possible structures
if "MediaPart" in folder_data and "MediaField" in folder_data.get("MediaPart", {}):
    # Structure: MediaPart.MediaField.Paths
    if "Paths" not in folder_data["MediaPart"]["MediaField"]:
        folder_data["MediaPart"]["MediaField"]["Paths"] = []
    folder_data["MediaPart"]["MediaField"]["Paths"].append(new_media_item["path"])
elif "MediaItems" in folder_data:
    # Structure: MediaItems array
    folder_data["MediaItems"].append(new_media_item)
else:
    # Create MediaItems array if nothing exists
    folder_data["MediaItems"] = [new_media_item]

# Output the updated JSON
print(json.dumps(folder_data, indent=2))
EOF
)

if [ $? -ne 0 ]; then
  echo "✗ Failed to update folder content JSON"
  exit 1
fi

echo "Updated Content Item (to be sent via POST):"
echo "$UPDATED_CONTENT" | python3 -m json.tool 2>/dev/null || echo "$UPDATED_CONTENT"
echo ""

# OrchardCore uses POST to /api/content for both create AND update
# When ContentItemId is included in the body, it updates the existing item
echo "Sending POST request to http://localhost:8080/api/content (update via POST with ContentItemId)"
echo ""

POST_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "http://localhost:8080/api/content" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATED_CONTENT")

HTTP_STATUS=$(echo "$POST_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
POST_BODY=$(echo "$POST_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "HTTP Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "204" ]; then
  echo "✓ Folder updated successfully with new media item!"
  echo ""
  if [ -n "$POST_BODY" ]; then
    echo "Response:"
    echo "$POST_BODY" | python3 -m json.tool 2>/dev/null || echo "$POST_BODY"
  fi
elif [ "$HTTP_STATUS" = "201" ]; then
  echo "✓ Folder updated successfully (201 Created)"
  echo ""
  if [ -n "$POST_BODY" ]; then
    echo "Response:"
    echo "$POST_BODY" | python3 -m json.tool 2>/dev/null || echo "$POST_BODY"
  fi
elif [ "$HTTP_STATUS" = "404" ]; then
  echo "✗ Endpoint not found (404)"
  echo ""
  echo "Response:"
  echo "$POST_BODY"
elif [ "$HTTP_STATUS" = "400" ]; then
  echo "✗ Bad Request (400)"
  echo "The content item format may be incorrect."
  echo ""
  echo "Response:"
  echo "$POST_BODY" | python3 -m json.tool 2>/dev/null || echo "$POST_BODY"
elif [ "$HTTP_STATUS" = "401" ]; then
  echo "✗ Unauthorized (401)"
  echo "Authentication token may be invalid or expired"
elif [ "$HTTP_STATUS" = "403" ]; then
  echo "✗ Forbidden (403)"
  echo "User may not have permission to update this content item"
else
  echo "✗ POST request failed with status $HTTP_STATUS"
  echo ""
  echo "Response:"
  echo "$POST_BODY" | python3 -m json.tool 2>/dev/null || echo "$POST_BODY"
fi

echo ""
echo "=== Summary ==="
echo "File uploaded: $MEDIA_PATH"
echo "Folder ID: $FOLDER_ID"
echo "Final status: $HTTP_STATUS"
echo ""
echo "Done!"
