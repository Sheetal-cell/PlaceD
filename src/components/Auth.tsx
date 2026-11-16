import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Shield,
  GraduationCap,
  ArrowRight,
  LogIn,
  UserPlus,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  Award,
  Sparkles,
  BarChart2,
  FileCheck2,
  Users,
  CalendarDays,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  Clock3,
  Phone
} from 'lucide-react';

import type { Student, Recruiter } from '../mockData';
import { alumniApi, type Alumni, type AlumniRegistrationRequest } from '../api/alumniApi';
import { authApi } from '../api/authApi';
import { studentApi } from '../api/studentApi';
import { recruiterApi } from '../api/recruiterApi';
import { userApi } from '../api/userApi';
import { Footer } from './Footer';
import './Auth.css';

interface AuthProps {
  students: Student[];
  recruiters: Recruiter[];
  alumni: Alumni[];

  onLogin: (
    role: 'student' | 'admin' | 'recruiter' | 'alumni',
    id?: string
  ) => void;

  onAlumniLogin: (
  requestData: {
    email: string;
    password: string;
  }
) => Promise<void>;

  onRegister: (newStudent: Student) => void;
  onRegisterRecruiter: (newRecruiter: Recruiter) => void;
  onRegisterAlumni: (
    requestData: AlumniRegistrationRequest
  ) => Promise<void>;

  onSeedData?: () => void;
}

export type AuthRole =
  | 'student'
  | 'admin'
  | 'recruiter'
  | 'alumni';

export const Auth: React.FC<AuthProps> = ({
  students,
  recruiters,
  alumni,
  onLogin,
  onRegister,
  onRegisterRecruiter,
  onRegisterAlumni
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialMode =
    searchParams.get('mode') === 'register'
      ? 'register'
      : 'login';

  const [authMode, setAuthMode] = useState<
    'login' | 'register'
  >(initialMode);

  const [activeRole, setActiveRole] =
    useState<AuthRole>('student');

  /* =========================================================
     COMMON STATE
  ========================================================= */

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationUserId, setVerificationUserId] = useState<number | null>(null);
  const [commonPhone, setCommonPhone] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressCountry, setAddressCountry] = useState('India');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [alumniStudentRegnNo, setAlumniStudentRegnNo] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState<number[]>([]);
  void onRegisterAlumni;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(
      () => setResendCooldown((seconds) => Math.max(0, seconds - 1)),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleAuthError = (err: any, email: string, fallback: string) => {
    if (err?.status === 403) {
      setVerificationEmail(email.trim().toLowerCase());
      setError('Your email address is not verified. Verify it or request a new verification email.');
      return;
    }
    setError(err?.message || fallback);
  };

  const handleResendVerification = async () => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentAttempts = resendAttempts.filter((time) => time > oneHourAgo);
    if (resendCooldown > 0) return;
    if (recentAttempts.length >= 3) {
      setError('You have reached the resend limit. Please try again after an hour.');
      return;
    }
    try {
      if (!verificationUserId) {
        setError('Please contact the placement administrator to resend your verification email.');
        return;
      }
      const updatedAttempts = [...recentAttempts, now];
      setResendAttempts(updatedAttempts);
      localStorage.setItem('placed_verification_resend_attempts', JSON.stringify(updatedAttempts));
      setResendCooldown(60);
      await userApi.sendVerification(verificationUserId);
      setError('A new verification email has been requested. Check your inbox.');
    } catch (err: any) {
      handleAuthError(err, verificationEmail, 'Unable to resend verification email.');
    }
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('placed_verification_resend_attempts') || '[]');
      if (Array.isArray(saved)) {
        const validAttempts = saved.filter((value) => typeof value === 'number' && value > Date.now() - 60 * 60 * 1000);
        setResendAttempts(validAttempts);
        const latestAttempt = validAttempts.length ? Math.max(...validAttempts) : 0;
        if (latestAttempt) {
          setResendCooldown(Math.max(0, 60 - Math.floor((Date.now() - latestAttempt) / 1000)));
        }
      }
      const savedUserId = Number(localStorage.getItem('placed_verification_user_id'));
      if (Number.isInteger(savedUserId) && savedUserId > 0) {
        setVerificationUserId(savedUserId);
        setVerificationEmail(localStorage.getItem('placed_verification_email') || '');
      }
    } catch {
      setResendAttempts([]);
    }
  }, []);

  const buildBaseUserRequest = (
    fullName: string,
    email: string,
    password: string,
    role: 'STUDENT' | 'ALUMNI' | 'RECRUITER' | 'TPO',
    phone: string
  ) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) throw new Error('Please enter your full name.');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
    const numericCollegeId = Number(collegeId);
    if (!Number.isInteger(numericCollegeId) || numericCollegeId <= 0) {
      throw new Error('Enter the College ID assigned by your placement administrator.');
    }
    if (!addressLine1.trim() || !addressCity.trim() || !addressState.trim() ||
        !addressCountry.trim() || !addressPostalCode.trim()) {
      throw new Error('Complete the required address and college details.');
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      throw new Error('Enter a valid 10-digit mobile number.');
    }
    return {
      nameRequest: { pronounce: 'They', firstName, middleName, lastName },
      addressRequest: {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: addressCity.trim(),
        state: addressState.trim(),
        country: addressCountry.trim(),
        postalCode: addressPostalCode.trim(),
      },
      email: email.trim().toLowerCase(),
      password,
      role,
      phone: phone.trim(),
      college_id: numericCollegeId,
    };
  };

  const createBaseUser = async (
    fullName: string,
    email: string,
    password: string,
    role: 'STUDENT' | 'ALUMNI' | 'RECRUITER' | 'TPO',
    phone: string
  ) => userApi.register(buildBaseUserRequest(fullName, email, password, role, phone));

  const completeRegistration = async (userId: number, email: string) => {
    setVerificationUserId(userId);
    localStorage.setItem('placed_verification_user_id', String(userId));
    localStorage.setItem('placed_verification_email', email.toLowerCase().trim());
    setVerificationEmail(email.toLowerCase().trim());
    setAuthMode('login');
    setSearchParams({ mode: 'login' });
    try {
      await userApi.sendVerification(userId);
      setError('Your account has been created and a verification email has been requested. Check your inbox.');
    } catch {
      setError('Your account was created, but the backend could not send the verification email. Please contact the placement administrator.');
    }
  };

  useEffect(() => {
    const modeParam = searchParams.get('mode');

    if (
      modeParam === 'register' ||
      modeParam === 'login'
    ) {
      setAuthMode(modeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;
    userApi.confirmVerificationToken(token)
      .then((message) => {
        if (typeof message !== 'string' || !message.toLowerCase().includes('email verified') || message.toLowerCase().includes('not verified')) {
          throw new Error('Verification was not successful.');
        }
        setError('Your email has been verified. You can now sign in.');
        setVerificationEmail('');
        setVerificationUserId(null);
        localStorage.removeItem('placed_verification_user_id');
        localStorage.removeItem('placed_verification_email');
        setSearchParams({ mode: 'login' });
      })
      .catch(() => setError('This verification link is invalid or expired.'));
  }, [searchParams, setSearchParams]);

  const handleModeChange = (
    mode: 'login' | 'register'
  ) => {
    setAuthMode(mode);
    setSearchParams({ mode });
    setError('');
  };

  const handleRoleChange = (role: AuthRole) => {
    setActiveRole(role);
    setError('');
    setShowPassword(false);
  };

  /* =========================================================
     STUDENT LOGIN / REGISTRATION
  ========================================================= */

  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRegistrationNumber, setRegRegistrationNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [regBranch, setRegBranch] = useState<
    | 'Computer Science'
    | 'Information Technology'
    | 'Electronics'
    | 'Mechanical'
    | 'Electrical'
  >('Computer Science');

  const [regCgpa, setRegCgpa] = useState('8.0');
  const [regYearOfAdmission, setRegYearOfAdmission] = useState('');
  const [regSkills, setRegSkills] = useState('React, TypeScript, JavaScript');
  const [regResume, setRegResume] = useState('');

  /* =========================================================
     ALUMNI REGISTRATION
  ========================================================= */

  const [alumniName, setAlumniName] = useState('');
  const [alumniEmail, setAlumniEmail] = useState('');
  const [alumniPassword, setAlumniPassword] = useState('');
  const [alumniGraduationYear, setAlumniGraduationYear] = useState(
    new Date().getFullYear().toString()
  );
  const [alumniCompany, setAlumniCompany] = useState('');
  const [alumniCurrentRole, setAlumniCurrentRole] = useState('');
  const [alumniDepartment, setAlumniDepartment] = useState<
    | 'Computer Science'
    | 'Information Technology'
    | 'Electronics'
    | 'Mechanical'
    | 'Electrical'
  >('Information Technology');
  const [alumniLinkedIn, setAlumniLinkedIn] = useState('');

  /* =========================================================
     RECRUITER LOGIN / REGISTRATION
  ========================================================= */

  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [recruiterPassword, setRecruiterPassword] = useState('');
  const [recName, setRecName] = useState('');
  const [recCompany, setRecCompany] = useState('');
  const [recDesignation, setRecDesignation] = useState('Technical Recruiter');
  const [recEmail, setRecEmail] = useState('');
  const [recPassword, setRecPassword] = useState('');

  /* =========================================================
     ADMIN CREDENTIALS
  ========================================================= */

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');

  /* =========================================================
     STUDENT SUBMIT
  ========================================================= */

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      const loginInput = studentRegNo.trim();

      if (!loginInput) {
        setError('Please enter your student email or MAKAUT registration number.');
        return;
      }

      setIsSubmitting(true);

      try {
        const res = await authApi.loginStudent({
          identifier: loginInput,
          password: studentPassword,
        });
        if (res?.role !== 'STUDENT') {
          throw new Error('This account is not registered with the Student role.');
        }

        if (res?.token) {
          localStorage.setItem('token', res.token);
          if (res.refreshToken) {
            localStorage.setItem('refreshToken', res.refreshToken);
          }
          localStorage.setItem('role', res.role || 'STUDENT');

          // The backend student profile is keyed by the 12-digit registration number.
          let resolvedStudentId = loginInput;
          if (!/^\d{12}$/.test(loginInput)) {
            const allStudents = await studentApi.getAll();
            const found = allStudents.find(
              (student) => student.email?.toLowerCase().trim() === loginInput.toLowerCase()
            );
            if (!found) throw new Error('Your student account has no linked student profile. Contact the placement administrator.');
            resolvedStudentId = String(found.id);
          }

          localStorage.setItem('studentId', resolvedStudentId);
          onLogin('student', resolvedStudentId);
        } else {
          throw new Error('The backend did not return an access token. Please try again.');
        }
      } catch (err: any) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        handleAuthError(err, loginInput, 'Invalid student credentials.');
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    /* =====================================================
       STUDENT REGISTRATION
    ===================================================== */

    if (
      !regName.trim() ||
      !regEmail.trim() ||
      !regRegistrationNumber.trim() ||
      !regPassword ||
      !regPhone.trim()
    ) {
      setError(
        'Please fill in all required fields.'
      );
      return;
    }

    const cleanedPhone = regPhone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setError('Mobile number must be a valid 10-digit number starting with 6, 7, 8, or 9.');
      return;
    }

    const normalizedEmail = regEmail.toLowerCase().trim();
    const rawRegNo = regRegistrationNumber.trim();
    const numericRegNo = rawRegNo.replace(/\D/g, '');

    if (numericRegNo.length !== 12) {
      setError('Registration number must be exactly 12 digits (e.g. 241000110549).');
      return;
    }

    if (!/^[a-zA-Z ]+$/.test(regName.trim())) {
      setError('Name must contain only letters and spaces.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (
      students.some(
        (s) =>
          s.registrationNumber
            ?.toLowerCase()
            .trim() === numericRegNo || String(s.id).trim() === numericRegNo
      )
    ) {
      setError(
        'An account with this registration number is already registered.'
      );
      return;
    }

    if (
      students.some(
        (s) =>
          s.email
            .toLowerCase()
            .trim() === normalizedEmail
      )
    ) {
      setError(
        'An account with this email is already registered.'
      );
      return;
    }

    const cgpaNum = parseFloat(regCgpa);

    if (
      Number.isNaN(cgpaNum) ||
      cgpaNum < 0 ||
      cgpaNum > 10
    ) {
      setError(
        'CGPA must be a valid number between 0 and 10.'
      );
      return;
    }

    const newStudent: Student = {
      id: numericRegNo,

      name: regName.trim(),

      email: normalizedEmail,

      phone: cleanedPhone,

      registrationNumber: numericRegNo,

      password: regPassword,

      branch: regBranch,

      cgpa: cgpaNum,

      backlogs: 0,

      placementStatus: 'Unplaced',

      placedCompany: undefined,

      placedPackage: undefined,

      resumeScore: 85,

      skills: regSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),

      projectsCount: 0,

      resumeText: regResume,

      applications: [],

      department: regBranch
    };

    setIsSubmitting(true);
    try {
      if (!regResume.trim() || !/^https?:\/\//i.test(regResume.trim())) {
        throw new Error('Enter a valid public resume URL (https://...).');
      }
      const baseUser = await createBaseUser(newStudent.name, normalizedEmail, regPassword, 'STUDENT', cleanedPhone);
      await studentApi.add({
        id: numericRegNo,
        department: newStudent.department,
        cgpa: newStudent.cgpa,
        activeBacklogs: 0,
        resumeUrl: regResume.trim(),
        yearOfAdmission: regYearOfAdmission.trim(),
        userId: baseUser.id,
      });

      onRegister({ ...newStudent, userId: baseUser.id, yearOfAdmission: regYearOfAdmission.trim() });
      setStudentRegNo(normalizedEmail);
      setStudentPassword('');
      await completeRegistration(baseUser.id, normalizedEmail);
    } catch (err: any) {
      setError(err?.message || 'Student registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     ALUMNI SUBMIT
  ========================================================= */

  const handleAlumniSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      const loginEmail = alumniEmail.trim();

      if (!loginEmail || !alumniPassword) {
        setError('Please enter your alumni email address and password.');
        return;
      }

      setIsSubmitting(true);

      try {
        const res = await authApi.login({
          email: loginEmail,
          password: alumniPassword,
          role: 'ALUMNI',
        });
        if (res?.role !== 'ALUMNI') {
          throw new Error('This account is not registered with the Alumni role.');
        }

        if (res?.token) {
          localStorage.setItem('token', res.token);
          if (res.refreshToken) {
            localStorage.setItem('refreshToken', res.refreshToken);
          }
          localStorage.setItem('role', res.role || 'ALUMNI');

          const allAlumni = await alumniApi.getAll();
          const foundAlumni = allAlumni.find(
            (a) => a.email.toLowerCase().trim() === loginEmail.toLowerCase()
          );
          if (!foundAlumni) throw new Error('Your account has no linked alumni profile. Contact the placement administrator.');
          const resolvedAlumniId = String(foundAlumni.id);

          localStorage.setItem('alumniId', resolvedAlumniId);
          onLogin('alumni', resolvedAlumniId);
        } else {
          throw new Error('The backend did not return an access token. Please try again.');
        }
      } catch (err: any) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('alumniId');
        handleAuthError(err, loginEmail, 'Invalid alumni credentials.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    /* =====================================================
       ALUMNI REGISTRATION VALIDATION
    ===================================================== */

    if (
      !alumniName.trim() ||
      !alumniEmail.trim() ||
      !alumniPassword ||
      !alumniGraduationYear.trim() ||
      !alumniCompany.trim() ||
      !alumniCurrentRole.trim() ||
      !alumniDepartment.trim()
    ) {
      setError('Please fill in all required alumni fields.');
      return;
    }

    const normalizedEmail = alumniEmail.toLowerCase().trim();

    if (
      alumni.some(
        (a) => a.email.toLowerCase().trim() === normalizedEmail
      )
    ) {
      setError('An alumni account with this email is already registered.');
      return;
    }

    if (
      students.some(
        (s) => s.email.toLowerCase().trim() === normalizedEmail
      )
    ) {
      setError('This email is already registered as a student account.');
      return;
    }

    const graduationYear = parseInt(alumniGraduationYear, 10);
    const currentYear = new Date().getFullYear();

    if (
      Number.isNaN(graduationYear) ||
      graduationYear < 1950 ||
      graduationYear > currentYear
    ) {
      setError(`Graduation year must be between 1950 and ${currentYear}.`);
      return;
    }

    if (
      alumniLinkedIn.trim() &&
      !(
        alumniLinkedIn.trim().startsWith('http://') ||
        alumniLinkedIn.trim().startsWith('https://')
      )
    ) {
      setError('LinkedIn URL should start with http:// or https://.');
      return;
    }

    const registrationRequest: AlumniRegistrationRequest = {
      name: alumniName.trim(),
      email: normalizedEmail,
      password: alumniPassword,
      graduationYear,
      currentCompany: alumniCompany.trim(),
      currentRole: alumniCurrentRole.trim(),
      department: alumniDepartment,
      linkedIn: alumniLinkedIn.trim(),
    };

    try {
      setIsSubmitting(true);
      if (!/^\d{12}$/.test(alumniStudentRegnNo.trim())) {
        throw new Error('Enter the 12-digit registration number of your existing student record.');
      }
      const baseUser = await createBaseUser(alumniName.trim(), normalizedEmail, alumniPassword, 'ALUMNI', commonPhone);
      await alumniApi.addDetails({
        userId: baseUser.id,
        studentRegnNo: alumniStudentRegnNo.trim(),
        bio: `${registrationRequest.currentRole} at ${registrationRequest.currentCompany}; graduated ${graduationYear}; department: ${registrationRequest.department}`,
        location: addressCity.trim(),
        linkedinUrl: registrationRequest.linkedIn,
      });
      setAlumniEmail(normalizedEmail);
      setStudentPassword('');
      await completeRegistration(baseUser.id, normalizedEmail);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Unable to register alumni.'
      );
    } finally {
      setIsSubmitting(false);
    }

    setAlumniName('');
    setAlumniPassword('');
    setAlumniGraduationYear(currentYear.toString());
    setAlumniCompany('');
    setAlumniCurrentRole('');
    setAlumniDepartment('Information Technology');
    setAlumniLinkedIn('');
  };

  /* =========================================================
     RECRUITER SUBMIT
  ========================================================= */

  const handleRecruiterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      setIsSubmitting(true);

      try {
        const identifier = recruiterEmail.trim();
        const res = await authApi.login({
          email: identifier,
          password: recruiterPassword,
          role: 'RECRUITER',
        });
        if (res?.role !== 'RECRUITER') {
          throw new Error('This account is not registered with the Recruiter role.');
        }

        if (!res?.token) throw new Error('The backend did not return an access token. Please try again.');
        localStorage.setItem('token', res.token);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('role', res.role || 'RECRUITER');

        const allRecruiters = await recruiterApi.getAll();
        const realRecruiter = allRecruiters.find(
          (recruiter) => recruiter.email.toLowerCase().trim() === identifier.toLowerCase().trim()
        );
        if (!realRecruiter) {
          throw new Error('Your account has no linked recruiter profile. Contact the placement administrator.');
        }
        if (realRecruiter.recruiterStatus !== 'APPROVED') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('role');
          if (realRecruiter.recruiterStatus === 'REJECTED') {
            setError('Your recruiter account request has been rejected by TPO.');
          } else {
            setError('Your recruiter account is pending TPO approval. Please wait for the TPO to approve your account before logging in.');
          }
          return;
        }
        localStorage.setItem('recruiterId', String(realRecruiter.id));
        onLogin('recruiter', String(realRecruiter.id));
      } catch (err: any) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('recruiterId');
        handleAuthError(err, recruiterEmail, 'Invalid recruiter credentials.');
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (
      !recName.trim() ||
      !recCompany.trim() ||
      !recEmail.trim() ||
      !recPassword
    ) {
      setError('Please fill in all required recruiter fields.');
      return;
    }

    const normalizedEmail = recEmail.toLowerCase().trim();

    if (
      recruiters.some(
        (r) => r.email.toLowerCase().trim() === normalizedEmail
      )
    ) {
      setError('A recruiter with this email is already registered.');
      return;
    }

    const newRecruiter: Recruiter = {
      id: `rec_${Math.random().toString(36).substring(2, 11)}`,
      name: recName.trim(),
      email: normalizedEmail,
      password: recPassword,
      companyName: recCompany.trim(),
      designation: recDesignation.trim() || 'Recruiter',
      recruiterStatus: 'PENDING',
    };

    setIsSubmitting(true);
    try {
      const baseUser = await createBaseUser(recName.trim(), normalizedEmail, recPassword, 'RECRUITER', commonPhone);
      const createdRecruiter = await recruiterApi.register({
        userId: baseUser.id,
        companyName: recCompany.trim(),
        designation: newRecruiter.designation,
      });

      onRegisterRecruiter({
        ...newRecruiter,
        id: String(createdRecruiter.id),
        recruiterStatus: createdRecruiter.recruiterStatus,
      });
      setRecruiterEmail(normalizedEmail);
      setRecruiterPassword('');
      await completeRegistration(baseUser.id, normalizedEmail);
      setError('Recruiter account created. A verification email was requested; TPO approval is also required before recruiter access.');
    } catch (err: any) {
      setError(err?.message || 'Recruiter registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     ADMIN SUBMIT
  ========================================================= */

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      setIsSubmitting(true);

      try {
        const res = await authApi.login({
          email: adminEmail.trim(),
          password: adminPassword,
          role: 'TPO',
        });
        if (res?.role !== 'TPO') {
          throw new Error('This account is not registered with the TPO role.');
        }

        if (res?.token) {
          localStorage.setItem('token', res.token);
          if (res.refreshToken) {
            localStorage.setItem('refreshToken', res.refreshToken);
          }
          localStorage.setItem('role', res.role || 'TPO');
          onLogin('admin');
        } else {
          throw new Error('No token returned from backend.');
        }
      } catch (err: any) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        handleAuthError(err, adminEmail, 'Unable to log in as administrator.');
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (!adminName.trim() || !adminEmail.trim() || !adminPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedEmail = adminEmail.toLowerCase().trim();
      const baseUser = await createBaseUser(adminName.trim(), normalizedEmail, adminPassword, 'TPO', commonPhone);
      await userApi.registerTpo(baseUser.id);
      setAdminEmail(normalizedEmail);
      setAdminPassword('');
      await completeRegistration(baseUser.id, normalizedEmail);
    } catch (err: any) {
      setError(err?.message || 'TPO Admin registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };
  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="auth-page-container">
      <div
        id="login-section"
        className="auth-section-wrapper py-12"
      >
        <div className="auth-split-container">

          {/* =================================================
              LEFT VISUAL PANEL
          ================================================= */}

          <div className="auth-visual-panel">
            <div className="auth-visual-header">

              <span className="auth-visual-badge">
                <Sparkles size={14} />
                Unified Placement Engine
              </span>

              <h2 className="auth-visual-title">
                Elevate Campus Placements
              </h2>

              <p className="auth-visual-desc">
                Streamline recruitment drives,
                score candidate resumes with AI,
                and track placement pipelines
                in real-time.
              </p>
            </div>

            <div className="auth-feature-list">

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <FileCheck2 size={20} />
                </div>

                <div className="auth-feature-text">
                  <h4>
                    AI ATS Resume Scorer
                  </h4>

                  <p>
                    Instant resume keyword
                    scoring against corporate
                    cutoffs.
                  </p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <BarChart2 size={20} />
                </div>

                <div className="auth-feature-text">
                  <h4>
                    Real-Time Pipeline
                  </h4>

                  <p>
                    Stage-by-stage candidate
                    promotion from online tests
                    to HR offers.
                  </p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Users size={20} />
                </div>

                <div className="auth-feature-text">
                  <h4>
                    Recruiter CRM
                  </h4>

                  <p>
                    Manage companies, recruiters,
                    drives and candidate selection.
                  </p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Award size={20} />
                </div>

                <div className="auth-feature-text">
                  <h4>
                    Alumni Network
                  </h4>

                  <p>
                    Connect students with alumni
                    for career advice, blogs and
                    referrals.
                  </p>
                </div>
              </div>
            </div>

            <div className="auth-visual-footer">

              <div className="auth-footer-stat">
                <span>95%</span>
                <span>Placement Rate</span>
              </div>

              <div className="auth-footer-stat">
                <span>300+</span>
                <span>Corporate Partners</span>
              </div>

              <div className="auth-footer-stat">
                <span>5000+</span>
                <span>Active Candidates</span>
              </div>

            </div>
          </div>

          {/* =================================================
              RIGHT FORM PANEL
          ================================================= */}

          <div className="auth-form-panel">

            <div>

              {/* =================================================
                  LOGIN / REGISTER SWITCH
              ================================================= */}

              <div className="auth-mode-switcher">

                <button
                  type="button"
                  onClick={() => {
                    handleModeChange('login');
                  }}
                  className={`auth-mode-btn ${
                    authMode === 'login'
                      ? 'active'
                      : ''
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleModeChange(
                      'register'
                    );
                  }}
                  className={`auth-mode-btn ${
                    authMode === ('register' as 'login' | 'register')
                      ? 'active'
                      : ''
                  }`}
                >
                  Register New Account
                </button>

              </div>

              {/* =================================================
                  ROLE SELECTOR
              ================================================= */}

              <div className="role-grid-header">
                <label>
                  Select Portal Role
                </label>
              </div>

              <div className="role-grid-4">

                {/* Student */}

                <button
                  type="button"
                  onClick={() =>
                    handleRoleChange(
                      'student'
                    )
                  }
                  className={`role-card-item ${
                    activeRole === 'student'
                      ? 'active'
                      : ''
                  }`}
                >
                  <GraduationCap
                    size={18}
                    className="role-card-icon"
                  />

                  <span className="role-card-title">
                    Student
                  </span>
                </button>

                {/* Admin */}

                <button
                  type="button"
                  onClick={() =>
                    handleRoleChange(
                      'admin'
                    )
                  }
                  className={`role-card-item ${
                    activeRole === 'admin'
                      ? 'active'
                      : ''
                  }`}
                >
                  <Shield
                    size={18}
                    className="role-card-icon"
                  />

                  <span className="role-card-title">
                    TPO / Admin
                  </span>
                </button>

                {/* Recruiter */}

                <button
                  type="button"
                  onClick={() =>
                    handleRoleChange(
                      'recruiter'
                    )
                  }
                  className={`role-card-item ${
                    activeRole === 'recruiter'
                      ? 'active'
                      : ''
                  }`}
                >
                  <Building2
                    size={18}
                    className="role-card-icon"
                  />

                  <span className="role-card-title">
                    Recruiter
                  </span>
                </button>

                {/* Alumni */}

                <button
                  type="button"
                  onClick={() =>
                    handleRoleChange(
                      'alumni'
                    )
                  }
                  className={`role-card-item ${
                    activeRole === 'alumni'
                      ? 'active'
                      : ''
                  }`}
                >
                  <Award
                    size={18}
                    className="role-card-icon"
                  />

                  <span className="role-card-title">
                    Alumni
                  </span>
                </button>

              </div>

              {/* =================================================
                  ERROR / STATUS MESSAGE
              ================================================= */}

              {error && (
                <div
                  className={`auth-error-banner ${
                    error.toLowerCase().includes(
                      'successfully'
                    ) ||
                    error.toLowerCase().includes(
                      'waiting'
                    ) ||
                    error.toLowerCase().includes(
                      'approval'
                    )
                      ? 'auth-success-banner'
                      : ''
                  }`}
                >
                  <span className="auth-error-dot" />

                  <span>{error}</span>
                  {verificationEmail && verificationUserId && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isSubmitting || resendCooldown > 0 || resendAttempts.filter((time) => time > Date.now() - 60 * 60 * 1000).length >= 3}
                      className="ml-2 underline font-semibold disabled:opacity-50"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : resendAttempts.filter((time) => time > Date.now() - 60 * 60 * 1000).length >= 3
                          ? 'Resend limit reached'
                          : 'Resend verification email'}
                    </button>
                  )}
                </div>
              )}

              {authMode === 'register' && (
                <div className="auth-form-scrollable my-4 rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold mb-3">Account details required by PlaceD</h3>
                  {activeRole !== 'student' && (
                    <div className="auth-input-group mb-3">
                      <label className="auth-input-label">Mobile Number *</label>
                      <input type="tel" required maxLength={10} value={commonPhone}
                        onChange={(e) => setCommonPhone(e.target.value.replace(/\\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number" className="auth-input-field" />
                    </div>
                  )}
                  <div className="auth-input-group mb-3">
                    <label className="auth-input-label">College ID *</label>
                    <input type="number" min="1" required value={collegeId}
                      onChange={(e) => setCollegeId(e.target.value)}
                      placeholder="College ID provided by your TPO" className="auth-input-field" />
                    <p className="text-xs text-slate-500 mt-1">The current backend accepts a college ID, but does not expose a college-list endpoint.</p>
                  </div>
                  <div className="auth-input-group mb-3">
                    <label className="auth-input-label">Address Line 1 *</label>
                    <input required value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="House / street / locality" className="auth-input-field" />
                  </div>
                  <div className="auth-input-group mb-3">
                    <label className="auth-input-label">Address Line 2</label>
                    <input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Apartment / landmark (optional)" className="auth-input-field" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="auth-input-group">
                      <label className="auth-input-label">City *</label>
                      <input required value={addressCity} onChange={(e) => setAddressCity(e.target.value)}
                        className="auth-input-field" />
                    </div>
                    <div className="auth-input-group">
                      <label className="auth-input-label">State *</label>
                      <input required value={addressState} onChange={(e) => setAddressState(e.target.value)}
                        className="auth-input-field" />
                    </div>
                    <div className="auth-input-group">
                      <label className="auth-input-label">Country *</label>
                      <input required value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)}
                        className="auth-input-field" />
                    </div>
                    <div className="auth-input-group">
                      <label className="auth-input-label">Postal Code *</label>
                      <input required value={addressPostalCode} onChange={(e) => setAddressPostalCode(e.target.value)}
                        className="auth-input-field" />
                    </div>
                  </div>
                </div>
              )}

              {authMode === 'register' && (
                <div className="auth-form-scrollable my-4 rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold mb-3">Additional details required by the backend</h3>
                  {activeRole !== 'student' && (
                    <div className="auth-input-group mb-3">
                      <label className="auth-input-label">Mobile Number *</label>
                      <input type="tel" required maxLength={10} value={commonPhone}
                        onChange={(e) => setCommonPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number" className="auth-input-field" />
                    </div>
                  )}
                  <div className="auth-input-group mb-3">
                    <label className="auth-input-label">College ID *</label>
                    <input type="number" min="1" required value={collegeId}
                      onChange={(e) => setCollegeId(e.target.value)}
                      placeholder="College ID supplied by your TPO" className="auth-input-field" />
                    <p className="text-xs text-slate-500 mt-1">The existing backend accepts a numeric college ID but does not expose a college-list endpoint.</p>
                  </div>
                  <div className="auth-input-group mb-3">
                    <label className="auth-input-label">Address Line 1 *</label>
                    <input required value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="House / street / locality" className="auth-input-field" />
                  </div>
                  <div className="auth-input-group mb-3">
                    <label className="auth-input-label">Address Line 2</label>
                    <input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Apartment / landmark (optional)" className="auth-input-field" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="auth-input-group"><label className="auth-input-label">City *</label>
                      <input required value={addressCity} onChange={(e) => setAddressCity(e.target.value)} className="auth-input-field" /></div>
                    <div className="auth-input-group"><label className="auth-input-label">State *</label>
                      <input required value={addressState} onChange={(e) => setAddressState(e.target.value)} className="auth-input-field" /></div>
                    <div className="auth-input-group"><label className="auth-input-label">Country *</label>
                      <input required value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)} className="auth-input-field" /></div>
                    <div className="auth-input-group"><label className="auth-input-label">Postal Code *</label>
                      <input required value={addressPostalCode} onChange={(e) => setAddressPostalCode(e.target.value)} className="auth-input-field" /></div>
                  </div>
                </div>
              )}

              {/* =================================================
                  STUDENT
              ================================================= */}

              {activeRole === 'student' && (
                <form
                  onSubmit={
                    handleStudentSubmit
                  }
                >
                  {authMode === 'login' ? (
                    <>
                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          Email Address or Registration Number
                        </label>

                        <div className="auth-input-box">

                          <Mail
                            size={18}
                            className="auth-input-icon"
                          />

                          <input
                            type="text"
                            required
                            value={
                              studentRegNo
                            }
                            onChange={(e) =>
                              setStudentRegNo(
                                e.target.value
                              )
                            }
                            placeholder="student@example.com or 241000110549"
                            className="auth-input-field"
                          />

                        </div>
                      </div>

                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          Password
                        </label>

                        <div className="auth-input-box">

                          <input
                            type={
                              showPassword
                                ? 'text'
                                : 'password'
                            }
                            required
                            value={
                              studentPassword
                            }
                            onChange={(e) =>
                              setStudentPassword(
                                e.target.value
                              )
                            }
                            placeholder="••••••••"
                            className="auth-input-field"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(
                                (value) =>
                                  !value
                              )
                            }
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>

                        </div>
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn mt-2"
                        disabled={
                          isSubmitting
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Authenticating…
                          </>
                        ) : (
                          <>
                            Sign In as Student
                            <ArrowRight
                              size={18}
                            />
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="auth-form-scrollable">

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Full Name
                          </label>

                          <div className="auth-input-box">

                            <input
                              type="text"
                              required
                              value={regName}
                              onChange={(e) =>
                                setRegName(
                                  e.target.value
                                )
                              }
                              placeholder="Aravind Sharma"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Registration Number
                          </label>

                          <div className="auth-input-box">

                            <input
                              type="text"
                              required
                              value={
                                regRegistrationNumber
                              }
                              onChange={(e) =>
                                setRegRegistrationNumber(
                                  e.target.value
                                )
                              }
                              placeholder="241000110xxx"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Email Address
                          </label>

                          <div className="auth-input-box">

                            <Mail
                              size={16}
                              className="auth-input-icon"
                            />

                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) =>
                                setRegEmail(
                                  e.target.value
                                )
                              }
                              placeholder="user@univ.edu"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Mobile Number
                          </label>

                          <div className="auth-input-box">

                            <Phone
                              size={16}
                              className="auth-input-icon"
                            />

                            <input
                              type="tel"
                              required
                              maxLength={10}
                              value={regPhone}
                              onChange={(e) =>
                                setRegPhone(
                                  e.target.value.replace(/\D/g, '').slice(0, 10)
                                )
                              }
                              placeholder="9876543210"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Password
                          </label>

                          <div className="auth-input-box">

                            <input
                              type="password"
                              required
                              value={regPassword}
                              onChange={(e) =>
                                setRegPassword(
                                  e.target.value
                                )
                              }
                              placeholder="••••••••"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Department / Branch
                          </label>

                          <div className="auth-input-box">

                            <select
                              value={regBranch}
                              onChange={(e) =>
                                setRegBranch(
                                  e.target.value as typeof regBranch
                                )
                              }
                              className="auth-input-field"
                            >
                              <option value="Computer Science">
                                Computer Science
                              </option>

                              <option value="Information Technology">
                                Information Technology
                              </option>

                              <option value="Electronics">
                                Electronics
                              </option>

                              <option value="Mechanical">
                                Mechanical
                              </option>

                              <option value="Electrical">
                                Electrical
                              </option>
                            </select>

                          </div>
                        </div>

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            CGPA (0 - 10)
                          </label>

                          <div className="auth-input-box">

                            <input
                              type="number"
                              step="0.01"
                              required
                              value={regCgpa}
                              onChange={(e) =>
                                setRegCgpa(
                                  e.target.value
                                )
                              }
                              min="0"
                              max="10"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                      </div>

                      <div className="auth-input-group mb-3">
                        <label className="auth-input-label">Year of Admission *</label>
                        <input type="number" required min="1950" max={new Date().getFullYear()}
                          value={regYearOfAdmission}
                          onChange={(e) => setRegYearOfAdmission(e.target.value)}
                          placeholder="e.g. 2024" className="auth-input-field" />
                      </div>

                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          Technical Skills
                        </label>

                        <div className="auth-input-box">

                          <input
                            type="text"
                            value={regSkills}
                            onChange={(e) =>
                              setRegSkills(
                                e.target.value
                              )
                            }
                            placeholder="React, TypeScript, Python, SQL"
                            className="auth-input-field"
                          />

                        </div>
                      </div>



                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          Public Resume URL *
                        </label>

                        <div className="auth-input-box">

                            <input
                              type="url"
                              required
                              value={regResume}
                              onChange={(e) => setRegResume(e.target.value)}
                              placeholder="https://drive.google.com/..."
                              className="auth-input-field"
                            />

                        </div>
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn mt-3"
                        disabled={
                          isSubmitting
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Creating Account…
                          </>
                        ) : (
                          <>
                            Register Student Profile
                            <UserPlus
                              size={18}
                            />
                          </>
                        )}
                      </button>

                    </div>
                  )}
                </form>
              )}

              {/* =================================================
                  ALUMNI
              ================================================= */}

              {activeRole === 'alumni' && (
                <form
                  onSubmit={
                    handleAlumniSubmit
                  }
                >

                  {authMode === 'login' ? (
                    <>

                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          Alumni Email
                        </label>

                        <div className="auth-input-box">

                          <Mail
                            size={18}
                            className="auth-input-icon"
                          />

                          <input
                            type="email"
                            required
                            value={alumniEmail}
                            onChange={(e) =>
                              setAlumniEmail(
                                e.target.value
                              )
                            }
                            placeholder="alumni@example.com"
                            className="auth-input-field"
                          />

                        </div>
                      </div>

                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          Password
                        </label>

                        <div className="auth-input-box">

                          <input
                            type={
                              showPassword
                                ? 'text'
                                : 'password'
                            }
                            required
                            value={
                              alumniPassword
                            }
                            onChange={(e) =>
                              setAlumniPassword(
                                e.target.value
                              )
                            }
                            placeholder="••••••••"
                            className="auth-input-field"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(
                                (value) =>
                                  !value
                              )
                            }
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>

                        </div>
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn mt-3"
                        disabled={
                          isSubmitting
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Signing In…
                          </>
                        ) : (
                          <>
                            Sign In as Alumni
                            <ArrowRight
                              size={18}
                            />
                          </>
                        )}
                      </button>

                    </>
                  ) : (
                    <div className="auth-form-scrollable">

                      {/* Name + Email */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Full Name *
                          </label>

                          <div className="auth-input-box">

                            <input
                              type="text"
                              required
                              value={
                                alumniName
                              }
                              onChange={(e) =>
                                setAlumniName(
                                  e.target.value
                                )
                              }
                              placeholder="Rahul Sharma"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Email Address *
                          </label>

                          <div className="auth-input-box">

                            <Mail
                              size={16}
                              className="auth-input-icon"
                            />

                            <input
                              type="email"
                              required
                              value={
                                alumniEmail
                              }
                              onChange={(e) =>
                                setAlumniEmail(
                                  e.target.value
                                )
                              }
                              placeholder="rahul@gmail.com"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                      </div>

                      <div className="auth-input-group mb-3">
                        <label className="auth-input-label">Existing Student Registration Number *</label>
                        <input type="text" inputMode="numeric" maxLength={12} required value={alumniStudentRegnNo}
                          onChange={(e) => setAlumniStudentRegnNo(e.target.value.replace(/\D/g, '').slice(0, 12))}
                          placeholder="12-digit registration number linked to your student record"
                          className="auth-input-field" />
                      </div>

                      {/* Password + Graduation Year */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Password *
                          </label>

                          <div className="auth-input-box">

                            <input
                              type={
                                showPassword
                                  ? 'text'
                                  : 'password'
                              }
                              required
                              value={
                                alumniPassword
                              }
                              onChange={(e) =>
                                setAlumniPassword(
                                  e.target.value
                                )
                              }
                              placeholder="••••••••"
                              className="auth-input-field"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword(
                                  (value) =>
                                    !value
                                )
                              }
                              className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>

                          </div>
                        </div>

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Graduation Year *
                          </label>

                          <div className="auth-input-box">

                            <CalendarDays
                              size={16}
                              className="auth-input-icon"
                            />

                            <input
                              type="number"
                              required
                              min="1950"
                              max={
                                new Date().getFullYear()
                              }
                              value={
                                alumniGraduationYear
                              }
                              onChange={(e) =>
                                setAlumniGraduationYear(
                                  e.target.value
                                )
                              }
                              placeholder="2024"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                      </div>

                      {/* Company + Role */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Current Company *
                          </label>

                          <div className="auth-input-box">

                            <Building2
                              size={16}
                              className="auth-input-icon"
                            />

                            <input
                              type="text"
                              required
                              value={
                                alumniCompany
                              }
                              onChange={(e) =>
                                setAlumniCompany(
                                  e.target.value
                                )
                              }
                              placeholder="Google"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Current Role *
                          </label>

                          <div className="auth-input-box">

                            <Briefcase
                              size={16}
                              className="auth-input-icon"
                            />

                            <input
                              type="text"
                              required
                              value={
                                alumniCurrentRole
                              }
                              onChange={(e) =>
                                setAlumniCurrentRole(
                                  e.target.value
                                )
                              }
                              placeholder="Software Engineer"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                      </div>

                      {/* Department */}

                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          Department *
                        </label>

                        <div className="auth-input-box">

                          <select
                            required
                            value={
                              alumniDepartment
                            }
                            onChange={(e) =>
                              setAlumniDepartment(
                                e.target.value as typeof alumniDepartment
                              )
                            }
                            className="auth-input-field"
                          >

                            <option value="Computer Science">
                              Computer Science
                            </option>

                            <option value="Information Technology">
                              Information Technology
                            </option>

                            <option value="Electronics">
                              Electronics
                            </option>

                            <option value="Mechanical">
                              Mechanical
                            </option>

                            <option value="Electrical">
                              Electrical
                            </option>

                          </select>

                        </div>
                      </div>

                      {/* LinkedIn */}

                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          LinkedIn Profile
                        </label>

                        <div className="auth-input-box">

                          <ExternalLink
                            size={16}
                            className="auth-input-icon"
                          />

                          <input
                            type="url"
                            value={
                              alumniLinkedIn
                            }
                            onChange={(e) =>
                              setAlumniLinkedIn(
                                e.target.value
                              )
                            }
                            placeholder="https://linkedin.com/in/your-profile"
                            className="auth-input-field"
                          />

                        </div>
                      </div>



                      <button
                        type="submit"
                        className="auth-submit-btn mt-3"
                        disabled={
                          isSubmitting
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Submitting…
                          </>
                        ) : (
                          <>
                            Submit Alumni Registration
                            <UserPlus
                              size={18}
                            />
                          </>
                        )}
                      </button>

                    </div>
                  )}

                </form>
              )}

              {/* =================================================
                  RECRUITER
              ================================================= */}

              {activeRole === 'recruiter' && (
                <form
                  onSubmit={
                    handleRecruiterSubmit
                  }
                >

                  {authMode === 'login' ? (
                    <>
                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          Work Email Address
                        </label>

                        <div className="auth-input-box">

                          <Mail
                            size={18}
                            className="auth-input-icon"
                          />

                          <input
                            type="email"
                            required
                            value={
                              recruiterEmail
                            }
                            onChange={(e) =>
                              setRecruiterEmail(
                                e.target.value
                              )
                            }
                            placeholder="you@company.com"
                            className="auth-input-field"
                          />

                        </div>
                      </div>

                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          Password
                        </label>

                        <div className="auth-input-box">

                          <input
                            type={
                              showPassword
                                ? 'text'
                                : 'password'
                            }
                            required
                            value={
                              recruiterPassword
                            }
                            onChange={(e) =>
                              setRecruiterPassword(
                                e.target.value
                              )
                            }
                            placeholder="••••••••"
                            className="auth-input-field"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(
                                (value) =>
                                  !value
                              )
                            }
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>

                        </div>
                      </div>

                      <div className="auth-alumni-info-card my-3">
                        <div className="flex items-start gap-3">
                          <Clock3
                            size={20}
                            className="shrink-0 text-amber-500"
                          />
                          <div>
                            <strong>
                              TPO Approval Required
                            </strong>
                            <p>
                              Recruiter accounts must be approved by the TPO before you can sign in.
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn mt-2"
                        disabled={
                          isSubmitting
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Authenticating…
                          </>
                        ) : (
                          <>
                            Sign In as Recruiter
                            <ArrowRight
                              size={18}
                            />
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="auth-form-scrollable">

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Full Name
                          </label>

                          <div className="auth-input-box">

                            <input
                              type="text"
                              required
                              value={recName}
                              onChange={(e) =>
                                setRecName(
                                  e.target.value
                                )
                              }
                              placeholder="Ananya Iyer"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Company Name
                          </label>

                          <div className="auth-input-box">

                            <Building2
                              size={16}
                              className="auth-input-icon"
                            />

                            <input
                              type="text"
                              required
                              value={
                                recCompany
                              }
                              onChange={(e) =>
                                setRecCompany(
                                  e.target.value
                                )
                              }
                              placeholder="Google / Microsoft"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Work Email
                          </label>

                          <div className="auth-input-box">

                            <Mail
                              size={16}
                              className="auth-input-icon"
                            />

                            <input
                              type="email"
                              required
                              value={
                                recEmail
                              }
                              onChange={(e) =>
                                setRecEmail(
                                  e.target.value
                                )
                              }
                              placeholder="you@company.com"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                        <div className="auth-input-group">

                          <label className="auth-input-label">
                            Password
                          </label>

                          <div className="auth-input-box">

                            <input
                              type="password"
                              required
                              value={
                                recPassword
                              }
                              onChange={(e) =>
                                setRecPassword(
                                  e.target.value
                                )
                              }
                              placeholder="••••••••"
                              className="auth-input-field"
                            />

                          </div>
                        </div>

                      </div>

                      <div className="auth-input-group">

                        <label className="auth-input-label">
                          Designation
                        </label>

                        <div className="auth-input-box">

                          <input
                            type="text"
                            value={
                              recDesignation
                            }
                            onChange={(e) =>
                              setRecDesignation(
                                e.target.value
                              )
                            }
                            placeholder="Technical Recruiter / HR Lead"
                            className="auth-input-field"
                          />

                        </div>
                      </div>

                      <div className="auth-alumni-info-card my-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2
                            size={20}
                            className="shrink-0 text-blue-500"
                          />
                          <div>
                            <strong>
                              Recruiter Registration
                            </strong>
                            <p>
                              Your company must already exist in PlaceD. Your registration will be submitted to the TPO for approval. You will only be able to access the Recruiter Portal after your account is approved by TPO.
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn mt-3"
                        disabled={
                          isSubmitting
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Creating Account…
                          </>
                        ) : (
                          <>
                            Register Company Recruiter
                            <UserPlus
                              size={18}
                            />
                          </>
                        )}
                      </button>

                    </div>
                  )}

                </form>
              )}

              {/* =================================================
                  ADMIN
              ================================================= */}

              {activeRole === 'admin' && (
                <form onSubmit={handleAdminSubmit}>
                  {authMode === 'register' ? (
                    <>
                      <div className="auth-input-group">
                        <label className="auth-input-label">Full Name</label>
                        <div className="auth-input-box">
                          <UserPlus size={18} className="auth-input-icon" />
                          <input
                            type="text"
                            required
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="Dr. Placement Officer"
                            className="auth-input-field"
                          />
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label className="auth-input-label">Admin Email Address</label>
                        <div className="auth-input-box">
                          <Mail size={18} className="auth-input-icon" />
                          <input
                            type="email"
                            required
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="tpo@university.edu"
                            className="auth-input-field"
                          />
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label className="auth-input-label">Password</label>
                        <div className="auth-input-box">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="••••••••"
                            className="auth-input-field"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn mt-6"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            Register TPO Admin
                            <UserPlus size={18} />
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="auth-input-group">
                        <label className="auth-input-label">Admin Email Address</label>
                        <div className="auth-input-box">
                          <Mail size={18} className="auth-input-icon" />
                          <input
                            type="email"
                            required
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="tpo@university.edu"
                            className="auth-input-field"
                          />
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label className="auth-input-label">Admin Password</label>
                        <div className="auth-input-box">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="••••••••"
                            className="auth-input-field"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="auth-submit-btn mt-6"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Authenticating…
                          </>
                        ) : (
                          <>
                            Authenticate TPO Admin
                            <LogIn size={18} />
                          </>
                        )}
                      </button>
                    </>
                  )}
                </form>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};