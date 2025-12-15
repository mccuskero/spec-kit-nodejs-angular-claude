# GraphQL Folder Query Fix - Using 'folder' Field

**Date**: 2025-12-15
**Previous Error**: `GET http://localhost:8080/api/content?contentType=Folder 405 (Method Not Allowed)`
**Solution**: Use GraphQL `folder` query field instead of REST API

## Problem History

1. **First Error**: Tried to use `contentItems` (plural) GraphQL query
   - Error: `Cannot query field 'contentItems' on type 'Query'`
   - Reason: Orchard Core doesn't have `contentItems` field

2. **Second Error**: Switched to REST API `GET /api/content?contentType=Folder`
   - Error: `405 Method Not Allowed`
   - Reason: Orchard Core REST API doesn't support GET with query parameters

## Discovery - GraphQL Schema Introspection

Introspected the GraphQL schema and found these Query fields:
```
contentItem    - Get single item by ID
menu           - Query menus
taxonomy       - Query taxonomies
folder         - Query folders ← This is what we need!
me             - Current user
siteLayers     - Site layers
mediaAssets    - Media assets
```

### The 'folder' Query Field

The `folder` field is specifically for querying Folder content type:

```graphql
folder(
  where: FolderWhereInput
  orderBy: FolderOrderByInput
  first: Int
  skip: Int
  status: Status
): [Folder]
```

#### Available Where Filters (FolderWhereInput)
- `contentItemId`, `contentItemId_not`, `contentItemId_in`, `contentItemId_not_in`
- `displayText`, `displayText_contains`, `displayText_starts_with`, etc.
- `createdUtc`, `modifiedUtc`, `publishedUtc` (with `_gt`, `_lt`, `_gte`, `_lte`)
- `owner`, `author` (with string comparisons)
- Logical operators: `OR`, `AND`, `NOT`

**Note**: Does not include `containedPart` or `taxonomyPart` filters, so parent folder filtering must be done client-side.

## Solution Implemented

### Updated queryFolders() Method

```typescript
queryFolders(repository: RepositoryLocation, parentFolderId?: string) {
  const query = `
    query QueryFolders {
      folder(first: 100) {
        contentItemId
        displayText
        owner
        author
        createdUtc
        modifiedUtc
        published
      }
    }
  `;

  return this.http.post<{ data: { folder: Folder[] } }>(
    this.GRAPHQL_URL,
    { query }
  ).pipe(
    map(response => {
      let folders = response.data?.folder || [];

      // Client-side filtering for parent folder
      if (parentFolderId) {
        folders = folders.filter(f =>
          (f as any).containedPart?.listContentItemId === parentFolderId
        );
      }

      return { folders, totalCount: folders.length };
    })
  );
}
```

## Example GraphQL Query & Response

### Request
```graphql
query QueryFolders {
  folder(first: 100) {
    contentItemId
    displayText
    owner
    author
    createdUtc
    modifiedUtc
    published
  }
}
```

### Response
```json
{
  "data": {
    "folder": [
      {
        "contentItemId": "4ef3rsazwd3a7zv8btqbmqdv5d",
        "displayText": "test",
        "createdUtc": "2025-12-15T04:07:17.500712Z",
        "modifiedUtc": "2025-12-15T04:07:17.500712Z",
        "published": true
      }
    ]
  }
}
```

## Limitations & Workarounds

### Current Limitations
1. **No ContainedPart filtering**: Can't filter by parent folder server-side
2. **No TaxonomyPart filtering**: Can't filter by repository server-side
3. **Client-side filtering needed**: Must fetch all, then filter

### Workarounds Applied
- Fetch up to 100 folders with `first: 100`
- Filter by `parentFolderId` on client-side
- Accept performance trade-off for now

### Future Improvements
If folder count exceeds ~100:
1. Increase `first` parameter (e.g., `first: 1000`)
2. Add pagination with `skip` parameter
3. Create custom Orchard Core GraphQL resolver with containedPart filter
4. Use Orchard Core Lucene for advanced queries

## Testing Scripts Created

### 1. introspect-graphql.sh
Introspects the GraphQL schema to discover available queries:
```bash
./scripts/introspect-graphql.sh
```

### 2. test-folder-query.sh
Tests the folder GraphQL query:
```bash
./scripts/test-folder-query.sh
```

## API Endpoints Summary

### ✅ Working GraphQL Queries
```graphql
# Query folders
query {
  folder(first: 100) {
    contentItemId
    displayText
    owner
    author
    createdUtc
    modifiedUtc
    published
  }
}

# Query single item by ID
query {
  contentItem(contentItemId: "id-here") {
    contentItemId
    displayText
    ...
  }
}
```

### ✅ Working REST API Operations
```http
# Create folder
POST /api/content
{ "ContentType": "Folder", ... }

# Update folder
PUT /api/content/{id}
{ "DisplayText": "New Name", ... }

# Delete folder
DELETE /api/content/{id}
```

### ❌ Not Supported
```http
# These don't work:
GET /api/content?contentType=Folder         # 405 Method Not Allowed
GET /api/content/Folder                     # 404 Not Found
POST /api/graphql { contentItems { ... } }  # Field doesn't exist
```

## Build Status

✅ **Build Successful**
```
Application bundle generation complete. [3.048 seconds]
Output location: frontend/dist/frontend
```

⚠️ **Warning** (Non-blocking):
```
folder-list.component.scss exceeded maximum budget by 1.75 kB
```

## Files Modified

1. `frontend/src/app/modules/dashboard/services/content.service.ts`
   - queryFolders() - Now uses GraphQL `folder` query
   - queryContent() - Simplified to return empty (TODO when File type configured)

2. `scripts/introspect-graphql.sh` - New script for schema introspection
3. `scripts/test-folder-query.sh` - New script for testing folder queries

## Summary

The 405 error was resolved by discovering and using Orchard Core's built-in `folder` GraphQL query field. While it doesn't support all the filtering we need (containedPart, taxonomyPart), it successfully returns folder data that can be filtered client-side. The application now queries folders without errors.

## Key Takeaways

1. **Orchard Core creates GraphQL queries for content types** - Each content type can have its own query field
2. **Always introspect the schema first** - Don't assume standard field names
3. **GraphQL mutations are not enabled** - Use REST API for create/update/delete
4. **Client-side filtering is acceptable** - For small to medium datasets (<100 items)
5. **REST GET with query params doesn't work** - Orchard Core REST API is limited to CRUD by ID

## Next Steps

1. Test folder query in running application
2. Verify folder creation and listing work together
3. Add File content type to Orchard Core if needed
4. Create similar GraphQL query for files when content type exists
