import React from 'react';
import { GitMerge, ArrowRight, X, Briefcase, FileText, Mail, Sparkles, CheckCircle2, Users, Award, GraduationCap, Clock } from 'lucide-react';
import type { Student, PlacementDrive, Recruiter } from '../../mockData';
import '../admin/RecordPlacementOfferModal.css';

interface RecruiterTrackerViewProps {
  recruiter: Recruiter;
  myDrives: PlacementDrive[];
  trackerDriveId: string;
  setTrackerDriveId: (id: string) => void;
  activeTrackerDrive: PlacementDrive | undefined;
  activeTrackerApplications: { student: Student; app: any }[];
  selectedStudentForResume: Student | null;
  setSelectedStudentForResume: (s: Student | null) => void;
  onPromoteStudent: (studentId: string, driveId: string, newRoundIndex: number, isFinalSelection: boolean) => void;
  onRejectStudent: (studentId: string, driveId: string) => void;
  onDownloadStudents: () => void;
}

export const RecruiterTrackerView: React.FC<RecruiterTrackerViewProps> = ({
  recruiter,
  myDrives,
  trackerDriveId,
  setTrackerDriveId,
  activeTrackerDrive,
  activeTrackerApplications,
  selectedStudentForResume,
  setSelectedStudentForResume,
  onPromoteStudent,
  onRejectStudent,
  onDownloadStudents
}) => {
  const defaultRounds = ['Online Assessment', 'Technical Interview', 'HR Interview'];
  const trackerRounds = (activeTrackerDrive && 'rounds' in activeTrackerDrive && Array.isArray((activeTrackerDrive as any).rounds) && (activeTrackerDrive as any).rounds.length > 0)
    ? (activeTrackerDrive as any).rounds
    : defaultRounds;

  const totalInPipeline = activeTrackerApplications.length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Banner & Drive Selector */}
      <div className="sp-page-header">
        <div>
          <h1 className="sp-page-title">
            <GitMerge size={28} className="text-blue-600" />
            Applicant Selection Pipeline
          </h1>
          <p className="sp-page-subtitle">
            Evaluate candidate applications for {recruiter.companyName}, inspect student resumes, and extend job offers.
          </p>
        </div>

        {myDrives.length > 0 && (
  <div className="flex items-end gap-3 flex-wrap">
    <button
      type="button"
      onClick={onDownloadStudents}
      disabled={activeTrackerApplications.length === 0}
      className="btn btn-primary h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="Download students for this drive"
    >
      <FileText size={18} />
      Download Students
    </button>

    <div className="flex flex-col gap-1.5 min-w-65">
      <label className="text-xs font-bold text-slate-700">
        Select Active Role Drive
      </label>

      <select
        value={trackerDriveId}
        onChange={(e) => setTrackerDriveId(e.target.value)}
        className="input-field font-bold text-slate-800"
      >
        {myDrives.map((drv) => (
          <option key={drv.id} value={drv.id}>
            {drv.title || drv.role} ({drv.package})
          </option>
        ))}
      </select>
    </div>
  </div>
)}
  </div>

      {activeTrackerDrive ? (
        <div className="flex flex-col gap-6">
          {/* Active Drive Details Summary Card */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Role Title:</span>{' '}
              <strong className="text-slate-900 font-bold text-base font-display">{activeTrackerDrive.title || activeTrackerDrive.role}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Active Pipeline Candidates:</span>{' '}
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80">
                <Users size={13} className="inline mr-1 text-blue-600" />
                {totalInPipeline} Candidates
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Offered Package:</span>{' '}
              <span className="sp-badge sp-badge-primary font-mono font-bold">{activeTrackerDrive.package || `${(activeTrackerDrive as any).salary || 6} LPA`}</span>
            </div>
            <div className="flex items-center gap-2 max-w-xl">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs shrink-0">Selection Stages:</span>{' '}
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 truncate">
                {trackerRounds.join(' ➔ ')}
              </span>
            </div>
          </div>

          {/* Kanban Stage Pipeline Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {trackerRounds.map((roundName: string, colIndex: number) => {
              const columnApplications = activeTrackerApplications.filter(
                (item) => item.app.currentRoundIndex === colIndex
              );
              const isLastCol = colIndex === trackerRounds.length - 1;

              return (
                <div key={roundName} className="card-container p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col gap-4">
                  {/* Round Column Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h4 className="font-bold text-slate-900 text-base font-display truncate" title={roundName}>
                      {roundName}
                    </h4>
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center justify-center border border-blue-200 shadow-2xs">
                      {columnApplications.length}
                    </span>
                  </div>

                  {/* Candidates Cards Container */}
                  <div className="flex flex-col gap-4 min-h-45">
                    {columnApplications.length === 0 ? (
                      <div className="p-8 rounded-2xl border border-dashed border-slate-200/90 bg-white/60 text-slate-400 text-xs font-semibold text-center flex flex-col items-center justify-center gap-2 my-auto">
                        <Sparkles size={22} className="text-slate-300" />
                        <span className="font-bold text-slate-500">Stage Empty</span>
                        <span className="text-[10px] text-slate-400 font-normal">No candidates currently in this round</span>
                      </div>
                    ) : (
                      columnApplications.map(({ student, app }) => {
                        const initials = student.name
                          ? student.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()
                          : 'ST';

                        return (
                          <div
                            key={app?.id || `${student.id}-${activeTrackerDrive.id}`}
                            className="card-kanban p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col gap-4 group"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs border border-white/20">
                                {initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-slate-900 text-base font-display leading-tight truncate" title={student.name}>
                                  {student.name}
                                </h5>
                                <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
                                  {student.department}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs bg-slate-50/90 p-3 rounded-xl border border-slate-200/80 font-semibold text-slate-700">
                              <span>CGPA: <strong className="text-slate-900 font-bold">{student.cgpa}</strong></span>
                              <span>Backlogs: <strong className="text-slate-900 font-bold">{student.backlogs ?? 0}</strong></span>
                            </div>

                            {/* Action Buttons Row */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                              <button
                                onClick={() => setSelectedStudentForResume(student)}
                                className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                title="Inspect Resume & Profile"
                              >
                                <FileText size={16} />
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onRejectStudent(student.id, activeTrackerDrive.id)}
                                  className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                  title="Reject Candidate"
                                >
                                  <X size={16} />
                                </button>
                                <button
                                  onClick={() => onPromoteStudent(student.id, activeTrackerDrive.id, colIndex + 1, isLastCol)}
                                  className="w-9 h-9 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center justify-center transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                                  title={isLastCol ? 'Select Candidate & Issue Offer' : 'Promote Candidate to Next Stage'}
                                >
                                  {isLastCol ? (
                                    <CheckCircle2 size={16} />
                                  ) : (
                                    <ArrowRight size={16} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card text-center py-16 p-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
          <Briefcase size={48} className="mx-auto opacity-20 mb-3 text-slate-500" />
          <h3 className="text-base font-bold text-slate-800 font-display">No Active Drives Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
            Publish recruitment campaigns under Company Drives to activate candidate selection tracking.
          </p>
        </div>
      )}

      {/* Resume Inspector Modal (Taking reference from RecordPlacementOfferModal & EventModal) */}
      {selectedStudentForResume && (
        <div className="rp-modal-overlay">
          <div className="rp-modal-card max-w-2xl">
            {/* Modal Header */}
            <div className="rp-modal-header">
              <div className="rp-header-left">
                <div
                  className="rp-header-icon-badge"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                >
                  <FileText size={24} />
                </div>
                <div className="rp-header-text">
                  <h3 className="rp-modal-title">{selectedStudentForResume.name}'s Resume</h3>
                  <p className="rp-modal-subtitle">
                    Candidate Application Portfolio & Profile • {recruiter.companyName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForResume(null)}
                className="rp-close-btn"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="rp-modal-body">
              {/* Candidate Info Card */}
              <div className="rp-candidate-card">
                <div className="rp-candidate-info">
                  <div className="rp-candidate-avatar" style={{ backgroundColor: '#2563eb' }}>
                    {selectedStudentForResume.name ? selectedStudentForResume.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="rp-candidate-details">
                    <h4 className="rp-candidate-name">{selectedStudentForResume.name}</h4>
                    <p className="rp-candidate-meta">
                      {selectedStudentForResume.department} • Registration No: {selectedStudentForResume.id}
                    </p>
                  </div>
                </div>
                <span className="rp-candidate-badge bg-blue-100 text-blue-800 border border-blue-200">
                  Candidate Profile
                </span>
              </div>

              {/* Candidate Details Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rp-input-wrapper bg-slate-50 border-slate-200">
                  <Mail size={18} className="rp-input-icon text-blue-600 shrink-0" />
                  <div className="flex flex-col min-w-0 truncate">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</span>
                    <span className="text-xs font-bold text-slate-900 truncate" title={selectedStudentForResume.email}>
                      {selectedStudentForResume.email}
                    </span>
                  </div>
                </div>

                <div className="rp-input-wrapper bg-slate-50 border-slate-200">
                  <GraduationCap size={18} className="rp-input-icon text-indigo-600 shrink-0" />
                  <div className="flex flex-col min-w-0 truncate">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Department / Branch</span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {selectedStudentForResume.department}
                    </span>
                  </div>
                </div>

                <div className="rp-input-wrapper bg-slate-50 border-slate-200">
                  <Award size={18} className="rp-input-icon text-amber-600 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">CGPA</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{selectedStudentForResume.cgpa} / 10.0</span>
                  </div>
                </div>

                <div className="rp-input-wrapper bg-slate-50 border-slate-200">
                  <Clock size={18} className="rp-input-icon text-rose-600 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Backlogs</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{selectedStudentForResume.backlogs ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Plain Text Resume Content */}
              <div className="p-4.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex flex-col gap-2">
                <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <FileText size={15} /> Candidate Plain Text Resume Overview
                </span>
                <p className="p-3 bg-white rounded-xl border border-blue-200/60 text-slate-800 leading-relaxed font-mono text-xs max-h-56 overflow-y-auto whitespace-pre-wrap shadow-inner">
                  {selectedStudentForResume.resumeText || 'No plain text resume overview available.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="rp-modal-footer">
              <a
                href={`mailto:${selectedStudentForResume.email}`}
                className="rp-btn-save inline-flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
              >
                <Mail size={16} />
                Contact Candidate
              </a>
              <button
                type="button"
                onClick={() => setSelectedStudentForResume(null)}
                className="rp-btn-cancel"
              >
                Done Viewing Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
