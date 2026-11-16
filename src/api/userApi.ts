import request from "./client";
import type { Role } from "./types";

export interface NameRequest {
  pronounce?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface AddressRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface UserRegistrationRequest {
  nameRequest: NameRequest;
  addressRequest: AddressRequest;
  email: string;
  password: string;
  role: Role;
  phone: string;
  college_id: number;
}

export interface UserResponse {
  id: number;
  nameResponseDTO?: {
    id?: number;
    pronounce?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    userId?: number;
  };
  addressResponseDTO?: AddressRequest & { userId?: number };
  email: string;
  accountStatus?: boolean;
  role: Role;
  phone?: string;
  college_id?: number;
  emailVerified: boolean;
}

export const userApi = {
  register: (data: UserRegistrationRequest) =>
    request<UserResponse>("/user/add", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getById: (id: number) => request<UserResponse>(`/user/${id}`),

  sendVerification: (id: number) =>
    request<string>(`/user/${id}/verifyEmail`, { method: "POST" }),

  registerTpo: (userId: number) =>
    request<{ id: number; userId: number }>("/tpo/register", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  confirmVerificationToken: (token: string) =>
    request<string>(`/user/verify-email?token=${encodeURIComponent(token)}`),

  delete: (id: number) =>
    request<string>(`/user/delete/${id}`, { method: "DELETE" }),
};
