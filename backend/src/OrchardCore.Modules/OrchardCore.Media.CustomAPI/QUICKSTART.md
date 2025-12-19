# Quick Start Guide - OrchardCore.Media.CustomAPI

**Requirements:** .NET 10.0 SDK or later

## Step-by-Step Installation

### Step 1: Build the Module

```bash
cd backend/src/OrchardCore.Modules/OrchardCore.Media.CustomAPI
dotnet build
```

**Expected output:**
```
Build succeeded.
```

### Step 2: Add Reference to OrchardCore CMS

Navigate to your OrchardCore CMS project:

```bash
cd ../../../../3rdParty/OrchardCore/src/OrchardCore.Cms.Web
```

Add the project reference:

```bash
dotnet add reference ../../../../backend/src/OrchardCore.Modules/OrchardCore.Media.CustomAPI/OrchardCore.Media.CustomAPI.csproj
```

### Step 3: Rebuild OrchardCore

```bash
cd ../../../../3rdParty/OrchardCore
dotnet build
```

### Step 4: Restart OrchardCore

If running via Docker:

```bash
docker-compose restart
```

If running directly:

```bash
cd src/OrchardCore.Cms.Web
dotnet run
```

### Step 5: Enable the Module

**Option A: Via Admin UI**

1. Navigate to `http://localhost:8080/admin`
2. Login with your credentials
3. Go to **Configuration** → **Features**
4. Search for "Media Custom API"
5. Click **Enable**

**Option B: Via Recipe (Automatic)**

Add to your setup recipe JSON:

```json
{
  "name": "EnableMediaAPI",
  "steps": [
    {
      "name": "feature",
      "enable": [
        "OrchardCore.Media.CustomAPI"
      ]
    }
  ]
}
```

### Step 6: Test the API

Run the test script:

```bash
./scripts/test-add-file.sh
```

**Expected output:**
```
✓ Authentication successful
GET /api/media status: 200
✓ File uploaded successfully to Orchard Core Media!
```

## Verification Checklist

- [ ] Module builds without errors
- [ ] Reference added to OrchardCore.Cms.Web
- [ ] OrchardCore rebuilds successfully
- [ ] OrchardCore restarts without errors
- [ ] Module appears in Features list
- [ ] Module is enabled
- [ ] `/api/media` endpoint responds (200 OK)
- [ ] File upload test succeeds

## Common Issues

### Module Doesn't Appear in Features

**Solution:**
```bash
# Clean and rebuild
cd 3rdParty/OrchardCore
dotnet clean
dotnet build
docker-compose restart
```

### 404 on /api/media

**Possible causes:**
1. Module not enabled - check Features in admin
2. OrchardCore.Media not enabled - enable it first
3. Route conflict - check Startup.cs

**Solution:**
```bash
# Check enabled features via API
curl http://localhost:8080/api/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

### Build Errors

**Missing OrchardCore.Module.Targets:**
```bash
cd backend/src/OrchardCore.Modules/OrchardCore.Media.CustomAPI
dotnet add package OrchardCore.Module.Targets
```

**Missing OrchardCore.Media.Abstractions:**
```bash
dotnet add package OrchardCore.Media.Abstractions
```

## Next Steps

1. **Test All Endpoints:**
   - Upload: `./scripts/test-add-file.sh`
   - List: `curl http://localhost:8080/api/media/list -H "Authorization: Bearer $TOKEN"`
   - Delete: `curl -X DELETE http://localhost:8080/api/media/path/to/file.jpg -H "Authorization: Bearer $TOKEN"`

2. **Update Frontend:**
   - The frontend service is already configured to use `/api/media`
   - Test file upload through the dashboard UI

3. **Configure Permissions:**
   - Set up role-based access control for media operations
   - Create custom permissions if needed

## Support

For issues or questions:
1. Check the full README.md in this directory
2. Review OrchardCore documentation: https://docs.orchardcore.net
3. Check the project issues on GitHub
