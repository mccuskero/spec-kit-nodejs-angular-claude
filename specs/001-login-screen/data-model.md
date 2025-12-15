# Data Model: Login Screen

**Feature**: Login Screen (001-login-screen)
**Date**: 2025-12-13
**Purpose**: Define TypeScript interfaces and data structures for login functionality

## Overview

The login screen handles user authentication data flowing between the Angular frontend and Orchard Core backend. Data models ensure type safety and establish clear contracts for API communication.

---

## Frontend Models (TypeScript Interfaces)

### 1. LoginRequest

**Purpose**: Data submitted to Orchard Core authentication endpoint

**Location**: `frontend/src/app/modules/login/models/login-request.model.ts`

```typescript
export interface LoginRequest {
  /**
   * Username for authentication
   * @required
   */
  username: string;

  /**
   * Password for authentication
   * @required
   */
  password: string;

  /**
   * Optional: Remember me flag for extended session
   * @default false
   */
  rememberMe?: boolean;
}
```

**Validation Rules**:
- `username`: Required, non-empty string
- `password`: Required, non-empty string, minimum 6 characters (validated client-side, enforced server-side)
- `rememberMe`: Optional boolean

**Usage**:
```typescript
const request: LoginRequest = {
  username: this.loginForm.value.username,
  password: this.loginForm.value.password,
  rememberMe: this.loginForm.value.rememberMe || false
};
```

---

### 2. AuthResponse

**Purpose**: Response from Orchard Core after authentication attempt

**Location**: `frontend/src/app/modules/login/models/auth-response.model.ts`

```typescript
export interface AuthResponse {
  /**
   * Authentication success status
   */
  success: boolean;

  /**
   * JWT access token (if authentication successful)
   * @optional
   */
  accessToken?: string;

  /**
   * JWT refresh token (for token renewal)
   * @optional
   */
  refreshToken?: string;

  /**
   * Token expiration timestamp (Unix epoch)
   * @optional
   */
  expiresAt?: number;

  /**
   * User information (if authentication successful)
   * @optional
   */
  user?: UserInfo;

  /**
   * Error message (if authentication failed)
   * @optional
   */
  error?: string;

  /**
   * Error code for programmatic handling
   * @optional
   */
  errorCode?: AuthErrorCode;
}
```

**Related Types**:
```typescript
export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  roles?: string[];
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}
```

**Usage**:
```typescript
this.authService.login(request).subscribe(
  (response: AuthResponse) => {
    if (response.success) {
      this.storeToken(response.accessToken!);
      this.router.navigate(['/dashboard']);
    } else {
      this.displayError(response.error || 'Authentication failed');
    }
  }
);
```

---

### 3. AuthState

**Purpose**: Application-wide authentication state

**Location**: `frontend/src/app/core/models/auth-state.model.ts`

```typescript
export interface AuthState {
  /**
   * Whether user is currently authenticated
   */
  isAuthenticated: boolean;

  /**
   * Current user information
   * @optional - null when not authenticated
   */
  currentUser: UserInfo | null;

  /**
   * Access token
   * @optional - null when not authenticated
   */
  token: string | null;

  /**
   * Token expiration time
   * @optional - null when not authenticated
   */
  tokenExpiry: number | null;

  /**
   * Loading state for async auth operations
   */
  isLoading: boolean;

  /**
   * Last authentication error
   * @optional - null when no error
   */
  error: string | null;
}
```

**Initial State**:
```typescript
export const initialAuthState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  token: null,
  tokenExpiry: null,
  isLoading: false,
  error: null
};
```

**Usage**:
```typescript
// In AuthService or NgRx store
private authState$ = new BehaviorSubject<AuthState>(initialAuthState);

isAuthenticated(): boolean {
  const state = this.authState$.value;
  return state.isAuthenticated &&
         state.token !== null &&
         state.tokenExpiry! > Date.now();
}
```

---

### 4. LoginFormData

**Purpose**: Internal form data structure for reactive form binding

**Location**: `frontend/src/app/modules/login/models/login-form-data.model.ts`

```typescript
export interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean; // UI state only
}
```

**Usage**:
```typescript
// In LoginFormComponent
loginForm: FormGroup<{
  username: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
}>;
```

---

## Backend Models (Orchard Core)

**Note**: These are managed by Orchard Core and not implemented in this feature. Documented here for reference.

### Orchard Core User Entity

```csharp
// Provided by Orchard Core (reference only)
public class User
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public string NormalizedUserName { get; set; }
    public string NormalizedEmail { get; set; }
    public bool EmailConfirmed { get; set; }
    public string PasswordHash { get; set; }
    public bool IsEnabled { get; set; }
    public bool IsLockedOut { get; set; }
    // ... additional Orchard Core fields
}
```

### Orchard Core Login DTO

```csharp
// Provided by Orchard Core (reference only)
public class LoginRequest
{
    public string UserName { get; set; }
    public string Password { get; set; }
    public bool RememberMe { get; set; }
}

public class LoginResponse
{
    public bool Success { get; set; }
    public string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string ErrorMessage { get; set; }
}
```

---

## Data Flow Diagram

```
┌─────────────────────────┐
│ LoginFormComponent      │
│ ┌─────────────────────┐ │
│ │ LoginFormData       │ │
│ │ - username          │ │
│ │ - password          │ │
│ │ - rememberMe        │ │
│ │ - showPassword      │ │
│ └─────────────────────┘ │
└────────────┬────────────┘
             │ Convert to LoginRequest
             │
             ▼
┌─────────────────────────┐
│ AuthService             │
│ ┌─────────────────────┐ │
│ │ LoginRequest        │ │
│ │ - username          │ │
│ │ - password          │ │
│ │ - rememberMe        │ │
│ └─────────────────────┘ │
└────────────┬────────────┘
             │ HTTP POST
             │
             ▼
┌─────────────────────────┐
│ Orchard Core API        │
│ /api/Users/login        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ AuthService             │
│ ┌─────────────────────┐ │
│ │ AuthResponse        │ │
│ │ - success           │ │
│ │ - accessToken       │ │
│ │ - refreshToken      │ │
│ │ - expiresAt         │ │
│ │ - user              │ │
│ │ - error             │ │
│ └─────────────────────┘ │
└────────────┬────────────┘
             │ Update AuthState
             │
             ▼
┌─────────────────────────┐
│ Application State       │
│ ┌─────────────────────┐ │
│ │ AuthState           │ │
│ │ - isAuthenticated   │ │
│ │ - currentUser       │ │
│ │ - token             │ │
│ │ - tokenExpiry       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## Validation Rules Summary

| Field | Client-Side Validation | Server-Side Validation |
|-------|----------------------|----------------------|
| `username` | Required, non-empty | Required, exists in DB |
| `password` | Required, min 6 chars | Required, matches hash |
| `rememberMe` | Optional boolean | N/A (session duration) |

**Note**: Client-side validation improves UX but NEVER replaces server-side validation (security requirement).

---

## State Transitions

### Authentication State Machine

```
[Not Authenticated]
      │
      │ user submits credentials
      ▼
[Loading] (isLoading = true)
      │
      ├─ success → [Authenticated] (isAuthenticated = true, token stored)
      │
      └─ failure → [Not Authenticated] (error displayed)
```

### Form State Machine

```
[Pristine] (untouched, no validation shown)
      │
      │ user interacts
      ▼
[Dirty] (validation shown on touched fields)
      │
      ├─ valid → [Submittable] (submit button enabled)
      │
      └─ invalid → [Not Submittable] (submit button disabled)
```

---

## Error Handling

### Error Response Structure

```typescript
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  displayMessage: string; // User-friendly message
  timestamp: number;
}
```

### Error Mapping

```typescript
function mapAuthError(error: any): AuthError {
  if (error.status === 401) {
    return {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: error.error?.message || 'Unauthorized',
      displayMessage: 'Invalid username or password. Please try again.',
      timestamp: Date.now()
    };
  }

  if (error.status === 423) {
    return {
      code: AuthErrorCode.ACCOUNT_LOCKED,
      message: 'Account locked',
      displayMessage: 'Your account has been locked. Please contact support.',
      timestamp: Date.now()
    };
  }

  // Network or server errors
  return {
    code: AuthErrorCode.NETWORK_ERROR,
    message: error.message,
    displayMessage: 'Unable to connect. Please check your connection and try again.',
    timestamp: Date.now()
  };
}
```

---

## Storage Strategy

### Token Storage

**Decision**: Store JWT tokens in HttpOnly cookies (preferred) or localStorage (fallback)

```typescript
// Token storage service
export class TokenStorageService {
  private readonly TOKEN_KEY = 'ets_cms_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'ets_cms_refresh_token';

  storeToken(token: string, refreshToken?: string): void {
    // If using localStorage (fallback)
    localStorage.setItem(this.TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}
```

**Note**: HttpOnly cookies are preferred for production (requires backend support). localStorage used for development/testing.

---

## Type Safety Guarantees

All models use TypeScript strict mode:
- `strict: true` in tsconfig.json
- No `any` types without explicit justification
- Null safety with strict null checks
- Interface contracts enforced at compile time

---

## Future Enhancements

### Potential Model Extensions

1. **Multi-Factor Authentication (MFA)**
```typescript
export interface MFAChallenge {
  challengeId: string;
  method: 'totp' | 'sms' | 'email';
  expiresAt: number;
}

export interface MFAResponse {
  code: string;
  challengeId: string;
}
```

2. **Social Login**
```typescript
export interface SocialLoginRequest {
  provider: 'google' | 'microsoft' | 'github';
  token: string;
}
```

3. **Password Reset**
```typescript
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
}
```

These are NOT part of the current implementation but the model structure supports future additions.
