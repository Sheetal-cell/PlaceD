import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { jobPostingApi } from '../api/jobPostingApi';
import type { Student, PlacementDrive, ResumeFeedback, Recruiter } from '../mockData';
import type { StudentWithPlacement, DriveWithCompany, CalendarEvent } from '../api/types';
import { Footer } from './Footer';
import { ScrapedDrives } from './scrapper/ScrapedDrives';
import CalendarPage from './calendar/CalendarPage';
import HROutreach from './hr/HROutreach';
import { AdminAlumniManagementView } from './admin/AdminAlumniManagementView';
import type { Alumni } from '../api/alumniApi';

// Import Redesigned Admin Components & Scoped CSS
import './admin/AdminPortal.css';
import { AdminSidebar, type AdminTabType } from './admin/AdminSidebar';
import { AdminMobileDrawer } from './admin/AdminMobileDrawer';
import { AdminDashboardView } from './admin/AdminDashboardView';
import { AdminDrivesView } from './admin/AdminDrivesView';
import { AdminStudentDatabaseView } from './admin/AdminStudentDatabaseView';
import { AdminLiveTrackerView } from './admin/AdminLiveTrackerView';
import { isOnCampusDrive } from '../utils/driveFilters';

interface AdminPortalProps {
  students: Student[];
  drives: PlacementDrive[];
  alumni: Alumni[];
  recruiters?: Recruiter[];

  onApproveRecruiter?: (id: string | number) => void;
  onApproveAlumni: (id: string) => void;
  onRejectAlumni: (id: string) => void;
  calendarEvents?: CalendarEvent[];
  onAddCalendarEvent?: (newEvent: CalendarEvent) => void;
  onLogout: () => void;
  onAddDrive: (drive: Omit<PlacementDrive, 'id' | 'registeredCount'>) => void;
  onToggleDriveActive: (driveId: string) => void;
  onUpdateStudentStatus: (studentId: string, company?: string, salaryPackage?: string) => void;
  onPromoteStudent: (studentId: string, driveId: string, newRoundIndex: number, isFinalSelection: boolean) => void;
  onRejectStudent: (studentId: string, driveId: string) => void;
  onSeedData?: () => void;
  onSaveFeedback: (studentId: string, feedback: ResumeFeedback) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  students,
  drives,
  alumni,
  recruiters = [],
  onApproveRecruiter,
  onApproveAlumni,
  onRejectAlumni,
  calendarEvents,
  onAddCalendarEvent,
  onSaveFeedback,
  onToggleDriveActive,
  onUpdateStudentStatus,
  onPromoteStudent,
  onRejectStudent,
  onSeedData
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string): AdminTabType => {
    if (path.includes('/admin/drives')) return 'drives';
    if (path.includes('/admin/students')) return 'students';
    if (path.includes('/admin/alumni')) return 'alumni';
    if (path.includes('/admin/calendar')) return 'calendar';
    if (path.includes('/admin/tracker') || path.includes('/admin/live-tracker')) return 'tracker';
    if (path.includes('/admin/scraped')) return 'scraped';
    if (path.includes('/admin/hr')) return 'hr';
    return 'dashboard';
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleTabChange = (tab: AdminTabType) => {
    const routeMap: Record<AdminTabType, string> = {
      dashboard: '/admin/dashboard',
      drives: '/admin/drives',
      students: '/admin/students',
      calendar: '/admin/calendar',
      tracker: '/admin/tracker',
      scraped: '/admin/scraped',
      hr: '/admin/hr',
      alumni: '/admin/alumni'
    };
    navigate(routeMap[tab]);
  };

  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // New Drive Form State
  const [showDriveForm, setShowDriveForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [role, setRole] = useState('');
  const [pkg, setPkg] = useState('');
  const [numericPkg, setNumericPkg] = useState(6);
  const [cgpaCutoff, setCgpaCutoff] = useState(7.0);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [allowedBranches, setAllowedBranches] = useState<string[]>(['Computer Science', 'Information Technology']);
  const [deadline, setDeadline] = useState('2026-06-30');
  const [jobDesc, setJobDesc] = useState('');
  const [skillsRequiredText, setSkillsRequiredText] = useState('React, JavaScript, Node.js');
  const [roundsText, setRoundsText] = useState('Aptitude Test, Technical Interview, HR Interview');



// Real Drives API & State
  const [realDrives, setRealDrives] = useState<DriveWithCompany[] | null>(null);
  useEffect(() => {
  jobPostingApi
    .getAllWithCompanyInfo()
    .then((apiDrives) => {

      setRealDrives(apiDrives);
    })
    .catch((error) => {
      console.error(
        'Failed to load recruitment drives:',
        error
      );
    });
}, []);

  const rawEffectiveDrives: (DriveWithCompany | PlacementDrive)[] = realDrives ?? drives;
  const effectiveDrives: (DriveWithCompany | PlacementDrive)[] = useMemo(() => {
    return rawEffectiveDrives.filter(isOnCampusDrive);
  }, [rawEffectiveDrives]);

  // Roster Filter State
  const [studentSearch, setStudentSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minCgpaFilter, setMinCgpaFilter] = useState(5.0);
  const [minAtsFilter, setMinAtsFilter] = useState(0);

  // Resume Review Modal State
  const [selectedStudentForResume, setSelectedStudentForResume] = useState<(Student | StudentWithPlacement) | null>(null);
  const [review, setReview] = useState({
    score: 80,
    status: 'Good',
    projects: '',
    skills: '',
    experience: '',
    ats: '',
    overall: ''
  });

  // Manual Status Change State
  const [statusChangeStudentId, setStatusChangeStudentId] = useState<string | null>(null);
  const [placedCompanyInput, setPlacedCompanyInput] = useState('');
  const [placedPackageInput, setPlacedPackageInput] = useState('');

  // Mobile details popover state
  const [, setActivePopoverStudent] = useState<(Student | StudentWithPlacement) | null>(null);

  // Live Round Tracker State
  const [trackerDriveId, setTrackerDriveId] = useState<string>(effectiveDrives[0]?.id || '');

  // Combined Students Roster (Deduplicated cleanly by student ID / email)
  const allStudents = useMemo(() => {
    const seen = new Set<string>();
    const result: (Student | StudentWithPlacement)[] = [];
    for (const student of students) {
      const key = String(student.id || student.email).trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(student);
      }
    }
    return result;
  }, [students]);

  // Analytics Computations (EXACT UNTOUCHED ALGORITHM)
  const totalStudentsCount = allStudents.length;
  const placedStudents = allStudents.filter((s) => s.placementStatus === 'Placed');
  const placedCount = placedStudents.length;
  const placementRate = totalStudentsCount > 0 ? Math.round((placedCount / totalStudentsCount) * 100) : 0;
  const activeDrivesCount = effectiveDrives.filter((d) => d.status === 'OPEN').length;

  const totalPackageSum = placedStudents.reduce((sum, s) => {
    if (!s.placedPackage) return sum;
    const num = parseFloat(String(s.placedPackage).replace(/[^\d.]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
  const averagePackage = placedCount > 0 ? (totalPackageSum / placedCount).toFixed(1) : '0.0';

  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Electrical', 'Mechanical', 'Civil', 'Chemical'];
  const branchData = branches.map((br) => {
    const branchStudents = allStudents.filter((s) => s.department === br);
    const branchPlaced = branchStudents.filter((s) => s.placementStatus === 'Placed');
    const pct = branchStudents.length > 0 ? Math.round((branchPlaced.length / branchStudents.length) * 100) : 0;
    return { name: br, pct, total: branchStudents.length, placed: branchPlaced.length };
  });

  // Handlers
  const handleDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim() || !companyLocation.trim()) return;

    const safeNumericPkg = Number.isNaN(Number(numericPkg)) ? 0 : Number(numericPkg);
    const safeCgpaCutoff = Number.isNaN(Number(cgpaCutoff)) ? 0 : Number(cgpaCutoff);
    const safeMaxBacklogs = Number.isNaN(Number(maxBacklogs)) ? 0 : Number(maxBacklogs);
    const cleanDesc = jobDesc.trim() || 'Recruitment drive for software engineering candidates.';
    const cleanLocation = jobLocation.trim() || companyLocation.trim() || 'Campus';
    const cleanWebsite = companyWebsite.trim()
      ? (companyWebsite.trim().startsWith('http://') || companyWebsite.trim().startsWith('https://')
          ? companyWebsite.trim()
          : `https://${companyWebsite.trim()}`)
      : undefined;

    try {
      const newDrive = await jobPostingApi.createDrive(
        companyName.trim(),
        cleanLocation,
        cleanWebsite,
        {
          title: role.trim(),
          description: cleanDesc,
          location: cleanLocation,
          eligibleCGPACutoff: safeCgpaCutoff,
          allowedBacklogs: safeMaxBacklogs,
          allowedBranches: allowedBranches.join(', '),
          eligibleBatch: '2026 Batch',
          requiredSkills: skillsRequiredText.trim(),
          salary: safeNumericPkg,
          deadline: deadline || new Date().toISOString().split('T')[0],
          recruitmentType: 'CAMPUS',
          sourceType: 'TPO'
        }
      );
      setRealDrives((prev) => (prev ? [newDrive, ...prev] : [newDrive]));
      setShowDriveForm(false);
      setRole('');
      setCompanyName('');
      setCompanyLocation('');
      setCompanyWebsite('');
      setJobLocation('');
      setPkg('');
      setNumericPkg(6);
      setCgpaCutoff(7.0);
      setMaxBacklogs(0);
      setJobDesc('');
      setSkillsRequiredText('React, JavaScript, Node.js');
      setRoundsText('Aptitude Test, Technical Interview, HR Interview');
    } catch (err) {
      console.error('Failed to create recruitment drive:', err);
      alert('Failed to create recruitment drive. Please check backend connection.');
    }
  };

  const handleBranchCheckbox = (branch: string) => {
    if (allowedBranches.includes(branch)) {
      setAllowedBranches(allowedBranches.filter((b) => b !== branch));
    } else {
      setAllowedBranches([...allowedBranches, branch]);
    }
  };

  const filteredStudents = allStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.registrationNumber &&
        student.registrationNumber.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchesBranch = branchFilter === 'All' || student.department === branchFilter;
    const matchesStatus = statusFilter === 'All' || student.placementStatus === statusFilter;
    const matchesCgpa = student.cgpa >= minCgpaFilter;
    const matchesAts = (student.resumeScore ?? 0) >= minAtsFilter;
    return matchesSearch && matchesBranch && matchesStatus && matchesCgpa && matchesAts;
  });

  const handleManualStatusSave = (studentId: string) => {
    if (!placedCompanyInput.trim() || !placedPackageInput.trim()) return;
    onUpdateStudentStatus(studentId, placedCompanyInput.trim(), placedPackageInput.trim() + ' LPA');
    setStatusChangeStudentId(null);
    setPlacedCompanyInput('');
    setPlacedPackageInput('');
  };

  const handleToggleDriveStatus = async (drive: DriveWithCompany | PlacementDrive) => {
    const nextStatus = drive.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    if (!realDrives) {
      onToggleDriveActive(drive.id);
      return;
    }
    try {
      await jobPostingApi.updateStatus(Number(drive.id), nextStatus);
      setRealDrives((prev) =>
        prev ? prev.map((d) => (d.id === drive.id ? { ...d, status: nextStatus } : d)) : prev
      );
    } catch (err) {
      console.error('Failed to update drive status:', err);
      alert('Failed to update status — check console for details.');
    }
  };

  const activeTrackerDrive = effectiveDrives.find((d) => d.id === trackerDriveId);
  const activeTrackerApplications = students.flatMap((s) =>
    s.applications
      .filter((app) => app.jobPostingId === trackerDriveId && app.status !== 'Rejected' && app.status !== 'Selected')
      .map((app) => ({ student: s, app }))
  );

  const handleDownloadStudents = () => {
  const headers = [
    'Name',
    'Email',
    'Registration Number',
    'Department',
    'CGPA',
    'Backlogs',
    'Placement Status',
    'Placed Company',
    'Placed Package',
    'ATS Score'
  ];

  const rows = filteredStudents.map((student) => [
    student.name,
    student.email,
    student.registrationNumber || '',
    student.department,
    student.cgpa,
    student.backlogs,
    student.placementStatus,
    student.placedCompany || '',
    student.placedPackage || '',
    student.resumeScore ?? 0
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'students-filtered.csv';
  link.click();

  URL.revokeObjectURL(url);
};

  return (
    <div className="ap-layout">
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-3 h-16 flex items-center justify-between gap-4 shadow-2xs">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-extrabold text-sm border border-blue-200/80 transition-all cursor-pointer flex items-center gap-2.5 shadow-2xs active:scale-95 shrink-0 min-h-[44px]"
        >
          <Menu size={22} className="text-blue-600 shrink-0" />
          <span className="font-display">Admin Menu</span>
        </button>
        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 font-mono truncate">
          {activeTab}
        </span>
      </div>

      <div className="ap-main-shell">
        {/* Persistent Desktop Sidebar (72px -> 280px Width Transition) */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded((prev) => !prev)}
          onSeedData={onSeedData}
        />

        {/* Mobile Navigation Drawer */}
        <AdminMobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onSeedData={onSeedData}
        />

        {/* Main Content Workspace Area */}
        <div className="ap-content-wrapper">
          <main className="ap-workspace">
            {activeTab === 'dashboard' && (
              <AdminDashboardView
                totalStudentsCount={totalStudentsCount}
                placedCount={placedCount}
                placementRate={placementRate}
                activeDrivesCount={activeDrivesCount}
                averagePackage={averagePackage}
                effectiveDrives={effectiveDrives}
                branchData={branchData}
              />
            )}

            {activeTab === 'drives' && (
              <AdminDrivesView
                showDriveForm={showDriveForm}
                setShowDriveForm={setShowDriveForm}
                handleDriveSubmit={handleDriveSubmit}
                companyName={companyName}
                setCompanyName={setCompanyName}
                companyLocation={companyLocation}
                setCompanyLocation={setCompanyLocation}
                companyWebsite={companyWebsite}
                setCompanyWebsite={setCompanyWebsite}
                role={role}
                setRole={setRole}
                jobLocation={jobLocation}
                setJobLocation={setJobLocation}
                pkg={pkg}
                setPkg={setPkg}
                numericPkg={numericPkg}
                setNumericPkg={setNumericPkg}
                cgpaCutoff={cgpaCutoff}
                setCgpaCutoff={setCgpaCutoff}
                maxBacklogs={maxBacklogs}
                setMaxBacklogs={setMaxBacklogs}
                allowedBranches={allowedBranches}
                handleBranchCheckbox={handleBranchCheckbox}
                branches={branches}
                deadline={deadline}
                setDeadline={setDeadline}
                jobDesc={jobDesc}
                setJobDesc={setJobDesc}
                skillsRequiredText={skillsRequiredText}
                setSkillsRequiredText={setSkillsRequiredText}
                roundsText={roundsText}
                setRoundsText={setRoundsText}
                effectiveDrives={effectiveDrives}
                handleToggleDriveStatus={handleToggleDriveStatus}
              />
            )}

            {activeTab === 'alumni' && (
              <AdminAlumniManagementView
                alumni={alumni}
                recruiters={recruiters}
                onApproveRecruiter={onApproveRecruiter}
                onApprove={onApproveAlumni}
                onReject={onRejectAlumni}
              />
            )}

            {activeTab === 'scraped' && <ScrapedDrives />}

            {activeTab === 'calendar' && (
              <div className="ap-card animate-fade-in">
                <CalendarPage events={calendarEvents} onAddEvent={onAddCalendarEvent} />
              </div>
            )}

            {activeTab === 'students' && (
              <AdminStudentDatabaseView
                filteredStudents={filteredStudents}
                allStudents={allStudents}
                studentSearch={studentSearch}
                setStudentSearch={setStudentSearch}
                branchFilter={branchFilter}
                setBranchFilter={setBranchFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                minCgpaFilter={minCgpaFilter}
                setMinCgpaFilter={setMinCgpaFilter}
                minAtsFilter={minAtsFilter}
                setMinAtsFilter={setMinAtsFilter}
                branches={branches}
                selectedStudentForResume={selectedStudentForResume}
                setSelectedStudentForResume={setSelectedStudentForResume}
                review={review}
                setReview={setReview}
                statusChangeStudentId={statusChangeStudentId}
                setStatusChangeStudentId={setStatusChangeStudentId}
                placedCompanyInput={placedCompanyInput}
                setPlacedCompanyInput={setPlacedCompanyInput}
                placedPackageInput={placedPackageInput}
                setPlacedPackageInput={setPlacedPackageInput}
                setActivePopoverStudent={setActivePopoverStudent}
                onUpdateStudentStatus={onUpdateStudentStatus}
                onSaveFeedback={onSaveFeedback}
                handleManualStatusSave={handleManualStatusSave}
                drives={drives}
                onDownloadStudents={handleDownloadStudents}
              />
            )}

            {activeTab === 'tracker' && (
              <AdminLiveTrackerView
                trackerDriveId={trackerDriveId}
                setTrackerDriveId={setTrackerDriveId}
                effectiveDrives={effectiveDrives}
                activeTrackerDrive={activeTrackerDrive}
                activeTrackerApplications={activeTrackerApplications}
                onPromoteStudent={onPromoteStudent}
                onRejectStudent={onRejectStudent}
              />
            )}

            {activeTab === 'hr' && <HROutreach />}
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
};