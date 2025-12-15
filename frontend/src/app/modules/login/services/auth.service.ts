import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse, AuthErrorCode } from '../models/auth-response.model';
import { environment } from '../../../../environments/environment';

// OAuth2 Token Response from Orchard Core
interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
  error?: string;
  error_description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'ets_cms_auth_token';
  private readonly TOKEN_URL = environment.tokenUrl;
  private readonly CLIENT_ID = environment.clientId;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // OAuth2 Password Grant Flow for Orchard Core
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', credentials.username);
    body.set('password', credentials.password);
    body.set('client_id', this.CLIENT_ID);
    body.set('scope', 'openid profile roles');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<OAuth2TokenResponse>(this.TOKEN_URL, body.toString(), { headers })
      .pipe(
        map((response: OAuth2TokenResponse) => {
          if (response.access_token) {
            // Store the access token
            this.storeToken(response.access_token);

            const authResponse: AuthResponse = {
              success: true,
              token: response.access_token
            };
            return authResponse;
          } else {
            // OAuth2 error response
            const authResponse: AuthResponse = {
              success: false,
              error: {
                code: AuthErrorCode.INVALID_CREDENTIALS,
                message: response.error_description || 'Login failed. Please check your credentials.'
              }
            };
            return authResponse;
          }
        }),
        catchError((error) => {
          console.error('Login error:', error);

          // Check if it's an OAuth2 error response
          if (error.error?.error) {
            const errorMessage = error.error.error === 'invalid_grant'
              ? 'Invalid username or password.'
              : error.error.error_description || 'Unable to connect to server. Please try again.';

            const authResponse: AuthResponse = {
              success: false,
              error: {
                code: error.error.error === 'invalid_grant'
                  ? AuthErrorCode.INVALID_CREDENTIALS
                  : AuthErrorCode.NETWORK_ERROR,
                message: errorMessage
              }
            };
            return of(authResponse);
          }

          // Network or other error
          const authResponse: AuthResponse = {
            success: false,
            error: {
              code: AuthErrorCode.NETWORK_ERROR,
              message: 'Unable to connect to server. Please try again.'
            }
          };
          return of(authResponse);
        })
      );
  }

  logout(): void {
    // TODO: Implement logout logic
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    return token !== null && token.length > 0;
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isAuthenticatedSubject.next(true);
  }
}
