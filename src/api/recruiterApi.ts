import request from "./client";
import type { RecruiterResponse, RecruiterRequest } from "./types";

const enrichRecruiter = async (recruiter: RecruiterResponse): Promise<RecruiterResponse> => {
  if (!recruiter.userId) return { ...recruiter, name: '', email: '' };
  const user = await request<any>(`/user/${recruiter.userId}`).catch(() => null);
  const name = user?.nameResponseDTO
    ? [user.nameResponseDTO.firstName, user.nameResponseDTO.middleName, user.nameResponseDTO.lastName].filter(Boolean).join(" ")
    : "";
  return { ...recruiter, name, email: user?.email || "" };
};

export const recruiterApi = {
  getAll: async () => {
    const recruiters = await request<RecruiterResponse[]>("/recruiters/all");
    return Promise.all((recruiters || []).map(enrichRecruiter));
  },

  getById: async (id: number) => enrichRecruiter(await request<RecruiterResponse>(`/recruiters/${id}`)),

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
