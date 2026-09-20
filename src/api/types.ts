export interface StudentResponse {
  id: string;
  name: string;
  email: string;
  registrationNumber?: string;
  phone: string;
  department: string;
  cgpa?: number;
  CGPA?: number;
  activeBacklogs: number;
  resumeUrl: string;
  year: number;
}

export interface StudentRequest {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  department: string;
  activeBacklogs?: number;
  resumeUrl: string;
  year: number;
  cgpa?: number;
  CGPA?: number;
}
export interface CompanyResponse {
  id: number;
  name: string;
  website: string;
  location: string;
  description: string;
}

export interface CompanyRequest {
  id?: number;          
  name: string;
  website?: string;
  location: string;
  description?: string;
}

export interface JobPostingResponse {
  id: number;

  title: string;
  description: string;

  salary?: number | null;
  deadline?: string | null;

  status: string;

  // Campus-only fields
  eligibleCGPACutoff?: number | null;
  allowedBacklogs?: number | null;
  allowedBranches?: string | null;
  eligibleBatch?: string | null;
  requiredSkills?: string | null;

  companyId?: number | null;
  companyName?: string | null;

  location?: string | null;
  department?: string | null;

  // Recruitment classification
  recruitmentType?: 'CAMPUS' | 'OFF_CAMPUS';
  sourceType?: 'RECRUITER' | 'TPO' | 'DATASET' | 'SCRAPER';

  // Scraped/off-campus fields
  applyUrl?: string | null;
  source?: string | null;
  postedAt?: string | null;
  jobType?: string | null;
  roleCategory?: string | null;
  scrapedDate?: string | null;
}

export interface JobPostingRequest {
  title: string;
  description?: string;

  // OpenAPI JobPostingRequestDTO fields
  eligibleCGPACutoff?: number | null;
  allowedBacklogs?: number | null;
  allowedBranches?: string | null;
  requiredSkills?: string | null;

  salary?: number | null;
  deadline?: string | null;

  companyId?: number | null;

  // Extra UI helper fields (optional for frontend drive creation helper)
  location?: string | null;
  eligibleBatch?: string | null;
  recruitmentType?: 'CAMPUS' | 'OFF_CAMPUS';
  sourceType?: 'RECRUITER' | 'TPO' | 'DATASET' | 'SCRAPER';
  applyUrl?: string | null;
  source?: string | null;
  postedAt?: string | null;
  jobType?: string | null;
  roleCategory?: string | null;
  scrapedDate?: string | null;
}
export interface DriveWithCompany {
  id: string;

  companyId: number;
  companyName: string;

  title: string;
  description: string;
  location: string;

  package: string;
  numericPackage: number;

  // Campus fields can be null for off-campus jobs
  cgpaCutoff: number | null;
  maxBacklogs: number | null;
  allowedBranches: string[] | null;
  eligibleBatch?: string | null;
  deadline: string | null;
  skillsRequired: string[] | null;

  status: 'OPEN' | 'CLOSED';

  registeredCount: number;

  // Recruitment classification
  recruitmentType: 'CAMPUS' | 'OFF_CAMPUS';

  sourceType?: 'RECRUITER' | 'TPO' | 'DATASET' | 'SCRAPER';

  // Off-campus fields
  applyUrl?: string | null;
  source?: string | null;
  postedAt?: string | null;
  jobType?: string | null;
  roleCategory?: string | null;
  department?: string | null;
  scrapedDate?: string | null;
}
export type RecruiterStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface RecruiterResponse {
  id: number;
  name: string;
  email: string;
  companyName: string;
  designation?: string;
  industry?: string;
  recruiterStatus: RecruiterStatus;
}
export interface RecruiterRequest {
  name: string;
  email: string;
  password: string;
  companyName: string;
  designation?: string;
  industry?: string;
}
export type Role = "TPO" | "RECRUITER" | "STUDENT" | "ALUMNI";

export interface LoginRequest {
  email: string;
  password: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: Role;
}

export interface RefreshRequest {
  refreshToken: string;
  role?: Role;
}

export interface StudentDashboardResponse {
  applicationsSubmitted: number;
  CGPA: number;
  activeBacklogs: number;
}

export interface DepartmentStat {
  department: string;
  totalStudents: number;
  placed: number;
  placementPercentage: number;
}

export interface SalaryRange {
  range: string;
  count: number;
}
export interface TPODashboardResponse {
  totalStudents: number;
  totalPlaced: number;
  placementPercentage: number;
  activeDrives: number;
  averageCTC: number;
  departmentStats: DepartmentStat[];
  salaryDistribution: SalaryRange[];
}
export interface StudentWithPlacement {
  id: string;
  name: string;
  email: string;
  registrationNumber?: string;
  department: string;
  cgpa: number;
  backlogs: number;
  placementStatus: "Placed" | "Unplaced";
  placedCompany?: string;
  placedPackage?: string;
  resumeScore: number;
  projectsCount: number;
  resumeText: string;
}

export interface ApplicationResponse {
  id: number;
  status: string;
  appliedDate: string;
  studentId: string;
  studentName: string;
  jobPostingId: number;
  jobTitle: string;
  companyName: string;
  currentRoundIndex?: number;
}

export interface PlacementEventResponse {
  id: number;
  title: string;
  eventType: string;
  companyId: number;
  companyName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  status: string;
}

export interface InterviewRoundResponse {
  id: number;
  roundNumber: number;
  roundType: string;
  status: string;
  feedback: string | null;
  scheduledAt: string;
  applicationId: number;
}

export interface CalendarEvent {
  id: number | string;
  title: string;
  eventType: string;
  companyId?: number;
  companyName?: string;
  company?: string;
  role?: string;
  scheduledDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  venue?: string;
  description?: string;
  status?: string;
  branches?: string[];
  isPrivate?: boolean;
  recruitmentType?: string;
  sourceType?: string;
}

export interface StudentRoundVisualizerResponse {
  studentId: string;
  jobPostingId: number;
  applicationId: number;
  interviewRoundId?: number;
  feedback?: string;
  scheduledAt?: string;
  status: string;
  roundNumber?: number;
  roundType?: string;
  appliedDate?: string;
}

export interface TPOUserRequest {
  name: string;
  email: string;
  password?: string;
}

export interface TPOUserResponse {
  id: number;
  name: string;
  email: string;
}

export interface AlumniRequest {
  id?: number;
  email?: string;
  password?: string;
  name?: string;
  bio?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  hashNodeUrl?: string;
  devToUrl?: string;
}

export interface AlumniResponse {
  id: number;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  hashNodeUrl?: string;
  devToUrl?: string;
}

export interface AlumniBlogRequest {
  id?: number;
  title?: string;
  description?: string;
  alumniId: number;
}

export interface AlumniBlogResponse {
  id: number;
  title: string;
  description: string;
  updatedAt?: string;
  createdAt?: string;
  alumniId: number;
}

export type NotificationsType =
  | 'JOB_POSTED'
  | 'APPLICATION_STATUS'
  | 'INTERVIEW_SCHEDULED'
  | 'GENERAL';

export interface NotificationResponse {
  id: number;
  type: NotificationsType;
  title: string;
  body: string;
  studentId?: number | string | null;
  createdAt?: string | null;
  read: boolean;
}