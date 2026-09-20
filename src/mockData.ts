export interface Application {
  id?: string;
  jobPostingId: string;
  driveId: string;
  companyName: string;
  role: string;
  appliedDate: string;
  status: 'Applied' | 'Test Scheduled' | 'Tech Round 1' | 'Tech Round 2' | 'HR Round' | 'Selected' | 'Rejected';
  currentRoundIndex: number; // Index matching the drive's rounds array
  feedback?: string;
  resumeFeedback?: string;

  technicalFeedback?: string;

  hrFeedback?: string;

  overallRemark?: string;

  rating?: number;

  nextStep?: string;

}

export interface ResumeFeedback {
  score: number;
  status: "Excellent" | "Good" | "Needs Improvement";

  projects: string;
  skills: string;
  experience: string;
  ats: string;
  overall: string;

  reviewedBy: string;
  reviewedOn: string;
}

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  password?: string;
  companyName: string;
  designation: string;
  recruiterStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber?: string;
  password: string;
  phone?: string;
  year?: number;

  department: string;
  branch: string;

  cgpa: number;
  backlogs: number;
  placementStatus: 'Placed' | 'Unplaced';
  placedCompany?: string;
  placedPackage?: string;
  resumeScore: number;
  skills: string[];
  projectsCount: number;
  resumeText: string;
  applications: Application[];

  resumeFeedback?: ResumeFeedback;
}

export interface PlacementDrive {
  id: string;

  companyName: string;
  title: string;
  description: string;

  location?: string;

  package: string;
  numericPackage: number;

  // Campus-only eligibility fields
  cgpaCutoff: number | null;
  maxBacklogs: number | null;
  allowedBranches: string[] | null;
  eligibleBatch?: string | null;
  deadline: string | null;
  skillsRequired: string[] | null;

  rounds: string[];

  status: 'OPEN' | 'CLOSED';

  recruiterId?: string;
  companyId?: number;

  role: string;
  registeredCount?: number;
  jobDesc: string;

  active?: boolean;
  salary?: number;

  // Backend recruitment classification
  // CAMPUS = On Campus
  // OFF_CAMPUS = Scraped Off Campus
  recruitmentType: 'CAMPUS' | 'OFF_CAMPUS';

  sourceType?: 'RECRUITER' | 'TPO' | 'DATASET' | 'SCRAPER';

  // Off-campus / scraper fields
  applyUrl?: string | null;
  source?: string | null;
  postedAt?: string | null;
  jobType?: string | null;
  roleCategory?: string | null;
  department?: string | null;
  scrapedDate?: string | null;
}
export const INITIAL_DRIVES: PlacementDrive[] = [
  {
    id: 'drv_1',
    companyName: 'Google',
    title: 'Associate Software Engineer', // was: role
    description: 'Join Google as an Associate Software Engineer. You will work on massive scale services, cloud infrastructure, and next-generation search systems. Strong algorithms and system design skills required.', // was: jobDesc
    package: '32 LPA',
    numericPackage: 32,
    cgpaCutoff: 8.5,
    maxBacklogs: 0,
    allowedBranches: ['Computer Science', 'Information Technology'],
    eligibleBatch: '2026 Batch',
    deadline: '2026-06-25',
    skillsRequired: ['React', 'TypeScript', 'Node.js', 'Data Structures', 'System Design'],
    rounds: ['Online Coding Test', 'Technical Round 1', 'Technical Round 2', 'HR Interview'],
    status: 'OPEN', // was: active: true + status: ""
    registeredCount: 42,
    recruiterId: 'rec_1',
    role: "",
    jobDesc: "",
    recruitmentType: 'CAMPUS',
sourceType: 'RECRUITER',
  },

  {
    id: 'drv_2',
    companyName: 'Microsoft',
    role: 'Software Engineer - Azure IoT',
    package: '28 LPA',
    numericPackage: 28,
    cgpaCutoff: 8.0,
    maxBacklogs: 0,
    allowedBranches: ['Computer Science', 'Information Technology', 'Electronics'],
    deadline: '2026-06-28',
    jobDesc: 'Develop robust, scalable cloud services for IoT applications on Azure. Collaborate with global engineering teams to shape the future of edge computing.',
    skillsRequired: ['C#', 'C++', 'Azure', 'REST APIs', 'SQL'],
    rounds: ['Online Assessment', 'Technical Coding Round', 'System Architecture Round', 'HR Round'],
    active: true,
    registeredCount: 68,
    recruiterId: 'rec_2',
    title: "",
    description: "",
    salary: 0,
    status: "OPEN",
    companyId: 0,
    recruitmentType: 'CAMPUS',
sourceType: 'RECRUITER',
  },
  {
    id: 'drv_3',
    companyName: 'NVIDIA',
    role: 'GPU Compiler Engineer',
    package: '26 LPA',
    numericPackage: 26,
    cgpaCutoff: 8.2,
    maxBacklogs: 0,
    allowedBranches: ['Computer Science', 'Electronics'],
    deadline: '2026-07-02',
    jobDesc: 'Work on compiling optimizations for cutting edge GPU architectures. Design intermediate representations and deep compiler optimizations.',
    skillsRequired: ['C++', 'LLVM', 'GPU Architecture', 'Algorithms', 'Assembly'],
    rounds: ['Compiler Basics MCQ Test', 'Technical Round 1 (C++)', 'Technical Round 2 (LLVM)', 'Managerial Fitment'],
    active: true,
    registeredCount: 25,
    title: "",
    description: "",
    salary: 0,
    status: "OPEN",
    companyId: 0,
    recruitmentType: 'CAMPUS',
    sourceType: 'RECRUITER'
  },
  {
    id: 'drv_4',
    companyName: 'Amazon',
    role: 'Cloud Operations Analyst',
    package: '16 LPA',
    numericPackage: 16,
    cgpaCutoff: 7.5,
    maxBacklogs: 1,
    allowedBranches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Electrical'],
    deadline: '2026-06-20',
    jobDesc: 'Manage infrastructure operations, resolve cloud failures, and optimize AWS resources for peak traffic loads.',
    skillsRequired: ['AWS', 'Linux', 'Python', 'Networking', 'Troubleshooting'],
    rounds: ['Aptitude & Coding Test', 'Technical Core Round', 'Bar Raiser Interview'],
    active: true,
    registeredCount: 110,
    title: "",
    description: "",
    salary: 0,
    status: "OPEN",
    companyId: 0,
    recruitmentType: 'CAMPUS',
    sourceType: 'RECRUITER'
  },
  {
    id: 'drv_5',
    companyName: 'Deloitte',
    role: 'Technology Consultant',
    package: '8.5 LPA',
    numericPackage: 8.5,
    cgpaCutoff: 7.0,
    maxBacklogs: 2,
    allowedBranches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Electrical'],
    deadline: '2026-06-30',
    jobDesc: 'Provide consulting solutions to enterprises looking to modernize their legacy operations. Map business logic to technological frameworks.',
    skillsRequired: ['Communication', 'SQL', 'Excel', 'Agile Methodology', 'Analytical Thinking'],
    rounds: ['Aptitude Assessment', 'Group Discussion', 'Case Study Round', 'Partner Interview'],
    active: true,
    registeredCount: 185,
    title: "",
    description: "",
    salary: 0,
    status: "OPEN",
    companyId: 0,
    recruitmentType: 'CAMPUS',
    sourceType: 'RECRUITER'
  },
  {
    id: 'drv_6',
    companyName: 'Tesla',
    role: 'Embedded Systems Developer',
    package: '22 LPA',
    numericPackage: 22,
    cgpaCutoff: 8.0,
    maxBacklogs: 0,
    allowedBranches: ['Electronics', 'Electrical', 'Computer Science'],
    deadline: '2026-07-05',
    jobDesc: 'Program real-time controllers and firmware for EV powertrains. Work closely with hardware engineering teams to execute sensor validation tests.',
    skillsRequired: ['Embedded C', 'RTOS', 'CAN Bus', 'Microcontrollers', 'Python'],
    rounds: ['Embedded Coding Assessment', 'Hardware Design Round', 'Deep Technical Round', 'Director Fitment'],
    active: true,
    registeredCount: 19,
    title: "",
    description: "",
    salary: 0,
    status: "CLOSED",
    companyId: 0,
    recruitmentType: 'CAMPUS',
    sourceType: 'RECRUITER'
  }
];

export const INITIAL_RECRUITERS: Recruiter[] = [
  {
    id: 'rec_1',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@google.com',
    password: 'recruiter123',
    companyName: 'Google',
    designation: 'Senior Technical Recruiter'
  },
  {
    id: 'rec_2',
    name: 'Wei Zhang',
    email: 'wei.zhang@microsoft.com',
    password: 'recruiter123',
    companyName: 'Microsoft',
    designation: 'Campus Recruitment Lead'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_1',
    name: 'Aravind Sharma',
    email: 'aravind.sharma@univ.edu',
    registrationNumber: '241000110423',
    password: 'student123',
    department: 'Computer Science',
    cgpa: 9.1,
    backlogs: 0,
    placementStatus: 'Placed',
    placedCompany: 'Google',
    placedPackage: '32 LPA',
    resumeScore: 88,
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Data Structures', 'SQL'],
    projectsCount: 3,
    resumeText: 'Full Stack Developer. Experienced with React, Node.js, Express, and PostgreSQL. Created a smart campus parking app using IoT sensors and a dashboard in React, reducing search times by 30%. Built an ATS scanner script in Python using natural language processing to extract keywords. Top 5% in competitive coding challenges.',
    applications: [
      {
        driveId: 'drv_1',
        companyName: 'Google',
        role: 'Associate Software Engineer',
        appliedDate: '2026-06-10',
        status: 'Selected',
        currentRoundIndex: 3,
        feedback: 'Outstanding technical performance across all rounds. Exceptional data structures and problem-solving abilities shown.',
        jobPostingId: ""
      }
    ],
    branch: ""
  },
  {
    id: 'std_2',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@univ.edu',
    registrationNumber: '241000110523',
    password: 'student123',
    department: 'Computer Science',
    cgpa: 8.3,
    backlogs: 0,
    placementStatus: 'Unplaced',
    resumeScore: 78,
    skills: ['React', 'TypeScript', 'C++', 'System Design', 'MongoDB'],
    projectsCount: 2,
    resumeText: 'Computer Science undergraduate. Proficient in C++ and Object-Oriented Programming. Created a web dashboard in React for visualising sorting algorithms. Completed a 2-month summer internship working with local restaurant directories. Eager to work on scalable cloud services.',
    applications: [
      {
        driveId: 'drv_1',
        companyName: 'Google',
        role: 'Associate Software Engineer',
        appliedDate: '2026-06-12',
        status: 'Tech Round 1',
        currentRoundIndex: 1,
        feedback: 'Cleared the online test with 95% score. Moving to the technical coding interviews.',
        jobPostingId: ""
      },
      {
        driveId: 'drv_2',
        companyName: 'Microsoft',
        role: 'Software Engineer - Azure IoT',
        appliedDate: '2026-06-14',
        status: 'Test Scheduled',
        currentRoundIndex: 0,
        jobPostingId: ""
      }
    ],
    branch: ""
  },
  {
    id: 'std_3',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@univ.edu',
    registrationNumber: '241000110560',
    password: 'student123',
    department: 'Information Technology',
    cgpa: 7.9,
    backlogs: 0,
    placementStatus: 'Unplaced',
    resumeScore: 82,
    skills: ['React', 'JavaScript', 'AWS', 'Python', 'REST APIs', 'Linux'],
    projectsCount: 3,
    resumeText: 'IT Senior student. Certified AWS Cloud Practitioner. Built a serverless blog site utilizing AWS Lambda, DynamoDB, and API Gateway. Proficient in Python scripting and REST API design. Familiar with Linux terminal operations and bash automation.',
    applications: [
      {
        driveId: 'drv_4',
        companyName: 'Amazon',
        role: 'Cloud Operations Analyst',
        appliedDate: '2026-06-13',
        status: 'Tech Round 1',
        currentRoundIndex: 1,
        feedback: 'Demonstrated solid understanding of AWS systems and basic automation concepts.',
        jobPostingId: ""
      },
      {
        driveId: 'drv_5',
        companyName: 'Deloitte',
        role: 'Technology Consultant',
        appliedDate: '2026-06-14',
        status: 'Applied',
        currentRoundIndex: 0,
        jobPostingId: ""
      }
    ],
    branch: ""
  },
  {
    id: 'std_4',
    name: 'Karan Malhotra',
    email: 'karan.malhotra@univ.edu',
    registrationNumber: '241000110559',
    password: 'student123',
    department: 'Electronics',
    cgpa: 8.6,
    backlogs: 0,
    placementStatus: 'Placed',
    placedCompany: 'NVIDIA',
    placedPackage: '26 LPA',
    resumeScore: 85,
    skills: ['C++', 'Embedded C', 'GPU Architecture', 'RTOS', 'Verilog'],
    projectsCount: 2,
    resumeText: 'Electronics Engineering. Passionate about low-level coding and custom processor architectures. Designed an 8-bit RISC core using Verilog and simulated it. Programmed a smart watch biosensor interface using Embedded C and an RTOS. Strong understanding of computer organization.',
    applications: [
      {
        driveId: 'drv_3',
        companyName: 'NVIDIA',
        role: 'GPU Compiler Engineer',
        appliedDate: '2026-06-11',
        status: 'Selected',
        currentRoundIndex: 3,
        feedback: 'Exceptional score in the Compiler test. Excellent understanding of computer hardware architecture.',
        jobPostingId: ""
      }
    ],
    branch: ""
  },
  {
    id: 'std_5',
    name: 'Priyanka Das',
    email: 'priyanka.das@univ.edu',
    registrationNumber: '241000110674',
    password: 'student123',
    department: 'Electrical',
    cgpa: 7.2,
    backlogs: 1,
    placementStatus: 'Unplaced',
    resumeScore: 65,
    skills: ['MATLAB', 'Electrical Circuits', 'Python', 'Power Systems', 'Communication'],
    projectsCount: 1,
    resumeText: 'Electrical Engineering student. Designed a power system grid simulation in MATLAB as a capstone project. Basic programming in Python. Completed standard laboratory assignments in power systems and electrical instrumentation.',
    applications: [
      {
        driveId: 'drv_5',
        companyName: 'Deloitte',
        role: 'Technology Consultant',
        appliedDate: '2026-06-15',
        status: 'Applied',
        currentRoundIndex: 0,
        jobPostingId: ""
      }
    ],
    branch: ""
  },
  {
    id: 'std_6',
    name: 'Vikram Aditya',
    email: 'vikram.aditya@univ.edu',
    registrationNumber: '241000110550',
    password: 'student123',
    department: 'Mechanical',
    cgpa: 6.8,
    backlogs: 2,
    placementStatus: 'Unplaced',
    resumeScore: 60,
    skills: ['SolidWorks', 'AutoCAD', 'Excel', 'Project Management'],
    projectsCount: 2,
    resumeText: 'Mechanical Engineering enthusiast. Fluent in AutoCAD and SolidWorks drafting. Modeled a formula-student race car frame and ran structural load stress tests. Strong team coordination and operations lead.',
    applications: [],
    branch: ""
  }
];

export const MOCK_RESUME_TIPS = {
  keywords: [
    { word: 'React', weight: 8, category: 'Frontend' },
    { word: 'TypeScript', weight: 8, category: 'Frontend' },
    { word: 'Node.js', weight: 7, category: 'Backend' },
    { word: 'System Design', weight: 9, category: 'Architectural' },
    { word: 'AWS', weight: 7, category: 'Cloud' },
    { word: 'C++', weight: 8, category: 'Languages' },
    { word: 'Python', weight: 6, category: 'Languages' },
    { word: 'SQL', weight: 6, category: 'Database' },
    { word: 'Docker', weight: 7, category: 'DevOps' },
    { word: 'Kubernetes', weight: 8, category: 'DevOps' },
    { word: 'Algorithms', weight: 9, category: 'Core CS' },
    { word: 'Git', weight: 4, category: 'Tools' },
  ],
  actionVerbs: ['Created', 'Built', 'Designed', 'Optimized', 'Led', 'Implemented', 'Reduced', 'Increased', 'Automated', 'Collaborated']
};

export const MOCK_INTERVIEW_QAS = {
  'Software Engineer': [
    {
      question: 'How do you optimize a slow database query that is causing a page to load in 5 seconds?',
      correctKeywords: ['index', 'indexes', 'explain', 'explain plan', 'query cache', 'n+1', 'eager loading', 'join', 'denormalize', 'partition'],
      sampleFollowUp: 'Excellent. When you mention indexing, what are the differences between clustered and non-clustered indexes in SQL?'
    },
    {
      question: 'Explain the difference between synchronous and asynchronous code execution, and when you would use each.',
      correctKeywords: ['blocking', 'non-blocking', 'event loop', 'thread', 'promise', 'callback', 'async/await', 'concurrency', 'i/o', 'performance'],
      sampleFollowUp: 'Perfect. How does JavaScript handle async tasks internally if it is a single-threaded language?'
    },
    {
      question: 'How do you handle application state across multiple components in a React application?',
      correctKeywords: ['redux', 'context api', 'zustand', 'props', 'lifting state up', 'useContext', 'reducer', 'global state', 'memoization'],
      sampleFollowUp: 'Good choice. In what scenarios would you choose Context API over Redux or Zustand?'
    }
  ],
  'Analyst': [
    {
      question: 'Describe a situation where you had to analyze a messy, incomplete dataset. How did you proceed?',
      correctKeywords: ['clean', 'impute', 'missing values', 'outliers', 'excel', 'pandas', 'nulls', 'data distribution', 'filter', 'validation'],
      sampleFollowUp: 'Excellent method. How do you handle outliers that might skew your statistical summaries?'
    },
    {
      question: 'If a product sales metric dropped by 20% in the last week, how would you begin to investigate the cause?',
      correctKeywords: ['segment', 'cohort', 'external factor', 'internal bug', 'funnel analysis', 'drill down', 'root cause', 'user journey', 'conversion rate'],
      sampleFollowUp: 'Very logical approach. How do you present these findings to executive stakeholders who are non-technical?'
    }
  ]
};
