import request from "./client";
import type {
  StudentResponse,
  StudentRequest,
  StudentRoundVisualizerResponse,
  ApplicationResponse,
  StudentWithPlacement,
} from "./types";
import { applicationApi } from "./applicationApi";
import { jobPostingApi } from "./jobPostingApi";

function normalizeDepartment(dept?: string): string {
  if (!dept) return "Computer Science";
  const d = dept.trim().toLowerCase();
  if (d === "cse" || d.includes("computer")) return "Computer Science";
  if (d === "it" || d.includes("information")) return "Information Technology";
  if (d === "ece" || d === "eee" || d.includes("electronics")) return "Electronics";
  if (d === "mech" || d.includes("mechanical")) return "Mechanical";
  if (d.includes("electrical")) return "Electrical";
  return dept;
}

export const studentApi = {
  getAll: () => request<StudentResponse[]>("/students/all"),

  getById: (id: string) => request<StudentResponse>(`/students/${id}`),

  add: (data: StudentRequest) => {
    const cgpaVal = Number(data.cgpa ?? data.CGPA ?? 0);
    const payload: Record<string, any> = {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      department: normalizeDepartment(data.department),
      activeBacklogs: Number(data.activeBacklogs ?? 0),
      resumeUrl: data.resumeUrl,
      year: Number(data.year ?? 4),
      cgpa: cgpaVal,
    };
    return request<StudentResponse>("/students/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: (data: StudentRequest) => {
    const cgpaVal = Number(data.cgpa ?? data.CGPA ?? 0);
    const payload: Record<string, any> = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      department: normalizeDepartment(data.department),
      activeBacklogs: Number(data.activeBacklogs ?? 0),
      resumeUrl: data.resumeUrl,
      year: Number(data.year ?? 4),
      cgpa: cgpaVal,
    };
    return request<StudentResponse>("/students/update", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: (id: string) =>
    request<string>(`/students/delete/${id}`, { method: "DELETE" }),

  getStageVisualizer: (id: string) =>
    request<StudentRoundVisualizerResponse[]>(`/students/stageVisualizer/${id}`),

  verifyEmail: (id: string) =>
    request<string>(`/students/${encodeURIComponent(id)}/verifyEmail`, {
      method: "POST",
    }),

  getAllWithPlacementInfo: async (): Promise<StudentWithPlacement[]> => {
    const [students, applications, jobPostings] = await Promise.all([
      request<StudentResponse[]>("/students/all"),
      applicationApi.getAll(),
      jobPostingApi.getAll(),
    ]);

    const jobPostingById = new Map(jobPostings.map((jp) => [jp.id, jp]));

    const placedByStudent = new Map<string, ApplicationResponse>();
    for (const app of applications) {
      if (app.status === "SHORTLISTED") {
        placedByStudent.set(app.studentId, app);
      }
    }

    return students.map((s): StudentWithPlacement => {
      const placedApp = placedByStudent.get(s.id);
      const placedPosting = placedApp
        ? jobPostingById.get(placedApp.jobPostingId)
        : undefined;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        department: s.department,
        cgpa: s.cgpa ?? s.CGPA ?? 0,
        backlogs: s.activeBacklogs,
        placementStatus: placedApp ? "Placed" : "Unplaced",
        placedCompany: placedApp?.companyName,
        placedPackage: placedPosting?.salary
          ? `${placedPosting.salary} LPA`
          : undefined,
        resumeScore: 0,
        projectsCount: 0,
        resumeText: "",
      };
    });
  },
};