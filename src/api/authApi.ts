import request from "./client";
import type { LoginRequest, LoginResponse, RefreshRequest } from "./types";

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