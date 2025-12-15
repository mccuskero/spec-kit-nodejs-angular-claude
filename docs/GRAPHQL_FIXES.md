# GraphQL and REST API Fixes

**Date**: 2025-12-15
**Issue**: 405 Method Not Allowed when creating folders via REST API

## Problem

The application was attempting to create folders using `POST /api/content/Folder`, which returned:
```
POST http://localhost:8080/api/content/Folder 405 (Method Not Allowed)
```

## Investigation

### GraphQL Mutations Not Available
Testing revealed that Orchard Core's GraphQL implementation does not support mutations:

```bash
./scripts/test-graphql-schema.sh
```

Result:
```json
{
    "data": {
        "__schema": {
            "mutationType": null  // ← No mutations available
        }
    }
}
```

### REST API Endpoint Discovery
Testing various endpoints:

1. ❌ `POST /api/content/Folder` → 405 Method Not Allowed
2. ✅ `POST /api/content` with `ContentType: "Folder"` → 200 Success

## Solution

### 1. Updated Folder Creation Endpoint

**File**: `frontend/src/app/modules/dashboard/services/content.service.ts`

Changed from:
```typescript
return this.http.post<Folder>(`${this.API_URL}/Folder`, payload)
```

To:
```typescript
// Use /api/content endpoint with ContentType in body
return this.http.post<Folder>(this.API_URL, payload)
```

### 2. Updated Request Payload

Added `ContentType` field to the payload:
```typescript
const payload = {
  ContentType: 'Folder',  // ← Required field
  DisplayText: request.displayText,
  Published: true,
  TaxonomyPart: {
    Repository: [request.repository]
  },
  ListPart: {},
  ...(request.parentFolderId && {
    ContainedPart: {
      ListContentItemId: request.parentFolderId,
      Order: 0
    }
  })
};
```

### 3. Fixed GraphQL Queries

All query operations continue to use GraphQL:
- `queryFolders()` - Uses GraphQL with `contentItems` query
- `queryContent()` - Uses GraphQL with `containedPart` filter
- `buildBreadcrumb()` - Uses GraphQL with `contentItem` query

## Testing Scripts Updated

### test-graphql-schema.sh
- Added authentication support
- Correct credentials: `admin` / `Admin123!`
- Tests schema introspection

### test-create-folder.sh (new)
- Tests folder creation via REST API
- Validates both endpoints
- Confirms successful creation

## Verified Endpoints

### Create Content (POST)
```bash
POST /api/content
Content-Type: application/json
Authorization: Bearer <token>

{
  "ContentType": "Folder",
  "DisplayText": "My Folder",
  "Published": true,
  "TaxonomyPart": {
    "Repository": ["Local"]
  },
  "ListPart": {}
}
```

### Query Content (REST API - UPDATED 2025-12-15)
```bash
# List all folders
GET /api/content?contentType=Folder
Authorization: Bearer <token>

# Get single item
GET /api/content/{contentItemId}
Authorization: Bearer <token>

# Note: GraphQL queries for lists are not supported
# GraphQL only supports contentItem (singular) for single item queries
```

## Key Findings

1. **Orchard Core GraphQL Limitations**:
   - Only queries are supported (no mutations)
   - GraphQL schema uses `contentItem` (singular), not `contentItems` (plural)
   - No support for querying multiple items via GraphQL
   - Must use REST API for all operations (create/read/update/delete)

2. **GraphQL Error Fixed (2025-12-15)**:
   - **Error**: `Cannot query field 'contentItems' on type 'Query'. Did you mean 'contentItem'?`
   - **Solution**: Switched all queries from GraphQL to REST API
   - **Reason**: Orchard Core GraphQL doesn't support list queries out of the box

3. **Correct REST Endpoints**:
   - Create: `POST /api/content` with `ContentType` in body
   - Read List: `GET /api/content?contentType=Folder`
   - Read Single: `GET /api/content/{contentItemId}`
   - Update: `PUT /api/content/{contentItemId}`
   - Delete: `DELETE /api/content/{contentItemId}`
   - Not supported: `/api/content/{ContentType}` endpoints return 405

4. **Authentication Required**:
   - All API calls require Bearer token
   - Obtain via `/connect/token` with password grant

5. **Environment Configuration**:
   - API Base URL: `http://localhost:8080/api/content`
   - GraphQL URL: `http://localhost:8080/api/graphql` (not used for queries)
   - Credentials: `admin` / `Admin123!`

## Build Status

✅ Build successful with no errors:
```
Application bundle generation complete. [2.962 seconds]
Output location: /Users/owenmccusker/Documents/dev/spec-kit/nodejs-test-claude/frontend/dist/frontend
```

## Next Steps

1. Test folder creation in the running application
2. Verify GraphQL queries work with real data
3. Implement error handling for API failures
4. Add unit tests for ContentService

## Related Files

- `frontend/src/app/modules/dashboard/services/content.service.ts` - Service implementation
- `scripts/test-graphql-schema.sh` - GraphQL testing script
- `scripts/test-create-folder.sh` - Folder creation testing script
- `specs/002-user-dashboard/contracts/orchard-content-api.yaml` - API contract
