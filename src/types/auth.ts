/**
 * Auth types for Promptly SDK
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  member: Member;
  token: string;
  token_type: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface SocialProvider {
  name: string;
  enabled: boolean;
}

export interface SocialAuthUrl {
  url: string;
  provider: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}
