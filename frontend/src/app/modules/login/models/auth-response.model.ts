export interface UserInfo {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserInfo;
  error?: {
    code: AuthErrorCode;
    message: string;
  };
}
