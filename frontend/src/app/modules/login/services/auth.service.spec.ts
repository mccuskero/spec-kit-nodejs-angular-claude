import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse, AuthErrorCode } from '../models/auth-response.model';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // T020: login() makes POST request to /api/Users/login with credentials
  it('should make POST request to Orchard Core login endpoint', () => {
    const credentials: LoginRequest = {
      username: 'testuser',
      password: 'password123'
    };

    const mockResponse: AuthResponse = {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      }
    };

    service.login(credentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.orchardCoreApiUrl}/Users/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(mockResponse);
  });

  // T021: login() stores token on successful response
  it('should store token in localStorage on successful login', (done) => {
    const credentials: LoginRequest = {
      username: 'testuser',
      password: 'password123'
    };

    const mockResponse: AuthResponse = {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      }
    };

    service.login(credentials).subscribe(() => {
      const storedToken = localStorage.getItem('ets_cms_auth_token');
      expect(storedToken).toBe('mock-jwt-token');
      done();
    });

    const req = httpMock.expectOne(`${environment.orchardCoreApiUrl}/Users/login`);
    req.flush(mockResponse);
  });

  // T022: login() updates isAuthenticated$ BehaviorSubject on success
  it('should update isAuthenticated$ on successful login', (done) => {
    const credentials: LoginRequest = {
      username: 'testuser',
      password: 'password123'
    };

    const mockResponse: AuthResponse = {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      }
    };

    service.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        expect(isAuth).toBe(true);
        done();
      }
    });

    service.login(credentials).subscribe();

    const req = httpMock.expectOne(`${environment.orchardCoreApiUrl}/Users/login`);
    req.flush(mockResponse);
  });

  it('should return false for isAuthenticated when no token exists', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should return null when getToken is called with no stored token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should clear token and update authentication state on logout', () => {
    localStorage.setItem('ets_cms_auth_token', 'test-token');

    service.logout();

    expect(localStorage.getItem('ets_cms_auth_token')).toBeNull();
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(false);
    });
  });

  // Phase 4: Error Handling Tests (T041-T043)

  // T041: handles 401 error and returns error in Observable
  it('should handle 401 error and return AuthResponse with error', (done) => {
    const credentials: LoginRequest = {
      username: 'wronguser',
      password: 'wrongpass'
    };

    service.login(credentials).subscribe(response => {
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(AuthErrorCode.NETWORK_ERROR);
      done();
    });

    const req = httpMock.expectOne(`${environment.orchardCoreApiUrl}/Users/login`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  // T042: handles 423 (account locked) error with specific message
  it('should handle 423 account locked error', (done) => {
    const credentials: LoginRequest = {
      username: 'lockeduser',
      password: 'password123'
    };

    service.login(credentials).subscribe(response => {
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      done();
    });

    const req = httpMock.expectOne(`${environment.orchardCoreApiUrl}/Users/login`);
    req.flush({ message: 'Account locked' }, { status: 423, statusText: 'Locked' });
  });

  // T043: handles network errors (status 0)
  it('should handle network errors', (done) => {
    const credentials: LoginRequest = {
      username: 'testuser',
      password: 'password123'
    };

    service.login(credentials).subscribe(response => {
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe(AuthErrorCode.NETWORK_ERROR);
      expect(response.error?.message).toContain('Unable to connect');
      done();
    });

    const req = httpMock.expectOne(`${environment.orchardCoreApiUrl}/Users/login`);
    req.error(new ProgressEvent('error'), { status: 0 });
  });
});
