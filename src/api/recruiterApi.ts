import request from "./client";
import type { RecruiterResponse, RecruiterRequest } from "./types";

export const recruiterApi = {
  getAll: () => request<RecruiterResponse[]>("/recruiters/all"),

  getById: (id: number) => request<RecruiterResponse>(`/recruiters/${id}`),

  register: (data: RecruiterRequest) =>
    request<RecruiterResponse>("/recruiters/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id: number) =>
    request<RecruiterResponse>(`/recruiters/approve/${id}`, {
      method: "PATCH",
    }),

  delete: (id: number) =>
    request<string>(`/recruiters/delete/${id}`, { method: "DELETE" }),
};
