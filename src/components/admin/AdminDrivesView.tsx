import React from 'react';
import { Briefcase, Building, X, Plus, CheckCircle2 } from 'lucide-react';
import type { DriveWithCompany } from '../../api/types';
import type { PlacementDrive } from '../../mockData';

interface AdminDrivesViewProps {
  showDriveForm: boolean;
  setShowDriveForm: (show: boolean) => void;
  handleDriveSubmit: (e: React.FormEvent) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  companyLocation: string;
  setCompanyLocation: (v: string) => void;
  companyWebsite: string;
  setCompanyWebsite: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  jobLocation: string;
  setJobLocation: (v: string) => void;
  pkg: string;
  setPkg: (v: string) => void;
  numericPkg: number;
  setNumericPkg: (v: number) => void;
  cgpaCutoff: number;
  setCgpaCutoff: (v: number) => void;
  maxBacklogs: number;
  setMaxBacklogs: (v: number) => void;
  allowedBranches: string[];
  handleBranchCheckbox: (branch: string) => void;
  branches: string[];
  deadline: string;
  setDeadline: (v: string) => void;
  jobDesc: string;
  setJobDesc: (v: string) => void;
  skillsRequiredText: string;
  setSkillsRequiredText: (v: string) => void;
  roundsText: string;
  setRoundsText: (v: string) => void;
  effectiveDrives: (DriveWithCompany | PlacementDrive)[];
  handleToggleDriveStatus: (drive: DriveWithCompany | PlacementDrive) => void;
}

export const AdminDrivesView: React.FC<AdminDrivesViewProps> = ({
  showDriveForm,
  setShowDriveForm,
  handleDriveSubmit,
  companyName,
  setCompanyName,
  companyLocation,
  setCompanyLocation,
  companyWebsite,
  setCompanyWebsite,
  role,
  setRole,
  jobLocation,
  setJobLocation,
  pkg,
  setPkg,
  numericPkg,
  setNumericPkg,
  cgpaCutoff,
  setCgpaCutoff,
  maxBacklogs,
  setMaxBacklogs,
  allowedBranches,
  handleBranchCheckbox,
  branches,
  deadline,
  setDeadline,
  jobDesc,
  setJobDesc,
  skillsRequiredText,
  setSkillsRequiredText,
  roundsText,
  setRoundsText,
  effectiveDrives,
  handleToggleDriveStatus
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Banner & Launch Button Header */}
      <div className="sp-page-header">
        <div>
          <h1 className="sp-page-title">
            <Briefcase size={28} className="text-blue-600" />
            Manage Campus Recruitment Drives ({effectiveDrives.length})
          </h1>
          <p className="sp-page-subtitle">
            Configure academic cutoffs, eligible branches, recruitment pipeline steps, and campaign statuses.
          </p>
        </div>

        <button
          onClick={() => setShowDriveForm(!showDriveForm)}
          className={`btn h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all self-start sm:self-center ${
            showDriveForm ? 'btn-secondary' : 'btn-primary'
          }`}
        >
          {showDriveForm ? <X size={18} /> : <Plus size={18} />}
          {showDriveForm ? 'Close Editor' : 'Launch New Drive'}
        </button>
      </div>

      {/* Expandable Launch Drive Form Drawer */}
      {showDriveForm && (
        <form
          onSubmit={handleDriveSubmit}
          className="card-form flex flex-col gap-6 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                <Building size={22} className="text-blue-600" />
                Launch New Recruitment Campaign
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in company criteria, job specifications, and application deadlines.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDriveForm(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Section 1: Recruitment Details */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 font-display border-b border-slate-100 pb-2">
              <Building size={14} /> Recruitment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Company HQ Location *</label>
                <input
                  type="text"
                  required
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                  placeholder="e.g. Bangalore, India"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Company Website (optional)</label>
                <input
                  type="text"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://google.com"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Job Role Name *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Associate Software Engineer"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Job Posting Location *</label>
                <input
                  type="text"
                  required
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  placeholder="Hyderabad / Remote"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">CTC Package (Text) *</label>
                <input
                  type="text"
                  required
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  placeholder="18 LPA"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Numeric Package (for analytics) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={numericPkg}
                  onChange={(e) => setNumericPkg(Number(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Eligibility Criteria */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 font-display border-b border-slate-100 pb-2">
              Eligibility Criteria
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">CGPA Cut-off (0-10) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="0"
                  max="10"
                  value={cgpaCutoff}
                  onChange={(e) => setCgpaCutoff(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Max Backlogs Allowed *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Application Deadline *</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Eligible Branches / Departments *</label>
              <div className="flex flex-wrap gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                {branches.map((b) => {
                  const isChecked = allowedBranches.includes(b);
                  return (
                    <label
                      key={b}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2 select-none ${
                        isChecked
                          ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBranchCheckbox(b)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span>{b}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Skills & Pipeline */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 font-display border-b border-slate-100 pb-2">
              Pipeline & Skills Details
            </h4>

            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Required Skills (Comma separated) *</label>
                <input
                  type="text"
                  required
                  value={skillsRequiredText}
                  onChange={(e) => setSkillsRequiredText(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, SQL"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Pipeline Selection Rounds (Comma separated order) *</label>
                <input
                  type="text"
                  required
                  value={roundsText}
                  onChange={(e) => setRoundsText(e.target.value)}
                  placeholder="e.g. Resume Screening, Technical Test, Technical Interview, HR Interview"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Job Description Summary</label>
                <textarea
                  rows={4}
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Provide full description of job role expectations..."
                  className="input-field font-sans resize-none min-h-25"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDriveForm(false)}
              className="btn btn-secondary h-12 px-6 rounded-xl font-bold text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 size={18} /> Launch Drive Campaign
            </button>
          </div>
        </form>
      )}

      {/* Active Drives Placement Cards List (Spacious & Centered SaaS Design) */}
      {/* Active Placement Drives List */}
      <div className="flex flex-col gap-5">
        {effectiveDrives.map((drive) => (
          <div
            key={drive.id}
            className={`glass-card p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ${
              drive.status === 'OPEN' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'
            }`}
          >
            <div className="flex-1 flex flex-col gap-4 w-full">
              {/* Header Info */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/15 border border-white/20">
                  {drive.companyName.charAt(0)}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-xl sm:text-2xl text-slate-900 font-display leading-tight">{drive.title || drive.companyName}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold font-mono bg-blue-50 text-blue-700 border border-blue-200/80">
                      {drive.package}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        drive.status === 'OPEN'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80'
                          : 'bg-rose-100 text-rose-800 border border-rose-200/80'
                      }`}
                    >
                      {drive.status === 'OPEN' ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-blue-600 flex items-center gap-1.5">
                    <Building size={14} className="shrink-0 text-blue-500" />
                    <span>{drive.companyName}</span>
                  </p>
                </div>
              </div>

              {/* Description */}
              {Boolean(drive.description) && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {drive.description}
                </p>
              )}

              {/* Structured Metadata Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Location</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate block">
                    {('location' in drive && drive.location) || 'Campus / Online'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cut-off CGPA</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 block">{drive.cgpaCutoff} CGPA</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Max Backlogs</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 block">{drive.maxBacklogs} Backlogs</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Registered</span>
                  <span className="text-xs sm:text-sm font-bold text-blue-600 block">{drive.registeredCount || 0} Students</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Deadline</span>
                  <span className="text-xs sm:text-sm font-bold text-indigo-600 block">{drive.deadline}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="self-stretch lg:self-center shrink-0 flex items-center justify-end">
              <button
                onClick={() => handleToggleDriveStatus(drive)}
                className={`btn h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  drive.status === 'OPEN' ? 'btn-danger' : 'btn-success'
                }`}
              >
                {drive.status === 'OPEN' ? 'Suspend Drive' : 'Reactivate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
