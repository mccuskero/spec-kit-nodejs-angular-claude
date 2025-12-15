#!/bin/bash

echo "Introspecting Orchard Core GraphQL Schema..."
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

# Get all Query fields
echo "2. Getting all Query type fields..."
curl -s -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ __type(name: \"Query\") { fields { name description args { name type { name kind ofType { name kind } } } } } }"}' \
  | python3 -m json.tool > /tmp/graphql-query-fields.json

echo "✓ Saved to /tmp/graphql-query-fields.json"
echo ""

# Extract just field names
echo "3. Available Query fields:"
cat /tmp/graphql-query-fields.json | python3 -c "import sys, json; data = json.load(sys.stdin); fields = data.get('data', {}).get('__type', {}).get('fields', []); print('\n'.join([f['name'] for f in fields]))"

echo ""
echo "4. Looking for content-related fields..."
cat /tmp/graphql-query-fields.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
fields = data.get('data', {}).get('__type', {}).get('fields', [])
for field in fields:
    if 'content' in field['name'].lower():
        print(f\"\n{field['name']}:\")
        print(f\"  Description: {field.get('description', 'N/A')}\")
        if field.get('args'):
            print(f\"  Arguments:\")
            for arg in field['args']:
                print(f\"    - {arg['name']}: {arg.get('type', {}).get('name', 'N/A')}\")
"

echo ""
echo "Done! Full output in /tmp/graphql-query-fields.json"
