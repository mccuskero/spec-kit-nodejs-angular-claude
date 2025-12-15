# Login Module

Secure authentication module for ETS-CMS that integrates with Orchard Core Identity services.

## Features

- ✅ **User Story 1**: Successful Login with username/password
- ✅ **User Story 2**: Password visibility toggle (show/hide)
- ✅ **User Story 3**: Failed login error handling with secure generic messages
- ✅ **User Story 4**: Forgot Password link (placeholder for future implementation)

## Components

### LoginFormComponent

The main login form component with reactive forms validation.

**Location**: `components/login-form/`

**Features**:
- Reactive forms with validation
- Real-time error message clearing on user input
- Password visibility toggle with accessibility support
- Secure error messages that don't reveal username vs password failures
- Loading state during authentication

## Services

### AuthService

Handles authentication with Orchard Core backend.

**Location**: `services/auth.service.ts`

**Methods**:
- `login(credentials: LoginRequest): Observable<AuthResponse>` - Authenticates user
- `logout(): void` - Clears authentication state
- `getToken(): string | null` - Retrieves stored auth token
- `isAuthenticated(): boolean` - Checks if user is authenticated
- `isAuthenticated$: Observable<boolean>` - Observable for auth state changes

**Token Storage**: Uses `localStorage` with key `ets_cms_auth_token`

## Models

- `LoginRequest` - Username and password credentials
- `AuthResponse` - Authentication response with token and user info
- `AuthState` - Global authentication state
- `AuthErrorCode` - Error code enumeration for different failure types

## Security

- HTTPS-only communication with backend
- Generic error messages to prevent username enumeration
- Secure token storage
- No sensitive data in error messages
- Password transmitted securely regardless of visibility state

## API Integration

**Endpoint**: `POST /api/Users/login`

**Request**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response**:
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "roles": ["string"]
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS|ACCOUNT_LOCKED|NETWORK_ERROR",
    "message": "Error message"
  }
}
```

## Testing

**Test Coverage**: 29 unit tests + E2E tests

**Unit Tests**:
- `login-form.component.spec.ts` - 19 tests
- `auth.service.spec.ts` - 10 tests

**E2E Tests**:
- `cypress/e2e/login.cy.ts` - 9 scenarios

**Run Tests**:
```bash
npm test
```

**Run E2E Tests**:
```bash
npm run e2e
```

## Accessibility

- ARIA labels on password toggle button
- Keyboard navigation support
- Focus visible styles
- Form validation with screen reader support

## Environment Configuration

Configure the Orchard Core API URL in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

```typescript
export const environment = {
  production: false,
  orchardCoreApiUrl: 'http://localhost:5000/api'
};
```

## Future Enhancements

- Password reset functionality (currently placeholder)
- Remember me option
- Multi-factor authentication
- Social login providers
- Session timeout handling

## Dependencies

- Angular 19+ (standalone components)
- Angular Reactive Forms
- Angular Router
- RxJS

## Version History

- **v1.0.0** (2025-12-13): Initial release with core login functionality
