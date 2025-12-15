# Orchard Core Authentication Setup

## Current Status

The OpenID client `angular-app` **already exists** in your Orchard Core instance, but:

1. ✅ Client is configured
2. ⚠️ **Scopes need to be updated**
3. ⚠️ **Credentials are incorrect**

## Error Diagnostics

### Test Results

```bash
# Test 1: With scopes
curl -s -X POST 'http://localhost:8080/connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&username=admin&password=Admin123app&client_id=angular-app&scope=openid profile roles'

Response:
{
  "error": "invalid_request",
  "error_description": "This client application is not allowed to use the specified scope."
}
```

**Meaning**: The `angular-app` client exists but doesn't have `openid`, `profile`, and `roles` scopes enabled.

```bash
# Test 2: Without scopes
curl -s -X POST 'http://localhost:8080/connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&username=admin&password=Admin123app&client_id=angular-app'

Response:
{
  "error": "invalid_grant",
  "error_description": "The specified username/password couple is invalid."
}
```

**Meaning**: The username `admin` with password `Admin123app` does not exist or is incorrect.

## Required Actions

### 1. Fix Client Scopes

1. Navigate to: http://localhost:8080/Admin
2. Go to: **Security → OpenID Connect → Applications**
3. Find and click on **`angular-app`**
4. Under **Allowed Scopes**, ensure these are checked:
   - ✓ `openid`
   - ✓ `profile`
   - ✓ `roles`
5. Click **Save**

### 2. Verify/Reset Admin Credentials

You need to determine the correct admin password. Try these options:

**Option A: Try Common Passwords**
```bash
# Default from quickstart guide
./scripts/test-auth-curl.sh admin Admin123!

# Your attempted password
./scripts/test-auth-curl.sh admin Admin123app

# Other common variations
./scripts/test-auth-curl.sh admin admin
./scripts/test-auth-curl.sh admin password
```

**Option B: Reset Admin Password**

If you don't remember the password, reset it:

1. Stop the Orchard Core container:
   ```bash
   cd 3rd-Party/OrchardCore
   docker-compose down
   ```

2. Remove the database volume (WARNING: This deletes all data):
   ```bash
   docker-compose down -v
   ```

3. Restart and go through setup wizard again:
   ```bash
   docker-compose up -d
   ```

4. Navigate to http://localhost:8080 and complete setup:
   - Site name: `ETS-CMS`
   - Recipe: `Blank Site`
   - Admin username: `admin`
   - Admin password: `Admin123!` (or your choice - **save it!**)
   - Admin email: `admin@example.com`

5. Then complete the OpenID configuration (see quickstart.md steps T007-T008)

## Testing Scripts

### Quick Test
```bash
# Test with specific credentials
./scripts/test-auth-curl.sh <username> <password>

# Example
./scripts/test-auth-curl.sh admin Admin123!
```

### Full Diagnostic
```bash
# Interactive verification script
./scripts/verify-orchard-auth.sh
```

This script will:
- ✓ Check if Orchard Core is running
- ✓ Verify OpenID Connect is configured
- ✓ Check if password grant type is supported
- ✓ Test authentication with your credentials
- ✓ Provide detailed error messages and fixes

## Successful Authentication Response

When everything is configured correctly, you should see:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJhdCtqd3QifQ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "openid profile roles"
}
```

## Current Configuration Summary

Based on testing:

| Item | Status | Notes |
|------|--------|-------|
| Orchard Core Running | ✅ | Port 8080 |
| OpenID Module Enabled | ✅ | Discovery endpoint working |
| Client `angular-app` | ✅ | Exists but needs scope fix |
| Password Grant Type | ⚠️ | Enabled but scopes missing |
| Admin Credentials | ❌ | Password incorrect |

## Next Steps

1. **Fix scopes** (see step 1 above)
2. **Find correct password** or reset database
3. **Test authentication**:
   ```bash
   ./scripts/verify-orchard-auth.sh
   ```
4. Once successful, the Angular app login will work

## Reference

- Quickstart Guide: `specs/002-user-dashboard/quickstart.md`
- OpenID Config: http://localhost:8080/.well-known/openid-configuration
- Admin Panel: http://localhost:8080/Admin
- Environment Config: `frontend/src/environments/environment.ts`
