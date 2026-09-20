import React, { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  FileCheck,
  AlertCircle,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Mail,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import type { Student } from '../../mockData';
import type { StudentTabType } from './StudentSidebar';
import { studentApi } from '../../api/studentApi';

interface StudentDashboardViewProps {
  currentStudent: Student;
  setActiveTab: (tab: StudentTabType) => void;
  onTrackApplication: (driveId: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  currentStudent,
  setActiveTab,
  onTrackApplication
}) => {
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSendVerification = async () => {
    if (!currentStudent?.id) return;
    setSendingVerification(true);
    try {
      await studentApi.verifyEmail(currentStudent.id);
      setVerificationSent(true);
    } catch {
      // Ignored
    } finally {
      setSendingVerification(false);
    }
  };

  const totalApplied = currentStudent.applications.length;
  const isPlaced = currentStudent.placementStatus === 'Placed';
  const firstName = currentStudent.name.split(' ')[0];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Email Verification Reminder Banner if unverified */}
      {currentStudent.emailVerified === false && (
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Mail size={22} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-950 font-display">
                Email Address Not Verified ({currentStudent.email})
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Verify your email address to receive real-time placement notifications and event alerts.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {verificationSent ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Verification Sent! Check Inbox
              </span>
            ) : (
              <button
                type="button"
                disabled={sendingVerification}
                onClick={handleSendVerification}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {sendingVerification ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Verification Link'
                )}
              </button>
            )}
          </div>
        </div>
      )}
      {/* Welcoming Hero Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="sp-badge sp-badge-success font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Academic Session
            </span>
          </div>

          {isPlaced && (
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <Award size={14} className="text-emerald-600" />
              <span>Placed at {currentStudent.placedCompany} ({currentStudent.placedPackage})</span>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight mt-1">
          Welcome back, {firstName}! 👋
        </h1>

        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          {isPlaced
            ? `Congratulations! You have secured a placement offer at ${currentStudent.placedCompany}. Keep your records and onboarding documentation ready.`
            : 'Review your upcoming drives, maintain your ATS resume match index, and practice technical screening rounds to boost your selection rate.'}
        </p>
      </div>

      {/* KPI Metric Cards */}
      <div className="sp-kpi-grid">
        <div className="sp-kpi-card" style={{ '--kpi-accent': '#2563EB' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">Cumulative GPA</span>
            <div className="sp-kpi-icon bg-blue-50 text-blue-600">
              <GraduationCap size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{currentStudent.cgpa}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Scale 0.0 - 10.0</p>
        </div>

        <div className="sp-kpi-card" style={{ '--kpi-accent': '#4F46E5' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">Submitted Applications</span>
            <div className="sp-kpi-icon bg-indigo-50 text-indigo-600">
              <Briefcase size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{totalApplied}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Drive Registrations</p>
        </div>

        <div className="sp-kpi-card" style={{ '--kpi-accent': '#10B981' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">ATS Resume Score</span>
            <div className="sp-kpi-icon bg-emerald-50 text-emerald-600">
              <FileCheck size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{currentStudent.resumeScore}%</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Match Index Rating</p>
        </div>

        <div className="sp-kpi-card" style={{ '--kpi-accent': '#F59E0B' } as React.CSSProperties}>
          <div className="sp-kpi-header">
            <span className="sp-kpi-label">Active Backlogs</span>
            <div className="sp-kpi-icon bg-amber-50 text-amber-600">
              <AlertCircle size={22} />
            </div>
          </div>
          <div className="sp-kpi-value">{currentStudent.backlogs}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Course Backlogs</p>
        </div>
      </div>

      {/* Main Grid: Active Applications + Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Applications */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 font-display text-base flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              Active Job Applications
            </h3>
            <button
              onClick={() => setActiveTab('drives')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Browse Drives <ArrowRight size={14} />
            </button>
          </div>

          {totalApplied === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Briefcase size={44} className="mx-auto opacity-30 mb-2" />
              <p className="text-sm font-bold text-slate-700 font-display">No applications submitted yet.</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Explore open placement drives to start applying.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {currentStudent.applications.map((app) => {
                const getBadgeClass = (status: string) => {
                  if (status === 'Selected') return 'sp-badge-success';
                  if (status === 'Rejected') return 'sp-badge-danger';
                  return 'sp-badge-info';
                };

                return (
                  <div
                    key={app.jobPostingId}
                    className="py-4 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-base shrink-0">
                        {app.companyName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm font-display">{app.companyName}</h4>
                        <p className="text-xs text-slate-500 font-medium">{app.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`sp-badge ${getBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                      <button
                        onClick={() => onTrackApplication(app.jobPostingId)}
                        className="btn btn-secondary h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <TrendingUp size={14} />
                        Track
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Suggestions & Skills */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 font-display text-base flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                Smart Recommendations
              </h3>
              <span className="sp-badge sp-badge-primary">AI Powered</span>
            </div>

            <div className="flex flex-col gap-4">
              {currentStudent.resumeScore < 75 && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs font-display">Optimize Resume Match</h4>
                      <p className="text-[11px] text-amber-700 font-medium">ATS Index at {currentStudent.resumeScore}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                    Review keyword density and recommendations to prevent automated screener rejections.
                  </p>
                  <button
                    onClick={() => setActiveTab('ats')}
                    className="btn btn-secondary h-8 w-full rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border-amber-300 text-amber-900 hover:bg-amber-100/60"
                  >
                    Run ATS Scanner →
                  </button>
                </div>
              )}

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-100 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold shadow-2xs">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm font-display">Technical Mock Practice</h4>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Interview Simulator</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Simulate Software Engineer or Analyst technical screening questions with automated feedback evaluation.
                </p>
                <button
                  onClick={() => setActiveTab('interview')}
                  className="btn btn-primary h-9 w-full rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  Start Practice Round →
                </button>
              </div>
            </div>
          </div>

          {/* Skills Pill Catalog */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-3">
            <h3 className="font-bold text-slate-900 font-display text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <BookOpen size={16} />
              Indexed Skills ({currentStudent.skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentStudent.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
