import request from "./client";
import type { RecruiterResponse, RecruiterRequest } from "./types";

const enrichRecruiter = async (recruiter: RecruiterResponse): Promise<RecruiterResponse> => {\n  if (!recruiter.userId) return recruiter;\n  const user = await request<any>(`/user/${recruiter.userId}`).catch(() => null);\n  const name = user?.nameResponseDTO\n    ? [user.nameResponseDTO.firstName, user.nameResponseDTO.middleName, user.nameResponseDTO.lastName].filter(Boolean).join(" ")\n    : "";\n  return { ...recruiter, name, email: user?.email || "" };\n};\n\nexport const recruiterApi = {
  getAll: async () => {\n    const recruiters = await request<RecruiterResponse[]>("/recruiters/all");\n    return Promise.all((recruiters || []).map(enrichRecruiter));\n  },

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
