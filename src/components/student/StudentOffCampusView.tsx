import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  Briefcase,
  AlertCircle,
  Tag,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { jobPostingApi } from '../../api/jobPostingApi';
import type { JobPostingResponse } from '../../api/types';
import { isOffCampusDrive, isActiveDrive } from '../../utils/driveFilters';

interface StudentOffCampusViewProps {
  onApply?: (driveId: string) => void;
  selectedRecruitmentType?: 'ON_CAMPUS' | 'OFF_CAMPUS';
  onRecruitmentTypeChange?: (type: 'ON_CAMPUS' | 'OFF_CAMPUS') => void;
}

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

export const StudentOffCampusView: React.FC<StudentOffCampusViewProps> = ({
  onApply,
  selectedRecruitmentType = 'OFF_CAMPUS',
  onRecruitmentTypeChange
}) => {
  const [jobs, setJobs] = useState<JobPostingResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Explicit search input state vs applied search query state
  const [searchInput, setSearchInput] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');

  const fetchOffCampusJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    console.log('[OffCampus] Fetching jobs from /job-postings/all');

    try {
      const allPostings = await jobPostingApi.getAll();
      const offCampusOnly = (allPostings || []).filter((job) => isOffCampusDrive(job) && isActiveDrive(job));

      console.log('[OffCampus] OFF_CAMPUS jobs count:', offCampusOnly.length);
      setJobs(offCampusOnly);
    } catch (err: any) {
      console.error('[OffCampus] Failed to fetch off-campus jobs:', err);
      setError('Unable to load off-campus opportunities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffCampusJobs();
  }, [fetchOffCampusJobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSubmittedQuery('');
  };

  const filteredJobs = useMemo(() => {
    if (!submittedQuery.trim()) return jobs;

    const query = submittedQuery.trim().toLowerCase();

    return jobs.filter((job) => {
      const title = (job.title || '').toLowerCase();
      const companyName = (job.companyName || '').toLowerCase();
      const location = (job.location || '').toLowerCase();
      const department = (job.department || '').toLowerCase();
      const description = (job.description || '').toLowerCase();
      const requiredSkills = (job.requiredSkills || '').toLowerCase();
      const roleCategory = (job.roleCategory || '').toLowerCase();

      return (
        (title !== 'nan' && title.includes(query)) ||
        (companyName !== 'nan' && companyName.includes(query)) ||
        (location !== 'nan' && location.includes(query)) ||
        (department !== 'nan' && department.includes(query)) ||
        (description !== 'nan' && description.includes(query)) ||
        (requiredSkills !== 'nan' && requiredSkills.includes(query)) ||
        (roleCategory !== 'nan' && roleCategory.includes(query))
      );
    });
  }, [jobs, submittedQuery]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* 1. Page Header styled with Dashboard Hero Theme (TOP OF OFF CAMPUS SECTION) */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-3">
            <Globe size={28} className="text-blue-600 shrink-0" />
            <span>Off-Campus Jobs</span>
            {!loading && !error && (
              <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-blue-600 text-white font-mono shadow-2xs">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'}
              </span>
            )}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed">
            Explore real-time off-campus career opportunities aggregated directly from corporate & recruitment portals.
          </p>
        </div>
      </div>

      {/* 2. On-Campus / Off-Campus Switcher Control (BELOW TOP HEADER) */}
      {onRecruitmentTypeChange && (
        <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onRecruitmentTypeChange('ON_CAMPUS')}
              className={`flex-1 sm:flex-initial px-8 py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                selectedRecruitmentType === 'ON_CAMPUS'
                  ? 'btn btn-primary text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Briefcase size={16} />
              <span>On Campus</span>
            </button>

            <button
              type="button"
              onClick={() => onRecruitmentTypeChange('OFF_CAMPUS')}
              className={`flex-1 sm:flex-initial px-8 py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                selectedRecruitmentType === 'OFF_CAMPUS'
                  ? 'btn btn-primary text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Globe size={16} />
              <span>Off Campus</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Search Area styled matching Profile Settings Form */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="relative flex items-center w-full flex-1">
            <Search
              size={20}
              className="absolute left-4 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search jobs by title, company, location, department, description, skills, or role category"
              className="input-field w-full pl-12 pr-10 py-3.5 bg-slate-50/90 border border-slate-200 text-sm font-medium rounded-xl focus:bg-white transition-all placeholder:text-slate-400"
            />
            {(searchInput || submittedQuery) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3.5 p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors text-xs font-bold cursor-pointer"
                aria-label="Clear search"
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full md:w-auto px-8 py-3.5 text-sm font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Search size={18} />
            <span>Search</span>
          </button>
        </form>

        {submittedQuery && (
          <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-500 font-medium">
            <span>
              Showing results matching: <strong className="text-blue-700 font-bold">"{submittedQuery}"</strong>
            </span>
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-600">
            Loading off-campus opportunities...
          </p>
        </div>
      )}

      {/* API Error State */}
      {!loading && error && (
        <div className="p-8 bg-rose-50/80 rounded-2xl border border-rose-200 text-center flex flex-col items-center justify-center gap-4">
          <AlertCircle size={40} className="text-rose-500" />
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-rose-900 font-display">
              {error}
            </h3>
            <p className="text-sm text-rose-700 font-medium">
              Please check your connection or login status and try again.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchOffCampusJobs()}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Off-Campus Jobs Available in API */}
      {!loading && !error && jobs.length === 0 && (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Globe size={32} />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              No off-campus opportunities available right now.
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Please check back later for newly available opportunities.
            </p>
          </div>
        </div>
      )}

      {/* Empty Search Results */}
      {!loading && !error && jobs.length > 0 && filteredJobs.length === 0 && (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Search size={32} />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              No jobs found
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              We couldn't find any off-campus opportunities matching your search.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearSearch}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Clear Search Filter
          </button>
        </div>
      )}

      {/* Job Results Grid */}
      {!loading && !error && filteredJobs.length > 0 && (
        <div className="flex flex-col gap-6">
          {filteredJobs.map((job) => {
            const companyDisplayName = cleanString(job.companyName, 'Company not specified');
            const initialLetter = companyDisplayName.charAt(0).toUpperCase();

            // Skill parsing
            const rawSkills = cleanString(job.requiredSkills, '');
            const skillsList = rawSkills
              ? rawSkills
                  .split(',')
                  .map((s) => s.trim())
                  .filter((s) => s && s.toLowerCase() !== 'nan')
              : [];

            const formattedSalary =
              job.salary != null && !isNaN(job.salary) && job.salary > 0
                ? `${job.salary} LPA`
                : 'Not disclosed';

            const formattedDeadline = job.deadline
              ? new Date(job.deadline).toLocaleDateString()
              : null;

            const formattedPostedAt = job.postedAt
              ? new Date(job.postedAt).toLocaleDateString()
              : job.scrapedDate
              ? new Date(job.scrapedDate).toLocaleDateString()
              : null;

            const validApplyUrl =
              job.applyUrl &&
              job.applyUrl.trim() &&
              job.applyUrl.trim().toLowerCase() !== 'nan'
                ? job.applyUrl.trim()
                : null;

            const descriptionText = cleanString(job.description, 'No description provided.');

            return (
              <div
                key={job.id}
                className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row justify-between md:items-stretch gap-6 border-l-4 border-l-blue-500"
              >
                {/* Main Content Info */}
                <div className="flex-1 flex flex-col justify-between gap-5">
                  <div className="flex flex-col gap-4">
                    {/* Top Row: Company & Title */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                        {initialLetter}
                      </div>

                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-xl font-bold text-slate-900 font-display tracking-tight truncate">
                            {companyDisplayName}
                          </h3>

                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-mono font-bold text-xs">
                            {formattedSalary}
                          </span>

                          {job.status && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              {job.status}
                            </span>
                          )}
                        </div>

                        <p className="text-base font-bold text-blue-600 flex items-center gap-2">
                          <Briefcase size={16} className="shrink-0" />
                          <span>{cleanString(job.title, 'Title not specified')}</span>
                        </p>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                          <MapPin size={12} /> Location
                        </span>
                        <span className="font-bold text-slate-800 truncate block">
                          {cleanString(job.location, 'Location not specified')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                          <Building2 size={12} /> Department
                        </span>
                        <span className="font-bold text-slate-800 truncate block">
                          {cleanString(job.department, 'Not specified')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                          <Layers size={12} /> Category
                        </span>
                        <span className="font-bold text-slate-800 truncate block">
                          {cleanString(job.roleCategory, 'Not specified')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                          <Clock size={12} /> Job Type
                        </span>
                        <span className="font-bold text-slate-800 truncate block">
                          {cleanString(job.jobType, 'Not specified')}
                        </span>
                      </div>
                    </div>

                    {/* Optional Eligibility Info (if backend populates) */}
                    {(job.eligibleCGPACutoff != null ||
                      job.allowedBacklogs != null ||
                      job.allowedBranches ||
                      formattedDeadline) && (
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50/50 px-3.5 py-2 rounded-lg border border-slate-100">
                        {job.eligibleCGPACutoff != null && (
                          <span>Cutoff: <strong className="text-slate-900">{job.eligibleCGPACutoff} CGPA</strong></span>
                        )}
                        {job.allowedBacklogs != null && (
                          <span>Max Backlogs: <strong className="text-slate-900">{job.allowedBacklogs}</strong></span>
                        )}
                        {job.allowedBranches && (
                          <span>Branches: <strong className="text-slate-900">{job.allowedBranches}</strong></span>
                        )}
                        {formattedDeadline && (
                          <span className="flex items-center gap-1 text-amber-700">
                            <Calendar size={13} /> Deadline: <strong>{formattedDeadline}</strong>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description (cleanString eliminates literal "NaN") */}
                    {descriptionText !== 'No description provided.' && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
                        {descriptionText}
                      </p>
                    )}
                  </div>

                  {/* Skills Pills & Source Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {skillsList.length > 0 ? (
                        skillsList.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center gap-1"
                          >
                            <Tag size={11} className="text-slate-400" />
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">
                          Skills not specified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                      {job.source && cleanString(job.source, '') && (
                        <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          Source: {cleanString(job.source, 'External')}
                        </span>
                      )}
                      {formattedPostedAt && (
                        <span className="font-medium">Posted: {formattedPostedAt}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Apply Action Side Panel */}
                <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50/90 min-w-52.5 w-full md:w-auto border border-slate-200/80 text-center shrink-0 gap-4">
                  <div className="flex flex-col items-center gap-1 py-1">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={12} /> External Hiring
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium mt-1">
                      Direct Company Application
                    </span>
                  </div>

                  {validApplyUrl ? (
                    <a
                      href={validApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (onApply) {
                          onApply(String(job.id));
                        }
                      }}
                      className="btn btn-primary h-11 w-full rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer no-underline text-white"
                    >
                      <span>Apply Now ↗</span>
                      <ExternalLink size={16} />
                    </a>
                  ) : onApply ? (
                    <button
                      type="button"
                      onClick={() => onApply(String(job.id))}
                      className="btn btn-primary h-11 w-full rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer text-white"
                    >
                      <span>Apply Now</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="btn h-11 w-full rounded-xl text-xs font-bold bg-slate-200/80 text-slate-500 border border-slate-300/80 cursor-not-allowed opacity-80 shadow-2xs"
                    >
                      Application Link Unavailable
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
