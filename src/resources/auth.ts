/**
 * Auth Resource for Promptly SDK
 */

import type { HttpClient } from '../http';
import type {
  LoginCredentials,
  RegisterData,
  Member,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
  SocialProvider,
  SocialAuthUrl,
  UpdateProfileData,
} from '../types';

export class AuthResource {
  constructor(private http: HttpClient) {}

  /**
   * Login with email and password
   * Token is automatically saved if persistToken is enabled
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.http.post<AuthResponse>('/auth/login', credentials);
    if (response.token) {
      this.http.setToken(response.token, response.user);
    }
    return response;
  }

  /**
   * Register new member
   * Token is automatically saved if persistToken is enabled
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.http.post<AuthResponse>('/auth/register', data);
    if (response.token) {
      this.http.setToken(response.token, response.user);
    }
    return response;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await this.http.post('/auth/logout');
    } finally {
      this.http.setToken(null);
    }
  }

  /**
   * Get current user profile
   */
  async me(): Promise<Member> {
    return this.http.get<Member>('/profile');
  }

  /**
   * Update profile
   */
  async updateProfile(data: UpdateProfileData): Promise<Member> {
    return this.http.put<Member>('/profile', data);
  }

  /**
   * Send password reset email
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return this.http.post('/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return this.http.post('/auth/reset-password', data);
  }

  /**
   * Get available social login providers
   */
  async getSocialProviders(): Promise<SocialProvider[]> {
    return this.http.get<SocialProvider[]>('/auth/social/providers');
  }

  /**
   * Get social login redirect URL
   */
  async getSocialAuthUrl(provider: string): Promise<SocialAuthUrl> {
    return this.http.get<SocialAuthUrl>(`/auth/social/${provider}`);
  }

  /**
   * Handle social login callback
   * Token is automatically saved if persistToken is enabled
   */
  async socialCallback(provider: string, code: string): Promise<AuthResponse> {
    const response = await this.http.post<AuthResponse>(`/auth/social/${provider}/callback`, { code });
    if (response.token) {
      this.http.setToken(response.token, response.user);
    }
    return response;
  }

  /**
   * Set token manually (e.g., from localStorage)
   */
  setToken(token: string | null): void {
    this.http.setToken(token);
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.http.getToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.http.isAuthenticated();
  }
}
