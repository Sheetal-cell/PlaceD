import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Briefcase,
  ChevronDown,
  Edit3,
  FileText,
  Plus,
  Trash2,
  Users,
  X,
  Sparkles,
  Globe,
  CheckCircle2,
  Save,
  Loader2,
  UserCheck,
  GitBranch,
  Menu
} from 'lucide-react';

import type {
  Alumni,
  Blog,
  BlogCategory,
  Referral,
  AlumniProfileRequest
} from '../api/alumniApi';

import { AlumniSidebar, type AlumniTabType } from './alumni/AlumniSidebar';
import { AlumniMobileDrawer } from './alumni/AlumniMobileDrawer';
import { AlumniDirectoryView } from './alumni/AlumniDirectoryView';
import { Footer } from './Footer';
import './AlumniPortal.css';
import './student/StudentPortal.css';

interface AlumniPortalProps {
  alumni: Alumni;
  allAlumni?: Alumni[];
  blogs: Blog[];
  referrals: Referral[];

  onLogout: () => void;

  onUpdateProfile?: (
    id: string | number,
    data: AlumniProfileRequest
  ) => Promise<void>;

  onCreateBlog: (
    blogData: Omit<Blog, 'id' | 'alumniId' | 'postedDate'>
  ) => Promise<void>;

  onUpdateBlog: (
    id: string,
    data: {
      title: string;
      content: string;
      category: BlogCategory;
      published: boolean;
    }
  ) => Promise<void>;

  onDeleteBlog: (id: string) => Promise<void>;

  onCreateReferral: (
    referralData: Omit<Referral, 'id' | 'alumniId' | 'postedDate'>
  ) => Promise<void>;

  onUpdateReferral: (
    id: string,
    data: Partial<Referral>
  ) => Promise<void>;

  onDeleteReferral: (id: string) => Promise<void>;
}

const categories: BlogCategory[] = [
  'Interview Experience',
  'Career Advice',
  'Referral Tips',
  'General'
];

export const AlumniPortal: React.FC<AlumniPortalProps> = ({
  alumni,
  allAlumni = [],
  blogs,
  referrals,
  onLogout,
  onUpdateProfile,
  onCreateBlog,
  onUpdateBlog,
  onDeleteBlog,
  onCreateReferral,
  onUpdateReferral,
  onDeleteReferral
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string): AlumniTabType => {
    if (path.includes('/alumni/blogs')) return 'blogs';
    if (path.includes('/alumni/my-blogs')) return 'myBlogs';
    if (path.includes('/alumni/referrals') || path.includes('/alumni/referral')) return 'referral';
    if (path.includes('/alumni/directory')) return 'directory';
    if (path.includes('/alumni/settings') || path.includes('/alumni/profile')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getTabFromPath(location.pathname);

  const setActiveTab = (tab: AlumniTabType) => {
    const routeMap: Record<AlumniTabType, string> = {
      dashboard: '/alumni/dashboard',
      blogs: '/alumni/blogs',
      myBlogs: '/alumni/my-blogs',
      referral: '/alumni/referrals',
      directory: '/alumni/directory',
      settings: '/alumni/settings'
    };
    navigate(routeMap[tab]);
  };

  useEffect(() => {
    if (location.pathname === '/alumni' || location.pathname === '/alumni/') {
      navigate('/alumni/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* Modal state */
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [readingBlog, setReadingBlog] = useState<Blog | null>(null);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);

  /* Profile Edit Form State */
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileForm, setProfileForm] = useState<AlumniProfileRequest>({
    name: alumni.name || '',
    email: alumni.email || '',
    bio: alumni.bio || '',
    location: alumni.location || '',
    linkedinUrl: alumni.linkedinUrl || alumni.linkedIn || '',
    githubUrl: alumni.githubUrl || '',
    hashNodeUrl: alumni.hashNodeUrl || '',
    devToUrl: alumni.devToUrl || '',
    graduationYear: alumni.graduationYear || 2024,
    currentCompany: alumni.currentCompany || '',
    currentRole: alumni.currentRole || '',
    department: alumni.department || 'Computer Science'
  });

  useEffect(() => {
    setProfileForm({
      name: alumni.name || '',
      email: alumni.email || '',
      bio: alumni.bio || '',
      location: alumni.location || '',
      linkedinUrl: alumni.linkedinUrl || alumni.linkedIn || '',
      githubUrl: alumni.githubUrl || '',
      hashNodeUrl: alumni.hashNodeUrl || '',
      devToUrl: alumni.devToUrl || '',
      graduationYear: alumni.graduationYear || 2024,
      currentCompany: alumni.currentCompany || '',
      currentRole: alumni.currentRole || '',
      department: alumni.department || 'Computer Science'
    });
  }, [alumni]);

  /* Blog Form State */
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    category: 'Career Advice' as BlogCategory,
    published: true
  });

  /* Referral Form State */
  const [referralForm, setReferralForm] = useState({
    companyName: '',
    role: '',
    description: '',
    active: true
  });

  /* Derived lists */
  const myBlogs = useMemo(
    () => blogs.filter((blog) => String(blog.alumniId) === String(alumni.id)),
    [blogs, alumni.id]
  );

  const myReferrals = useMemo(
    () => referrals.filter((r) => String(r.alumniId) === String(alumni.id)),
    [referrals, alumni.id]
  );

  const publishedBlogs = useMemo(
    () => blogs.filter((b) => b.published),
    [blogs]
  );

  const resetBlogForm = () => {
    setBlogForm({
      title: '',
      content: '',
      category: 'Career Advice',
      published: true
    });
    setEditingBlog(null);
  };

  const resetReferralForm = () => {
    setReferralForm({
      companyName: '',
      role: '',
      description: '',
      active: true
    });
    setEditingReferral(null);
    setShowReferralForm(false);
  };

  const handleBlogSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.content.trim()) return;

    const blogData = {
      ...blogForm,
      published: publish
    };

    if (editingBlog) {
      await onUpdateBlog(editingBlog.id, blogData);
    } else {
      await onCreateBlog(blogData);
    }

    resetBlogForm();
    setActiveTab('myBlogs');
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralForm.companyName.trim() || !referralForm.role.trim()) return;

    if (editingReferral) {
      await onUpdateReferral(editingReferral.id, referralForm);
    } else {
      await onCreateReferral(referralForm);
    }

    resetReferralForm();
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfile) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg('');

    try {
      const payload: AlumniProfileRequest = {
        ...profileForm,
        email: profileForm.email || alumni.email
      };
      await onUpdateProfile(alumni.id, payload);
      setProfileSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const startEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      published: blog.published
    });
    setActiveTab('blogs');
  };

  const startEditReferral = (referral: Referral) => {
    setEditingReferral(referral);
    setReferralForm({
      companyName: referral.companyName,
      role: referral.role,
      description: referral.description,
      active: referral.active
    });
    setShowReferralForm(true);
  };

  const ALUMNI_TAB_LABELS: Record<AlumniTabType, string> = {
    dashboard: 'Dashboard',
    blogs: 'Write Blog',
    myBlogs: 'My Blogs',
    referral: 'Offer Referral',
    directory: 'Alumni Directory',
    settings: 'Profile Settings'
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-primary">
      {/* Desktop Collapsible Sidebar */}
      <AlumniSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
        alumni={alumni}
      />

      {/* Mobile Navigation Drawer */}
      <AlumniMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alumni={alumni}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Top Bar */}
        <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 h-16 flex items-center justify-between gap-4 shadow-2xs shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/90 text-blue-900 font-extrabold text-sm border border-blue-200/80 transition-all cursor-pointer flex items-center gap-2.5 shadow-2xs active:scale-95 shrink-0 min-h-[44px]"
            aria-label="Open Alumni Navigation Drawer"
          >
            <Menu size={22} className="text-blue-600 shrink-0" />
            <span className="font-display">Menu</span>
          </button>

          <div className="flex items-center gap-2 min-w-0 text-right">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-display truncate">
              {ALUMNI_TAB_LABELS[activeTab] || activeTab}
            </span>
          </div>
        </div>

        {/* Content Container */}
        <main className="sp-workspace">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6 animate-fade-in pb-10">
              {/* Welcoming Hero Banner */}
              <div className="glass-card p-6 sm:p-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="sp-badge sp-badge-success font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Verified Alumni Network
                    </span>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <Award size={14} className="text-blue-600" />
                    <span>{alumni.currentCompany || 'Placement Alumni'} — {alumni.currentRole || 'Senior Engineer'}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight mt-1">
                  Welcome back, {alumni.name ? alumni.name.split(' ')[0] : 'Alumni'}! 👋
                </h1>

                <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
                  Share your career insights, publish technical & interview blogs, post candidate referral openings, and mentor current campus students.
                </p>
              </div>

              {/* KPI Metric Grid */}
              <div className="sp-kpi-grid">
                <div className="sp-kpi-card" style={{ '--kpi-accent': '#2563EB' } as React.CSSProperties}>
                  <div className="sp-kpi-header">
                    <span className="sp-kpi-label">Published Blogs</span>
                    <div className="sp-kpi-icon bg-blue-50 text-blue-600">
                      <BookOpen size={22} />
                    </div>
                  </div>
                  <div className="sp-kpi-value">{myBlogs.length}</div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Articles & Interview Guides</p>
                </div>

                <div className="sp-kpi-card" style={{ '--kpi-accent': '#4F46E5' } as React.CSSProperties}>
                  <div className="sp-kpi-header">
                    <span className="sp-kpi-label">Referrals Offered</span>
                    <div className="sp-kpi-icon bg-indigo-50 text-indigo-600">
                      <Briefcase size={22} />
                    </div>
                  </div>
                  <div className="sp-kpi-value">{myReferrals.length}</div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Active Job Opening Posts</p>
                </div>

                <div className="sp-kpi-card" style={{ '--kpi-accent': '#10B981' } as React.CSSProperties}>
                  <div className="sp-kpi-header">
                    <span className="sp-kpi-label">Network Alumni</span>
                    <div className="sp-kpi-icon bg-emerald-50 text-emerald-600">
                      <Users size={22} />
                    </div>
                  </div>
                  <div className="sp-kpi-value">{allAlumni.length || publishedBlogs.length || 1}</div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Verified Members</p>
                </div>

                <div className="sp-kpi-card" style={{ '--kpi-accent': '#F59E0B' } as React.CSSProperties}>
                  <div className="sp-kpi-header">
                    <span className="sp-kpi-label">Account Status</span>
                    <div className="sp-kpi-icon bg-amber-50 text-amber-600">
                      <UserCheck size={22} />
                    </div>
                  </div>
                  <div className="sp-kpi-value text-lg font-bold text-emerald-700">TPO Verified</div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Alumni Portal Access</p>
                </div>
              </div>

              {/* Main 3-Column Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Recent Activity Feed */}
                <div className="lg:col-span-2 glass-card p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 font-display text-base flex items-center gap-2">
                      <BookOpen size={20} className="text-blue-600" />
                      Recent Published Contributions
                    </h3>
                    <button
                      onClick={() => setActiveTab('myBlogs')}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View All Posts
                    </button>
                  </div>

                  {myBlogs.length === 0 && myReferrals.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <BookOpen size={44} className="mx-auto opacity-30 mb-2" />
                      <p className="text-sm font-bold text-slate-700 font-display">No articles or referrals posted yet.</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Publish your first blog or referral opportunity below.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-slate-100">
                      {[
                        ...myBlogs.map((b) => ({
                          id: b.id,
                          title: b.title,
                          type: 'Blog Article',
                          date: b.postedDate
                        })),
                        ...myReferrals.map((r) => ({
                          id: r.id,
                          title: `${r.companyName} — ${r.role}`,
                          type: 'Referral Posting',
                          date: r.postedDate
                        }))
                      ]
                        .slice(0, 5)
                        .map((act) => (
                          <div
                            key={act.id}
                            className="py-3.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold">
                                {act.type === 'Blog Article' ? <FileText size={16} /> : <Briefcase size={16} />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-900 truncate">{act.title}</span>
                                <span className="text-[11px] text-slate-500 font-medium">{act.type} · {act.date}</span>
                              </div>
                            </div>
                            <span className="sp-badge sp-badge-success text-[10px] shrink-0">
                              Active
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Right 1 Col: Creator Quick Actions */}
                <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-5">
                  <h3 className="font-bold text-slate-900 font-display text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-600" />
                    Quick Actions
                  </h3>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setActiveTab('blogs')}
                      className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 hover:border-blue-300 transition-all flex items-center justify-between text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                          <FileText size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">Write Career Experience Blog</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Guide students through rounds & prep</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('referral')}
                      className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 hover:border-indigo-300 transition-all flex items-center justify-between text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">Post Referral Opportunity</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Share job roles from your company</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
                          <Edit3 size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">Update Profile & Links</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Keep company, role, & GitHub updated</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WRITE BLOG TAB */}
          {activeTab === 'blogs' && (
            <div className="flex flex-col gap-6 animate-fade-in pb-10">
              <div className="sp-page-header">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-3">
                    <FileText size={28} className="text-blue-600 shrink-0" />
                    {editingBlog ? 'Edit Blog Article' : 'Compose & Publish Alumni Experience Blog'}
                  </h1>
                  <p className="sp-page-subtitle">
                    Share your interview experience, technical prep advice, or career journey to guide campus students.
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => handleBlogSubmit(e, blogForm.published)} className="sp-card flex flex-col gap-6 p-6 sm:p-7">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display border-b border-slate-100 pb-3">
                  Article Details & Content
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Article Title *</label>
                    <input
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      placeholder="e.g. My Google Software Engineer Interview Experience & Prep Strategy"
                      required
                      className="input-field"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Category *</label>
                    <div className="relative">
                      <select
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value as BlogCategory })}
                        className="input-field appearance-none cursor-pointer pr-10"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Article Body & Interview Insights *</label>
                  <textarea
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    placeholder="Write detailed interview rounds, coding questions asked, prep tips, and recommendations for campus students..."
                    rows={12}
                    required
                    className="input-field font-sans leading-relaxed resize-y"
                  />
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    checked={blogForm.published}
                    onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">Publish this blog immediately to the student community</span>
                </label>

                <div className="flex items-center gap-3 justify-end pt-2">
                  {editingBlog && (
                    <button
                      type="button"
                      onClick={resetBlogForm}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText size={18} />
                    {editingBlog ? 'Update Article' : 'Publish Article'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MY BLOGS TAB */}
          {activeTab === 'myBlogs' && (
            <div className="flex flex-col gap-6 animate-fade-in pb-10">
              <div className="sp-page-header">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-3">
                    <BookOpen size={28} className="text-blue-600 shrink-0" />
                    My Published Articles
                  </h1>
                  <p className="sp-page-subtitle">
                    Manage and review all articles you have contributed to the placement portal.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetBlogForm();
                    setActiveTab('blogs');
                  }}
                  className="btn btn-primary h-11 px-5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  Write New Blog
                </button>
              </div>

              {myBlogs.length === 0 ? (
                <div className="sp-card text-center py-16 p-6 text-slate-400">
                  <FileText size={44} className="mx-auto mb-2 text-slate-300" />
                  <h4 className="font-extrabold text-slate-800 text-base font-display">No blogs written yet</h4>
                  <p className="text-xs text-slate-500 mt-1">Start sharing your experiences to guide current students.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {myBlogs.map((blog) => (
                    <div key={blog.id} className="sp-card p-6 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="sp-badge sp-badge-info font-bold text-[10px] uppercase">
                            {blog.category}
                          </span>
                          <span className={`sp-badge ${blog.published ? 'sp-badge-success' : 'bg-slate-100 text-slate-700'} font-bold text-[10px]`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base font-display">{blog.title}</h4>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{blog.content}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                        <span className="text-[11px] text-slate-400 font-medium">Posted {blog.postedDate}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReadingBlog(blog)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                          >
                            Read
                          </button>
                          <button
                            onClick={() => startEditBlog(blog)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this blog post?')) onDeleteBlog(blog.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REFERRAL TAB */}
          {activeTab === 'referral' && (
            <div className="flex flex-col gap-6 animate-fade-in pb-10">
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-rose-50 border-2 border-rose-300 text-center gap-3 my-2 shadow-xs">
                <h2 className="text-2xl sm:text-4xl font-black text-rose-600 font-display tracking-tight uppercase">
                  referral is not available now , the feature is coming soon
                </h2>
              </div>

              <div className="sp-page-header">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-3">
                    <Briefcase size={28} className="text-blue-600 shrink-0" />
                    Referral Opportunities
                  </h1>
                  <p className="sp-page-subtitle">
                    Post active candidate referral openings from your organization for students.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetReferralForm();
                    setShowReferralForm(true);
                  }}
                  className="btn btn-primary h-11 px-5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  Add Referral Post
                </button>
              </div>

              {showReferralForm && (
                <form onSubmit={handleReferralSubmit} className="sp-card p-6 sm:p-7 flex flex-col gap-5 border-blue-200 bg-blue-50/40">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display border-b border-slate-200/80 pb-3">
                    {editingReferral ? 'Edit Referral Details' : 'Post New Referral Opening'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Company Name *</label>
                      <input
                        required
                        value={referralForm.companyName}
                        onChange={(e) => setReferralForm({ ...referralForm, companyName: e.target.value })}
                        placeholder="e.g. Microsoft / Google / Amazon"
                        className="input-field"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Job Role / Position *</label>
                      <input
                        required
                        value={referralForm.role}
                        onChange={(e) => setReferralForm({ ...referralForm, role: e.target.value })}
                        placeholder="e.g. Software Engineer / SDE-1"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Job Description & Application Instructions</label>
                    <textarea
                      rows={5}
                      value={referralForm.description}
                      onChange={(e) => setReferralForm({ ...referralForm, description: e.target.value })}
                      placeholder="Requirements, job ID, eligibility, or email instructions for student candidate resumes..."
                      className="input-field font-sans resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={referralForm.active}
                        onChange={(e) => setReferralForm({ ...referralForm, active: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-800">Active Referral Opening</span>
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={resetReferralForm}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary h-11 px-6 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Briefcase size={16} />
                        {editingReferral ? 'Update Referral' : 'Post Referral'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Referral List */}
              <div className="flex flex-col gap-4">
                {myReferrals.length === 0 && !showReferralForm ? (
                  <div className="sp-card text-center py-16 p-6 text-slate-400">
                    <Briefcase size={44} className="mx-auto mb-2 text-slate-300" />
                    <h4 className="font-extrabold text-slate-800 text-base font-display">No active referral posts</h4>
                    <p className="text-xs text-slate-500 mt-1">Post referral opportunities to assist campus students in getting hired.</p>
                  </div>
                ) : (
                  myReferrals.map((ref) => (
                    <div key={ref.id} className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0 border border-amber-200">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-extrabold text-slate-900 text-base">{ref.companyName}</h4>
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-extrabold">{ref.role}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{ref.description}</p>
                          <span className="text-[10px] text-slate-400 font-medium mt-2 block">Posted {ref.postedDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 justify-end">
                        <button onClick={() => startEditReferral(ref)} className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold flex items-center gap-1">
                          <Edit3 size={14} /> Edit
                        </button>
                        <button onClick={() => { if (window.confirm('Delete referral?')) onDeleteReferral(ref.id); }} className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-extrabold flex items-center gap-1">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* DIRECTORY TAB */}
          {activeTab === 'directory' && (
            <AlumniDirectoryView alumniList={allAlumni.length > 0 ? allAlumni : [alumni]} currentAlumni={alumni} />
          )}

          {/* SETTINGS / PROFILE TAB */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Page Header */}
              <div className="sp-page-header">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-3">
                    <UserCheck size={28} className="text-blue-600 shrink-0" />
                    Alumni Member Placement Profile
                  </h1>
                  <p className="sp-page-subtitle">
                    Update your personal credentials, current organization, job role, location, bio, and developer portfolio links.
                  </p>
                </div>
                <span className="sp-badge sp-badge-success flex items-center gap-1 shrink-0">
                  <CheckCircle2 size={13} /> Verified Alumni
                </span>
              </div>

              {profileSuccessMsg && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-extrabold flex items-center gap-3 animate-fade-in shadow-2xs">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
                {/* Section 1: Personal Credentials */}
                <div className="sp-card flex flex-col gap-5 p-6 sm:p-7">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display border-b border-slate-100 pb-3">
                    1. Personal Credentials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="e.g. Raj Alumni"
                        className="input-field"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Email Address (Account Identifier)</label>
                      <input
                        type="email"
                        disabled
                        value={alumni.email}
                        className="input-field bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Career & Organization Details */}
                <div className="sp-card flex flex-col gap-5 p-6 sm:p-7">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display border-b border-slate-100 pb-3">
                    2. Career & Organization Credentials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Current Organization / Company</label>
                      <input
                        type="text"
                        value={profileForm.currentCompany || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, currentCompany: e.target.value })}
                        placeholder="e.g. Google / Microsoft / Amazon"
                        className="input-field"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Job Role / Designation</label>
                      <input
                        type="text"
                        value={profileForm.currentRole || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, currentRole: e.target.value })}
                        placeholder="e.g. Senior Software Engineer"
                        className="input-field"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Location / City</label>
                      <input
                        type="text"
                        value={profileForm.location || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        placeholder="e.g. Bengaluru, KA / Remote"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Graduation Year</label>
                      <input
                        type="number"
                        value={profileForm.graduationYear || 2024}
                        onChange={(e) => setProfileForm({ ...profileForm, graduationYear: parseInt(e.target.value, 10) || 2024 })}
                        className="input-field"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Department / Stream</label>
                      <select
                        value={profileForm.department || 'Computer Science'}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                        className="input-field"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Electrical">Electrical</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Alumni Bio & Mentoring Overview */}
                <div className="sp-card flex flex-col gap-5 p-6 sm:p-7">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display border-b border-slate-100 pb-3">
                    3. Alumni Bio & Mentoring Overview
                  </h3>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">
                      Experience Summary & Career Guidance Notes
                    </label>
                    <textarea
                      rows={5}
                      value={profileForm.bio || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Share your work experience highlights, tech stack expertise, interview tips, and mentoring focus..."
                      className="input-field font-sans leading-relaxed text-slate-800 resize-none min-h-[120px]"
                    />
                  </div>
                </div>

                {/* Section 4: Developer Portfolios & Social Links */}
                <div className="sp-card flex flex-col gap-5 p-6 sm:p-7">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display border-b border-slate-100 pb-3">
                    4. Developer Portfolios & Professional Links
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Globe size={15} className="text-blue-600" /> LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={profileForm.linkedinUrl || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="input-field"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <GitBranch size={15} className="text-slate-800" /> GitHub Profile URL
                      </label>
                      <input
                        type="url"
                        value={profileForm.githubUrl || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                        placeholder="https://github.com/username"
                        className="input-field"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Globe size={15} className="text-indigo-600" /> Hashnode Blog URL
                      </label>
                      <input
                        type="url"
                        value={profileForm.hashNodeUrl || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, hashNodeUrl: e.target.value })}
                        placeholder="https://hashnode.com/@username"
                        className="input-field"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Globe size={15} className="text-slate-700" /> Dev.to Blog URL
                      </label>
                      <input
                        type="url"
                        value={profileForm.devToUrl || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, devToUrl: e.target.value })}
                        placeholder="https://dev.to/username"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="btn btn-primary h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Saving Profile Details...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Profile & Career Credentials
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* Reader Modal for Blogs */}
      {readingBlog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 flex flex-col gap-5 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setReadingBlog(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-900 font-extrabold text-xs uppercase w-fit">
              {readingBlog.category}
            </span>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display leading-tight pr-8">
              {readingBlog.title}
            </h2>

            <div className="text-xs text-slate-400 font-medium">
              Posted on {readingBlog.postedDate}
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {readingBlog.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};