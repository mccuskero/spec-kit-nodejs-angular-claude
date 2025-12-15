import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from '../../services/auth.service';
import { AuthResponse, AuthErrorCode } from '../../models/auth-response.model';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // T015: empty username shows error after touch
  it('should show username error when empty after touch', () => {
    const usernameControl = component.loginForm.get('username');
    usernameControl?.markAsTouched();
    fixture.detectChanges();

    expect(usernameControl?.hasError('required')).toBe(true);
    expect(usernameControl?.touched).toBe(true);
  });

  // T016: empty password shows error after touch
  it('should show password error when empty after touch', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.markAsTouched();
    fixture.detectChanges();

    expect(passwordControl?.hasError('required')).toBe(true);
    expect(passwordControl?.touched).toBe(true);
  });

  // T017: submit button disabled when form invalid
  it('should disable submit button when form is invalid', () => {
    expect(component.loginForm.invalid).toBe(true);

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');

    expect(submitButton?.disabled).toBe(true);
  });

  // T018: onSubmit() calls authService.login() with form values
  it('should call authService.login with form values on submit', () => {
    const mockResponse: AuthResponse = {
      success: true,
      token: 'mock-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      }
    };
    authService.login.and.returnValue(of(mockResponse));

    component.loginForm.setValue({
      username: 'testuser',
      password: 'password123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });

  // Phase 4: Failed Login Tests (T038-T045)

  // T038: shows generic error message on 401 response
  it('should show generic error message on 401 response', () => {
    const mockErrorResponse: AuthResponse = {
      success: false,
      error: {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid username or password'
      }
    };
    authService.login.and.returnValue(of(mockErrorResponse));

    component.loginForm.setValue({
      username: 'wronguser',
      password: 'wrongpass'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid username or password');
  });

  // T039: error message does not reveal username vs password failure
  it('should use generic message that does not reveal which credential was incorrect', () => {
    const mockErrorResponse: AuthResponse = {
      success: false,
      error: {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid username or password'
      }
    };
    authService.login.and.returnValue(of(mockErrorResponse));

    component.loginForm.setValue({
      username: 'testuser',
      password: 'wrongpass'
    });

    component.onSubmit();

    // Should use a generic message, not reveal which field was wrong
    expect(component.errorMessage).toBe('Invalid username or password');
    // Should not say things like "Invalid username" or "Incorrect password"
    expect(component.errorMessage).not.toMatch(/^Invalid username$/);
    expect(component.errorMessage).not.toMatch(/^Incorrect password$/);
  });

  // T040: error message clears when user starts typing
  it('should clear error message when user starts typing', () => {
    component.errorMessage = 'Some error message';

    component.loginForm.get('username')?.setValue('new');
    fixture.detectChanges();

    expect(component.errorMessage).toBeNull();
  });

  // T042: handles 423 (account locked) error
  it('should handle account locked error with specific message', () => {
    const mockErrorResponse: AuthResponse = {
      success: false,
      error: {
        code: AuthErrorCode.ACCOUNT_LOCKED,
        message: 'Account is locked. Please contact support.'
      }
    };
    authService.login.and.returnValue(of(mockErrorResponse));

    component.loginForm.setValue({
      username: 'lockeduser',
      password: 'password123'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Account is locked. Please contact support.');
  });

  // T043: handles network errors (status 0)
  it('should handle network errors', () => {
    const mockErrorResponse: AuthResponse = {
      success: false,
      error: {
        code: AuthErrorCode.NETWORK_ERROR,
        message: 'Unable to connect to server. Please try again.'
      }
    };
    authService.login.and.returnValue(of(mockErrorResponse));

    component.loginForm.setValue({
      username: 'testuser',
      password: 'password123'
    });

    component.onSubmit();

    expect(component.errorMessage).toContain('Unable to connect');
  });

  // T045: user can retry login after error
  it('should allow user to retry login after error', () => {
    // First attempt fails
    const mockErrorResponse: AuthResponse = {
      success: false,
      error: {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid username or password'
      }
    };
    authService.login.and.returnValue(of(mockErrorResponse));

    component.loginForm.setValue({
      username: 'wronguser',
      password: 'wrongpass'
    });
    component.onSubmit();

    expect(component.errorMessage).toBeTruthy();

    // Second attempt succeeds
    const mockSuccessResponse: AuthResponse = {
      success: true,
      token: 'mock-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      }
    };
    authService.login.and.returnValue(of(mockSuccessResponse));

    component.loginForm.setValue({
      username: 'testuser',
      password: 'password123'
    });
    component.onSubmit();

    expect(component.errorMessage).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  // Phase 5: Password Toggle Tests (T054-T057)

  // T054: password field type is 'password' by default
  it('should have password field type as password by default', () => {
    const compiled = fixture.nativeElement;
    const passwordInput = compiled.querySelector('input[formControlName="password"]');

    expect(passwordInput?.type).toBe('password');
  });

  // T055: togglePasswordVisibility() changes showPassword boolean
  it('should toggle showPassword property when togglePasswordVisibility is called', () => {
    expect(component.showPassword).toBe(false);

    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);

    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });

  // T056: password field type changes to 'text' when showPassword is true
  it('should change password field type to text when showPassword is true', () => {
    component.showPassword = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const passwordInput = compiled.querySelector('input[formControlName="password"]');

    expect(passwordInput?.type).toBe('text');
  });

  // T057: password is transmitted securely regardless of showPassword state
  it('should transmit password securely regardless of visibility state', () => {
    const mockResponse: AuthResponse = {
      success: true,
      token: 'mock-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      }
    };
    authService.login.and.returnValue(of(mockResponse));

    // Set showPassword to true
    component.showPassword = true;
    component.loginForm.setValue({
      username: 'testuser',
      password: 'password123'
    });

    component.onSubmit();

    // Verify password is sent as-is in the request, not affected by visibility
    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });

  // Phase 6: Forgot Password Tests (T068-T070)

  // T068: forgot password link renders in template
  it('should render forgot password link', () => {
    const compiled = fixture.nativeElement;
    const forgotPasswordLink = compiled.querySelector('a[href="#"]');

    expect(forgotPasswordLink).toBeTruthy();
    expect(forgotPasswordLink?.textContent).toContain('Forgot Password');
  });

  // T069: clicking forgot password link shows "coming soon" message
  it('should show coming soon message when forgot password is clicked', () => {
    component.onForgotPassword();

    expect(component.errorMessage).toBe('Password reset coming soon');
  });

  // T070 (E2E): forgot password link is visible and clickable
  // This is tested in the E2E suite
});
