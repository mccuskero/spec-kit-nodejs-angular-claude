# Research: Login Screen Implementation

**Feature**: Login Screen (001-login-screen)
**Date**: 2025-12-13
**Purpose**: Research technical decisions and best practices for implementing secure login with Orchard Core integration

## Research Areas

### 1. Orchard Core Authentication Integration

**Decision**: Use Orchard Core's built-in Authentication API endpoints with JWT token-based authentication

**Rationale**:
- Orchard Core provides `/api/auth/token` endpoint for authentication
- JWT tokens enable stateless authentication suitable for SPA (Single Page Application)
- Tokens can be stored in HttpOnly cookies or localStorage (cookies preferred for security)
- Orchard Core handles session management, token expiration, and refresh automatically

**Alternatives Considered**:
1. **Cookie-based session authentication**: More traditional but requires stateful server sessions, complicates scaling
2. **OAuth2/OpenID Connect**: Overcomplicated for username/password login, better suited for third-party auth
3. **Custom authentication service**: Violates Constitution Principle I (Security First) - don't reinvent security

**Best Practices**:
- Use Orchard Core's `Users` API: `POST /api/Users/login` or similar endpoint
- Store JWT tokens securely (HttpOnly cookies preferred over localStorage to prevent XSS)
- Implement token refresh logic before expiration
- Handle 401/403 responses and redirect to login when needed

**Documentation References**:
- Orchard Core Authentication: https://docs.orchardcore.net/en/latest/reference/modules/Users/
- Orchard Core API: https://docs.orchardcore.net/en/latest/reference/web-apis/

---

### 2. Angular Reactive Forms vs Template-Driven Forms

**Decision**: Use Angular Reactive Forms (ReactiveFormsModule)

**Rationale**:
- Better for complex validation (required, email format, min length)
- More testable - form logic is in component class, not template
- Type-safe with TypeScript
- Easier to implement dynamic behaviors (enable/disable fields, conditional validation)
- Industry standard for production Angular applications

**Alternatives Considered**:
1. **Template-Driven Forms**: Simpler but less testable, harder to validate complex scenarios, mixing logic and template

**Implementation**:
```typescript
// In login-form.component.ts
this.loginForm = this.formBuilder.group({
  username: ['', [Validators.required]],
  password: ['', [Validators.required, Validators.minLength(6)]]
});
```

**Best Practices**:
- Disable submit button until form is valid
- Show validation errors only after field is touched or form is submitted
- Use FormControl, FormGroup abstractions
- Implement custom validators if needed (e.g., no spaces in username)

---

### 3. Password Show/Hide Toggle Implementation

**Decision**: Custom component with input type toggling

**Rationale**:
- Simple, accessible, and reusable
- No third-party library needed
- Full control over styling and behavior
- Can be tested independently

**Implementation Approach**:
```typescript
// password-toggle.component.ts
@Input() control: FormControl;
@Output() visibilityChanged = new EventEmitter<boolean>();

showPassword = false;

get inputType(): string {
  return this.showPassword ? 'text' : 'password';
}

toggleVisibility(): void {
  this.showPassword = !this.showPassword;
  this.visibilityChanged.emit(this.showPassword);
}
```

**Alternatives Considered**:
1. **Third-party component library** (e.g., Angular Material): Adds unnecessary dependency for simple toggle
2. **Inline toggle logic in login form**: Less reusable, violates DRY principle

**Best Practices**:
- Use `aria-label` for accessibility
- Toggle between `type="password"` and `type="text"`
- Use standard eye/eye-slash icons (Font Awesome, Material Icons, or SVG)
- Ensure password is always transmitted as masked (type toggle is UI-only)

---

### 4. Error Handling and User Feedback

**Decision**: Generic error messages for auth failures, specific messages for validation errors

**Rationale**:
- Security best practice: Don't reveal if username or password was incorrect
- User experience: Be specific about validation errors (empty field, invalid format)
- Network errors: Provide helpful retry message without exposing system details

**Implementation Strategy**:
```typescript
// Generic authentication error
"Invalid username or password. Please try again."

// Validation errors (field-specific)
"Username is required"
"Password must be at least 6 characters"

// Network/service errors
"Unable to connect. Please check your connection and try again."
```

**Alternatives Considered**:
1. **Specific error messages**: "Username not found" vs "Incorrect password" - violates security best practice (user enumeration attack)
2. **No error messages**: Poor UX, users can't fix issues

**Best Practices**:
- Display errors prominently near form or at top
- Use Angular Material Snackbar or custom alert component
- Clear errors when user starts typing (reactive error clearing)
- Log detailed errors server-side for debugging (Orchard Core handles this)

---

### 5. Loading States and UX Feedback

**Decision**: Disable form and show spinner during authentication request

**Rationale**:
- Prevents duplicate submissions
- Provides clear visual feedback
- Standard UX pattern users expect

**Implementation**:
```typescript
isLoading = false;

login(): void {
  if (this.loginForm.invalid) return;

  this.isLoading = true;
  this.authService.login(this.loginForm.value)
    .pipe(finalize(() => this.isLoading = false))
    .subscribe(
      response => this.router.navigate(['/dashboard']),
      error => this.handleError(error)
    );
}
```

**Alternatives Considered**:
1. **No loading indicator**: Poor UX, users may submit multiple times
2. **Progress bar**: Overcomplicated for < 2 second operation

**Best Practices**:
- Disable submit button when loading
- Show spinner icon on button or overlay
- Use CSS to reduce opacity of form during loading
- Implement timeout (e.g., 10 seconds) for network errors

---

### 6. Routing and Navigation Strategy

**Decision**: Use Angular Router with route guards for authentication state

**Rationale**:
- Angular Router is standard for SPA navigation
- Route guards prevent unauthorized access to protected routes
- Can redirect to login if session expires

**Implementation**:
```typescript
// login-routing.module.ts
const routes: Routes = [
  { path: 'login', component: LoginFormComponent }
];

// auth.guard.ts (for protected routes)
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

**Alternatives Considered**:
1. **Window.location navigation**: Loses SPA benefits, forces full page reload
2. **Manual DOM manipulation**: Anti-pattern in Angular, breaks framework abstractions

**Best Practices**:
- Redirect to dashboard on successful login
- Store intended URL before redirecting to login (returnUrl parameter)
- Use lazy loading for login module (improves initial load time)

---

### 7. HTTP Interceptor for Auth Token Management

**Decision**: Implement Angular HTTP interceptor to automatically attach auth tokens

**Rationale**:
- Centralized token management
- Automatic token attachment to all API requests
- Can handle token refresh logic
- Separation of concerns - components don't manage tokens

**Implementation**:
```typescript
// auth.interceptor.ts
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = this.authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next.handle(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
      return throwError(error);
    })
  );
}
```

**Alternatives Considered**:
1. **Manual token attachment in each service**: Repetitive, error-prone, violates DRY
2. **No interceptor**: Services must manually manage tokens and handle 401s

**Best Practices**:
- Register interceptor globally in app.module.ts providers
- Handle 401 responses uniformly (logout and redirect)
- Exclude login endpoint from token attachment logic

---

### 8. Accessibility (A11y) Requirements

**Decision**: Full WCAG 2.1 AA compliance for login form

**Rationale**:
- Legal requirement in many jurisdictions
- Better user experience for all users
- Screen reader support critical for authentication

**Implementation Checklist**:
- ✅ All form fields have `<label>` elements with `for` attribute
- ✅ Error messages announced to screen readers (aria-live regions)
- ✅ Keyboard navigation (Tab, Enter to submit)
- ✅ Focus management (auto-focus first field, trap focus in modal if used)
- ✅ ARIA labels for icon buttons (password toggle, submit)
- ✅ Sufficient color contrast (4.5:1 for text, 3:1 for UI components)
- ✅ No reliance on color alone for error indication

**Best Practices**:
- Use semantic HTML (`<form>`, `<label>`, `<button type="submit">`)
- Test with screen reader (NVDA, JAWS, or macOS VoiceOver)
- Ensure error messages are associated with fields (aria-describedby)

---

### 9. Responsive Design Strategy

**Decision**: Mobile-first responsive CSS with flexbox/grid

**Rationale**:
- Login screen must work on all devices (spec requirement)
- Mobile-first ensures baseline functionality
- Flexbox/Grid are modern, well-supported layout tools

**Breakpoints**:
```scss
// login-form.component.scss
.login-container {
  // Mobile (< 768px): Full width, stacked
  width: 100%;
  padding: 1rem;

  // Tablet (768px - 1024px): Centered, max-width
  @media (min-width: 768px) {
    max-width: 400px;
    margin: 0 auto;
  }

  // Desktop (> 1024px): Same as tablet
  @media (min-width: 1024px) {
    max-width: 450px;
  }
}
```

**Alternatives Considered**:
1. **Desktop-first**: Harder to ensure mobile works, requires more media query overrides
2. **Fixed desktop-only design**: Violates spec requirement for mobile support

**Best Practices**:
- Use relative units (rem, em, %) over px
- Test on actual devices (iOS, Android)
- Ensure touch targets are at least 44x44px (mobile)

---

## Implementation Dependencies

### Required Angular Modules
- `@angular/forms` (ReactiveFormsModule)
- `@angular/router` (RouterModule)
- `@angular/common/http` (HttpClientModule)

### Optional Libraries (Recommended)
- **Icon Library**: Font Awesome or Angular Material Icons (for eye/eye-slash icons)
- **Testing**: Already specified (Jasmine/Karma, Cypress)

### Orchard Core Dependencies
- Orchard Core must be running at `./3rd-party/orchard-core`
- Authentication API endpoint must be accessible
- CORS configured to allow Angular frontend origin

---

## Security Considerations Summary

1. **No secrets in frontend code**: All auth logic in Orchard Core
2. **HTTPS only**: Enforced at infrastructure level
3. **Generic error messages**: Prevent user enumeration
4. **Secure token storage**: HttpOnly cookies preferred over localStorage
5. **CSRF protection**: If using cookies, ensure CSRF tokens
6. **Rate limiting**: Handled by Orchard Core backend
7. **Password transmission**: Always sent as masked input (UI toggle doesn't affect transmission)

---

## Testing Strategy

### Unit Tests (Jasmine/Karma)
1. Login form component: Form validation, submit handling, error display
2. Password toggle component: Toggle state, input type change
3. Auth service: API calls (mocked with HttpClientTestingModule)

### Integration Tests
1. Auth service + HTTP interceptor: Token attachment, 401 handling
2. Login form + Auth service: End-to-end authentication flow (mocked backend)

### E2E Tests (Cypress)
1. Successful login: Enter credentials, submit, verify dashboard redirect
2. Failed login: Enter invalid credentials, verify error message
3. Empty validation: Submit empty form, verify validation errors
4. Password toggle: Toggle password visibility, verify input type change

---

## Open Questions (None)

All technical decisions have been made. No clarifications needed from stakeholder.

---

## References

- Orchard Core Docs: https://docs.orchardcore.net/
- Angular Forms Guide: https://angular.io/guide/reactive-forms
- Angular Security: https://angular.io/guide/security
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
