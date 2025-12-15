import { UserInfo } from '../../modules/login/models/auth-response.model';

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
}
