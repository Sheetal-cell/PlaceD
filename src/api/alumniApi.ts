import request from "./client";

export type BlogCategory =
  | 'Interview Experience'
  | 'Career Advice'
  | 'Referral Tips'
  | 'General';

export interface Alumni {
  id: string;
  userId?: number;
  studentRegnNo?: string;
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

export const alumniApi = {
  async getAll(): Promise<Alumni[]> {
    const res = await request<any[]>('/alumni/all');
    if (!Array.isArray(res)) return [];

    return Promise.all(res.map(async (a: any) => {
      const user = a.userId ? await request<any>(`/user/${a.userId}`).catch(() => null) : null;
      const nameData = user?.nameResponseDTO;
      const name = nameData
        ? [nameData.firstName, nameData.middleName, nameData.lastName].filter(Boolean).join(' ')
        : '';
      return {
        id: String(a.id),
        userId: a.userId,
        studentRegnNo: a.studentRegnNo,
        name,
        email: user?.email || '',
        bio: a.bio || '',
        location: a.location || '',
        linkedinUrl: a.linkedinUrl || '',
        githubUrl: a.githubUrl || '',
        hashNodeUrl: a.hashNodeUrl || '',
        devToUrl: a.devToUrl || '',
        linkedIn: a.linkedinUrl || '',
      };
    }));
  },

  async getById(id: string | number): Promise<Alumni> {
    const a = await request<any>(`/alumni/${id}`);
    const user = a.userId ? await request<any>(`/user/${a.userId}`).catch(() => null) : null;
    const nameData = user?.nameResponseDTO;
    const name = nameData
      ? [nameData.firstName, nameData.middleName, nameData.lastName].filter(Boolean).join(' ')
      : '';
    return {
      id: String(a.id),
      userId: a.userId,
      studentRegnNo: a.studentRegnNo,
      name,
      email: user?.email || '',
      bio: a.bio || '',
      location: a.location || '',
      linkedinUrl: a.linkedinUrl || '',
      githubUrl: a.githubUrl || '',
      hashNodeUrl: a.hashNodeUrl || '',
      devToUrl: a.devToUrl || '',
      linkedIn: a.linkedinUrl || '',
    };
  },

  saveAll(_alumni: Alumni[]) {
    // No-op: Data is maintained in PostgreSQL database
  },

  async register(_requestData: AlumniRegistrationRequest): Promise<any> {
    throw new Error('Alumni registration requires a base user account and an existing student registration number. Use the two-step registration flow in Auth.');
  },

  async addDetails(requestData: {
    userId: number;
    studentRegnNo: string;
    bio?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    hashNodeUrl?: string;
    devToUrl?: string;
  }): Promise<string> {
    return request<string>('/alumni/add', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  async add(_requestData: AlumniRegistrationRequest): Promise<any> {
    throw new Error('The backend AlumniRequestDTO requires userId and studentRegnNo. Use addDetails after creating the base user.');
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
    const existing = await this.getById(id);
    if (!existing.userId || !existing.studentRegnNo) {
      throw new Error('This alumni profile is missing its linked user or student record.');
    }
    const bio = requestData.bio ??
      [requestData.currentRole, requestData.currentCompany,
       requestData.graduationYear ? `Graduation year: ${requestData.graduationYear}` : '',
       requestData.department ? `Department: ${requestData.department}` : '']
        .filter(Boolean).join(' | ');
    return request<string>(`/alumni/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId: existing.userId,
        studentRegnNo: existing.studentRegnNo,
        bio,
        location: requestData.location ?? existing.location ?? '',
        linkedinUrl: requestData.linkedinUrl ?? requestData.linkedIn ?? existing.linkedinUrl ?? '',
        githubUrl: requestData.githubUrl ?? existing.githubUrl ?? '',
        hashNodeUrl: requestData.hashNodeUrl ?? existing.hashNodeUrl ?? '',
        devToUrl: requestData.devToUrl ?? existing.devToUrl ?? '',
      }),
    });
  },

  async update(id: string | number, requestData: Partial<Alumni>): Promise<any> {
    const existing = await this.getById(id);
    if (!existing.userId || !existing.studentRegnNo) {
      throw new Error('This alumni profile is missing its linked user or student record.');
    }
    return request<string>(`/alumni/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId: existing.userId,
        studentRegnNo: existing.studentRegnNo,
        bio: requestData.bio ?? existing.bio ?? '',
        location: requestData.location ?? existing.location ?? '',
        linkedinUrl: requestData.linkedinUrl ?? requestData.linkedIn ?? existing.linkedinUrl ?? '',
        githubUrl: requestData.githubUrl ?? existing.githubUrl ?? '',
        hashNodeUrl: requestData.hashNodeUrl ?? existing.hashNodeUrl ?? '',
        devToUrl: requestData.devToUrl ?? existing.devToUrl ?? '',
      }),
    });
  },

  async delete(id: string | number): Promise<void> {
    await request<string>(`/alumni/delete/${id}`, {
      method: 'DELETE',
    });
  },
};
