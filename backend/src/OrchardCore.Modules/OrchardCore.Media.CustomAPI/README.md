# OrchardCore.Media.CustomAPI

Custom REST API module for Orchard Core media management with endpoints for upload, list, edit, and delete operations.

**Target Framework:** .NET 10.0

## Features

This module exposes the following REST API endpoints:

- **POST** `/api/media` - Upload a file
- **GET** `/api/media/list` - List all media files
- **GET** `/api/media/{*path}` - Get file information
- **DELETE** `/api/media/{*path}` - Delete a file
- **PUT** `/api/media/move` - Move/rename a file

## Installation

### 1. Build the Module

Navigate to the module directory and build:

```bash
cd backend/src/OrchardCore.Modules/OrchardCore.Media.CustomAPI
dotnet build
```

### 2. Reference in OrchardCore Project

Add a project reference to your Orchard Core CMS project (usually in `3rdParty/OrchardCore`):

```bash
cd ./3rd-Party/OrchardCore/src/OrchardCore.Cms.Web/
dotnet add reference ../../../../backend/src/OrchardCore.Modules/OrchardCore.Media.CustomAPI/OrchardCore.Media.CustomAPI.csproj
```

Or manually edit `OrchardCore.Cms.Web.csproj` and add:

```xml
<ItemGroup>
  <ProjectReference Include="..\..\..\..\backend\src\OrchardCore.Modules\OrchardCore.Media.CustomAPI\OrchardCore.Media.CustomAPI.csproj" />
</ItemGroup>
```

then

```bash
dotnet build
```

### 3. Enable the Module

After building and running Orchard Core:

1. Log in to the admin dashboard (`/admin`)
2. Go to **Configuration** → **Features**
3. Search for "Media Custom API"
4. Click **Enable**

Alternatively, enable via recipe or through code in your setup.

### 4. Verify Installation

Check that the module is loaded:

```bash
curl http://localhost:8080/api/media/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Documentation

### Authentication

All endpoints require Bearer token authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Endpoints

#### 1. Upload File

**POST** `/api/media`

Upload a file to the media library.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: The file to upload (required)
  - `path`: Optional subfolder path (e.g., "images/products")

**Example:**

```bash
curl -X POST http://localhost:8080/api/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sunset.JPG" \
  -F "path=uploads"
```

**Response (201 Created):**

```json
{
  "path": "uploads/sunset_20251218120000.JPG",
  "name": "sunset_20251218120000.JPG",
  "size": 3659073,
  "mimeType": "image/jpeg",
  "createdUtc": "2025-12-18T12:00:00Z",
  "url": "/media/uploads/sunset_20251218120000.JPG"
}
```

#### 2. List Files

**GET** `/api/media/list?path={optional-path}`

List all files in the media library or a specific directory.

**Query Parameters:**
- `path` (optional): Directory path to list (default: root)

**Example:**

```bash
curl http://localhost:8080/api/media/list?path=uploads \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**

```json
{
  "path": "uploads",
  "files": [
    {
      "path": "uploads/sunset_20251218120000.JPG",
      "name": "sunset_20251218120000.JPG",
      "size": 3659073,
      "lastModified": "2025-12-18T12:00:00Z",
      "url": "/media/uploads/sunset_20251218120000.JPG"
    }
  ],
  "totalCount": 1
}
```

#### 3. Get File Info

**GET** `/api/media/{*path}`

Get information about a specific file.

**Example:**

```bash
curl http://localhost:8080/api/media/uploads/sunset_20251218120000.JPG \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**

```json
{
  "path": "uploads/sunset_20251218120000.JPG",
  "name": "sunset_20251218120000.JPG",
  "size": 3659073,
  "lastModified": "2025-12-18T12:00:00Z",
  "url": "/media/uploads/sunset_20251218120000.JPG"
}
```

#### 4. Delete File

**DELETE** `/api/media/{*path}`

Delete a file from the media library.

**Example:**

```bash
curl -X DELETE http://localhost:8080/api/media/uploads/sunset_20251218120000.JPG \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200 OK):**

```json
{
  "message": "File deleted successfully.",
  "path": "uploads/sunset_20251218120000.JPG"
}
```

#### 5. Move/Rename File

**PUT** `/api/media/move`

Move or rename a file in the media library.

**Request Body:**

```json
{
  "sourcePath": "uploads/old-name.jpg",
  "destinationPath": "images/new-name.jpg"
}
```

**Example:**

```bash
curl -X PUT http://localhost:8080/api/media/move \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourcePath": "uploads/sunset_20251218120000.JPG",
    "destinationPath": "images/sunset.JPG"
  }'
```

**Response (200 OK):**

```json
{
  "message": "File moved successfully.",
  "oldPath": "uploads/sunset_20251218120000.JPG",
  "newPath": "images/sunset.JPG",
  "url": "/media/images/sunset.JPG"
}
```

## Error Responses

All endpoints return standard HTTP status codes:

- **400 Bad Request**: Invalid request (missing file, invalid path, etc.)
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: File not found
- **500 Internal Server Error**: Server error during operation

**Example Error Response:**

```json
{
  "error": "File is required."
}
```

## Integration with Frontend

Update the frontend service to use these endpoints:

```typescript
// Upload file
uploadFile(file: File, displayText: string, repository: RepositoryLocation, folderId: string): Observable<any> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('path', folderId);

  return this.http.post('http://localhost:8080/api/media', formData);
}

// List files
listFiles(path: string = ''): Observable<any> {
  return this.http.get(`http://localhost:8080/api/media/list?path=${path}`);
}

// Delete file
deleteFile(path: string): Observable<any> {
  return this.http.delete(`http://localhost:8080/api/media/${path}`);
}
```

## Troubleshooting

### Module Not Showing in Features

1. Ensure the module is properly referenced in the CMS project
2. Rebuild the solution: `dotnet build`
3. Restart Orchard Core

### 404 Not Found

1. Verify the module feature is enabled in admin
2. Check that `OrchardCore.Media` feature is also enabled
3. Verify the route matches: `/api/media`

### 401 Unauthorized

1. Ensure Bearer token is included in Authorization header
2. Verify token is valid and not expired
3. Check user has proper permissions for media operations

## Development

### Adding New Endpoints

Edit `Controllers/MediaApiController.cs` and add new action methods:

```csharp
[HttpGet("custom-endpoint")]
public async Task<IActionResult> CustomAction()
{
    // Your implementation
    return Ok(new { result = "success" });
}
```

### Modifying Permissions

Add custom permissions in a `Permissions.cs` file:

```csharp
public class Permissions : IPermissionProvider
{
    public static readonly Permission ManageMediaApi = new Permission("ManageMediaApi", "Manage Media API");

    public Task<IEnumerable<Permission>> GetPermissionsAsync()
    {
        return Task.FromResult(new[] { ManageMediaApi }.AsEnumerable());
    }
}
```

Then apply to controllers:

```csharp
[Authorize(Policy = "ManageMediaApi")]
public class MediaApiController : ControllerBase { }
```

## License

This module is part of the Dashboard project and follows the same license.
