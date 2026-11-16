import request from "./client";
import type { LoginRequest, LoginResponse, RefreshRequest } from "./types";

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyRecoveryOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  loginStudent: (data: { identifier: string; password: string }) =>
    request<LoginResponse>("/auth/login/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  googleLogin: (data: GoogleLoginRequest) =>
    request<LoginResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  forgotPassword: (data: ForgotPasswordRequest) =>
    request<{ message?: string }>("/auth/forget-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyRecoveryOtp: (data: VerifyRecoveryOtpRequest) =>
    request<{ token: string }>("/auth/verify-recovery-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetPassword: (data: ResetPasswordRequest) =>
    request<{ message?: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resendVerification: (data: ResendVerificationRequest) =>
    request<{ message?: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refresh: (data: RefreshRequest) =>
    request<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (data: RefreshRequest) =>
    request<string>("/auth/logout", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
