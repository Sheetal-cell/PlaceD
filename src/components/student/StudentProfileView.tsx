import React, { useState } from 'react';
import { UserCheck, FileText, Upload, Save, CheckCircle2, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { studentApi } from '../../api/studentApi';

interface StudentProfileViewProps {
  emailVerified?: boolean;
  studentId?: string;
  profileName: string;
  setProfileName: (v: string) => void;
  profileEmail: string;
  setProfileEmail: (v: string) => void;
  profilePassword: string;
  setProfilePassword: (v: string) => void;
  profileBranch: string;
  setProfileBranch: (v: string) => void;
  profileCgpa: string;
  setProfileCgpa: (v: string) => void;
  profileBacklogs: string;
  setProfileBacklogs: (v: string) => void;
  profileSkills: string;
  setProfileSkills: (v: string) => void;
  profileResume: string;
  setProfileResume: (v: string) => void;
  uploadedResumeName: string;
  uploadedResumeFile: File | null;
  uploadedCVName: string;
  uploadedCVFile: File | null;
  handleResumeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCVUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
  onGoToAts: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  emailVerified,
  studentId,
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  profilePassword,
  setProfilePassword,
  profileBranch,
  setProfileBranch,
  profileCgpa,
  setProfileCgpa,
  profileBacklogs,
  setProfileBacklogs,
  profileSkills,
  setProfileSkills,
  profileResume,
  setProfileResume,
  uploadedResumeName,
  uploadedResumeFile,
  uploadedCVName,
  uploadedCVFile,
  handleResumeUpload,
  handleCVUpload,
  handleSaveProfile,
  onGoToAts
}) => {
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleTriggerVerify = async () => {
    if (!studentId) return;
    setSendingVerification(true);
    try {
      await studentApi.verifyEmail(studentId);
      setVerificationSent(true);
    } catch {
      // Handled silently or state
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page Header */}
      <div className="sp-page-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-3">
            <UserCheck size={28} className="text-blue-600 shrink-0" />
            Candidate Placement Profile
          </h1>
          <p className="sp-page-subtitle">
            Update your academic records, contact info, branch credentials, and current placement status.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
        {/* Section 1: Personal Details */}
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
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                {emailVerified === true ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1">
                      <AlertCircle size={12} /> Unverified
                    </span>
                    {studentId && (
                      <button
                        type="button"
                        onClick={handleTriggerVerify}
                        disabled={sendingVerification || verificationSent}
                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {sendingVerification ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : verificationSent ? (
                          'Sent!'
                        ) : (
                          'Verify Email'
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Branch / Department</label>
              <select
                value={profileBranch}
                onChange={(e) => setProfileBranch(e.target.value)}
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

        {/* Section 2: Academic Metrics & Skills */}
        <div className="sp-card flex flex-col gap-5 p-6 sm:p-7">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display border-b border-slate-100 pb-3">
            2. Academic Metrics & Skills Catalog
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Cumulative CGPA (0-10)</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                max="10"
                value={profileCgpa}
                onChange={(e) => setProfileCgpa(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Active Course Backlogs</label>
              <input
                type="number"
                required
                min="0"
                value={profileBacklogs}
                onChange={(e) => setProfileBacklogs(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">
              Technical Skills (Comma separated)
            </label>
            <input
              type="text"
              required
              value={profileSkills}
              onChange={(e) => setProfileSkills(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Section 3: Document Uploads & Plain Text Sync */}
        <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2.5">
              <FileText size={22} className="text-blue-600" />
              3. Resume & CV Documents
            </h3>
            <span className="sp-badge sp-badge-primary">ATS Compatible</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Upload Card */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-blue-300 transition-all flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm font-display">Primary Resume Document</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">PDF, DOC, DOCX • Max 5 MB</p>
                  </div>
                </div>
                {uploadedResumeName && (
                  <span className="sp-badge sp-badge-success flex items-center gap-1 shrink-0">
                    <CheckCircle2 size={13} /> Uploaded
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/60">
                <label className="btn btn-secondary h-10 w-full rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2">
                  <Upload size={14} />
                  <span>{uploadedResumeName ? 'Change Resume File' : 'Choose Resume File'}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>

                {uploadedResumeName ? (
                  <div className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs mt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[200px]" title={uploadedResumeName}>
                        📄 {uploadedResumeName}
                      </span>
                      {uploadedResumeFile && (
                        <span className="font-mono text-[11px] text-slate-500 font-semibold">
                          {(uploadedResumeFile.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={onGoToAts}
                      className="btn btn-primary h-8 w-full rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 mt-1"
                    >
                      <Sparkles size={13} /> Analyze Resume in ATS Tool →
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium text-center py-1">No resume file selected yet.</p>
                )}
              </div>
            </div>

            {/* Full CV Upload Card */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-indigo-300 transition-all flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm font-display">Full Academic Curriculum Vitae (CV)</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">PDF, DOC, DOCX • Max 5 MB</p>
                  </div>
                </div>
                {uploadedCVName && (
                  <span className="sp-badge sp-badge-success flex items-center gap-1 shrink-0">
                    <CheckCircle2 size={13} /> Uploaded
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/60">
                <label className="btn btn-secondary h-10 w-full rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2">
                  <FileText size={14} />
                  <span>{uploadedCVName ? 'Change CV File' : 'Choose Full CV File'}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCVUpload}
                    className="hidden"
                  />
                </label>

                {uploadedCVName ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs mt-1">
                    <span className="font-bold text-slate-900 truncate max-w-[200px]" title={uploadedCVName}>
                      📑 {uploadedCVName}
                    </span>
                    {uploadedCVFile && (
                      <span className="font-mono text-[11px] text-slate-500 font-semibold">
                        {(uploadedCVFile.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium text-center py-1">No full CV file selected yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Plain Text Overview Textarea */}
          <div className="flex flex-col gap-2.5 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-sm font-bold text-slate-800 font-display">
                Resume Plain Text Overview
              </label>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ● Syncs with ATS Scorer
              </span>
            </div>
            <textarea
              rows={5}
              required
              value={profileResume}
              onChange={(e) => setProfileResume(e.target.value)}
              placeholder="Paste your plain text resume summary, work experience, and project highlights..."
              className="input-field font-sans leading-relaxed text-slate-800 resize-none min-h-[130px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="btn btn-primary h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Profile & Academic Credentials
          </button>
        </div>
      </form>
    </div>
  );
};
