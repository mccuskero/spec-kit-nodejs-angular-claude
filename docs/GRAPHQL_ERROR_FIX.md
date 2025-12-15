# GraphQL Error Fix - contentItems Query

**Date**: 2025-12-15
**Error**: `POST http://localhost:8080/api/graphql 400 (Bad Request)`
**Message**: `Cannot query field 'contentItems' on type 'Query'. Did you mean 'contentItem'?`

## Problem

The application was attempting to query multiple content items using GraphQL with the query:
```graphql
query {
  contentItems(where: { contentType: "Folder" }) {
    contentItemId
    displayText
    ...
  }
}
```

However, Orchard Core's GraphQL schema does not support `contentItems` (plural). It only has `contentItem` (singular) which returns a single item by ID.

## Root Cause

Orchard Core's GraphQL module has limited query support:
- ✅ `contentItem(contentItemId: String!)` - Returns single item
- ❌ `contentItems(where: {...})` - **Not available**

This means:
- GraphQL cannot be used for listing/querying multiple items
- GraphQL cannot be used with filters, pagination, or sorting
- GraphQL is only suitable for fetching single items by ID

## Solution

Switched from GraphQL queries to REST API for all read operations:

### Before (GraphQL - Failed)
```typescript
queryFolders(repository: RepositoryLocation, parentFolderId?: string) {
  const query = `
    query QueryFolders($repository: String!, $parentFolderId: String) {
      contentItems(
        where: {
          contentType: "Folder"
          ...
        }
        first: 100
        orderBy: { displayText: ASC }
      ) {
        contentItemId
        displayText
        ...
      }
    }
  `;

  return this.http.post(this.GRAPHQL_URL, { query, variables });
}
```

### After (REST API - Working)
```typescript
queryFolders(repository: RepositoryLocation, parentFolderId?: string) {
  let url = `${this.API_URL}?contentType=Folder`;

  return this.http.get<Folder[]>(url).pipe(
    map(folders => {
      // Client-side filtering for parent folder
      let filtered = folders;
      if (parentFolderId) {
        filtered = filtered.filter(f =>
          f.containedPart?.listContentItemId === parentFolderId
        );
      }
      return { folders: filtered, totalCount: filtered.length };
    })
  );
}
```

## Changes Made

### 1. queryFolders() - content.service.ts:73
- Changed from: GraphQL query with `contentItems`
- Changed to: REST GET request to `/api/content?contentType=Folder`
- Added: Client-side filtering for parent folder

### 2. queryContent() - content.service.ts:110
- Changed from: GraphQL query with `contentItems`
- Changed to: REST GET request to `/api/content`
- Added: Client-side filtering by folder and content type

### 3. getFolderById() - content.service.ts:195
- Changed from: GraphQL query with `contentItem`
- Changed to: REST GET request to `/api/content/{id}`
- Note: This one could still use GraphQL, but REST is more consistent

## Trade-offs

### GraphQL Approach (Original)
- ❌ Not supported by Orchard Core
- ❌ Results in 400 Bad Request error
- ✅ Would allow server-side filtering (if it worked)
- ✅ Would allow complex queries (if it worked)

### REST API Approach (Current)
- ✅ Fully supported by Orchard Core
- ✅ Works immediately
- ❌ Limited filtering (client-side only)
- ❌ No complex server-side queries
- ❌ Must fetch all items then filter

## Performance Considerations

### Current Limitations
- Fetches ALL folders/items, then filters client-side
- Not scalable for large datasets (>1000 items)
- No server-side pagination

### Future Improvements Needed
If the application scales to many items:
1. **Custom REST API endpoints** with server-side filtering
2. **Orchard Core Lucene module** for advanced queries
3. **Custom GraphQL resolvers** (requires Orchard Core customization)
4. **Virtual scrolling** in UI for large lists

## REST API Endpoints Now Used

### Query Operations
```http
# List all folders
GET /api/content?contentType=Folder
Authorization: Bearer {token}

# List all content (then filter client-side)
GET /api/content
Authorization: Bearer {token}

# Get single item
GET /api/content/{contentItemId}
Authorization: Bearer {token}
```

### Create Operations
```http
POST /api/content
Content-Type: application/json
Authorization: Bearer {token}

{
  "ContentType": "Folder",
  "DisplayText": "My Folder",
  "Published": true,
  ...
}
```

### Update Operations
```http
PUT /api/content/{contentItemId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "DisplayText": "Updated Name",
  "Published": false
}
```

### Delete Operations
```http
DELETE /api/content/{contentItemId}
Authorization: Bearer {token}
```

## Testing

### Verified Working
✅ Folder creation via REST API
✅ Folder listing via REST API
✅ Single folder retrieval via REST API
✅ Client-side filtering by parent folder
✅ Build successful with no errors

### Not Yet Tested
⏳ Large datasets (>100 items)
⏳ Repository filtering
⏳ Breadcrumb navigation with deep hierarchies

## Build Status

✅ **Build Successful**
```
Application bundle generation complete. [3.212 seconds]
Output location: frontend/dist/frontend
```

⚠️ **Warning** (Non-blocking):
```
folder-list.component.scss exceeded maximum budget by 1.75 kB
(Expected due to comprehensive table styling)
```

## Recommendations

### Short Term (Current Implementation)
- ✅ Use REST API for all operations
- ✅ Accept client-side filtering for now
- ✅ Monitor performance with real data

### Medium Term (If scaling needed)
1. Add virtual scrolling to folder-list component
2. Implement client-side caching
3. Add loading states for large queries
4. Consider pagination UI

### Long Term (If many items)
1. Create custom Orchard Core API controllers with filtering
2. Enable and configure Orchard Core Lucene module
3. Implement server-side search and filtering
4. Consider creating custom GraphQL resolvers

## Files Modified

1. `frontend/src/app/modules/dashboard/services/content.service.ts`
   - queryFolders() - Line 73
   - queryContent() - Line 110
   - getFolderById() - Line 195

## References

- Orchard Core GraphQL Documentation: https://docs.orchardcore.net/en/latest/reference/modules/GraphQL/
- Orchard Core Content API: https://docs.orchardcore.net/en/latest/reference/modules/ContentManagement/
- Issue discussion: GraphQL queries limited to single items

## Summary

The GraphQL error was resolved by switching all query operations from GraphQL to REST API. While this requires client-side filtering (less efficient), it's a working solution that integrates properly with Orchard Core's API structure. The application now successfully queries folders and content items without errors.
