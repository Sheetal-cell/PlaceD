import React, { useEffect, useState } from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';

import { Auth } from './components/Auth';
import { StudentPortal } from './components/StudentPortal';
import { AdminPortal } from './components/AdminPortal';
import { RecruiterPortal } from './components/RecruiterPortal';
import { AlumniPortal } from './components/AlumniPortal';

import { LandingPage } from './components/LandingPage';
import { FeaturesPage } from './components/FeaturesPage';
import { HowItWorksPage } from './components/HowItWorksPage';

import { Notification } from './components/Notification';
import { NotificationBell } from './components/student/NotificationBell';
import { RouteLoadingBar } from './components/RouteLoadingBar';
import placedLogo from './assets/placed_logo.png';

import type { ToastType } from './components/Notification';

import type {
  Student,
  PlacementDrive,
  Application,
  Recruiter,
  ResumeFeedback,
} from './mockData';

import type {
  CalendarEvent,
  JobPostingRequest,
  Role,
} from './api/types';

import {
  alumniApi,
  type Alumni,
  type Blog,
  type Referral,
  type AlumniRegistrationRequest,
  type AlumniProfileRequest
} from './api/alumniApi';

import { studentApi } from './api/studentApi';
import { jobPostingApi } from './api/jobPostingApi';
import { recruiterApi } from './api/recruiterApi';
import { calendarApi } from './api/calendarApi';
import { applicationApi } from './api/applicationApi';
import { authApi } from './api/authApi';

import {
  LogOut,
  Shield,
  Building2,
  Award,
  Menu,
  X,
} from 'lucide-react';

import { motion } from 'motion/react';


/* =========================================================
   SESSION TYPES
========================================================= */

type UserRole =
  | 'student'
  | 'admin'
  | 'recruiter'
  | 'alumni';

interface Session {
  role: UserRole;
  studentId?: string;
  recruiterId?: string;
  alumniId?: string;
}


/* =========================================================
   PROTECTED ROUTE
========================================================= */

const ProtectedRoute = ({
  children,
  allowedRole,
  session,
}: {
  children: React.ReactElement;
  allowedRole: UserRole;
  session: Session | null;
}) => {
  /*
   * User is not logged in.
   */
  if (!session) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  /*
   * User is logged in but trying to access
   * another role's portal.
   */
  if (session.role !== allowedRole) {
    return (
      <Navigate
        to={`/${session.role}`}
        replace
      />
    );
  }

  return children;
};


/* =========================================================
   LANDING PAGE NAVIGATION
========================================================= */

function NavLinksWithSlidingUnderline() {
  const location = useLocation();
  const navigate = useNavigate();

  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  const desktopNavItems = [
    {
      path: '/',
      label: 'About',
    },
    {
      path: '/features',
      label: 'Features',
    },
    {
      path: '/how-it-works',
      label: 'How it Works',
    },
  ];

  const mobileNavItems = [
    {
      path: '/',
      label: 'About',
    },
    {
      path: '/how-it-works',
      label: 'How It Works',
    },
    {
      path: '/features',
      label: 'Features',
    },
  ];

  const activePath =
    hoveredPath !== null
      ? hoveredPath
      : location.pathname;

  // Close mobile dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex items-center gap-2 relative" ref={mobileMenuRef}>
      <nav
        className="landing-nav-links"
        onMouseLeave={() => setHoveredPath(null)}
      >
        {desktopNavItems.map((item) => {
          const isRouteActive =
            location.pathname === item.path;

          const isTargeted =
            activePath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={() =>
                setHoveredPath(item.path)
              }
              className={`
                landing-nav-link
                relative
                py-1
                px-1
                transition-colors
                duration-200
                hidden sm:inline-block
                ${
                  isRouteActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-700 hover:text-blue-600'
                }
              `}
            >
              <span className="relative z-10">
                {item.label}
              </span>

              {isTargeted && (
                <motion.div
                  layoutId="landing-nav-sliding-underline"
                  className="
                    absolute
                    -bottom-0.5
                    left-0
                    right-0
                    h-[2.5px]
                    bg-blue-600
                    rounded-full
                    pointer-events-none
                  "
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 32,
                  }}
                />
              )}
            </Link>
          );
        })}

        <button
          onClick={() =>
            navigate('/auth?mode=login')
          }
          className="landing-nav-btn font-bold cursor-pointer shrink-0"
        >
          Sign In
        </button>
      </nav>

      {/* Mobile Menu Trigger Button (Visual borderless 3-line hamburger with reference touch target size) */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        className="sm:hidden px-3.5 py-2 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-center shrink-0 min-h-[42px] focus:outline-none"
        title="Navigation Menu"
        aria-label="Toggle Mobile Navigation Menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Perfected Navigation Dropdown Menu Card on Mobile with Centered Contents */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-full right-0 mt-3.5 w-60 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-3 z-50 animate-fade-in flex flex-col gap-1.5">
          {mobileNavItems.map((item) => {
            const isRouteActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-center text-center px-4 py-3 rounded-xl text-sm font-extrabold min-h-[46px] transition-all cursor-pointer ${
                  isRouteActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-600 border border-transparent'
                }`}
              >
                <span className="text-center">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   MAIN APP CONTENT
========================================================= */

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicRoute = ['/', '/features', '/how-it-works'].includes(location.pathname);


  /* =======================================================
     STUDENTS
  ======================================================= */

  /* =======================================================
     STUDENTS
  ======================================================= */

  const [students, setStudents] = useState<Student[]>([]);

  /* =======================================================
     PLACEMENT DRIVES
  ======================================================= */

  const [drives, setDrives] = useState<PlacementDrive[]>([]);

  /* =======================================================
     RECRUITERS
  ======================================================= */

  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);

  /* =======================================================
     ALUMNI
  ======================================================= */

  const [alumni, setAlumni] = useState<Alumni[]>([]);

  /* =======================================================
     ALUMNI BLOGS
  ======================================================= */

  const [blogs, setBlogs] = useState<Blog[]>([]);

  /* =======================================================
     ALUMNI REFERRALS
  ======================================================= */

  const [referrals, setReferrals] = useState<Referral[]>([]);

  /* =======================================================
     CALENDAR EVENTS
  ======================================================= */

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  /* =======================================================
     SESSION & RESTORATION
  ======================================================= */

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');

    if (token && storedRole) {
      const roleLower = storedRole.toLowerCase();
      const mappedRole: UserRole =
        roleLower === 'student'
          ? 'student'
          : roleLower === 'recruiter'
          ? 'recruiter'
          : roleLower === 'alumni'
          ? 'alumni'
          : 'admin';

      setSession({ role: mappedRole });
    }
  }, []);

  useEffect(() => {
    const loadBackendData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const [
          alumniData,
          blogsData,
          studentsWithPlacement,
          drivesWithCompany,
          recruitersList,
          eventsList,
          applicationsList
        ] = await Promise.all([
          alumniApi.getAll().catch(() => []),
          alumniApi.getBlogs().catch(() => []),
          studentApi.getAllWithPlacementInfo().catch(() => []),
          jobPostingApi.getAllWithCompanyInfo().catch(() => []),
          recruiterApi.getAll().catch(() => []),
          calendarApi.getAll().catch(() => []),
          applicationApi.getAll().catch(() => []),
        ]);

        setAlumni(alumniData);
        setBlogs(blogsData);
        console.log("BLOGS FROM BACKEND:", blogsData);

        const appsByStudent = new Map<string, Application[]>();
        for (const app of applicationsList) {
          const sId = String(app.studentId);
          const currentApps = appsByStudent.get(sId) || [];
          currentApps.push({
            driveId: String(app.jobPostingId),
            jobPostingId: String(app.jobPostingId),
            companyName: app.companyName || '',
            role: app.jobTitle || '',
            appliedDate: app.appliedDate || '',
            status: app.status === 'SHORTLISTED' ? 'Selected' : app.status === 'REJECTED' ? 'Rejected' : 'Applied',
            currentRoundIndex: 0,
          });
          appsByStudent.set(sId, currentApps);
        }

        const mappedStudents: Student[] = studentsWithPlacement.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          registrationNumber: s.id,
          password: '',
          branch: s.department,
          cgpa: s.cgpa,
          backlogs: s.backlogs,
          placementStatus: s.placementStatus,
          placedCompany: s.placedCompany,
          placedPackage: s.placedPackage,
          resumeScore: 85,
          skills: [],
          projectsCount: 0,
          resumeText: '',
          applications: appsByStudent.get(String(s.id)) || [],
          department: s.department,
        }));
        setStudents(mappedStudents);

        const mappedDrives: PlacementDrive[] = drivesWithCompany.map((d) => ({
          id: d.id,
          companyName: d.companyName,
          companyId: d.companyId,
          role: d.roleCategory || d.title,
          title: d.title,
          description: d.description,
          jobDesc: d.description || '',
          package: d.package,
          numericPackage: d.numericPackage,
          cgpaCutoff: d.cgpaCutoff,
          maxBacklogs: d.maxBacklogs,
          allowedBranches: d.allowedBranches,
          eligibleBatch: d.eligibleBatch,
          deadline: d.deadline ?? null,
          location: d.location,
          skillsRequired: d.skillsRequired,
          status: d.status,
          registeredCount: d.registeredCount,
          rounds: d.recruitmentType === 'OFF_CAMPUS' ? [] : ['Online Assessment', 'Technical Interview', 'HR Interview'],
          recruitmentType: d.recruitmentType,
          sourceType: d.sourceType,
          applyUrl: d.applyUrl,
          source: d.source,
          postedAt: d.postedAt,
          jobType: d.jobType,
          roleCategory: d.roleCategory,
          scrapedDate: d.scrapedDate,
        }));
        setDrives(mappedDrives);

        const mappedRecruiters: Recruiter[] = recruitersList.map((r) => ({
          id: String(r.id),
          name: r.name,
          email: r.email,
          password: '',
          companyName: r.companyName,
          companyId: r.id,
          designation: r.designation || 'Recruiter',
          industry: r.industry || 'Technology',
          postedDrives: [],
        }));
        setRecruiters(mappedRecruiters);

        setCalendarEvents(eventsList);
      } catch (error) {
        console.error('Failed to load initial backend data:', error);
      }
    };

    loadBackendData();
  }, [session]);

  /* =======================================================
     TOAST
  ======================================================= */

  const [toast, setToast] = useState<ToastType | null>(null);

  const triggerToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setToast({
      id: Math.random().toString(36).substring(2, 11),
      message,
      type,
    });
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('placed_session');
      setSession(null);
      triggerToast('Session expired or unauthorized. Please log in again.', 'warning');
      navigate('/auth?mode=login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  const handleSeedData = () => {
    triggerToast('Seed operation is deprecated. Data comes from backend.', 'info');
  };


  /* =======================================================
     LOGIN
  ======================================================= */

  const handleLogin = (
    role: UserRole,
    id?: string
  ) => {

    /* ---------------- STUDENT ---------------- */

    if (role === 'student') {
      setSession({
        role,
        studentId: id,
      });

      const sId = id?.toLowerCase().trim();
      const student = sId
        ? students.find(
            (s) =>
              String(s.id).toLowerCase().trim() === sId ||
              (s.email && s.email.toLowerCase().trim() === sId) ||
              (s.registrationNumber && String(s.registrationNumber).toLowerCase().trim() === sId)
          )
        : undefined;

      triggerToast(
        `Welcome back, ${
          student?.name || 'Student'
        }!`,
        'success'
      );

      navigate('/student');

      return;
    }


    /* ---------------- RECRUITER ---------------- */

    if (role === 'recruiter') {
      setSession({
        role,
        recruiterId: id,
      });

      const rId = id?.toLowerCase().trim();
      const recruiter = rId
        ? recruiters.find(
            (r) =>
              String(r.id).toLowerCase().trim() === rId ||
              (r.email && r.email.toLowerCase().trim() === rId)
          )
        : undefined;

      triggerToast(
        `Welcome back, ${
          recruiter?.name || 'Recruiter'
        }${
          recruiter?.companyName ? ` from ${recruiter.companyName}` : ''
        }!`,
        'success'
      );

      navigate('/recruiter');

      return;
    }


    /* ---------------- ALUMNI ---------------- */

    if (role === 'alumni') {
      setSession({
        role,
        alumniId: id,
      });

      const aId = id?.toLowerCase().trim();
      const alum = aId
        ? alumni.find(
            (a) =>
              String(a.id).toLowerCase().trim() === aId ||
              (a.email && a.email.toLowerCase().trim() === aId)
          )
        : undefined;

      triggerToast(
        `Welcome back, ${alum?.name || 'Alumni'}!`,
        'success'
      );

      navigate('/alumni');

      return;
    }


    /* ---------------- ADMIN ---------------- */

    setSession({
      role: 'admin',
    });

    triggerToast(
      'Administrator authenticated successfully.',
      'success'
    );

    navigate('/admin');
  };

  const handleAlumniLogin = async (
    requestData: {
      email: string;
      password: string;
    }
  ): Promise<void> => {
    try {
      const res = await alumniApi.login(requestData);
      if (res?.token) {
        localStorage.setItem('token', res.token);
      }

      const allAlumni = await alumniApi.getAll();
      const realAlumni = allAlumni.find(
        (a) => a.email.toLowerCase().trim() === requestData.email.toLowerCase().trim()
      );

      if (!realAlumni) {
        throw new Error('Alumni profile record not found in system database.');
      }

      setAlumni((previousAlumni) => {
        const exists = previousAlumni.some(
          (item) => item.id === realAlumni.id
        );

        if (exists) {
          return previousAlumni.map((item) =>
            item.id === realAlumni.id
              ? realAlumni
              : item
          );
        }

        return [
          ...previousAlumni,
          realAlumni
        ];
      });

      setSession({
        role: 'alumni',
        alumniId: String(realAlumni.id)
      });

      triggerToast(
        `Welcome back, ${realAlumni.name}!`,
        'success'
      );

      navigate('/alumni');
    } catch (error) {
      console.error(
        'Failed to login alumni:',
        error
      );

      throw new Error(
        error instanceof Error
          ? error.message
          : 'Unable to login alumni.'
      );
    }
  };


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const storedRole = localStorage.getItem('role') as Role | null;

    if (refreshToken) {
      try {
        await authApi.logout({
          refreshToken,
          role: storedRole || undefined,
        });
      } catch (err) {
        console.warn('Backend logout call returned error:', err);
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('placed_session');
    setSession(null);

    triggerToast(
      'Logged out successfully.',
      'info'
    );

    navigate('/auth?mode=login');
  };


  /* =======================================================
     STUDENT APPLY TO DRIVE
  ======================================================= */

  const handleApplyDrive = async (
    driveId: string
  ) => {
    if (
      !session ||
      session.role !== 'student' ||
      !session.studentId
    ) {
      triggerToast('Please log in as a student to apply.', 'warning');
      return;
    }

    const sId = session.studentId.toLowerCase().trim();
    const student = students.find(
      (item) =>
        String(item.id).toLowerCase().trim() === sId ||
        (item.email && item.email.toLowerCase().trim() === sId) ||
        (item.registrationNumber && String(item.registrationNumber).toLowerCase().trim() === sId)
    );

    const drive = drives.find(
      (item) => String(item.id) === String(driveId)
    );

    if (!student) {
      triggerToast('Student profile not found.', 'error');
      return;
    }

    if (!drive) {
      triggerToast('Placement drive not found.', 'error');
      return;
    }

    if (drive.status === 'CLOSED' || drive.active === false) {
      triggerToast('This drive is not currently accepting applications.', 'warning');
      return;
    }

    /*
     * Prevent duplicate applications.
     */
    if (
      student.applications.some(
        (application) =>
          String(application.driveId) === String(driveId) ||
          String(application.jobPostingId) === String(driveId)
      )
    ) {
      triggerToast(
        'You have already submitted an application for this drive.',
        'warning'
      );
      return;
    }

    const rawStudentId = student.registrationNumber || student.id;
    const formattedStudentId =
      rawStudentId.length === 12
        ? rawStudentId
        : rawStudentId.replace(/\D/g, '').padStart(12, '0').slice(-12);

    const jobPostingIdNum = parseInt(drive.id, 10);
    if (isNaN(jobPostingIdNum)) {
      triggerToast('Invalid job posting ID format.', 'error');
      return;
    }

    try {
      const responseDTO = await applicationApi.create({
        studentId: formattedStudentId,
        jobPostingId: jobPostingIdNum
      });

      const newApplication: Application = {
        id: responseDTO.id ? String(responseDTO.id) : undefined,
        driveId: String(responseDTO.jobPostingId || drive.id),
        jobPostingId: String(responseDTO.jobPostingId || drive.id),
        companyName: responseDTO.companyName || drive.companyName,
        role: responseDTO.jobTitle || drive.title,
        appliedDate:
          responseDTO.appliedDate ||
          new Date().toISOString().split('T')[0],
        status:
          responseDTO.status === 'SHORTLISTED'
            ? 'Selected'
            : responseDTO.status === 'REJECTED'
            ? 'Rejected'
            : 'Applied',
        currentRoundIndex: 0,
      };

      setStudents((previousStudents) =>
        previousStudents.map((studentItem) => {
          if (
            String(studentItem.id).toLowerCase().trim() === sId ||
            (studentItem.email && studentItem.email.toLowerCase().trim() === sId) ||
            (studentItem.registrationNumber && String(studentItem.registrationNumber).toLowerCase().trim() === sId)
          ) {
            return {
              ...studentItem,
              applications: [
                newApplication,
                ...studentItem.applications,
              ],
            };
          }
          return studentItem;
        })
      );

      setDrives((previousDrives) =>
        previousDrives.map((driveItem) => {
          if (String(driveItem.id) === String(driveId)) {
            return {
              ...driveItem,
              registeredCount: (driveItem.registeredCount || 0) + 1,
            };
          }
          return driveItem;
        })
      );

      triggerToast(
        `Application submitted successfully for ${drive.companyName}!`,
        'success'
      );
    } catch (err: any) {
      console.error('Backend application create error:', err);
      triggerToast(
        err?.message || 'Failed to submit application. Please try again.',
        'error'
      );
    }
  };


  /* =======================================================
     STUDENT RESUME SCORE
  ======================================================= */

  const handleUpdateResumeScore = (
    score: number,
    resumeText: string
  ) => {
    if (
      !session ||
      session.role !== 'student' ||
      !session.studentId
    ) {
      return;
    }

    setStudents(
      (previousStudents) =>
        previousStudents.map(
          (student) => {
            if (
              student.id ===
              session.studentId
            ) {
              return {
                ...student,
                resumeScore: score,
                resumeText,
              };
            }

            return student;
          }
        )
    );

    triggerToast(
      `Resume index optimized! New ATS Score: ${score}%`,
      'success'
    );
  };


  /* =======================================================
     STUDENT PROFILE UPDATE
  ======================================================= */

  const handleUpdateStudentProfile = (
    updatedStudent: Student
  ) => {
    setStudents(
      (previousStudents) =>
        previousStudents.map(
          (student) =>
            student.id === updatedStudent.id
              ? updatedStudent
              : student
        )
    );

    triggerToast(
      'Profile settings saved successfully.',
      'success'
    );
  };


  /* =======================================================
     ADD PLACEMENT DRIVE
  ======================================================= */

  const handleAddDrive = async (
  newDriveData: Omit<
    PlacementDrive,
    'id' | 'registeredCount'
  >,
  recruiterId?: string
) => {

  try {

    const requestData: JobPostingRequest = {
      title:
        newDriveData.title ||
        newDriveData.role,

      description:
        newDriveData.description ||
        newDriveData.jobDesc,

      location:
        newDriveData.location,

      eligibleCGPACutoff:
        newDriveData.cgpaCutoff,

      allowedBacklogs:
        newDriveData.maxBacklogs,

      allowedBranches:
        newDriveData.allowedBranches
          ?.join(', ') ?? null,

      eligibleBatch:
        newDriveData.eligibleBatch,

      requiredSkills:
        newDriveData.skillsRequired
          ?.join(', ') ?? null,

      salary:
        newDriveData.numericPackage,

      deadline:
        newDriveData.deadline,

      recruitmentType:
        'CAMPUS',

      sourceType:
        recruiterId
          ? 'RECRUITER'
          : 'TPO',
    };

    const createdDrive =
      await jobPostingApi.createDrive(
        newDriveData.companyName,
        newDriveData.location || 'Campus / Remote',
        undefined,
        requestData
      );

    const mappedDrive: PlacementDrive = {

      id:
        createdDrive.id,

      companyName:
        createdDrive.companyName,

      companyId:
        createdDrive.companyId,

      title:
        createdDrive.title,

      role:
        createdDrive.title,

      description:
        createdDrive.description,

      jobDesc:
        createdDrive.description,

      location:
        createdDrive.location,

      package:
        createdDrive.package,

      numericPackage:
        createdDrive.numericPackage,

      cgpaCutoff:
        createdDrive.cgpaCutoff,

      maxBacklogs:
        createdDrive.maxBacklogs,

      allowedBranches:
        createdDrive.allowedBranches,

      eligibleBatch:
        createdDrive.eligibleBatch,

      deadline:
        createdDrive.deadline ?? null,

      skillsRequired:
        createdDrive.skillsRequired,

      rounds:
        newDriveData.rounds,

      status:
        createdDrive.status,

      registeredCount:
        createdDrive.registeredCount,

      recruiterId,

      recruitmentType:
        createdDrive.recruitmentType,

      sourceType:
        createdDrive.sourceType,

      applyUrl:
        createdDrive.applyUrl,

      source:
        createdDrive.source,

      postedAt:
        createdDrive.postedAt,

      jobType:
        createdDrive.jobType,

      roleCategory:
        createdDrive.roleCategory,

      scrapedDate:
        createdDrive.scrapedDate,
    };

    setDrives((previous) => [
      mappedDrive,
      ...previous,
    ]);

    /*
     * Keep your existing calendar creation
     * code here.
     */

    if (newDriveData.deadline) {

      const driveCalendarEvent: CalendarEvent = {
        id: Date.now(),

        title:
          `${newDriveData.companyName} - ${newDriveData.title}`,

        eventType: 'Deadline',

        companyName:
          newDriveData.companyName,

        company:
          newDriveData.companyName,

        role:
          newDriveData.title,

        scheduledDate:
          newDriveData.deadline,

        startTime:
          '23:59',

        location:
          newDriveData.location ||
          'Campus / Online',

        description:
          `Registration deadline for ${newDriveData.companyName} (${newDriveData.title}). Package: ${newDriveData.package}.`,

        status:
          'SCHEDULED',
      };

      setCalendarEvents(
        (previous) => [
          driveCalendarEvent,
          ...previous,
        ]
      );
    }

    triggerToast(
      `Recruitment drive for ${newDriveData.companyName} created successfully!`,
      'success'
    );

  } catch (error) {

    console.error(
      'Failed to create recruitment drive:',
      error
    );

    triggerToast(
      error instanceof Error
        ? error.message
        : 'Failed to create recruitment drive.',
      'error'
    );

    throw error;
  }
};


  /* =======================================================
     ADD CALENDAR EVENT
  ======================================================= */

  const handleAddCalendarEvent = (
    newEvent: CalendarEvent
  ) => {
    setCalendarEvents(
      (previousEvents) => [
        newEvent,
        ...previousEvents,
      ]
    );

    triggerToast(
      `Calendar Event "${newEvent.title}" published!`,
      'success'
    );
  };


  /* =======================================================
     TOGGLE DRIVE ACTIVE / CLOSED
  ======================================================= */

  const handleToggleDriveActive = (
    driveId: string
  ) => {

    setDrives(
      (previousDrives) =>
        previousDrives.map(
          (drive) => {

            if (
              drive.id === driveId
            ) {
              const nextStatus =
                drive.status === 'OPEN'
                  ? 'CLOSED'
                  : 'OPEN';

              triggerToast(
                `Drive for ${drive.companyName} has been ${
                  nextStatus === 'OPEN'
                    ? 'activated'
                    : 'suspended'
                }.`,
                nextStatus === 'OPEN'
                  ? 'success'
                  : 'warning'
              );

              return {
                ...drive,
                status:
                  nextStatus as
                    | 'OPEN'
                    | 'CLOSED',
              };
            }

            return drive;
          }
        )
    );
  };


  /* =======================================================
     UPDATE STUDENT PLACEMENT STATUS
  ======================================================= */

  const handleUpdateStudentStatus = (
    studentId: string,
    company?: string,
    salaryPackage?: string
  ) => {

    const student =
      students.find(
        (item) =>
          item.id === studentId
      );

    if (!student) {
      return;
    }


    setStudents(
      (previousStudents) =>
        previousStudents.map(
          (studentItem) => {

            if (
              studentItem.id === studentId
            ) {

              /*
               * Mark as placed.
               */

              if (
                company &&
                salaryPackage
              ) {

                triggerToast(
                  `${studentItem.name} marked as Placed @ ${company}!`,
                  'success'
                );

                return {
                  ...studentItem,

                  placementStatus:
                    'Placed' as const,

                  placedCompany:
                    company,

                  placedPackage:
                    salaryPackage,
                };
              }


              /*
               * Reset placement.
               */

              triggerToast(
                `${studentItem.name} status reset to Unplaced.`,
                'info'
              );

              return {
                ...studentItem,

                placementStatus:
                  'Unplaced' as const,

                placedCompany:
                  undefined,

                placedPackage:
                  undefined,
              };
            }

            return studentItem;
          }
        )
    );
  };


  /* =======================================================
     PROMOTE STUDENT (MOVE ROUND / SELECT)
  ======================================================= */

  function getDefaultFutureLocalDateTime(hoursAhead = 24): string {
    const date = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
    const pad = (value: number) => String(value).padStart(2, "0");
    return (
      [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
      ].join("-") +
      "T" +
      [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds()),
      ].join(":")
    );
  }

  const handlePromoteStudent = (
    studentId: string,
    driveId: string,
    newRoundIndex: number,
    isFinalSelection: boolean
  ) => {
    const student = students.find((item) => item.id === studentId);
    const drive = drives.find((item) => item.id === driveId);

    if (!student || !drive) return;

    setStudents((previousStudents) =>
      previousStudents.map((studentItem) => {
        if (studentItem.id !== studentId) return studentItem;

        const updatedApplications = studentItem.applications.map((application) => {
          if (application.jobPostingId !== driveId) return application;

          if (isFinalSelection) {
            return {
              ...application,
              status: 'Selected' as const,
              currentRoundIndex: newRoundIndex - 1,
              feedback: `Offer issued! Selected for the role of ${drive.title} with a salary package of ${drive.package}.`,
            };
          }

          return {
            ...application,
            status: 'Applied' as const,
            currentRoundIndex: newRoundIndex,
            feedback: `Promoted to ${drive.rounds?.[newRoundIndex] || `Round ${newRoundIndex + 1}`}`,
          };
        });

        return {
          ...studentItem,
          applications: updatedApplications,
        };
      })
    );

    // Persist to real backend REST API
    applicationApi
      .getAll()
      .then((allApps) => {
        const realApp = allApps.find(
          (a) =>
            String(a.studentId) === String(studentId) &&
            String(a.jobPostingId) === String(driveId)
        );
        if (realApp) {
          if (isFinalSelection) {
            applicationApi.updateStatus(realApp.id, 'SELECTED').catch(() => {});
          } else {
            applicationApi.updateStatus(realApp.id, 'SHORTLISTED').catch(() => {});
            const roundName = drive.rounds?.[newRoundIndex] || `Round ${newRoundIndex + 1}`;
            applicationApi
              .addRound(realApp.id, {
                roundNumber: newRoundIndex + 1,
                roundType: roundName,
                scheduledAt: getDefaultFutureLocalDateTime(24),
              })
              .catch((err) => {
                console.error('Failed to add interview round:', err);
              });
          }
        }
      })
      .catch(() => {});

    if (isFinalSelection) {
      triggerToast(
        `Congratulations! ${student.name} has been selected for ${drive.companyName}!`,
        'success'
      );
    } else {
      triggerToast(
        `${student.name} promoted to "${drive.rounds?.[newRoundIndex] || `Round ${newRoundIndex + 1}`}" for ${drive.companyName}.`,
        'success'
      );
    }
  };

  /* =======================================================
     REJECT STUDENT
  ======================================================= */

  const handleRejectStudent = (studentId: string, driveId: string) => {
    const student = students.find((item) => item.id === studentId);
    const drive = drives.find((item) => item.id === driveId);

    if (!student || !drive) return;

    setStudents((previousStudents) =>
      previousStudents.map((studentItem) => {
        if (studentItem.id !== studentId) return studentItem;

        return {
          ...studentItem,
          applications: studentItem.applications.map((application) => {
            if (application.jobPostingId !== driveId) return application;

            return {
              ...application,
              status: 'Rejected' as const,
              feedback: `Recruitment cycle concluded at stage "${drive.rounds?.[application.currentRoundIndex] || 'Current Stage'}". Better luck next time!`,
            };
          }),
        };
      })
    );

    // Persist to real backend REST API
    applicationApi
      .getAll()
      .then((allApps) => {
        const realApp = allApps.find(
          (a) =>
            String(a.studentId) === String(studentId) &&
            String(a.jobPostingId) === String(driveId)
        );
        if (realApp) {
          applicationApi.updateStatus(realApp.id, 'REJECTED').catch(() => {});
        }
      })
      .catch(() => {});

    triggerToast(
      `${student.name} marked as Rejected for ${drive.companyName}.`,
      'warning'
    );
  };


  /* =======================================================
     SAVE RESUME FEEDBACK
  ======================================================= */

  const saveFeedback = (
    studentId: string,
    feedback: ResumeFeedback
  ) => {

    setStudents(
      (previousStudents) =>
        previousStudents.map(
          (student) =>
            student.id === studentId
              ? {
                  ...student,
                  resumeFeedback:
                    feedback,
                }
              : student
        )
    );
  };


  /* =======================================================
     REGISTER STUDENT
  ======================================================= */

  const handleRegisterStudent = (
    newStudent: Student
  ) => {
    setStudents((previousStudents) => {
      const exists = previousStudents.some(
        (s) => String(s.id).trim().toLowerCase() === String(newStudent.id).trim().toLowerCase()
      );
      if (exists) return previousStudents;
      return [...previousStudents, newStudent];
    });

    triggerToast(
      'Student registration successful! Please sign in.',
      'success'
    );
  };


  /* =======================================================
     REGISTER RECRUITER
  ======================================================= */

  const handleRegisterRecruiter = (
    newRecruiter: Recruiter
  ) => {

    setRecruiters(
      (previousRecruiters) => [
        ...previousRecruiters,
        newRecruiter,
      ]
    );

    triggerToast(
      `Recruiter account created for ${newRecruiter.companyName}! Please sign in.`,
      'success'
    );
  };


  /* =======================================================
     REGISTER ALUMNI
  ======================================================= */

  const handleRegisterAlumni = async (
    requestData: AlumniRegistrationRequest
  ): Promise<void> => {
    try {
      const createdAlumni = await alumniApi.register(
        requestData
      );

      setAlumni((previousAlumni) => {
        const filtered = previousAlumni.filter((a) => a.id !== createdAlumni.id);
        return [...filtered, createdAlumni];
      });

      triggerToast(
        'Registration submitted. Please wait to be verified/approved by TPO before signing in.',
        'info'
      );
    } catch (error) {
      console.error(
        'Failed to register alumni:',
        error
      );

      throw new Error(
        error instanceof Error
          ? error.message
          : 'Unable to register alumni.'
      );
    }
  };

  /* =======================================================
     APPROVE RECRUITER (TPO ONLY)
  ======================================================= */

  const handleApproveRecruiter = async (
    recruiterId: string | number
  ): Promise<void> => {
    try {
      await recruiterApi.approve(Number(recruiterId));
      setRecruiters((previous) =>
        previous.map((r) =>
          r.id === recruiterId || String(r.id) === String(recruiterId)
            ? { ...r, recruiterStatus: 'APPROVED' }
            : r
        )
      );
      triggerToast('Recruiter account approved successfully.', 'success');
    } catch (error) {
      console.error('Failed to approve recruiter:', error);
      triggerToast('Failed to approve recruiter account.', 'error');
    }
  };

  /* =======================================================
     APPROVE ALUMNI
  ======================================================= */

  const handleApproveAlumni = async (
  alumniId: string
): Promise<void> => {
  try {
    await alumniApi.approve(alumniId);

    setAlumni((previousAlumni) =>
      previousAlumni.map((person) =>
        person.id === alumniId
          ? {
              ...person,
              alumniStatus: 'APPROVED'
            }
          : person
      )
    );

    triggerToast(
      'Alumni approved successfully.',
      'success'
    );
  } catch (error) {
    console.error(
      'Failed to approve alumni:',
      error
    );

    triggerToast(
      error instanceof Error
        ? error.message
        : 'Unable to approve alumni.',
      'error'
    );
  }
};


  /* =======================================================
     REJECT ALUMNI
  ======================================================= */

  const handleRejectAlumni = async (
  alumniId: string
): Promise<void> => {
  try {
    const person = alumni.find(
      (item) => item.id === alumniId
    );

    await alumniApi.reject(alumniId);

    setAlumni((previousAlumni) =>
      previousAlumni.filter(
        (item) => item.id !== alumniId
      )
    );

    triggerToast(
      `${person?.name || 'Alumni'} rejected.`,
      'warning'
    );
  } catch (error) {
    console.error(
      'Failed to reject alumni:',
      error
    );

    triggerToast(
      error instanceof Error
        ? error.message
        : 'Unable to reject alumni.',
      'error'
    );
  }
};

  /* =======================================================
     ADD BLOG
  ======================================================= */


  

  const handleCreateBlog = async (
  blogData: Omit<
    Blog,
    'id' | 'alumniId' | 'postedDate'
  >
) => {
  if (!session?.alumniId) {
    return;
  }

  try {
    const newBlog = await alumniApi.createBlog(
      session.alumniId,
      {
        title: blogData.title,
        content: blogData.content,
        category: blogData.category,
        published: blogData.published,
      }
    );

    setBlogs((previousBlogs) => [
      newBlog,
      ...previousBlogs,
    ]);

    triggerToast(
      newBlog.published
        ? 'Blog published successfully.'
        : 'Blog saved as draft.',
      'success'
    );
  } catch (error) {
    console.error(
      'Failed to create blog:',
      error
    );

    triggerToast(
      error instanceof Error
        ? error.message
        : 'Failed to publish blog.',
      'error'
    );
  }
};
  /* =======================================================
     UPDATE BLOG
  ======================================================= */

  const handleUpdateBlog = async (
  id: string,
  data: {
    title: string;
    content: string;
    category: Blog['category'];
    published: boolean;
  }
) => {
  try {
    const updatedBlog =
      await alumniApi.updateBlog(id, {
        title: data.title,
        content: data.content,
        category: data.category,
        published: data.published,
      });

    setBlogs((previousBlogs) =>
      previousBlogs.map((blog) =>
        blog.id === id
          ? updatedBlog
          : blog
      )
    );

    triggerToast(
      'Blog updated successfully.',
      'success'
    );
  } catch (error) {
    console.error(
      'Failed to update blog:',
      error
    );

    triggerToast(
      error instanceof Error
        ? error.message
        : 'Failed to update blog.',
      'error'
    );
  }
};

  /* =======================================================
     DELETE BLOG
  ======================================================= */

  const handleDeleteBlog = async (
  blogId: string
) => {
  try {
    await alumniApi.deleteBlog(blogId);

    setBlogs((previousBlogs) =>
      previousBlogs.filter(
        (blog) => blog.id !== blogId
      )
    );

    triggerToast(
      'Blog deleted.',
      'info'
    );
  } catch (error) {
    console.error(
      'Failed to delete blog:',
      error
    );

    triggerToast(
      error instanceof Error
        ? error.message
        : 'Failed to delete blog.',
      'error'
    );
  }
};

  /* =======================================================
     UPDATE ALUMNI PROFILE
  ======================================================= */

  const handleUpdateAlumniProfile = async (
    id: string | number,
    requestData: AlumniProfileRequest
  ): Promise<void> => {
    try {
      await alumniApi.updateProfile(id, requestData);
      setAlumni((previousAlumni) =>
        previousAlumni.map((a) =>
          String(a.id) === String(id)
            ? {
                ...a,
                ...requestData,
                linkedinUrl: requestData.linkedinUrl || requestData.linkedIn || a.linkedinUrl
              }
            : a
        )
      );
      triggerToast('Alumni profile updated successfully.', 'success');
    } catch (error) {
      console.error('Failed to update alumni profile:', error);
      triggerToast('Failed to update alumni profile.', 'error');
    }
  };
  /* =======================================================
     ADD REFERRAL
  ======================================================= */

  const handleAddReferral = async (
  referralData: Omit<
    Referral,
    'id' | 'alumniId' | 'postedDate'
  >
) => {
  if (!session?.alumniId) {
    return;
  }

  try {
    const newReferral =
      await alumniApi.createReferral(
        session.alumniId,
        {
          companyName:
            referralData.companyName,
          role: referralData.role,
          description:
            referralData.description,
          active: referralData.active,
        }
      );

    setReferrals(
      (previousReferrals) => [
        newReferral,
        ...previousReferrals,
      ]
    );

    triggerToast(
      'Referral opportunity posted successfully.',
      'success'
    );
  } catch (error) {
    console.error(
      'Failed to create referral:',
      error
    );

    triggerToast(
      error instanceof Error
        ? error.message
        : 'Failed to post referral.',
      'error'
    );
  }
};

const handleUpdateReferral = async (
  id: string,
  data: Partial<Referral>
) => {
  try {
    const existingReferral = referrals.find(
      (referral) => referral.id === id
    );

    if (!existingReferral) {
      throw new Error('Referral not found.');
    }

    const requestData = {
      companyName:
        data.companyName ?? existingReferral.companyName,
      role:
        data.role ?? existingReferral.role,
      description:
        data.description ?? existingReferral.description,
      active:
        data.active ?? existingReferral.active,
    };

    const updatedReferral =
      await alumniApi.updateReferral(
        id,
        requestData
      );

    setReferrals((previousReferrals) =>
      previousReferrals.map((referral) =>
        referral.id === id
          ? updatedReferral
          : referral
      )
    );

    triggerToast(
      'Referral updated successfully.',
      'success'
    );
  } catch (error) {
    console.error(
      'Failed to update referral:',
      error
    );

    triggerToast(
      error instanceof Error
        ? error.message
        : 'Unable to update referral.',
      'error'
    );
  }
};

const handleDeleteReferral = async (
  id: string
) => {
  try {
    await alumniApi.deleteReferral(id);

    setReferrals((previousReferrals) =>
      previousReferrals.filter(
        (referral) => referral.id !== id
      )
    );

    triggerToast(
      'Referral deleted successfully.',
      'success'
    );
  } catch (error) {
    console.error(
      'Failed to delete referral:',
      error
    );

    triggerToast(
      error instanceof Error
        ? error.message
        : 'Unable to delete referral.',
      'error'
    );
  }
};
  /* =======================================================
     TOGGLE REFERRAL
  ======================================================= */

  /* =======================================================
     UPDATE ALUMNI PROFILE
  ======================================================= */

  /* =======================================================
     GET LOGGED-IN STUDENT
  ======================================================= */

  const loggedInStudent = React.useMemo(() => {
    if (session?.role !== 'student' || !session.studentId) return undefined;
    const sId = session.studentId.toLowerCase().trim();
    const found = students.find(
      (student) =>
        String(student.id).toLowerCase().trim() === sId ||
        (student.email && student.email.toLowerCase().trim() === sId) ||
        (student.registrationNumber && String(student.registrationNumber).toLowerCase().trim() === sId)
    );
    if (found) return found;

    return {
      id: session.studentId,
      name: session.studentId.includes('@') ? session.studentId.split('@')[0] : `Student (${session.studentId})`,
      email: session.studentId.includes('@') ? session.studentId : `${session.studentId}@student.univ.edu`,
      registrationNumber: session.studentId,
      password: '',
      branch: 'Computer Science',
      department: 'Computer Science',
      cgpa: 8.0,
      backlogs: 0,
      placementStatus: 'Unplaced' as const,
      resumeScore: 85,
      skills: [],
      projectsCount: 0,
      resumeText: '',
      applications: [],
    };
  }, [session, students]);

  const loggedInRecruiter = React.useMemo(() => {
    if (session?.role !== 'recruiter' || !session.recruiterId) return undefined;
    const rId = session.recruiterId.toLowerCase().trim();
    const found = recruiters.find(
      (recruiter) =>
        String(recruiter.id).toLowerCase().trim() === rId ||
        (recruiter.email && recruiter.email.toLowerCase().trim() === rId)
    );
    if (found) return found;

    return {
      id: session.recruiterId,
      name: session.recruiterId.includes('@') ? session.recruiterId.split('@')[0] : 'Recruiter',
      email: session.recruiterId.includes('@') ? session.recruiterId : `${session.recruiterId}@company.com`,
      password: '',
      companyName: 'Corporate',
      designation: 'Recruiter',
      postedDrives: [],
    };
  }, [session, recruiters]);

  const loggedInAlumni = React.useMemo(() => {
    if (session?.role !== 'alumni' || !session.alumniId) return undefined;
    const aId = session.alumniId.toLowerCase().trim();
    const found = alumni.find(
      (item) =>
        String(item.id).toLowerCase().trim() === aId ||
        (item.email && item.email.toLowerCase().trim() === aId)
    );
    if (found) return found;

    return {
      id: session.alumniId,
      name: session.alumniId.includes('@') ? session.alumniId.split('@')[0] : 'Alumni',
      email: session.alumniId.includes('@') ? session.alumniId : `${session.alumniId}@alumni.univ.edu`,
      graduationYear: new Date().getFullYear(),
      currentCompany: 'Verified Industry',
      currentRole: 'Software Engineer',
      department: 'CSE',
      alumniStatus: 'APPROVED' as const,
    };
  }, [session, alumni]);


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="app-shell">

      {/* Route Loading Transition */}

      <RouteLoadingBar />


      {/* Global Notifications */}

      <Notification
        toast={toast}
        onClose={() =>
          setToast(null)
        }
      />


      {/* ===================================================
          GLOBAL HEADER
      =================================================== */}

      <header className="app-header">

        <div className="app-logo flex items-center gap-2.5">
          <img src={placedLogo} alt="PlaceD Logo" className="w-8 h-8 object-contain rounded-lg shrink-0" />
          <Link
            to="/"
            className="
              font-display
              font-extrabold
              text-xl
              text-[hsl(var(--text-primary))]
              hover:opacity-90
              no-underline
            "
          >
            PlaceD
          </Link>
        </div>


        {/* =================================================
            LOGGED-IN USER HEADER
        ================================================= */}

        {!isPublicRoute && session ? (

          <div className="user-nav-profile">

            {/* ---------------- STUDENT ---------------- */}

            {session.role === 'student' &&
            loggedInStudent ? (

              <div className="flex items-center gap-3">

                <NotificationBell studentId={loggedInStudent.id} />

                <div className="hidden sm:flex flex-col text-right">

                  <span className="
                    text-xs
                    font-semibold
                    text-[hsl(var(--text-primary))]
                    truncate
                    max-w-30
                  ">
                    {loggedInStudent.name}
                  </span>

                  <span className="
                    text-[10px]
                    text-[hsl(var(--text-secondary))]
                    font-semibold
                    uppercase
                  ">
                    {loggedInStudent.department}
                  </span>

                </div>

                <div className="avatar">
                  {loggedInStudent.name.charAt(0)}
                </div>

              </div>


            ) : session.role === 'recruiter' &&
              loggedInRecruiter ? (

              /* ---------------- RECRUITER ---------------- */

              <div className="flex items-center gap-3">

                <div className="hidden sm:flex flex-col text-right">

                  <span className="
                    text-xs
                    font-semibold
                    text-[hsl(var(--text-primary))]
                    truncate
                    max-w-30
                  ">
                    {loggedInRecruiter.name}
                  </span>

                  <span className="
                    text-[10px]
                    text-sky-600
                    font-bold
                    uppercase
                    tracking-wider
                  ">
                    {loggedInRecruiter.companyName}
                    {' '}Recruiter
                  </span>

                </div>

                <div className="
                  avatar
                  bg-linear-to-br
                  from-sky-400
                  to-blue-600
                ">
                  <Building2
                    size={16}
                    className="text-white"
                  />
                </div>

              </div>


            ) : session.role === 'alumni' &&
              loggedInAlumni ? (

              /* ---------------- ALUMNI ---------------- */

              <div className="flex items-center gap-3">

                <div className="hidden sm:flex flex-col text-right">

                  <span className="
                    text-xs
                    font-semibold
                    text-[hsl(var(--text-primary))]
                  ">
                    {loggedInAlumni.name}
                  </span>

                  <span className="
                    text-[10px]
                    text-blue-600
                    font-bold
                    uppercase
                    tracking-wider
                  ">
                    {loggedInAlumni.currentCompany || 'Verified'} Alumni
                  </span>

                </div>

                <div className="
                  avatar
                  bg-gradient-to-br
                  from-blue-600
                  to-indigo-600
                ">
                  <Award
                    size={16}
                    className="text-white"
                  />
                </div>

              </div>


            ) : (

              /* ---------------- ADMIN ---------------- */

              <div className="flex items-center gap-3">

                <div className="hidden sm:flex flex-col text-right">

                  <span className="
                    text-xs
                    font-semibold
                    text-[hsl(var(--text-primary))]
                  ">
                    TPO Coordinator
                  </span>

                  <span className="
                    text-[10px]
                    text-blue-600
                    font-bold
                    uppercase
                    tracking-wider
                  ">
                    Administrator
                  </span>

                </div>

                <div className="
                  avatar
                  bg-linear-to-br
                  from-blue-500
                  to-indigo-600
                ">
                  <Shield
                    size={16}
                    className="text-white"
                  />
                </div>

              </div>
            )}


            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="
                btn
                btn-secondary
                btn-sm
                p-1.5
                rounded-lg
                text-gray-500
                hover:text-red-600
                transition-colors
              "
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>

          </div>

        ) : (

          /* =================================================
             PUBLIC NAVIGATION
          ================================================= */

          <NavLinksWithSlidingUnderline />

        )}

      </header>


      {/* ===================================================
          ROUTES
      =================================================== */}

      <main className="app-main">

        <Routes>

          {/* =================================================
              LANDING PAGE
          ================================================= */}

          <Route
            path="/"
            element={
              <LandingPage />
            }
          />


          {/* =================================================
              FEATURES
          ================================================= */}

          <Route
            path="/features"
            element={
              <FeaturesPage />
            }
          />


          {/* =================================================
              HOW IT WORKS
          ================================================= */}

          <Route
            path="/how-it-works"
            element={
              <HowItWorksPage />
            }
          />


          {/* =================================================
              AUTH
          ================================================= */}

          <Route
            path="/auth"
            element={
              <Auth
                students={students}
                recruiters={recruiters}
                alumni={alumni}

                onLogin={
                  handleLogin
                }

                onRegister={
                  handleRegisterStudent
                }

                onRegisterRecruiter={
                  handleRegisterRecruiter
                }

                onRegisterAlumni={
                  handleRegisterAlumni
                }
                onAlumniLogin={handleAlumniLogin}

                onSeedData={
                  handleSeedData
                }
              />
            }
          />


          {/* =================================================
              STUDENT PORTAL
          ================================================= */}

          <Route
            path="/student/*"
            element={

              <ProtectedRoute
                allowedRole="student"
                session={session}
              >

                {loggedInStudent ? (

                  <StudentPortal
  currentStudent={loggedInStudent}
  drives={drives}
  calendarEvents={calendarEvents}
  blogs={blogs}
  referrals={referrals}
  alumni={alumni}
  onLogout={handleLogout}
  onApply={handleApplyDrive}
  onUpdateResumeScore={handleUpdateResumeScore}
  onUpdateStudentProfile={handleUpdateStudentProfile}
/>

                ) : (

                  <Navigate
                    to="/auth?mode=login"
                    replace
                  />

                )}

              </ProtectedRoute>
            }
          />


          {/* =================================================
              RECRUITER PORTAL
          ================================================= */}

          <Route
            path="/recruiter/*"
            element={

              <ProtectedRoute
                allowedRole="recruiter"
                session={session}
              >

                {loggedInRecruiter ? (

                  <RecruiterPortal
                    recruiter={
                      loggedInRecruiter
                    }

                    students={
                      students
                    }

                    drives={
                      drives
                    }

                    onLogout={
                      handleLogout
                    }

                    onAddDrive={
                      (driveData) =>
                        handleAddDrive(
                          driveData,
                          loggedInRecruiter.id
                        )
                    }

                    onToggleDriveActive={
                      handleToggleDriveActive
                    }

                    onPromoteStudent={
                      handlePromoteStudent
                    }

                    onRejectStudent={
                      handleRejectStudent
                    }
                  />

                ) : (

                  <Navigate
                    to="/auth?mode=login"
                    replace
                  />

                )}

              </ProtectedRoute>
            }
          />


          {/* =================================================
              ADMIN / TPO PORTAL
          ================================================= */}

          <Route
            path="/admin/*"
            element={

              <ProtectedRoute
                allowedRole="admin"
                session={session}
              >

                <AdminPortal

                  students={
                    students
                  }

                  drives={
                    drives
                  }

                  calendarEvents={
                    calendarEvents
                  }

                  alumni={
                    alumni
                  }

                  onAddCalendarEvent={
                    handleAddCalendarEvent
                  }

                  onLogout={
                    handleLogout
                  }

                  onAddDrive={
                    handleAddDrive
                  }

                  onToggleDriveActive={
                    handleToggleDriveActive
                  }

                  onUpdateStudentStatus={
                    handleUpdateStudentStatus
                  }

                  onPromoteStudent={
                    handlePromoteStudent
                  }

                  onRejectStudent={
                    handleRejectStudent
                  }

                  onSeedData={
                    handleSeedData
                  }

                  onSaveFeedback={
                    saveFeedback
                  }

                  recruiters={recruiters}

                  onApproveRecruiter={
                    handleApproveRecruiter
                  }

                  onApproveAlumni={
                    handleApproveAlumni
                  }

                  onRejectAlumni={
                    handleRejectAlumni
                  }

                />

              </ProtectedRoute>
            }
          />


          {/* =================================================
              ALUMNI PORTAL
          ================================================= */}

          <Route
            path="/alumni/*"
            element={

              <ProtectedRoute
                allowedRole="alumni"
                session={session}
              >

                {loggedInAlumni ? (

                  <AlumniPortal
                    alumni={loggedInAlumni}
                    allAlumni={alumni}
                    blogs={blogs}
                    referrals={referrals}
                    onLogout={handleLogout}
                    onUpdateProfile={handleUpdateAlumniProfile}
                    onCreateBlog={handleCreateBlog}
                    onUpdateBlog={handleUpdateBlog}
                    onDeleteBlog={handleDeleteBlog}
                    onCreateReferral={handleAddReferral}
                    onUpdateReferral={handleUpdateReferral}
                    onDeleteReferral={handleDeleteReferral}
                  />

                ) : (

                  <Navigate
                    to="/auth?mode=login"
                    replace
                  />

                )}

              </ProtectedRoute>
            }
          />


          {/* =================================================
              FALLBACK
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </main>

    </div>
  );
}


/* =========================================================
   ROOT APP
========================================================= */

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}