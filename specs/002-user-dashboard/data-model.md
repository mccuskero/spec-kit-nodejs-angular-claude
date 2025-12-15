# Data Model: User Dashboard

**Feature**: User Dashboard
**Branch**: 002-user-dashboard
**Date**: 2025-12-13
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the data entities, relationships, and validation rules for the user dashboard feature. The dashboard manages navigation state, user preferences, and hierarchical content organization through folders.

---

## Entity Definitions

### 1. DashboardState

**Purpose**: Represents the current state of the dashboard UI and user context.

**Storage**: Session Storage (temporary, cleared on tab close)

**TypeScript Interface**:

```typescript
interface DashboardState {
  currentSection: NavigationSection;
  repositoryLocation: RepositoryLocation;
  breadcrumbPath: BreadcrumbItem[];
  isLoading: boolean;
  lastUpdated: Date;
}

type NavigationSection = 'shared-blog' | 'content' | 'change-logs';
type RepositoryLocation = 'Local' | 'Shared';
```

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| currentSection | NavigationSection | Yes | Currently active navigation section | One of: 'shared-blog', 'content', 'change-logs' |
| repositoryLocation | RepositoryLocation | Yes | Selected repository context | One of: 'Local', 'Shared' |
| breadcrumbPath | BreadcrumbItem[] | No | Navigation trail for current folder location | Max 10 items (folder depth limit) |
| isLoading | boolean | Yes | Loading state for async operations | Default: false |
| lastUpdated | Date | Yes | Timestamp of last state change | ISO 8601 format |

**Relationships**: None (UI state only)

**State Transitions**:

```
[Initial] → currentSection='content', repositoryLocation='Local'
[Navigation] → currentSection changes → workspace updates → breadcrumbPath resets
[Repository Toggle] → repositoryLocation changes → content reloads → breadcrumbPath resets
[Folder Navigation] → breadcrumbPath updates → content list filters
```

---

### 2. UserPreferences

**Purpose**: Persistent user settings that survive session and tab closure.

**Storage**: Local Storage (permanent)

**TypeScript Interface**:

```typescript
interface UserPreferences {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  defaultRepository: RepositoryLocation;
  defaultSection: NavigationSection;
  contentViewMode: 'list' | 'grid';
}

type ThemeMode = 'light' | 'dark';
```

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| theme | ThemeMode | Yes | UI color theme | One of: 'light', 'dark'; Default: 'light' |
| sidebarCollapsed | boolean | Yes | Navigation menu collapsed state | Default: false |
| defaultRepository | RepositoryLocation | Yes | Default repository on dashboard load | One of: 'Local', 'Shared'; Default: 'Local' |
| defaultSection | NavigationSection | Yes | Default section on dashboard load | One of: 'shared-blog', 'content', 'change-logs'; Default: 'content' |
| contentViewMode | 'list' \| 'grid' | Yes | Display mode for content items | One of: 'list', 'grid'; Default: 'list' |

**Relationships**: None (user-specific settings)

**Validation Rules**:
- All fields must be present; missing fields reset to defaults
- Invalid enum values reset to defaults
- Corrupted localStorage data triggers full reset with warning

---

### 3. Folder (Orchard Core ContentItem)

**Purpose**: Container for organizing content items in hierarchical structure.

**Storage**: Orchard Core Content Repository (database)

**Orchard Core Content Type**:

```json
{
  "name": "Folder",
  "displayName": "Folder",
  "contentTypeId": "Folder"
}
```

**TypeScript Interface** (Angular client model):

```typescript
interface Folder {
  contentItemId: string;
  displayText: string;
  owner: string;
  createdUtc: Date;
  modifiedUtc: Date;
  published: boolean;
  containedPart: ContainedPart | null;
  listPart: ListPart;
  taxonomyPart: TaxonomyPart;
}

interface ContainedPart {
  listContentItemId: string;  // Parent folder ID
  order: number;
}

interface ListPart {
  containedContentTypes: string[];
  enableOrdering: boolean;
}

interface TaxonomyPart {
  repository: RepositoryLocation;
}
```

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| contentItemId | string | Yes | Unique Orchard Core content item ID | Auto-generated GUID |
| displayText | string | Yes | Folder name visible to users | 1-255 characters; alphanumeric + spaces, hyphens, underscores |
| owner | string | Yes | User who created the folder | User ID from Orchard Identity |
| createdUtc | Date | Yes | Creation timestamp | ISO 8601; auto-generated |
| modifiedUtc | Date | Yes | Last modification timestamp | ISO 8601; auto-updated |
| published | boolean | Yes | Visibility in queries | Must be true for folder to appear |
| containedPart.listContentItemId | string | No | Parent folder ID (null for root) | Valid folder contentItemId or null |
| containedPart.order | number | No | Display order within parent | Integer >= 0; default: 0 |
| listPart.containedContentTypes | string[] | Yes | Allowed child content types | Default: ["Document", "Image", "Folder"] |
| listPart.enableOrdering | boolean | Yes | Manual ordering enabled | Default: true |
| taxonomyPart.repository | RepositoryLocation | Yes | Repository classification | One of: 'Local', 'Shared' |

**Relationships**:
- **Parent-Child**: `containedPart.listContentItemId` links to parent Folder's `contentItemId`
- **Repository Classification**: `taxonomyPart.repository` determines visibility context
- **Ownership**: `owner` links to User (from Orchard Identity)

**Validation Rules**:
- `displayText` must be unique within the same parent folder
- Maximum folder depth: 10 levels (enforced client-side before creation)
- `listContentItemId` must reference an existing Folder with `listPart` enabled
- Cannot delete folder with child content (cascade delete or move children first)
- `published` must be true or folder won't appear in API queries

**State Transitions**:

```
[Create] → contentItemId generated → published=true → appears in folder list
[Rename] → displayText updated → modifiedUtc updated
[Move] → containedPart.listContentItemId updated → breadcrumb path changes
[Delete] → soft delete (archive) if has children, hard delete if empty
```

---

### 4. ContentItem (Generic)

**Purpose**: Represents any content stored within folders (documents, images, etc.).

**Storage**: Orchard Core Content Repository (database)

**TypeScript Interface** (Angular client model):

```typescript
interface ContentItem {
  contentItemId: string;
  contentType: string;
  displayText: string;
  owner: string;
  createdUtc: Date;
  modifiedUtc: Date;
  published: boolean;
  containedPart: ContainedPart;
  taxonomyPart: TaxonomyPart;
  // Additional content-specific fields based on contentType
  [key: string]: any;
}
```

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| contentItemId | string | Yes | Unique Orchard Core content item ID | Auto-generated GUID |
| contentType | string | Yes | Type of content (Document, Image, etc.) | Must be registered Orchard content type |
| displayText | string | Yes | Content name visible to users | 1-255 characters |
| owner | string | Yes | User who created the content | User ID from Orchard Identity |
| createdUtc | Date | Yes | Creation timestamp | ISO 8601; auto-generated |
| modifiedUtc | Date | Yes | Last modification timestamp | ISO 8601; auto-updated |
| published | boolean | Yes | Visibility in queries | Must be true to appear in folder |
| containedPart.listContentItemId | string | Yes | Parent folder ID | Valid folder contentItemId (required for dashboard content) |
| containedPart.order | number | No | Display order within folder | Integer >= 0; default: 0 |
| taxonomyPart.repository | RepositoryLocation | Yes | Repository classification | One of: 'Local', 'Shared' |

**Relationships**:
- **Folder Containment**: `containedPart.listContentItemId` links to Folder's `contentItemId`
- **Repository Classification**: `taxonomyPart.repository` must match parent folder's repository
- **Ownership**: `owner` links to User (from Orchard Identity)

**Validation Rules**:
- `contentType` must be in parent folder's `listPart.containedContentTypes`
- `listContentItemId` is required (content must be in a folder)
- `repository` must match parent folder's `repository` (no cross-repository content)
- Cannot move content between Local and Shared repositories (must recreate)

---

### 5. BreadcrumbItem

**Purpose**: Represents a single node in the folder navigation trail.

**Storage**: Computed client-side from folder hierarchy (not persisted)

**TypeScript Interface**:

```typescript
interface BreadcrumbItem {
  contentItemId: string;
  displayText: string;
  level: number;
}
```

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| contentItemId | string | Yes | Folder content item ID | Valid Folder contentItemId |
| displayText | string | Yes | Folder name for display | 1-255 characters |
| level | number | Yes | Depth in hierarchy (0 = root) | Integer 0-9 (max depth 10) |

**Relationships**:
- Derived from Folder entity chain following `containedPart.listContentItemId` upward to root

**Computation Logic**:

```typescript
async function buildBreadcrumb(folderId: string): Promise<BreadcrumbItem[]> {
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentFolder = await getFolder(folderId);
  let level = 0;

  while (currentFolder && level < 10) {
    breadcrumbs.unshift({
      contentItemId: currentFolder.contentItemId,
      displayText: currentFolder.displayText,
      level: level
    });

    if (currentFolder.containedPart?.listContentItemId) {
      currentFolder = await getFolder(currentFolder.containedPart.listContentItemId);
      level++;
    } else {
      break; // Reached root
    }
  }

  return breadcrumbs;
}
```

---

### 6. NavigationMenuItem

**Purpose**: Represents a clickable navigation button in the dashboard menu.

**Storage**: Static configuration (not persisted, defined in code)

**TypeScript Interface**:

```typescript
interface NavigationMenuItem {
  id: NavigationSection;
  label: string;
  icon: string;
  route: string;
  order: number;
}
```

**Static Data**:

```typescript
const NAVIGATION_ITEMS: NavigationMenuItem[] = [
  {
    id: 'shared-blog',
    label: 'Shared Blog',
    icon: 'blog',
    route: '/dashboard/shared-blog',
    order: 1
  },
  {
    id: 'content',
    label: 'Content',
    icon: 'folder',
    route: '/dashboard/content',
    order: 2
  },
  {
    id: 'change-logs',
    label: 'Change Logs',
    icon: 'history',
    route: '/dashboard/change-logs',
    order: 3
  }
];
```

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | NavigationSection | Yes | Unique navigation section identifier | One of: 'shared-blog', 'content', 'change-logs' |
| label | string | Yes | Display text for button | Non-empty string |
| icon | string | Yes | Icon identifier (Material Icons) | Valid icon name |
| route | string | Yes | Angular route path | Valid Angular route |
| order | number | Yes | Display order in menu | Integer >= 0 |

**Relationships**: None (static configuration)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│  DashboardState │
│  (Session)      │
│  - currentSection
│  - repositoryLocation
│  - breadcrumbPath[]
└─────────────────┘
         │
         │ uses
         ▼
┌─────────────────┐         ┌──────────────────┐
│ NavigationMenuItem│       │  UserPreferences │
│ (Static Config)  │         │  (LocalStorage)  │
│ - id             │         │  - theme         │
│ - label          │         │  - sidebarCollapsed
│ - route          │         │  - defaultRepo   │
└─────────────────┘         └──────────────────┘


Orchard Core Content Repository:

┌──────────────────┐
│     Folder       │───┐
│  (ContentItem)   │   │ Parent-Child
│  - contentItemId │◄──┘ (containedPart.listContentItemId)
│  - displayText   │
│  - listPart      │───┐
│  - containedPart │   │ Contains
│  - taxonomyPart  │   │
└──────────────────┘   │
         │             │
         │ Repository  │
         │ (taxonomyPart)
         │             │
         ▼             ▼
┌──────────────────┐
│   ContentItem    │
│  - contentItemId │
│  - displayText   │
│  - containedPart │───> Parent Folder
│  - taxonomyPart  │───> Repository (Local/Shared)
└──────────────────┘


┌──────────────────┐
│ BreadcrumbItem[] │ (Computed from Folder hierarchy)
│  - contentItemId │
│  - displayText   │
│  - level         │
└──────────────────┘
```

---

## Validation Rules Summary

### Client-Side Validation

| Entity | Field | Validation | Error Message |
|--------|-------|------------|---------------|
| Folder | displayText | 1-255 chars, alphanumeric + spaces/hyphens/underscores | "Folder name must be 1-255 characters and contain only letters, numbers, spaces, hyphens, or underscores" |
| Folder | depth | Max 10 levels | "Maximum folder depth of 10 levels exceeded" |
| DashboardState | currentSection | Enum value | "Invalid navigation section" |
| DashboardState | repositoryLocation | Enum value | "Invalid repository location" |
| UserPreferences | theme | Enum value | "Invalid theme selection" |

### Server-Side Validation (Orchard Core)

| Entity | Field | Validation | HTTP Status |
|--------|-------|------------|-------------|
| Folder | published | Must be true | 400 Bad Request |
| Folder | listContentItemId | Must exist or be null | 404 Not Found |
| ContentItem | listContentItemId | Must exist | 404 Not Found |
| ContentItem | repository | Must match parent folder | 400 Bad Request |
| All | Authentication | Valid JWT token | 401 Unauthorized |
| All | Authorization | User has permissions | 403 Forbidden |

---

## Data Flow Patterns

### Folder Creation Flow

```
User Input (folder name, repository)
  ↓
Client-Side Validation (name format, depth limit)
  ↓
POST /api/content/Folder
  {
    "DisplayText": "My Folder",
    "Published": true,
    "TaxonomyPart": { "Repository": ["Local"] },
    "ListPart": {},
    "ContainedPart": { "ListContentItemId": "{parentId}" }
  }
  ↓
Server-Side Validation (Orchard Core)
  ↓
Database Insert
  ↓
Response: { "contentItemId": "{guid}", "displayText": "My Folder" }
  ↓
Client Updates UI (refresh folder list)
```

### Content Query Flow (by Repository + Folder)

```
User Selects Repository (Local/Shared)
  ↓
DashboardStateService.setRepositoryLocation('Local')
  ↓
Effect triggers sessionStorage.setItem()
  ↓
User Navigates to Folder
  ↓
POST /api/graphql
  query {
    contentItems(where: {
      contentType: "Folder"
      containedPart: { listContentItemId: "{folderId}" }
    }) {
      contentItemId
      displayText
      createdUtc
    }
  }
  ↓
Response: { data: { contentItems: [...] } }
  ↓
Client Filters by repository (taxonomyPart.repository === 'Local')
  ↓
Display content list in workspace
```

### Breadcrumb Construction Flow

```
User Opens Folder
  ↓
Client calls buildBreadcrumb(folderId)
  ↓
Loop: GET /api/content/{currentFolderId}
  ↓
Extract: containedPart.listContentItemId (parent ID)
  ↓
Repeat until parent ID is null (root reached) or depth = 10
  ↓
Build array: [root, level1, level2, ..., currentFolder]
  ↓
Update DashboardState.breadcrumbPath
  ↓
Render breadcrumb navigation in UI
```

---

## Migration Considerations

### From Flat Structure to Hierarchical

If content already exists without folder organization:

1. Create default "Uncategorized" folder per repository
2. Batch update existing content items: set `containedPart.listContentItemId` to default folder
3. Notify users to organize content into proper folders

### Repository Migration (Local ↔ Shared)

**Not Supported**: Content cannot move between repositories (by design).

**Workaround**: Copy content (create new item in target repository, delete from source).

---

## Performance Considerations

### Indexing

Orchard Core should index:
- `containedPart.listContentItemId` (for folder queries)
- `taxonomyPart.termContentItemIds` (for repository filtering)
- `published` (for visibility)
- `contentType` (for type filtering)

### Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|------|---------------|-----|--------------|
| Folder list | Angular service cache | 5 minutes | On folder create/delete |
| Breadcrumb path | DashboardState | Session | On folder navigation |
| User preferences | LocalStorage | Permanent | On manual update |
| Content list | No cache | N/A | Fetch on demand |

### Query Optimization

- Limit folder depth to 10 levels (prevents deep recursion in breadcrumb)
- Use GraphQL pagination (`first: 50, after: {cursor}`) for large folder contents
- Lazy-load folder contents (don't fetch all children recursively)
- Debounce repository toggle (300ms) to prevent rapid API calls

---

## Security & Privacy

### Sensitive Data

- **Never store in web storage**: JWT tokens, passwords, personal identifiable information
- **Session storage**: Navigation state only (non-sensitive)
- **Local storage**: User preferences only (non-sensitive)

### Access Control

- All API endpoints require JWT authentication (from 001-login-screen)
- Orchard Core enforces content permissions (read/write/delete)
- Folders inherit permissions from parent (Orchard Core default behavior)
- Users can only see content they own or have explicit permissions for

### Data Validation

- **Client-side**: Input sanitization, format validation (fail fast)
- **Server-side**: Business rule enforcement, permission checks (authoritative)
- **Double validation**: Both client and server validate all user input

---

## Testing Checklist

### Unit Tests

- [ ] DashboardState serialization/deserialization
- [ ] UserPreferences validation and default handling
- [ ] Breadcrumb construction logic with various depths
- [ ] Folder name validation (valid and invalid cases)
- [ ] Repository filter logic

### Integration Tests

- [ ] Folder creation via Orchard Core API
- [ ] Content item creation within folder
- [ ] Breadcrumb query across folder hierarchy
- [ ] Repository filtering (Local vs Shared)
- [ ] State persistence (session storage, local storage)

### E2E Tests (Cypress)

- [ ] Create folder → verify appears in list
- [ ] Add content to folder → verify parent relationship
- [ ] Navigate folder hierarchy → verify breadcrumb updates
- [ ] Toggle repository → verify content filters correctly
- [ ] Logout and return → verify state restored from session storage

---

**Data Model Status**: ✅ Complete
**Next Steps**: Generate API contracts, create quickstart guide
