import React, { useState, useEffect } from 'react';
import { Users, FileText, ChevronRight, X, Save, TrendingUp, CheckCircle2, Award, Sparkles} from 'lucide-react';
import type { Student, PlacementDrive, ResumeFeedback } from '../../mockData';
import type { StudentWithPlacement } from '../../api/types';
import { StudentVisualizerView } from '../student/StudentVisualizerView';
import { RecordPlacementOfferModal } from './RecordPlacementOfferModal';
import { applicationApi } from '../../api/applicationApi';
import { isOnCampusDrive } from '../../utils/driveFilters';
import './RecordPlacementOfferModal.css';

interface AdminStudentDatabaseViewProps {
  filteredStudents: (Student | StudentWithPlacement)[];
  allStudents: (Student | StudentWithPlacement)[];
  onDownloadStudents: () => void;
  studentSearch: string;
  setStudentSearch: (v: string) => void;
  branchFilter: string;
  setBranchFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  minCgpaFilter: number;
  setMinCgpaFilter: (v: number) => void;
  minAtsFilter: number;
  setMinAtsFilter: (v: number) => void;
  branches: string[];
  selectedStudentForResume: (Student | StudentWithPlacement) | null;
  setSelectedStudentForResume: (s: (Student | StudentWithPlacement) | null) => void;
  review: {
    score: number;
    status: string;
    projects: string;
    skills: string;
    experience: string;
    ats: string;
    overall: string;
  };
  setReview: React.Dispatch<React.SetStateAction<{
    score: number;
    status: string;
    projects: string;
    skills: string;
    experience: string;
    ats: string;
    overall: string;
  }>>;
  statusChangeStudentId: string | null;
  setStatusChangeStudentId: (id: string | null) => void;
  placedCompanyInput: string;
  setPlacedCompanyInput: (v: string) => void;
  placedPackageInput: string;
  setPlacedPackageInput: (v: string) => void;
  setActivePopoverStudent: (s: (Student | StudentWithPlacement) | null) => void;
  onUpdateStudentStatus: (studentId: string, company?: string, salaryPackage?: string) => void;
  onSaveFeedback: (studentId: string, feedback: ResumeFeedback) => void;
  handleManualStatusSave: (studentId: string) => void;
  drives?: PlacementDrive[];
}

export const AdminStudentDatabaseView: React.FC<AdminStudentDatabaseViewProps> = ({
  filteredStudents,
  allStudents,
  onDownloadStudents,
  studentSearch,
  setStudentSearch,
  branchFilter,
  setBranchFilter,
  statusFilter,
  setStatusFilter,
  minCgpaFilter,
  setMinCgpaFilter,
  minAtsFilter,
  setMinAtsFilter,
  branches,
  selectedStudentForResume,
  setSelectedStudentForResume,
  review,
  setReview,
  statusChangeStudentId,
  setStatusChangeStudentId,
  placedCompanyInput,
  setPlacedCompanyInput,
  placedPackageInput,
  setPlacedPackageInput,
  onUpdateStudentStatus,
  onSaveFeedback,
  handleManualStatusSave,
  drives = []
}) => {


  const [activeMobileStudent, setActiveMobileStudent] = useState<(Student | StudentWithPlacement) | null>(null);
  const [selectedStudentForVisualizer, setSelectedStudentForVisualizer] = useState<(Student | StudentWithPlacement) | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [fetchedApplications, setFetchedApplications] = useState<any[]>([]);
  useEffect(() => {
    if (selectedStudentForVisualizer?.id) {
      applicationApi
        .getAll()
        .then((allApps) => {
          const sApps = allApps.filter((a) => {
            if (String(a.studentId) !== String(selectedStudentForVisualizer.id)) return false;
            const matchedDrive = drives.find((d) => String(d.id) === String(a.jobPostingId));
            if (matchedDrive && !isOnCampusDrive(matchedDrive)) return false;
            return true;
          });
          if (sApps.length > 0) {
            const mapped = sApps.map((app) => {
              const matchedDrive = drives.find(
                (d) => String(d.id) === String(app.jobPostingId)
              );
              return {
                jobPostingId: String(app.jobPostingId),
                driveId: String(app.jobPostingId),
                companyName: app.companyName || matchedDrive?.companyName || 'Company',
                role: matchedDrive?.title || 'Software Engineer',
                appliedDate: app.appliedDate || '2026-06-01',
                status:
                  app.status === 'SHORTLISTED'
                    ? 'Selected'
                    : app.status === 'REJECTED'
                    ? 'Rejected'
                    : 'Applied',
                currentRoundIndex: app.currentRoundIndex ?? 0,
                feedback: 'Application status and round evaluations synchronized live from placement board.'
              };
            });
            setFetchedApplications(mapped);
            if (mapped[0]) {
              setSelectedAppId(mapped[0].jobPostingId);
            }
          } else {
            setFetchedApplications([]);
          }
        })
        .catch(() => {});
    }
  }, [selectedStudentForVisualizer?.id, drives]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Banner */}
      <div className="sp-page-header">
        <div>
          <h1 className="sp-page-title">
            <Users size={28} className="text-blue-600" />
            Student Placement Roster
          </h1>
          <p className="sp-page-subtitle">
            Review academic qualifications, filter by department & CGPA thresholds, edit placement statuses, and inspect candidate resumes.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center flex-wrap">
          <button
            onClick={onDownloadStudents}
            disabled={filteredStudents.length === 0}
            className="btn btn-primary h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={18} />
            Download Database
          </button>

          <div className="px-4 py-2.5 bg-slate-100 rounded-xl text-xs text-slate-700 font-extrabold border border-slate-200/80 shadow-2xs">
            Showing{' '}
            <span className="text-blue-600 font-extrabold">
              {filteredStudents.length}
            </span>{' '}
            of {allStudents.length} Candidates
          </div>
        </div>
      </div>

      {/* Filter Tools Bar */}
      <div className="ap-card p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Search Candidate</label>
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Name, email, reg no..."
            className="input-field"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Branch / Dept</label>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="input-field"
          >
            <option value="All">All Departments</option>
            {branches.map((br) => (
              <option key={br} value={br}>{br}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Placement Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="All">All Status</option>
            <option value="Placed">Placed</option>
            <option value="Unplaced">Unplaced</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Min CGPA</span>
            <span className="text-blue-600 font-mono">{minCgpaFilter.toFixed(1)}+</span>
          </div>
          <input
            type="range"
            min="5.0"
            max="10.0"
            step="0.1"
            value={minCgpaFilter}
            onChange={(e) => setMinCgpaFilter(Number(e.target.value))}
            className="accent-blue-600 mt-2 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Min ATS Score</span>
            <span className="text-emerald-600 font-mono">{minAtsFilter}%+</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minAtsFilter}
            onChange={(e) => setMinAtsFilter(Number(e.target.value))}
            className="accent-emerald-600 mt-2 cursor-pointer"
          />
        </div>
      </div>

      {/* Roster Table Container */}
      <div className="ap-card p-0 overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <table className="hidden md:table w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50 uppercase tracking-wider text-[11px]">
              <th className="px-8 py-5">Student Info</th>
              <th className="px-8 py-5">Department</th>
              <th className="px-8 py-5">CGPA / Backlogs</th>
              <th className="px-8 py-5">Placement Status</th>
              <th className="px-8 py-5">ATS Score</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center text-slate-400 font-medium">
                  No candidate records match the selected search and cutoff filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/90 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="font-extrabold text-slate-900 text-base font-display leading-tight">{student.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-xs inline-block border border-slate-200/60">
                      {student.department}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-mono">
                    <strong className="text-slate-900 text-base font-extrabold">{student.cgpa}</strong> <span className="text-slate-500 text-xs">CGPA</span>
                    <span className="text-slate-400 text-xs ml-1.5 font-sans font-medium">({student.backlogs} Backlogs)</span>
                  </td>
                  <td className="px-8 py-6">
                    {student.placementStatus === 'Placed' ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="sp-badge sp-badge-success self-start px-3 py-1 font-bold">Placed</span>
                        <span className="text-xs text-blue-600 font-extrabold truncate max-w-48" title={student.placedCompany}>
                          {student.placedCompany} ({student.placedPackage})
                        </span>
                      </div>
                    ) : (
                      <span className="sp-badge sp-badge-warning self-start px-3 py-1 font-bold">Unplaced</span>
                    )}
                  </td>
                  <td className="px-8 py-6 font-mono font-black text-emerald-600 text-base">
                    {student.resumeScore}%
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setSelectedStudentForVisualizer(student)}
                        className="p-3.5 sm:p-4 rounded-2xl bg-blue-50 hover:bg-blue-600 border border-blue-200/90 text-blue-700 hover:text-white transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-105 active:scale-95 flex items-center justify-center"
                        title="Open Stage Visualizer Pipeline"
                      >
                        <TrendingUp size={20} />
                      </button>

                      <button
                        onClick={() => setSelectedStudentForResume(student)}
                        className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-600 border border-indigo-200/90 text-indigo-700 hover:text-white transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-105 active:scale-95 flex items-center justify-center"
                        title="Review Resume Text & ATS Feedback"
                      >
                        <FileText size={20} />
                      </button>

                      <button
                        onClick={() => {
                          if (student.placementStatus === 'Placed') {
                            onUpdateStudentStatus(student.id);
                          } else {
                            setStatusChangeStudentId(student.id);
                            setPlacedCompanyInput('');
                            setPlacedPackageInput('');
                          }
                        }}
                        className={`btn h-12 px-6 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          student.placementStatus === 'Placed' ? 'btn-danger' : 'btn-success'
                        }`}
                        title={student.placementStatus === 'Placed' ? 'Mark as Unplaced' : 'Set Placed'}
                      >
                        {student.placementStatus === 'Placed' ? 'Mark Unplaced' : 'Set Placed'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile View Responsive Candidate Cards */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              No student records match the selected parameters.
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => setActiveMobileStudent(student)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm font-display">{student.name}</h4>
                      <span className={`sp-badge ${student.placementStatus === 'Placed' ? 'sp-badge-success' : 'sp-badge-warning'}`}>
                        {student.placementStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {student.department} • {student.cgpa} CGPA • ATS {student.resumeScore}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-xs font-bold text-blue-600 hidden xs:inline">Details</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Student Detail Popover Modal */}
      {activeMobileStudent && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col gap-5 my-auto">
            {/* Modal Top Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm">
                  {activeMobileStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg font-display">{activeMobileStudent.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{activeMobileStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveMobileStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Candidate Specs Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Department</span>
                <span className="font-bold text-slate-900 truncate block">{activeMobileStudent.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">CGPA / Backlogs</span>
                <span className="font-bold text-slate-900 block">{activeMobileStudent.cgpa} CGPA ({activeMobileStudent.backlogs} Backlogs)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">ATS Resume Score</span>
                <span className="font-bold text-emerald-600 block">{activeMobileStudent.resumeScore}% Match</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Status</span>
                <span className={`sp-badge mt-0.5 ${activeMobileStudent.placementStatus === 'Placed' ? 'sp-badge-success' : 'sp-badge-warning'}`}>
                  {activeMobileStudent.placementStatus}
                </span>
              </div>
            </div>

            {/* Placed offer details if placed */}
            {activeMobileStudent.placementStatus === 'Placed' && activeMobileStudent.placedCompany && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
                <span>Placed at: <strong>{activeMobileStudent.placedCompany}</strong></span>
                <span className="font-mono font-bold text-emerald-700">{activeMobileStudent.placedPackage}</span>
              </div>
            )}

            {/* Action Buttons inside Mobile Detail Modal */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedStudentForVisualizer(activeMobileStudent);
                  setActiveMobileStudent(null);
                }}
                className="btn bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 h-11 w-full rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <TrendingUp size={16} /> Open Stage Visualizer Pipeline
              </button>

              <button
                onClick={() => {
                  setSelectedStudentForResume(activeMobileStudent);
                  setActiveMobileStudent(null);
                }}
                className="btn btn-secondary h-11 w-full rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <FileText size={16} /> Review Resume Text & ATS Feedback
              </button>

              <button
                onClick={() => {
                  if (activeMobileStudent.placementStatus === 'Placed') {
                    onUpdateStudentStatus(activeMobileStudent.id);
                  } else {
                    setStatusChangeStudentId(activeMobileStudent.id);
                  }
                  setActiveMobileStudent(null);
                }}
                className={`btn h-12 w-full px-6 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeMobileStudent.placementStatus === 'Placed' ? 'btn-danger' : 'btn-success'
                }`}
              >
                {activeMobileStudent.placementStatus === 'Placed' ? 'Mark Unplaced' : 'Set Placed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Corporate Placement Offer Modal */}
      {statusChangeStudentId && (() => {
        const targetStudent = allStudents.find(
          (s) => s.id === statusChangeStudentId || ('registrationNo' in s && s.registrationNo === statusChangeStudentId)
        ) || null;

        return (
          <RecordPlacementOfferModal
            studentId={statusChangeStudentId}
            targetStudent={targetStudent}
            placedCompanyInput={placedCompanyInput}
            setPlacedCompanyInput={setPlacedCompanyInput}
            placedPackageInput={placedPackageInput}
            setPlacedPackageInput={setPlacedPackageInput}
            onClose={() => setStatusChangeStudentId(null)}
            onSave={handleManualStatusSave}
          />
        );
      })()}

      {/* Resume Analyzer Feedback Modal */}
      {selectedStudentForResume && (
        <div className="rp-modal-overlay">
          <div className="rp-modal-card max-w-3xl">
            {/* Modal Header */}
            <div className="rp-modal-header">
              <div className="rp-header-left">
                <div
                  className="rp-header-icon-badge"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}
                >
                  <FileText size={24} />
                </div>
                <div className="rp-header-text">
                  <h3 className="rp-modal-title">Resume Analyzer Report</h3>
                  <p className="rp-modal-subtitle">
                    Candidate ATS Evaluation & TPO Review Feedback
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
              {/* Candidate Summary Card */}
              <div className="rp-candidate-card">
                <div className="rp-candidate-info">
                  <div className="rp-candidate-avatar" style={{ backgroundColor: '#4f46e5' }}>
                    {selectedStudentForResume.name
                      ? selectedStudentForResume.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'ST'}
                  </div>
                  <div className="rp-candidate-details">
                    <h4 className="rp-candidate-name">{selectedStudentForResume.name}</h4>
                    <p className="rp-candidate-meta">
                      {selectedStudentForResume.department} • Student ID: {selectedStudentForResume.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rp-candidate-badge bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ATS {selectedStudentForResume.resumeScore}% Match
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200">
                    {selectedStudentForResume.projectsCount || 0} Projects
                  </span>
                </div>
              </div>

              {/* Extracted Resume Plain Text */}
              <div className="flex flex-col gap-2">
                <label className="rp-field-label">
                  <FileText size={14} className="text-indigo-600" />
                  Parsed Resume Content & Plain Text
                </label>
                <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800">
                  {selectedStudentForResume.resumeText || 'No resume text provided.'}
                </div>
              </div>

              {/* TPO Review Feedback Form */}
              <div className="flex flex-col gap-4 pt-2 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 font-display">
                  <Sparkles size={16} className="text-purple-600" />
                  Add TPO Review & Assessment
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Evaluation Score */}
                  <div className="rp-form-group">
                    <label className="rp-field-label">
                      <Award size={14} className="text-blue-600" />
                      ATS Evaluation Score (0-100)
                    </label>
                    <div className="rp-input-wrapper">
                      <Award size={18} className="rp-input-icon text-blue-600" />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="e.g. 85"
                        className="rp-input-field"
                        value={review.score}
                        onChange={(e) => setReview({ ...review, score: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Performance Status Rating */}
                  <div className="rp-form-group">
                    <label className="rp-field-label">
                      <Sparkles size={14} className="text-purple-600" />
                      Performance Assessment Rating
                    </label>
                    <div className="rp-input-wrapper">
                      <select
                        className="rp-input-field bg-transparent cursor-pointer font-extrabold text-slate-800"
                        value={review.status}
                        onChange={(e) => setReview({ ...review, status: e.target.value })}
                      >
                        <option value="Excellent">Excellent Candidate</option>
                        <option value="Good">Good Candidate</option>
                        <option value="Needs Improvement">Needs Improvement</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Projects Feedback */}
                <div className="rp-form-group">
                  <label className="rp-field-label">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Projects & Technical Feedback
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter project quality and technical feedback..."
                    className="rp-input-wrapper w-full focus:outline-none text-xs font-medium resize-none"
                    style={{ minHeight: '64px' }}
                    value={review.projects}
                    onChange={(e) => setReview({ ...review, projects: e.target.value })}
                  />
                </div>

                {/* Overall Summary */}
                <div className="rp-form-group">
                  <label className="rp-field-label">
                    <FileText size={14} className="text-indigo-600" />
                    Overall Evaluation & Recommendations
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter overall evaluation summary for candidate..."
                    className="rp-input-wrapper w-full focus:outline-none text-xs font-medium resize-none"
                    style={{ minHeight: '64px' }}
                    value={review.overall}
                    onChange={(e) => setReview({ ...review, overall: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="rp-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedStudentForResume(null)}
                className="rp-btn-cancel"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedStudentForResume) return;
                  onSaveFeedback(selectedStudentForResume.id, {
                    ...review,
                    status: (['Good', 'Excellent', 'Needs Improvement'].includes(review.status)
                      ? review.status
                      : 'Needs Improvement') as 'Good' | 'Excellent' | 'Needs Improvement',
                    reviewedBy: 'TPO Admin',
                    reviewedOn: new Date().toLocaleDateString()
                  });
                  setSelectedStudentForResume(null);
                }}
                className="rp-btn-save"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}
              >
                <Save size={16} /> Save Feedback Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Visualizer Modal for TPO */}
      {selectedStudentForVisualizer && (
        <div className="rp-modal-overlay">
          <div className="rp-modal-card rp-modal-card-wide">
            {/* Modal Header */}
            <div className="rp-modal-header">
              <div className="rp-header-left">
                <div
                  className="rp-header-icon-badge"
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' }}
                >
                  <TrendingUp size={24} />
                </div>
                <div className="rp-header-text">
                  <h3 className="rp-modal-title">
                    {selectedStudentForVisualizer.name}'s Stage Visualizer
                  </h3>
                  <p className="rp-modal-subtitle">
                    Live Selection Round Status & Pipeline Tracking
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForVisualizer(null)}
                className="rp-close-btn"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="rp-modal-body overflow-y-auto">
              {/* Candidate Info Summary Bar */}
              <div className="rp-candidate-card mb-2">
                <div className="rp-candidate-info">
                  <div className="rp-candidate-avatar bg-sky-600">
                    {selectedStudentForVisualizer.name
                      ? selectedStudentForVisualizer.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'ST'}
                  </div>
                  <div className="rp-candidate-details">
                    <h4 className="rp-candidate-name">{selectedStudentForVisualizer.name}</h4>
                    <p className="rp-candidate-meta">
                      {selectedStudentForVisualizer.department} • CGPA: {selectedStudentForVisualizer.cgpa} • Backlogs: {selectedStudentForVisualizer.backlogs}
                    </p>
                  </div>
                </div>

                <span
                  className={`rp-candidate-badge ${
                    selectedStudentForVisualizer.placementStatus === 'Placed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {selectedStudentForVisualizer.placementStatus}
                </span>
              </div>

              {/* Visualizer Body Container */}
              <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-inner">
                <StudentVisualizerView
                  currentStudent={{
                    id: selectedStudentForVisualizer.id,
                    name: selectedStudentForVisualizer.name,
                    email: selectedStudentForVisualizer.email,
                    password: '',
                    department: selectedStudentForVisualizer.department,
                    branch: selectedStudentForVisualizer.department,
                    cgpa: selectedStudentForVisualizer.cgpa,
                    backlogs: selectedStudentForVisualizer.backlogs,
                    skills: ['React', 'TypeScript', 'Java'],
                    placementStatus: selectedStudentForVisualizer.placementStatus,
                    resumeScore: selectedStudentForVisualizer.resumeScore ?? 80,
                    projectsCount: selectedStudentForVisualizer.projectsCount ?? 2,
                    resumeText: selectedStudentForVisualizer.resumeText ?? '',
                    applications: fetchedApplications.length > 0 ? fetchedApplications : [
                      {
                        jobPostingId: '1',
                        driveId: '1',
                        companyName: selectedStudentForVisualizer.placedCompany || 'Google',
                        role: 'Associate Software Engineer',
                        appliedDate: '2026-06-01',
                        status: selectedStudentForVisualizer.placementStatus === 'Placed' ? 'Selected' : 'Applied',
                        currentRoundIndex: 0,
                        feedback: 'Candidate under evaluation by recruitment board.'
                      }
                    ]
                  }}
                  drives={drives}
                  selectedApplicationId={selectedAppId || (fetchedApplications[0]?.jobPostingId || '1')}
                  setSelectedApplicationId={setSelectedAppId}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="rp-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedStudentForVisualizer(null)}
                className="rp-btn-save w-full justify-center"
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' }}
              >
                <CheckCircle2 size={16} />
                Done Viewing Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
