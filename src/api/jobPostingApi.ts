import request from "./client";
import type {
  JobPostingResponse,
  JobPostingRequest,
  DriveWithCompany,
  CompanyResponse,
} from "./types";
import { companyApi } from "./companyApi";
import { applicationApi } from "./applicationApi";

export const jobPostingApi = {
  getAll: async (): Promise<JobPostingResponse[]> => {
    const [postings, companies] = await Promise.all([
      request<JobPostingResponse[]>("/job-postings/all"),
      companyApi.getAll().catch(() => []),
    ]);

    const companyById = new Map<number, CompanyResponse>();
    const companyByName = new Map<string, CompanyResponse>();
    for (const c of companies || []) {
      if (c.id != null) companyById.set(c.id, c);
      if (c.name) companyByName.set(c.name.trim().toLowerCase(), c);
    }

    return (postings || []).map((jp) => {
      const company =
        (jp.companyId ? companyById.get(jp.companyId) : undefined) ||
        (jp.companyName ? companyByName.get(jp.companyName.trim().toLowerCase()) : undefined);

      const recruitmentType: 'CAMPUS' | 'OFF_CAMPUS' =
        jp.recruitmentType === 'CAMPUS' || jp.recruitmentType === 'OFF_CAMPUS'
          ? jp.recruitmentType
          : (company ? 'CAMPUS' : 'OFF_CAMPUS');

      return {
        ...jp,
        recruitmentType,
        sourceType: jp.sourceType || (recruitmentType === 'OFF_CAMPUS' ? 'SCRAPER' : 'RECRUITER'),
      };
    });
  },

  getById: (id: number) =>
    request<JobPostingResponse>(`/job-postings/${id}`),

  getByCompany: (companyId: number) =>
    request<JobPostingResponse[]>(
      `/companies/job-postings/${companyId}`
    ),

  updateStatus: (id: number, status: string) =>
    request<JobPostingResponse>(
      `/job-postings/${id}/status?status=${encodeURIComponent(status)}`,
      { method: "PATCH" }
    ),

  delete: (id: number) =>
    request<string>(`/job-postings/delete/${id}`, { method: "DELETE" }),

  getAllWithCompanyInfo: async (): Promise<DriveWithCompany[]> => {
  const [postings, companies, applications] = await Promise.all([
    request<JobPostingResponse[]>("/job-postings/all"),
    companyApi.getAll(),
    applicationApi.getAll(),
  ]);

  const companyById = new Map<number, CompanyResponse>();
  const companyByName = new Map<string, CompanyResponse>();
  for (const company of companies || []) {
    if (company.id != null) companyById.set(company.id, company);
    if (company.name) companyByName.set(company.name.trim().toLowerCase(), company);
  }

  const registeredCountByPosting = new Map<number, number>();

  for (const application of applications) {
    registeredCountByPosting.set(
      application.jobPostingId,
      (registeredCountByPosting.get(application.jobPostingId) ?? 0) + 1
    );
  }

  return postings.map((jp): DriveWithCompany => {
    const company =
      (jp.companyId
        ? companyById.get(jp.companyId)
        : undefined) ||
      (jp.companyName
        ? companyByName.get(
            jp.companyName.trim().toLowerCase()
          )
        : undefined);

    const recruitmentType: 'CAMPUS' | 'OFF_CAMPUS' =
      jp.recruitmentType === 'CAMPUS' || jp.recruitmentType === 'OFF_CAMPUS'
        ? jp.recruitmentType
        : (company ? 'CAMPUS' : 'OFF_CAMPUS');

    const isOffCampus =
      recruitmentType === 'OFF_CAMPUS';

    const companyName =
      jp.companyName ||
      company?.name ||
      'Unknown Company';

    const companyId =
      jp.companyId ||
      company?.id ||
      0;

    const skills =
      jp.requiredSkills
        ?.split(',')
        .map((skill) => skill.trim())
        .filter(Boolean) ?? null;

    const branches =
      jp.allowedBranches
        ?.split(',')
        .map((branch) => branch.trim())
        .filter(Boolean) ?? null;

    return {
      id: String(jp.id),

      companyId,
      companyName,

      title: jp.title,
      description: jp.description ?? '',
      location: jp.location ?? '',

      package:
        jp.salary != null
          ? `${jp.salary} LPA`
          : 'Not disclosed',

      numericPackage: jp.salary ?? 0,

      // IMPORTANT:
      // Off-campus does NOT receive campus eligibility fields.
      cgpaCutoff: isOffCampus
        ? null
        : (jp.eligibleCGPACutoff ?? null),

      maxBacklogs: isOffCampus
        ? null
        : (jp.allowedBacklogs ?? null),

      allowedBranches: isOffCampus
        ? null
        : branches,

      eligibleBatch: isOffCampus
        ? null
        : (jp.eligibleBatch ?? null),

      deadline: isOffCampus
        ? null
        : (jp.deadline ?? null),

      skillsRequired: isOffCampus
        ? null
        : skills,

      status:
        jp.status === 'OPEN'
          ? 'OPEN'
          : 'CLOSED',

      registeredCount:
        registeredCountByPosting.get(jp.id) ?? 0,

      recruitmentType: recruitmentType as 'CAMPUS' | 'OFF_CAMPUS',

      sourceType: jp.sourceType,

      applyUrl: jp.applyUrl ?? null,
      source: jp.source ?? null,
      postedAt: jp.postedAt ?? null,
      jobType: jp.jobType ?? null,
      roleCategory: jp.roleCategory ?? null,
      department: jp.department ?? null,
      scrapedDate: jp.scrapedDate ?? null,
    };
  });
},

  createDrive: async (
    companyName: string,
    companyLocation: string,
    companyWebsite: string | undefined,
    jobData: JobPostingRequest
  ): Promise<DriveWithCompany> => {
    const companies = await companyApi.getAll();
    const existing = companies.find(
      (c: { name: string; }) => c.name.trim().toLowerCase() === companyName.trim().toLowerCase()
    );

    const safeLocation = companyLocation?.trim() || jobData.location?.trim() || 'Campus';

    const company =
      existing ??
      (await companyApi.create({
        name: companyName.trim(),
        location: safeLocation,
        website: companyWebsite?.trim() || undefined,
      }));

    const posting = await companyApi.addJobPosting(
      company.id,
      {
        title: jobData.title,
        description: jobData.description || undefined,
        eligibleCGPACutoff:
          typeof jobData.eligibleCGPACutoff === 'number' && !isNaN(jobData.eligibleCGPACutoff)
            ? jobData.eligibleCGPACutoff
            : undefined,
        allowedBacklogs:
          typeof jobData.allowedBacklogs === 'number' && !isNaN(jobData.allowedBacklogs)
            ? jobData.allowedBacklogs
            : undefined,
        allowedBranches: jobData.allowedBranches || undefined,
        requiredSkills: jobData.requiredSkills || undefined,
        salary:
          typeof jobData.salary === 'number' && !isNaN(jobData.salary) && jobData.salary > 0
            ? jobData.salary
            : 6.0,
        deadline: jobData.deadline && !isNaN(Date.parse(jobData.deadline))
          ? jobData.deadline
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        companyId: company.id,
      }
    );

    return {
  id: String(posting.id),
  companyId: company.id,
  companyName: company.name,

  title: posting.title,
  description: posting.description,
  location: posting.location ?? '',

  package:
    posting.salary != null
      ? `${posting.salary} LPA`
      : 'N/A',

  numericPackage: posting.salary ?? 0,

  cgpaCutoff:
    posting.eligibleCGPACutoff ?? null,

  maxBacklogs:
    posting.allowedBacklogs ?? null,

  allowedBranches:
    posting.allowedBranches
      ? posting.allowedBranches
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean)
      : null,

  eligibleBatch:
    posting.eligibleBatch ?? null,

  deadline:
    posting.deadline ?? null,

  skillsRequired:
    posting.requiredSkills
      ? posting.requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : null,

  status: 'OPEN',

  registeredCount: 0,

  // TPO/Recruiter-created drive
  recruitmentType: 'CAMPUS',

  sourceType:
    jobData.sourceType ?? 'TPO',

  applyUrl: posting.applyUrl ?? null,
  source: posting.source ?? null,
  postedAt: posting.postedAt ?? null,
  jobType: posting.jobType ?? null,
  roleCategory: posting.roleCategory ?? null,
  scrapedDate: posting.scrapedDate ?? null,
};
  },
};

export function isOnCampusDrive(drive: any): boolean {
  if (!drive) return false;
  return drive.recruitmentType === 'CAMPUS';
}

export function isOffCampusDrive(drive: any): boolean {
  if (!drive) return false;
  return drive.recruitmentType === 'OFF_CAMPUS';
}

export function isActiveDrive(drive: any): boolean {
  if (!drive) return false;
  const status = String(drive.status || '').trim().toUpperCase();
  return status === 'OPEN' || status === 'ACTIVE';
}