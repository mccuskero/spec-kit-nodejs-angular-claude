# Orchard Core CORS Configuration Guide

## Problem
Angular app gets CORS error when trying to authenticate:
```
Access to XMLHttpRequest at 'http://localhost:8080/connect/token' from origin 'http://localhost:4200'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution: Enable CORS in Orchard Core

### Step-by-Step Instructions

1. **Access Orchard Core Admin**
   - URL: http://localhost:8080/Admin
   - Login: admin / Admin123!

2. **Enable CORS Module**
   - Navigate to: `Configuration` → `Features`
   - Search for: `CORS`
   - Click `Enable` on the `CORS` module (OrchardCore.Cors)

3. **Configure CORS Settings**
   - Navigate to: `Configuration` → `Settings` → `CORS`
   - Click `Add Policy`

4. **CORS Policy Configuration**
   ```
   Policy Name: AngularApp
   Origins: http://localhost:4200
   Allow Any Origin: ☐ (unchecked)
   Allow Credentials: ☑ (checked - required for auth)
   Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
   Allow Any Method: ☐ (unchecked)
   Allowed Headers: *
   Allow Any Header: ☑ (checked)
   Exposed Headers: (leave empty)
   Max Age: 3600
   ```

5. **Set as Default Policy**
   - Check: `☑ Set as default policy`
   - Click: `Save`

### Verification

After configuring CORS, test the login again:

1. Open your Angular app: http://localhost:4200
2. Try to login with: admin / Admin123!
3. Check browser DevTools Network tab - you should see:
   - OPTIONS request (preflight) with 204 response
   - POST request with `Access-Control-Allow-Origin: http://localhost:4200` header

### Troubleshooting

If CORS still doesn't work:

1. **Check the CORS module is enabled**
   ```bash
   # In browser console, check the response headers:
   # Should include: Access-Control-Allow-Origin: http://localhost:4200
   ```

2. **Verify Origin URL matches exactly**
   - Angular dev server: `http://localhost:4200` (no trailing slash)
   - Must match the origin in the request

3. **Clear browser cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Check Orchard Core logs**
   - Location: `3rd-Party/OrchardCore/src/OrchardCore.Cms.Web/App_Data/logs/`

## Alternative: Configure via appsettings.json (Development Only)

For development, you can also configure CORS programmatically by modifying Program.cs,
but the UI approach is recommended as it's tenant-specific and more flexible.

## Production Notes

For production:
- Use specific origins (not wildcards)
- Only allow required methods and headers
- Consider using environment-specific CORS policies
- Set appropriate Max Age for preflight caching
