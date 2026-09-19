

import React, { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Search,
  Users,
  XCircle,
  Sparkles,
  Award,
  ShieldCheck
} from 'lucide-react';

import type { Alumni } from '../../api/alumniApi';
import type { Recruiter } from '../../mockData';

interface AdminAlumniManagementViewProps {
  alumni: Alumni[];
  recruiters?: Recruiter[];
  onApproveRecruiter?: (id: string | number) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const AdminAlumniManagementView: React.FC<
  AdminAlumniManagementViewProps
> = ({
  alumni,
  recruiters = [],
  onApproveRecruiter,
  onApprove,
  onReject
}) => {
  const [search, setSearch] = useState('');

  const pendingRecruiters = useMemo(() => {
    return recruiters.filter((r) => r.recruiterStatus === 'PENDING');
  }, [recruiters]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return alumni;

    return alumni.filter((item) =>
      [
        item.name,
        item.email,
        item.currentCompany,
        item.currentRole,
        item.department
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [alumni, search]);

  const pending = filtered.filter(
    (item) => item.alumniStatus === 'PENDING'
  );

  const approved = filtered.filter(
    (item) => item.alumniStatus !== 'PENDING'
  );

  return (
    <div className="flex flex-col gap-7 animate-fade-in pb-10">

      {/* Welcoming Hero Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="sp-badge sp-badge-primary font-bold flex items-center gap-1.5 shadow-2xs">
              <Sparkles size={13} /> Institutional Alumni Network
            </span>
          </div>

          {pending.length > 0 && (
            <div className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold flex items-center gap-2 shadow-2xs animate-pulse">
              <Clock3 size={14} className="text-amber-600" />
              <span>{pending.length} Registration Request{pending.length > 1 ? 's' : ''} Awaiting Approval</span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-3">
              <Users size={28} className="text-blue-600 shrink-0" />
              Alumni Management
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium mt-1">
              Review registration applications, manage verified alumni profiles, and maintain connection with your institutional network.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, company..."
              className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white/90 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="sp-kpi-grid">
        {/* Card 1: Total Alumni */}
        <div className="sp-kpi-card" style={{ '--kpi-accent': '#2563EB' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">Total Alumni</span>
            <div className="sp-kpi-icon bg-blue-50 text-blue-600">
              <Users size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{alumni.length}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Registered Network Members</p>
        </div>

        {/* Card 2: Pending Approval */}
        <div className="sp-kpi-card" style={{ '--kpi-accent': '#F59E0B' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">Pending Approval</span>
            <div className="sp-kpi-icon bg-amber-50 text-amber-600">
              <Clock3 size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{alumni.filter((item) => item.alumniStatus === 'PENDING').length}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Awaiting TPO Verification</p>
        </div>

        {/* Card 3: Approved Alumni */}
        <div className="sp-kpi-card" style={{ '--kpi-accent': '#10B981' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">Approved Alumni</span>
            <div className="sp-kpi-icon bg-emerald-50 text-emerald-600">
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{approved.length}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Verified Active Profiles</p>
        </div>
      </div>

      {/* Pending Recruiter Approvals Section */}
      {pendingRecruiters.length > 0 && (
        <section className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50/50 via-purple-50/20 to-white shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
            <h3 className="font-extrabold text-slate-900 font-display text-base sm:text-lg flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold border border-indigo-300 shadow-2xs">
                <Building2 size={18} />
              </div>
              Pending Recruiter Approvals
            </h3>
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-900 font-extrabold text-xs shadow-2xs">
              {pendingRecruiters.length} Recruiter{pendingRecruiters.length > 1 ? 's' : ''} Awaiting Approval
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {pendingRecruiters.map((rec) => (
              <div
                key={rec.id}
                className="p-6 rounded-2xl border border-indigo-100 hover:border-indigo-300 bg-white shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 ring-4 ring-white">
                    {rec.companyName ? rec.companyName.slice(0, 2).toUpperCase() : 'RC'}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-extrabold text-slate-900 text-base sm:text-lg font-display">
                        {rec.name}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs">
                        {rec.designation || 'Corporate Recruiter'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{rec.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                        <Building2 size={13} className="text-indigo-600" />
                        Company: {rec.companyName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 justify-end">
                  <button
                    onClick={() => onApproveRecruiter && onApproveRecruiter(rec.id)}
                    className="btn btn-success h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 size={16} />
                    Approve Recruiter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Alumni Section */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 font-display text-base sm:text-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200/80 shadow-2xs">
              <Clock3 size={18} />
            </div>
            Pending Alumni Approvals
          </h3>
          <span className="sp-badge sp-badge-warning font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-2xs">
            {pending.length} Pending
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="sp-visualizer-card text-center py-14 px-6 rounded-3xl border border-slate-200/80 bg-slate-50/60 shadow-2xs text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 size={28} />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 font-display">No pending alumni registrations</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium max-w-md mx-auto">
              All registered alumni requests have been reviewed and approved.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl border border-slate-200/90 hover:border-blue-300 bg-gradient-to-br from-slate-50/80 via-slate-50/40 to-white shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 ring-4 ring-white">
                    {item.name
                      ? item.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'AL'}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-base sm:text-lg font-display">
                          {item.name}
                        </h4>
                        {item.linkedIn && (
                          <a
                            href={item.linkedIn}
                            target="_blank"
                            rel="noreferrer"
                            className="sp-badge sp-badge-primary font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 hover:underline shadow-2xs"
                          >
                            LinkedIn
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {item.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-3 py-1 bg-white border border-slate-200/90 rounded-xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                        <GraduationCap size={13} className="text-blue-600" />
                        Class of {item.graduationYear}
                      </span>

                      <span className="px-3 py-1 bg-white border border-slate-200/90 rounded-xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                        <Award size={13} className="text-indigo-600" />
                        {item.department}
                      </span>

                      {item.currentCompany && (
                        <span className="px-3 py-1 bg-white border border-slate-200/90 rounded-xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                          <Building2 size={13} className="text-emerald-600" />
                          {item.currentCompany}
                        </span>
                      )}

                      {item.currentRole && (
                        <span className="px-3 py-1 bg-white border border-slate-200/90 rounded-xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                          <Briefcase size={13} className="text-amber-600" />
                          {item.currentRole}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 justify-end">
                  <button
                    onClick={() => onApprove(item.id)}
                    className="btn btn-success h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Reject ${item.name}'s alumni registration?`
                        )
                      ) {
                        onReject(item.id);
                      }
                    }}
                    className="btn btn-danger h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Alumni Directory Section */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 font-display text-base sm:text-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200/80 shadow-2xs">
              <CheckCircle2 size={18} />
            </div>
            Approved Alumni Directory
          </h3>
          <span className="sp-badge sp-badge-success font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-2xs">
            {approved.length} Active Alumni
          </span>
        </div>

        {approved.length === 0 ? (
          <div className="sp-visualizer-card text-center py-14 px-6 rounded-3xl border border-slate-200/80 bg-slate-50/60 shadow-2xs text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Users size={28} />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 font-display">No approved alumni yet</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium max-w-md mx-auto">
              Approved alumni profiles will appear in this directory once verified.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Alumni Member</th>
                  <th className="px-6 py-4">Current Company</th>
                  <th className="px-6 py-4">Job Role</th>
                  <th className="px-6 py-4">Graduation & Dept</th>
                  <th className="px-6 py-4 text-right">Verification</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {approved.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300/70 text-slate-800 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {item.name
                            ? item.name
                                .split(' ')
                                .map((part) => part[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()
                            : 'AL'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            {item.name}
                            {item.linkedIn && (
                              <a
                                href={item.linkedIn}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                                title="LinkedIn Profile"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-extrabold text-slate-800">
                      {item.currentCompany || 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                      {item.currentRole || 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                      Class of {item.graduationYear} ({item.department})
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="sp-badge sp-badge-success font-extrabold text-xs px-3 py-1 rounded-full shadow-2xs inline-flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};