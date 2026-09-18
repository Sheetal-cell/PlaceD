import request from "./client";

export type AlumniStatus = 'PENDING' | 'APPROVED';

export type BlogCategory =
  | 'Interview Experience'
  | 'Career Advice'
  | 'Referral Tips'
  | 'General';

export interface Alumni {
  id: string;
  name: string;
  email: string;
  password?: string;
  bio?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  hashNodeUrl?: string;
  devToUrl?: string;

  graduationYear?: number;
  currentCompany?: string;
  currentRole?: string;
  department?: string;
  linkedIn?: string;

  alumniStatus?: AlumniStatus;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  description?: string;
  category: BlogCategory;
  postedDate: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  alumniId: string;
  published: boolean;
}

export interface Referral {
  id: string;
  alumniId: string;
  companyName: string;
  role: string;
  description: string;
  postedDate: string;
  active: boolean;
}

/*
 * Request contracts.
 */

export interface AlumniRegistrationRequest {
  name: string;
  email: string;
  password?: string;
  bio?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  hashNodeUrl?: string;
  devToUrl?: string;

  graduationYear?: number;
  currentCompany?: string;
  currentRole?: string;
  department?: string;
  linkedIn?: string;
}

export interface AlumniLoginRequest {
  email: string;
  password?: string;
}

export interface AlumniProfileRequest {
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  hashNodeUrl?: string;
  devToUrl?: string;

  graduationYear?: number;
  currentCompany?: string;
  currentRole?: string;
  department?: string;
  linkedIn?: string;
}

export interface BlogRequest {
  title: string;
  content?: string;
  description?: string;
  category?: BlogCategory;
  published?: boolean;
  alumniId?: number | string;
}

export interface ReferralRequest {
  companyName: string;
  role: string;
  description: string;
  active: boolean;
}

const APPROVED_ALUMNI_STORAGE_KEY = 'approved_alumni_emails';
const PENDING_ALUMNI_STORAGE_KEY = 'pending_alumni_emails';

export function getCurrentUserEmail(): string {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload && payload.sub) {
          return payload.sub;
        }
      }
    }
  } catch {}
  return '';
}

export function getApprovedAlumniEmails(): Set<string> {
  try {
    const raw = localStorage.getItem(APPROVED_ALUMNI_STORAGE_KEY);
    if (!raw) {
      return new Set([
        'rahul.verma@alumni.univ.edu',
        'priya.sharma@alumni.univ.edu',
        'alumni@example.com'
      ]);
    }
    return new Set(JSON.parse(raw).map((e: string) => e.toLowerCase().trim()));
  } catch {
    return new Set([
      'rahul.verma@alumni.univ.edu',
      'priya.sharma@alumni.univ.edu',
      'alumni@example.com'
    ]);
  }
}

export function saveApprovedAlumniEmails(emails: Set<string>): void {
  localStorage.setItem(APPROVED_ALUMNI_STORAGE_KEY, JSON.stringify(Array.from(emails)));
}

export function getPendingAlumniEmails(): Set<string> {
  try {
    const raw = localStorage.getItem(PENDING_ALUMNI_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw).map((e: string) => e.toLowerCase().trim()));
  } catch {
    return new Set();
  }
}

export function savePendingAlumniEmails(emails: Set<string>): void {
  localStorage.setItem(PENDING_ALUMNI_STORAGE_KEY, JSON.stringify(Array.from(emails)));
}

export function markAlumniApproved(email: string): void {
  if (!email) return;
  const normalized = email.toLowerCase().trim();
  const approved = getApprovedAlumniEmails();
  approved.add(normalized);
  saveApprovedAlumniEmails(approved);

  const pending = getPendingAlumniEmails();
  pending.delete(normalized);
  savePendingAlumniEmails(pending);
}

export function markAlumniPending(email: string): void {
  if (!email) return;
  const normalized = email.toLowerCase().trim();
  const pending = getPendingAlumniEmails();
  pending.add(normalized);
  savePendingAlumniEmails(pending);
}

export const alumniApi = {
  async getAll(): Promise<Alumni[]> {
    const res = await request<any[]>('/alumni/all');
    if (!Array.isArray(res)) return [];
    const approvedEmails = getApprovedAlumniEmails();

    return res.map((a: any) => {
      const email = (a.email || '').toLowerCase().trim();
      const status: AlumniStatus = approvedEmails.has(email) ? 'APPROVED' : 'PENDING';

      return {
        id: String(a.id),
        name: a.name || '',
        email: a.email || '',
        bio: a.bio || '',
        location: a.location || '',
        linkedinUrl: a.linkedinUrl || a.linkedIn || '',
        githubUrl: a.githubUrl || '',
        hashNodeUrl: a.hashNodeUrl || '',
        devToUrl: a.devToUrl || '',
        graduationYear: a.graduationYear || 2024,
        currentCompany: a.currentCompany || '',
        currentRole: a.currentRole || '',
        department: a.department || 'CSE',
        linkedIn: a.linkedinUrl || a.linkedIn || '',
        alumniStatus: status
      };
    });
  },

  async getById(id: string | number): Promise<Alumni> {
    const a = await request<any>(`/alumni/${id}`);
    const approvedEmails = getApprovedAlumniEmails();
    const email = (a.email || '').toLowerCase().trim();
    const status: AlumniStatus = approvedEmails.has(email) ? 'APPROVED' : 'PENDING';

    return {
      id: String(a.id),
      name: a.name || '',
      email: a.email || '',
      bio: a.bio || '',
      location: a.location || '',
      linkedinUrl: a.linkedinUrl || '',
      githubUrl: a.githubUrl || '',
      hashNodeUrl: a.hashNodeUrl || '',
      devToUrl: a.devToUrl || '',
      graduationYear: a.graduationYear || 2024,
      currentCompany: a.currentCompany || '',
      currentRole: a.currentRole || '',
      department: a.department || 'CSE',
      linkedIn: a.linkedinUrl || '',
      alumniStatus: status
    };
  },

  saveAll(_alumni: Alumni[]) {
    // No-op: Data is maintained in PostgreSQL database
  },

  async register(requestData: AlumniRegistrationRequest): Promise<any> {
    await this.add(requestData);
    if (requestData.email) {
      markAlumniPending(requestData.email);
    }
    return {
      id: String(Date.now()),
      name: requestData.name,
      email: requestData.email,
      department: requestData.department || 'Computer Science',
      graduationYear: requestData.graduationYear || new Date().getFullYear(),
      currentCompany: requestData.currentCompany || '',
      currentRole: requestData.currentRole || '',
      linkedIn: requestData.linkedIn || '',
      alumniStatus: 'PENDING'
    };
  },

  async add(requestData: AlumniRegistrationRequest): Promise<any> {
    const result = await request<string>('/alumni/add', {
      method: 'POST',
      body: JSON.stringify({
        name: requestData.name,
        email: requestData.email,
        password: requestData.password || 'password',
        bio: requestData.bio || requestData.currentRole || '',
        location: requestData.location || '',
        linkedinUrl: requestData.linkedinUrl || requestData.linkedIn || '',
        githubUrl: requestData.githubUrl || '',
        hashNodeUrl: requestData.hashNodeUrl || '',
        devToUrl: requestData.devToUrl || ''
      }),
    });
    if (requestData.email) {
      markAlumniPending(requestData.email);
    }
    return result;
  },

  async login(requestData: AlumniLoginRequest): Promise<any> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: requestData.email,
        password: requestData.password || '',
        role: 'ALUMNI'
      })
    });
  },

  async approve(id: string | number): Promise<void> {
    const existing = await this.getById(id).catch(() => null);
    if (existing && existing.email) {
      markAlumniApproved(existing.email);
    }
    try {
      await request<string>(`/alumni/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          id: Number(id),
          name: existing?.name || '',
          email: existing?.email || '',
          password: 'password',
          bio: existing?.bio || '',
          location: existing?.location || '',
          linkedinUrl: existing?.linkedinUrl || '',
          githubUrl: existing?.githubUrl || '',
          hashNodeUrl: existing?.hashNodeUrl || '',
          devToUrl: existing?.devToUrl || '',
        }),
      });
    } catch {
      await request<string>(`/alumni/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          id: Number(id),
          email: existing?.email || '',
          password: 'password',
          name: existing?.name || ''
        }),
      }).catch(() => {});
    }
  },

  async reject(id: string | number): Promise<void> {
    const existing = await this.getById(id).catch(() => null);
    if (existing && existing.email) {
      const email = existing.email.toLowerCase().trim();
      const pending = getPendingAlumniEmails();
      pending.delete(email);
      savePendingAlumniEmails(pending);

      const approved = getApprovedAlumniEmails();
      approved.delete(email);
      saveApprovedAlumniEmails(approved);
    }
    await request<string>(`/alumni/delete/${id}`, {
      method: 'DELETE',
    });
  },

  async getBlogs(): Promise<Blog[]> {
    const res = await request<any[]>('/blog/all');
    if (!Array.isArray(res)) return [];
    return res.map((b: any) => ({
      id: String(b.id),
      title: b.title || '',
      description: b.description || '',
      content: b.description || '',
      category: 'General',
      postedDate: b.createdAt || b.updatedAt || new Date().toISOString().split('T')[0],
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      alumniId: String(b.alumniId),
      published: true
    }));
  },

  saveBlogs(_blogs: Blog[]) {
    // No-op: Data is maintained in PostgreSQL database
  },

  async createBlog(alumniId: string | number, requestData: BlogRequest): Promise<Blog> {
    await request<string>('/blog/add', {
      method: 'POST',
      body: JSON.stringify({
        title: requestData.title,
        description: requestData.description || requestData.content || '',
        alumniId: Number(alumniId)
      }),
    });

    const now = new Date().toISOString().split('T')[0];
    return {
      id: String(Date.now()),
      title: requestData.title,
      description: requestData.description || requestData.content || '',
      content: requestData.content || requestData.description || '',
      category: requestData.category || 'General',
      postedDate: now,
      createdAt: now,
      updatedAt: now,
      alumniId: String(alumniId),
      published: requestData.published ?? true
    };
  },

  async updateBlog(id: string | number, requestData: BlogRequest): Promise<Blog> {
    await request<string>(`/blog/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: Number(id),
        title: requestData.title,
        description: requestData.description || requestData.content || '',
        alumniId: Number(requestData.alumniId || 1)
      }),
    });

    const now = new Date().toISOString().split('T')[0];
    return {
      id: String(id),
      title: requestData.title,
      description: requestData.description || requestData.content || '',
      content: requestData.content || requestData.description || '',
      category: requestData.category || 'General',
      postedDate: now,
      createdAt: now,
      updatedAt: now,
      alumniId: String(requestData.alumniId || 1),
      published: requestData.published ?? true
    };
  },

  async deleteBlog(id: string | number): Promise<void> {
    await request<string>(`/blog/delete/${id}`, {
      method: 'DELETE',
    });
  },

  async getReferrals(): Promise<Referral[]> {
    return [];
  },

  saveReferrals(_referrals: Referral[]) {
    // No-op: Referrals not supported by backend
  },

  async createReferral(_alumniId: string, _requestData: ReferralRequest): Promise<Referral> {
    throw new Error('Referrals module is currently unsupported by the backend API.');
  },

  async updateReferral(_id: string, _requestData: ReferralRequest): Promise<Referral> {
    throw new Error('Referrals module is currently unsupported by the backend API.');
  },

  async deleteReferral(_id: string): Promise<void> {
    // No-op
  },

  async getProfile(id: string | number): Promise<Alumni> {
    return this.getById(id);
  },

  async updateProfile(id: string | number, requestData: AlumniProfileRequest): Promise<any> {
    const existing = await this.getById(id).catch(() => null);
    const emailToUse = requestData.email || existing?.email || getCurrentUserEmail();

    return request<string>(`/alumni/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: Number(id),
        name: requestData.name || existing?.name || '',
        email: emailToUse,
        password: 'password',
        bio: requestData.bio || requestData.currentRole || existing?.bio || '',
        location: requestData.location || existing?.location || '',
        linkedinUrl: requestData.linkedinUrl || requestData.linkedIn || existing?.linkedinUrl || '',
        githubUrl: requestData.githubUrl || existing?.githubUrl || '',
        hashNodeUrl: requestData.hashNodeUrl || existing?.hashNodeUrl || '',
        devToUrl: requestData.devToUrl || existing?.devToUrl || ''
      }),
    });
  },

  async update(id: string | number, requestData: Partial<Alumni>): Promise<any> {
    const existing = await this.getById(id).catch(() => null);
    const emailToUse = requestData.email || existing?.email || getCurrentUserEmail();

    return request<string>(`/alumni/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: Number(id),
        name: requestData.name || existing?.name || '',
        email: emailToUse,
        password: 'password',
        bio: requestData.bio || requestData.currentRole || existing?.bio || '',
        location: requestData.location || existing?.location || '',
        linkedinUrl: requestData.linkedinUrl || requestData.linkedIn || existing?.linkedinUrl || '',
        githubUrl: requestData.githubUrl || existing?.githubUrl || '',
        hashNodeUrl: requestData.hashNodeUrl || existing?.hashNodeUrl || '',
        devToUrl: requestData.devToUrl || existing?.devToUrl || ''
      }),
    });
  },

  async delete(id: string | number): Promise<void> {
    await request<string>(`/alumni/delete/${id}`, {
      method: 'DELETE',
    });
  },
};
