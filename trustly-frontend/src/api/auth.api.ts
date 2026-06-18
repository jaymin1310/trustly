import { apiClient, clearTokens, setAuthSession } from './client'
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  OtpRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from '../types/models'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse>('/api/auth/register', data).then((r) => r.data),

  resendVerificationOtp: (data: OtpRequest) =>
    apiClient.post<ApiResponse>('/api/auth/resend-verification-otp', data).then((r) => r.data),

  verifyOtp: (data: VerifyOtpRequest) =>
    apiClient.post<AuthResponse>('/api/auth/verify-otp', data).then((r) => r.data),

  forgotPassword: (data: OtpRequest) =>
    apiClient.post<ApiResponse>('/api/auth/forgot-password', data).then((r) => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<ApiResponse>('/api/auth/reset-password', data).then((r) => r.data),

  resendResetOtp: (data: OtpRequest) =>
    apiClient.post<ApiResponse>('/api/auth/resend-reset-otp', data).then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse>('/api/auth/logout', { refreshToken }).then((r) => r.data),

  logoutAll: () =>
    apiClient.post<ApiResponse>('/api/auth/logout-all').then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/api/auth/refresh', { refreshToken }).then((r) => r.data),

  storeAuth: (response: AuthResponse) => {
    setAuthSession(response)
  },

  clearAuth: () => clearTokens(),
}
