import React, { useState, useEffect } from 'react';
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
import type { Student } from '../../mockData';
import {
  aiMockInterviewApi,
  type AnswerFeedback,
  type SubmitAnswerResponse,
} from '../../api/aiMockInterviewApi';

interface CompletedRound {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  studentAnswer: string;
  feedback: AnswerFeedback;
}

interface StudentInterviewViewProps {
  currentStudent?: Student;
  interviewRole: 'Software Engineer' | 'Analyst' | null;
  setInterviewRole: (role: 'Software Engineer' | 'Analyst' | null) => void;
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

  // Completed rounds history for clean stage rendering
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);

  // Setup form inputs
  const [experienceLevel, setExperienceLevel] = useState<string>('Beginner');
  const [skillsInput, setSkillsInput] = useState<string>(
    currentStudent?.skills ? currentStudent.skills.join(', ') : 'React, Node.js, TypeScript'
  );

  // Status & error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync profile skills if student prop updates
  useEffect(() => {
    if (currentStudent?.skills && currentStudent.skills.length > 0) {
      setSkillsInput(currentStudent.skills.join(', '));
    }
  }, [currentStudent]);

  // Start Interview via PlaceD AI FastAPI backend
  const handleStartInterview = async (role: 'Software Engineer' | 'Analyst') => {
    setApiError(null);
    setIsLoading(true);

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const response = await aiMockInterviewApi.startInterview({
        role,
        student_name: currentStudent?.name,
        skills: parsedSkills,
        experience_level: experienceLevel,
      });

      setSessionId(response.session_id);
      setInterviewRole(role);
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
        /* Setup & Track Choice View */
        <div className="flex flex-col gap-6">
          {/* Interview Setup Card */}
          <div className="sp-card flex flex-col gap-5 p-6 sm:p-7">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              Interview Session Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Experience Level Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="input-field"
                >
                  <option value="Beginner">Beginner (Entry Level / Fresh Grad)</option>
                  <option value="Intermediate">Intermediate (1-3 Years)</option>
                  <option value="Advanced">Advanced (Senior / Specialist)</option>
                </select>
              </div>

              {/* Skills Input */}
              <div className="flex flex-col gap-2">
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
          </div>

          {/* Track Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Software Engineer Track */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shadow-2xs">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">Software Engineer Track</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2 font-medium">
                    Evaluates system architecture, data structures, backend APIs, web frameworks, and programming logic.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleStartInterview('Software Engineer')}
                className="btn btn-primary h-12 w-full rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Connecting to PlaceD AI...</span>
                  </>
                ) : (
                  <>
                    Start Software Engineering Mock <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Technology Analyst Track */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 shadow-2xs">
                  <Award size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">Technology Analyst Track</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2 font-medium">
                    Evaluates dataset analysis, business metric calculations, stakeholder communication, and problem analysis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleStartInterview('Analyst')}
                className="btn btn-primary h-12 w-full rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-600 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Connecting to PlaceD AI...</span>
                  </>
                ) : (
                  <>
                    Start Technology Analyst Mock <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
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
                    Role Track: <span className="font-bold text-slate-700">{interviewRole}</span> ({experienceLevel})
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
                  <strong>{interviewRole}</strong> track.
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
