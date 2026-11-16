import request from "./client";
import type {
  StudentResponse,
  StudentRequest,
  StudentRoundVisualizerResponse,
  ApplicationResponse,
  StudentWithPlacement,
  JobPostingResponse,
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
  return "Computer Science";
}

async function enrichStudent(student: StudentResponse): Promise<StudentResponse> {
  if (!student.userId) return { ...student, name: student.name || '', email: student.email || '', phone: student.phone || '', year: student.year ?? 0 };
  const user = await request<any>(`/user/${student.userId}`).catch(() => null);
  const name = user?.nameResponseDTO
    ? [user.nameResponseDTO.firstName, user.nameResponseDTO.middleName, user.nameResponseDTO.lastName].filter(Boolean).join(" ")
    : "";
  return {
    ...student,
    name,
    email: user?.email || "",
    phone: user?.phone || "",
    emailVerified: Boolean(user?.emailVerified),
    year: student.year ?? 0,
  };
}

export const studentApi = {
  getAll: async () => {
    const students = await request<StudentResponse[]>("/students/all");
    return Promise.all((students || []).map(enrichStudent));
  },

  getById: async (id: string) => enrichStudent(await request<StudentResponse>(`/students/${id}`)),

  add: (data: StudentRequest) =>
    request<StudentResponse>("/students/add", {
      method: "POST",
      body: JSON.stringify({
        id: data.id,
        department: normalizeDepartment(data.department),
        cgpa: Number(data.cgpa ?? 0),
        activeBacklogs: Number(data.activeBacklogs ?? 0),
        resumeUrl: data.resumeUrl,
        yearOfAdmission: data.yearOfAdmission,
        dateOfBirth: data.dateOfBirth,
        userId: data.userId,
      }),
    }),

  update: (data: StudentRequest) =>
    request<StudentResponse>("/students/update", {
      method: "PUT",
      body: JSON.stringify({
        id: data.id,
        department: normalizeDepartment(data.department),
        cgpa: Number(data.cgpa),
        activeBacklogs: Number(data.activeBacklogs ?? 0),
        resumeUrl: data.resumeUrl,
        yearOfAdmission: data.yearOfAdmission,
        dateOfBirth: data.dateOfBirth,
        userId: data.userId,
      }),
    }),

  delete: (id: string) =>
    request<string>(`/students/delete/${id}`, { method: "DELETE" }),

  getStageVisualizer: (id: string) =>
    request<StudentRoundVisualizerResponse[]>(`/students/stageVisualizer/${id}`),

  verifyEmail: (id: string) =>
    request<string>(`/user/${encodeURIComponent(id)}/verifyEmail`, {
      method: "POST",
    }),

  confirmVerificationToken: (token: string) =>
    request<string>(`/user/verify-email?token=${encodeURIComponent(token)}`),

  getAllWithPlacementInfo: async (): Promise<StudentWithPlacement[]> => {
    const [students, applications, jobPostings] = await Promise.all([
      studentApi.getAll().catch(() => []),
      applicationApi.getAll().catch(() => []),
      jobPostingApi.getAll().catch(() => []),
    ]);

    const jobPostingById = new Map<number, JobPostingResponse>(
      (jobPostings || []).map((jp) => [jp.id, jp])
    );

    const placedByStudent = new Map<string, ApplicationResponse>();
    for (const app of applications || []) {
      if (app.status === "SHORTLISTED") {
        placedByStudent.set(app.studentId, app);
      }
    }

    return (students || []).map((s): StudentWithPlacement => {
      const placedApp = placedByStudent.get(s.id);
      const placedPosting = placedApp
        ? jobPostingById.get(placedApp.jobPostingId)
        : undefined;
      return {
        id: s.id,
        userId: s.userId,
        yearOfAdmission: s.yearOfAdmission,
        name: s.name || "",
        email: s.email || "",
        phone: s.phone,
        department: s.department,
        cgpa: s.cgpa ?? s.CGPA ?? 0,
        backlogs: s.activeBacklogs ?? 0,
        placementStatus: placedApp ? "Placed" : "Unplaced",
        placedCompany: placedApp?.companyName,
        placedPackage: placedPosting?.salary != null
          ? `${placedPosting.salary} LPA`
          : undefined,
        resumeScore: 0,
        projectsCount: 0,
        resumeText: "",
        emailVerified: s.emailVerified,
      };
    });
  },
};