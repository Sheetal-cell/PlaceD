import React, {
  useMemo,
  useState
} from 'react';
import { Briefcase, AlertCircle, Lock, Award, CheckCircle2, Globe, Loader2 } from 'lucide-react';
import type { Student, PlacementDrive } from '../../mockData';
import { StudentOffCampusView } from './StudentOffCampusView';
import { isOnCampusDrive, isOffCampusDrive, isActiveDrive } from '../../utils/driveFilters';

interface StudentDrivesViewProps {
  currentStudent: Student;
  drives: PlacementDrive[];
  onApply: (driveId: string) => Promise<void> | void;
}

export const StudentDrivesView: React.FC<StudentDrivesViewProps> = ({
  currentStudent,
  drives,
  onApply
}) => {
  const isPlaced = currentStudent.placementStatus === 'Placed';
  const [applyingDriveId, setApplyingDriveId] = useState<string | null>(null);

  const [
    selectedRecruitmentType,
    setSelectedRecruitmentType
  ] = useState<
    'ON_CAMPUS' | 'OFF_CAMPUS'
  >('ON_CAMPUS');

  const [
    selectedRole,
    setSelectedRole
  ] = useState('ALL');

  const availableRoles = useMemo(() => {
    const roles = drives
      .filter((drive) =>
        (selectedRecruitmentType === 'ON_CAMPUS'
          ? isOnCampusDrive(drive)
          : isOffCampusDrive(drive)) && isActiveDrive(drive)
      )
      .map(
        (drive) =>
          drive.roleCategory ||
          drive.role ||
          drive.title
      )
      .filter(Boolean);

    return [
      'ALL',
      ...Array.from(
        new Set(roles)
      ).sort()
    ];
  }, [
    drives,
    selectedRecruitmentType
  ]);

  const filteredDrives = useMemo(() => {
    return drives.filter((drive) => {
      const matchesType =
        selectedRecruitmentType === 'ON_CAMPUS'
          ? isOnCampusDrive(drive)
          : isOffCampusDrive(drive);

      const matchesStatus = isActiveDrive(drive);

      const role =
        drive.roleCategory ||
        drive.role ||
        drive.title;

      const matchesRole =
        selectedRole === 'ALL' ||
        role === selectedRole;

      return (
        matchesType &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [
    drives,
    selectedRecruitmentType,
    selectedRole
  ]);

  // Core Smart Compatibility Math (EXACT UNTOUCHED ALGORITHM)
  const getCompatibility = (student: Student, drive: PlacementDrive) => {

    if (
      drive.recruitmentType === 'OFF_CAMPUS'
    ) {
      return {
        eligible: true,
        score: 0,
        matchingSkills: []
      };
    }
    const cgpaCutoff = drive.cgpaCutoff ?? 0;
    const isGpaEligible = student.cgpa >= cgpaCutoff;
    const isBacklogEligible = student.backlogs <= (drive.maxBacklogs ?? 0);
    const isBranchEligible = (drive.allowedBranches ?? []).includes(student.department);
    const eligible = isGpaEligible && isBacklogEligible && isBranchEligible;

    if (!eligible) {
      return {
        eligible: false,
        score: 0,
        reasons: [
          !isGpaEligible && `GPA cut-off is ${cgpaCutoff} (yours: ${student.cgpa})`,
          !isBacklogEligible && `Max backlogs allowed is ${drive.maxBacklogs} (yours: ${student.backlogs})`,
          !isBranchEligible && `Eligible branches: ${(drive.allowedBranches ?? []).join(', ')} (your branch: ${student.department})`
        ].filter(Boolean) as string[]
      };
    }

    const requiredSkills = drive.skillsRequired ?? [];
    const studentSkills = student.skills;
    const matchingSkills = requiredSkills.filter((s) =>
      studentSkills.some((ss) => ss.toLowerCase() === s.toLowerCase())
    );

    const skillScore = requiredSkills.length > 0 ? (matchingSkills.length / requiredSkills.length) * 70 : 70;
    const gpaBonus = Math.min(((student.cgpa - cgpaCutoff) / (10 - cgpaCutoff)) * 30, 30);
    const overallScore = Math.min(Math.round(skillScore + Math.max(0, gpaBonus)), 100);

    return { eligible: true, score: overallScore, matchingSkills };
  };

// Safe string cleaner to eliminate literal "NaN", "null", "undefined", or empty whitespace strings
const cleanString = (val?: string | number | null, fallback = 'Not specified'): string => {
  if (val == null) return fallback;
  const str = String(val).trim();
  if (
    !str ||
    str.toLowerCase() === 'nan' ||
    str.toLowerCase() === 'null' ||
    str.toLowerCase() === 'undefined'
  ) {
    return fallback;
  }
  return str;
};

  if (selectedRecruitmentType === 'OFF_CAMPUS') {
    return (
      <StudentOffCampusView
        onApply={onApply}
        selectedRecruitmentType={selectedRecruitmentType}
        onRecruitmentTypeChange={(type) => {
          setSelectedRecruitmentType(type);
          setSelectedRole('ALL');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Drives Top Header Banner */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-3">
            <Briefcase size={28} className="text-blue-600 shrink-0" />
            On-Campus Placement Drives ({filteredDrives.length})
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed">
            Real-time candidate compatibility match score calculated against corporate criteria.
          </p>
        </div>

        {isPlaced && (
          <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2 shadow-xs shrink-0">
            <Award size={18} className="text-amber-600 shrink-0" />
            <span>Placement process concluded (Placed)</span>
          </div>
        )}
      </div>

      {/* Recruitment Controls & Role Filters */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setSelectedRecruitmentType('ON_CAMPUS');
              setSelectedRole('ALL');
            }}
            className="flex-1 sm:flex-initial px-8 py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide btn btn-primary text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Briefcase size={16} />
            <span>On Campus</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRecruitmentType('OFF_CAMPUS');
              setSelectedRole('ALL');
            }}
            className="flex-1 sm:flex-initial px-8 py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Globe size={16} />
            <span>Off Campus</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <label className="text-xs sm:text-sm font-extrabold text-slate-600 shrink-0 uppercase tracking-wider font-display">
            Role
          </label>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="input-field min-w-44 sm:min-w-60 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-50/80 border border-slate-200 cursor-pointer"
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role === 'ALL' ? 'All Roles' : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="flex flex-col gap-6">
        {filteredDrives.map((drive) => {
          const matchResult = getCompatibility(currentStudent, drive);
          const hasApplied = currentStudent.applications.some(
            (a) => String(a.driveId) === String(drive.id) || String(a.jobPostingId) === String(drive.id)
          );
          const application = currentStudent.applications.find((a) => a.driveId === drive.id);

          return (
            <div
              key={drive.id}
              className={`glass-card p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row justify-between md:items-stretch gap-6 ${
                matchResult.eligible ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'
              }`}
            >
              {/* Left Drive Info */}
              <div className="flex-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                      {drive.companyName.charAt(0)}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900 font-display tracking-tight">
                          {drive.companyName}
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-mono font-bold text-xs">
                          {drive.package}
                        </span>
                        {hasApplied && (
                          <span
                            className={`sp-badge ${
                              application?.status === 'Selected'
                                ? 'sp-badge-success'
                                : application?.status === 'Rejected'
                                ? 'sp-badge-danger'
                                : 'sp-badge-info'
                            }`}
                          >
                            Status: {application?.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-blue-600">{drive.title}</p>
                    </div>
                  </div>

                  {cleanString(drive.description, '') && (
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {cleanString(drive.description, 'No description provided.')}
                    </p>
                  )}
                </div>

                {drive.recruitmentType !== 'OFF_CAMPUS' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 bg-slate-50/90 p-4 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Min CGPA
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {drive.cgpaCutoff != null ? `${drive.cgpaCutoff} CGPA` : '7 CGPA'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Max Backlogs
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {drive.maxBacklogs ?? 0}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Branches
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate block" title={drive.allowedBranches?.join(', ') || 'Computer Science, Information Technology, Electronics'}>
                        {drive.allowedBranches && drive.allowedBranches.length > 0
                          ? drive.allowedBranches.join(', ')
                          : 'Computer Science, Information Technology, Electronics'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Grad Batch
                      </span>
                      <span className="font-bold text-indigo-600 text-xs">
                        {cleanString(drive.eligibleBatch, 'Not specified')}
                      </span>
                    </div>
                  </div>
                ) : (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 bg-slate-50/90 p-4 rounded-xl border border-slate-200/80 text-xs">

    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
        Job Type
      </span>

      <span className="font-bold text-slate-900">
        {drive.jobType || 'Not specified'}
      </span>
    </div>

    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
        Source
      </span>

      <span className="font-bold text-slate-900">
        {drive.source || 'External'}
      </span>
    </div>

    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
        Category
      </span>

      <span className="font-bold text-slate-900">
        {drive.roleCategory || drive.title}
      </span>
    </div>

    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
        Posted
      </span>

      <span className="font-bold text-slate-900">
        {drive.postedAt
          ? new Date(drive.postedAt).toLocaleDateString()
          : 'Recently'}
      </span>
    </div>

  </div>
)}

                {/* Skills Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(drive.skillsRequired ?? []).map((skill) => {
                    const hasSkill = currentStudent.skills.some(
                      (ss) => ss.toLowerCase() === skill.toLowerCase()
                    );
                    return (
                      <span
                        key={skill}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                          hasSkill
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {hasSkill && <span className="text-emerald-600 font-bold">✓</span>}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Right Compatibility Panel & Apply Action */}
              <div className="flex flex-col items-center justify-between p-5 rounded-2xl bg-slate-50/90 min-w-52.5 w-full md:w-auto border border-slate-200/80 text-center shrink-0 gap-4">
                {matchResult.eligible ? (
                  <>
                    <div className="flex flex-col items-center py-2">
                      <div className="text-4xl font-black text-emerald-600 font-display">
                        {matchResult.score}%
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest mt-1">
                        Compatibility Score
                      </span>
                    </div>

                    {drive.recruitmentType === 'OFF_CAMPUS' ? (
                      <button
                        type="button"
                        disabled={!drive.applyUrl}
                        onClick={() => {
                          if (drive.applyUrl) {
                            window.open(
                              drive.applyUrl,
                              '_blank',
                              'noopener,noreferrer'
                            );
                          }
                        }}
                        className="btn btn-primary h-11 w-full rounded-xl text-xs font-bold shadow-md"
                      >
                        {drive.applyUrl
                          ? `Apply on ${drive.source || 'Job Portal'}`
                          : 'Application Link Unavailable'}
                      </button>
                    ) : hasApplied ? (
                      <button
                        type="button"
                        disabled
                        className="btn h-11 w-full rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed opacity-90 flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle2 size={16} />
                        Applied
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={applyingDriveId === drive.id}
                        onClick={async () => {
                          setApplyingDriveId(drive.id);
                          try {
                            await onApply(drive.id);
                          } finally {
                            setApplyingDriveId(null);
                          }
                        }}
                        className="btn btn-primary h-11 w-full rounded-xl text-xs font-extrabold shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        {applyingDriveId === drive.id ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Applying...
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-full flex flex-col gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5">
                        <AlertCircle size={15} />
                        Ineligible
                      </div>

                      <div className="flex flex-col gap-1.5 mt-2 text-[11px] text-slate-500 text-left w-full leading-tight font-medium">
                        {matchResult.reasons?.map((reason, i) => (
                          <p key={i}>• {reason}</p>
                        ))}
                      </div>
                    </div>

                    <button
                      disabled
                      className="btn btn-secondary h-11 w-full rounded-xl text-xs font-bold opacity-60 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 flex items-center justify-center gap-1.5"
                    >
                      <Lock size={15} />
                      Locked
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
