# Orchard Core Folder Management Setup Guide

This guide walks you through configuring Orchard Core to support the folder management features in the dashboard.

## Prerequisites

- Orchard Core running on `http://localhost:8080`
- Admin access to Orchard Core
- Angular app CORS configured (see `scripts/configure-cors-guide.md`)

## Table of Contents

1. [Enable Required Modules](#1-enable-required-modules)
2. [Create Repository Taxonomy](#2-create-repository-taxonomy)
3. [Create Folder Content Type](#3-create-folder-content-type)
4. [Configure GraphQL](#4-configure-graphql)
5. [Test the Setup](#5-test-the-setup)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Enable Required Modules

### Step 1.1: Access Features Page

1. Navigate to: `http://localhost:8080/Admin`
2. Login with your admin credentials
3. Go to: **Configuration** → **Features**

### Step 1.2: Enable Core Modules

Search for and enable the following modules (if not already enabled):

- ✅ **Content Management** (`OrchardCore.Contents`)
- ✅ **Content Types** (`OrchardCore.ContentTypes`)
- ✅ **Lists** (`OrchardCore.Lists`)
- ✅ **Taxonomies** (`OrchardCore.Taxonomies`)
- ✅ **GraphQL** (`OrchardCore.Apis.GraphQL`)
- ✅ **Title** (`OrchardCore.Title`)

**How to enable:**
- Click the **Enable** button next to each module
- Wait for the success notification
- Refresh the page after enabling all modules

---

## 2. Create Repository Taxonomy

The Repository taxonomy allows folders to be categorized as "Local" or "Shared".

### Step 2.1: Create Taxonomy

1. Go to: **Content** → **Content Definition** → **Taxonomies**
2. Click **Create Taxonomy**
3. Configure:
   - **Name**: `Repository`
   - **Display Name**: `Repository`
   - **Description**: `Defines whether content is stored locally or shared`
4. Click **Save**

### Step 2.2: Add Terms

1. Open the **Repository** taxonomy you just created
2. Click **Add Term** and create:
   - **Term 1**:
     - Name: `Local`
     - Display Text: `Local`
   - **Term 2**:
     - Name: `Shared`
     - Display Text: `Shared`
3. Click **Save** for each term

---

## 3. Create Folder Content Type

### Step 3.1: Create Content Type

1. Go to: **Content** → **Content Definition** → **Content Types**
2. Click **Create new type**
3. Enter:
   - **Display Name**: `Folder`
   - **Technical Name**: `Folder`
   - **Description**: `A folder to organize content hierarchically`
4. Click **Create**

### Step 3.2: Add Title Part

1. In the Folder content type editor, click **Add Parts**
2. Find and add: **Title Part**
3. Configure Title Part settings:
   - ✅ **Show** (display in editor)
   - ✅ **Required**
4. Click **Save**

### Step 3.3: Add List Part

1. Click **Add Parts** again
2. Find and add: **List Part**
3. Configure List Part settings:
   - **Contained Content Types**: Select:
     - ✅ `Folder` (folders can contain folders)
     - ✅ `ContentItem` (folders can contain content items)
   - ✅ **Enable Ordering** (allow manual ordering)
4. Click **Save**

### Step 3.4: Add Taxonomy Part

1. Click **Add Parts** again
2. Find and add: **Taxonomy Part**
3. Configure Taxonomy Part:
   - **Name**: `Repository`
   - **Display Name**: `Repository`
   - **Taxonomy**: Select `Repository` (the taxonomy we created)
   - ✅ **Required**
   - Selection Mode: **Radio buttons** (single selection)
4. Click **Save**

### Step 3.5: Add Contained Part

1. Click **Add Parts** again
2. Find and add: **Contained Part**
   - This allows folders to be contained within other folders
3. No additional configuration needed
4. Click **Save**

### Step 3.6: Configure Content Type Settings

1. Scroll to **Content Type Settings** at the bottom
2. Configure:
   - ✅ **Creatable** (users can create folders)
   - ✅ **Listable** (folders appear in content lists)
   - ✅ **Draftable** (optional - allows draft folders)
   - ✅ **Versionable** (optional - track folder changes)
   - ✅ **Securable** (optional - folder-level permissions)
3. Click **Save**

---

## 4. Configure GraphQL

### Step 4.1: Verify GraphQL is Enabled

1. Go to: **Configuration** → **Features**
2. Search for: `GraphQL`
3. Ensure **GraphQL** module is **enabled**

### Step 4.2: Test GraphQL Endpoint

Open a terminal and run:

```bash
curl -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { queryType { name } } }"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "__schema": {
      "queryType": {
        "name": "Query"
      }
    }
  }
}
```

### Step 4.3: Verify Folder Type in GraphQL Schema

```bash
curl -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"Folder\") { name fields { name type { name } } } }"
  }'
```

If you see Folder fields, GraphQL is correctly configured!

---

## 5. Test the Setup

### Step 5.1: Test Folder Creation via GraphQL

```bash
curl -X POST http://localhost:8080/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "mutation { createContentItem(contentItem: { contentType: \"Folder\", displayText: \"Test Folder\", publish: true, taxonomyPart: { repository: \"Local\" }, listPart: { containedContentTypes: [\"Folder\", \"ContentItem\"], enableOrdering: true } }) { contentItemId displayText } }"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "createContentItem": {
      "contentItemId": "4abc123...",
      "displayText": "Test Folder"
    }
  }
}
```

### Step 5.2: Test from Angular App

1. Start Angular dev server: `npm start`
2. Navigate to: `http://localhost:4200`
3. Login with your credentials
4. Click on **Content** section in navigation
5. Click **New Folder** button
6. Enter folder name: `My First Folder`
7. Click **Create Folder**

**Expected Result:**
- Folder appears in the list
- No errors in browser console
- Folder is created in Orchard Core

### Step 5.3: Verify in Orchard Admin

1. Go to: `http://localhost:8080/Admin`
2. Navigate to: **Content** → **Content Items**
3. Filter by: **Folder** content type
4. You should see the folder you created

---

## 6. Troubleshooting

### Issue: "GraphQL endpoint not found" (404)

**Solution:**
1. Verify GraphQL module is enabled:
   - Go to: **Configuration** → **Features**
   - Search for: `GraphQL`
   - Click **Enable** if not enabled
2. Restart Orchard Core application
3. Clear browser cache

### Issue: "Folder content type not found"

**Solution:**
1. Verify Folder content type exists:
   - Go to: **Content** → **Content Definition** → **Content Types**
   - Look for `Folder` in the list
2. Ensure all required parts are added (Title, List, Taxonomy, Contained)
3. Click **Save** on the content type

### Issue: "Repository taxonomy not found"

**Solution:**
1. Create Repository taxonomy (see Section 2)
2. Add `Local` and `Shared` terms
3. Ensure Taxonomy Part on Folder is configured to use `Repository` taxonomy

### Issue: "Mutation failed - unauthorized"

**Solution:**
1. Verify CORS is configured (see `scripts/configure-cors-guide.md`)
2. Ensure JWT token is valid (check localStorage: `ets_cms_auth_token`)
3. Check user has permission to create Folders:
   - Go to: **Security** → **Roles**
   - Assign `Create Folder` permission to user's role

### Issue: "GraphQL mutation errors"

**Common Errors and Solutions:**

1. **"Field 'taxonomyPart' not found"**
   - Solution: Add Taxonomy Part to Folder content type (Step 3.4)

2. **"Field 'listPart' not found"**
   - Solution: Add List Part to Folder content type (Step 3.3)

3. **"Field 'containedPart' not found"**
   - Solution: Add Contained Part to Folder content type (Step 3.5)

4. **"Repository term not found"**
   - Solution: Create Repository taxonomy with Local and Shared terms (Section 2)

### Issue: "CORS error when creating folder"

**Solution:**
1. Follow CORS setup guide: `scripts/configure-cors-guide.md`
2. Verify CORS policy includes:
   - Origin: `http://localhost:4200`
   - Methods: `GET, POST, PUT, DELETE, OPTIONS`
   - Allow Credentials: ✅ Checked

### Issue: Folders created but not appearing in list

**Solution:**
1. Check repository filter matches:
   - Dashboard shows `Local` or `Shared` repository
   - Folder was created with matching repository term
2. Verify GraphQL query permissions:
   - User role has `View Folder` permission
3. Check browser console for GraphQL query errors

---

## Quick Reference: Required Configuration

### Modules
- ✅ Content Management
- ✅ Content Types
- ✅ Lists
- ✅ Taxonomies
- ✅ GraphQL
- ✅ Title

### Folder Content Type Parts
- ✅ Title Part (required)
- ✅ List Part (contained types: Folder, ContentItem)
- ✅ Taxonomy Part (taxonomy: Repository, required)
- ✅ Contained Part

### Repository Taxonomy Terms
- ✅ Local
- ✅ Shared

### GraphQL Endpoint
- URL: `http://localhost:8080/api/graphql`
- Method: POST
- Content-Type: application/json

---

## Additional Resources

- **Orchard Core Documentation**: https://docs.orchardcore.net
- **GraphQL Documentation**: https://docs.orchardcore.net/en/latest/reference/modules/Apis.GraphQL/
- **Content Management**: https://docs.orchardcore.net/en/latest/reference/modules/Contents/
- **Taxonomies**: https://docs.orchardcore.net/en/latest/reference/modules/Taxonomies/

---

## Testing Checklist

- [ ] GraphQL module enabled
- [ ] Repository taxonomy created with Local and Shared terms
- [ ] Folder content type created with all required parts
- [ ] GraphQL endpoint responds to queries
- [ ] Can create folder via curl/Postman
- [ ] CORS configured for Angular app
- [ ] Can create folder from Angular app
- [ ] Folder appears in Orchard Admin
- [ ] Can navigate into folders
- [ ] Breadcrumb navigation works

---

**Last Updated**: 2025-12-14
**Version**: 1.0
**For**: Dashboard Phase 5 - Folder Management
