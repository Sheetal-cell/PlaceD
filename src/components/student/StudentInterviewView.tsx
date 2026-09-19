import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Award,
  ArrowRight,
  RefreshCw,
  Sparkles,
  User,
  Bot,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';
import type { Student, PlacementDrive } from '../../mockData';
import {
  aiMockInterviewApi,
  type AnswerFeedback,
  type SubmitAnswerResponse,
} from '../../api/aiMockInterviewApi';

const ALLOWED_ROLES = [
  'Software Engineer',
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'QA Engineer',
  'SDET',
  'Business Analyst',
];

const ALLOWED_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const DEFAULT_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'NVIDIA',
  'Deloitte',
  'Tesla',
];

interface CompletedRound {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  studentAnswer: string;
  feedback: AnswerFeedback;
}

interface StudentInterviewViewProps {
  currentStudent?: Student;
  drives?: PlacementDrive[];
  interviewRole: string | null;
  setInterviewRole: (role: string | null) => void;
  interviewQuestions: any[];
  setInterviewQuestions: React.Dispatch<React.SetStateAction<any[]>>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (idx: number) => void;
  userAnswer: string;
  setUserAnswer: (ans: string) => void;
  chatHistory: any[];
  setChatHistory: React.Dispatch<React.SetStateAction<any[]>>;
  isInterviewFinished: boolean;
  setIsInterviewFinished: (fin: boolean) => void;
  interviewScores: number[];
  setInterviewScores: React.Dispatch<React.SetStateAction<number[]>>;
}

export const StudentInterviewView: React.FC<StudentInterviewViewProps> = ({
  currentStudent,
  drives,
  interviewRole,
  setInterviewRole,
  setInterviewQuestions,
  setCurrentQuestionIndex,
  userAnswer,
  setUserAnswer,
  setIsInterviewFinished,
  setInterviewScores,
}) => {
  // Session & Question state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [activeCompanyName, setActiveCompanyName] = useState<string>('Google');

  // Completed rounds history for clean stage rendering
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);

  // Setup form inputs
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [selectedCompanyOption, setSelectedCompanyOption] = useState<string>('Google');
  const [customCompanyName, setCustomCompanyName] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('Beginner');
  const [skillsInput, setSkillsInput] = useState<string>(
    currentStudent?.skills ? currentStudent.skills.join(', ') : 'React, Node.js, TypeScript'
  );

  // Status & error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Derive available company options from drives, student applications, defaults, and add 'Other'
  const companyOptions = useMemo(() => {
    const driveCompanies = drives ? drives.map((d) => d.companyName).filter(Boolean) : [];
    const studentCompanies = currentStudent?.applications
      ? currentStudent.applications.map((a) => a.companyName).filter(Boolean)
      : [];
    const existing = Array.from(
      new Set([...DEFAULT_COMPANIES, ...driveCompanies, ...studentCompanies])
    );
    return [...existing.filter((c) => c !== 'Other'), 'Other'];
  }, [drives, currentStudent]);

  // Compute effective company name to send to backend
  const effectiveCompanyName =
    selectedCompanyOption === 'Other' ? customCompanyName.trim() : selectedCompanyOption;

  // Sync profile skills if student prop updates
  useEffect(() => {
    if (currentStudent?.skills && currentStudent.skills.length > 0) {
      setSkillsInput(currentStudent.skills.join(', '));
    }
  }, [currentStudent]);

  // Start Interview via PlaceD AI FastAPI backend
  const handleStartInterview = async () => {
    if (!targetRole.trim() || !effectiveCompanyName || !experienceLevel.trim()) {
      setApiError('Please select or enter a valid target company name.');
      return;
    }

    setApiError(null);
    setIsLoading(true);

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const response = await aiMockInterviewApi.startInterview({
        role: targetRole,
        company_name: effectiveCompanyName,
        student_name: currentStudent?.name,
        skills: parsedSkills,
        experience_level: experienceLevel,
      });

      setSessionId(response.session_id);
      setActiveCompanyName(effectiveCompanyName);
      setInterviewRole(response.role || targetRole);
      setTotalQuestions(response.total_questions);
      setQuestionNumber(response.question_number);
      setCurrentQuestion(response.question);

      setCurrentQuestionIndex(response.question_number - 1);
      setInterviewQuestions([{ question: response.question }]);

      setUserAnswer('');
      setIsFinished(false);
      setIsInterviewFinished(false);
      setInterviewScores([]);
      setOverallScore(null);
      setCompletedRounds([]);
    } catch (err: any) {
      setApiError(
        err.message ||
          'Failed to start interview. Please ensure the PlaceD AI service is running at http://127.0.0.1:8000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Answer via PlaceD AI FastAPI backend
  const handleSendAnswer = async () => {
    if (!userAnswer.trim() || !interviewRole || !sessionId || isLoading) return;

    const answer = userAnswer.trim();
    setApiError(null);
    setIsLoading(true);

    try {
      const response: SubmitAnswerResponse = await aiMockInterviewApi.submitAnswer({
        session_id: sessionId,
        answer,
      });

      const { feedback, next_question, interview_finished, overall_score, question_number: returnedQNum } = response;

      // Save round in completed history
      const newRound: CompletedRound = {
        questionNumber,
        totalQuestions,
        question: currentQuestion,
        studentAnswer: answer,
        feedback,
      };

      setCompletedRounds((prev) => [...prev, newRound]);
      setInterviewScores((prev) => [...prev, feedback.score]);
      setUserAnswer('');

      if (!interview_finished && next_question) {
        const nextNum = returnedQNum + 1;
        setQuestionNumber(nextNum);
        setCurrentQuestion(next_question);
        setCurrentQuestionIndex(returnedQNum);
        setInterviewQuestions((prev) => [...prev, { question: next_question }]);
      } else {
        setIsFinished(true);
        setIsInterviewFinished(true);
        if (overall_score !== undefined && overall_score !== null) {
          setOverallScore(overall_score);
        }
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = () => {
    setInterviewRole(null);
    setSessionId(null);
    setApiError(null);
    setIsFinished(false);
    setIsInterviewFinished(false);
    setCompletedRounds([]);
    setUserAnswer('');
  };

  const progressPercentage = Math.min(
    Math.round((questionNumber / Math.max(totalQuestions, 1)) * 100),
    100
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="sp-page-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-3">
            <MessageSquare size={28} className="text-blue-600 shrink-0" />
            PlaceD AI Mock Interview Simulator
          </h1>
          <p className="sp-page-subtitle">
            Conduct AI-powered technical interviews with real-time feedback, detailed evaluation, and model answers.
          </p>
        </div>

        {interviewRole && (
          <button
            type="button"
            onClick={handleResetSession}
            disabled={isLoading}
            className="btn btn-secondary h-10 px-4 rounded-xl text-xs font-bold self-start md:self-center cursor-pointer disabled:opacity-50"
          >
            ← Change Track
          </button>
        )}
      </div>

      {/* Global API Error Alert */}
      {apiError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-red-900 font-display">API Error</h4>
            <p className="mt-0.5 text-xs text-red-700 font-medium">{apiError}</p>
          </div>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {!interviewRole ? (
        /* Single Interview Setup Card */
        <div className="sp-card flex flex-col gap-6 p-6 sm:p-8">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2.5">
              <Sparkles size={20} className="text-blue-600" />
              Mock Interview Configuration
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Select your target role, company, experience level, and technical skills for the AI interviewer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Student Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Student Name</label>
              <input
                type="text"
                readOnly
                value={currentStudent?.name || 'Student Candidate'}
                className="input-field bg-slate-50 text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            {/* Company Name Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Target Company *</label>
              <select
                value={selectedCompanyOption}
                onChange={(e) => {
                  setSelectedCompanyOption(e.target.value);
                  if (e.target.value !== 'Other') {
                    setCustomCompanyName('');
                  }
                }}
                className="input-field"
              >
                {companyOptions.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>

              {selectedCompanyOption === 'Other' && (
                <input
                  type="text"
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                  placeholder="Enter custom company name (e.g. Meta, Apple, Netflix)"
                  className="input-field mt-1 animate-fade-in focus:ring-2 focus:ring-blue-100"
                />
              )}
            </div>

            {/* Target Role Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Target Role *</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="input-field"
              >
                {ALLOWED_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Experience Level *</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="input-field"
              >
                {ALLOWED_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Technical Skills Input */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">
                Technical Skills (Comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. React, Node.js, Python, SQL"
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={isLoading || !effectiveCompanyName || !targetRole.trim() || !experienceLevel.trim()}
              onClick={handleStartInterview}
              className="btn btn-primary h-12 w-full sm:w-auto px-8 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Connecting to PlaceD AI...</span>
                </>
              ) : (
                <>
                  <span>Start Mock Interview</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Active Interview Page */
        <div className="flex flex-col gap-6">
          {/* Header Progress Card */}
          <div className="sp-card flex flex-col gap-4 p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                  <Bot size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">Interviewer AI</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Role Track: <span className="font-bold text-slate-700">{interviewRole}</span> ({experienceLevel}) | Company: <span className="font-bold text-slate-700">{activeCompanyName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="sp-badge sp-badge-primary font-bold font-mono text-xs">
                  Question {Math.min(questionNumber, totalQuestions)} of {totalQuestions}
                </span>
                {isFinished && overallScore !== null && (
                  <span className="sp-badge sp-badge-success font-bold font-mono text-xs">
                    Overall Rating: {overallScore} / 10
                  </span>
                )}
              </div>
            </div>

            {/* Subtle Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Render Completed Conversation Rounds */}
          {completedRounds.map((round, rIdx) => (
            <div key={rIdx} className="flex flex-col gap-6">
              {/* Question Card */}
              <div className="sp-card flex flex-col gap-3 p-6 sm:p-7">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Bot size={16} className="text-blue-600" />
                  Question {round.questionNumber} of {round.totalQuestions}
                </h3>
                <p className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {round.question}
                </p>
              </div>

              {/* Student Response Card */}
              <div className="sp-card flex flex-col gap-3 p-6 sm:p-7 bg-blue-50/20 border-blue-100">
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider font-display border-b border-blue-100 pb-3 flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  Your Response
                </h3>
                <p className="text-sm font-medium text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {round.studentAnswer}
                </p>
              </div>

              {/* PlaceD AI Evaluation Card */}
              <div className="sp-card flex flex-col gap-6 p-6 sm:p-7">
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                  <Sparkles size={20} className="text-blue-600" />
                  PlaceD AI Evaluation
                </h3>

                {/* Score Section */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">
                    Score
                  </h4>
                  <div>
                    <span className="sp-badge sp-badge-primary text-sm px-4 py-1.5 font-bold font-mono">
                      {round.feedback.score} / 10
                    </span>
                  </div>
                </div>

                {/* Feedback Section */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">
                    Evaluation & Feedback
                  </h4>
                  <p className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                    {round.feedback.feedback}
                  </p>
                </div>

                {/* Strengths Section */}
                {round.feedback.strengths && round.feedback.strengths.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-display flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      Strengths
                    </h4>
                    <div className="flex flex-col gap-2">
                      {round.feedback.strengths.map((strItem, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs font-medium text-emerald-900 leading-relaxed"
                        >
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{strItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Areas for Improvement Section */}
                {round.feedback.weaknesses && round.feedback.weaknesses.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider font-display flex items-center gap-1.5">
                      <XCircle size={16} className="text-amber-600" />
                      Areas for Improvement
                    </h4>
                    <div className="flex flex-col gap-2">
                      {round.feedback.weaknesses.map((wItem, wIdx) => (
                        <div
                          key={wIdx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-100 text-xs font-medium text-amber-900 leading-relaxed"
                        >
                          <XCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                          <span>{wItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ideal Answer Section */}
                {round.feedback.ideal_answer && (
                  <div className="flex flex-col gap-2.5">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider font-display flex items-center gap-1.5">
                      <BookOpen size={16} className="text-blue-600" />
                      Ideal Answer
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                      {round.feedback.ideal_answer}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Active Question & Answer Form (When interview is ongoing) */}
          {!isFinished ? (
            <div className="flex flex-col gap-6">
              {/* Question Card */}
              <div className="sp-card flex flex-col gap-3 p-6 sm:p-7">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Bot size={16} className="text-blue-600" />
                  Current Question ({questionNumber} of {totalQuestions})
                </h3>
                <p className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {currentQuestion}
                </p>
              </div>

              {/* Answer Typing Form Section */}
              <div className="sp-card flex flex-col gap-4 p-6 sm:p-7">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <label className="text-sm font-bold text-slate-800 font-display">
                    Your Response
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">
                    Press Shift+Enter for newline
                  </span>
                </div>

                <textarea
                  rows={5}
                  disabled={isLoading}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && userAnswer.trim() && !isLoading) {
                      e.preventDefault();
                      handleSendAnswer();
                    }
                  }}
                  placeholder="Type your technical interview response here..."
                  className="input-field font-sans leading-relaxed text-slate-800 resize-none min-h-[140px] focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                />

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!userAnswer.trim() || isLoading}
                    onClick={handleSendAnswer}
                    className="btn btn-primary h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Submit Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Final Overall Performance Report Section */
            <div className="sp-card flex flex-col gap-6 p-6 sm:p-8 bg-emerald-50/40 border-emerald-200">
              <div className="flex flex-col items-center text-center gap-3 border-b border-emerald-100 pb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
                  <Award size={36} />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-display">
                  Interview Session Complete!
                </h3>
                <p className="text-sm text-emerald-800 max-w-md font-medium">
                  You have completed all {totalQuestions} technical questions for the{' '}
                  <strong>{interviewRole}</strong> track at <strong>{activeCompanyName}</strong>.
                </p>
                {overallScore !== null && (
                  <div className="mt-2">
                    <span className="sp-badge sp-badge-success text-base px-5 py-2 font-mono font-bold">
                      Overall Rating Index: {overallScore} / 10
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="btn btn-primary h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={18} />
                  <span>Start New Mock Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
