const AI_BASE_URL =
  import.meta.env.VITE_AI_BASE_URL || "http://127.0.0.1:8000";

export interface StartInterviewRequest {
  role: string;
  student_name?: string;
  skills?: string[];
  experience_level?: string;
}

export interface StartInterviewResponse {
  session_id: string;
  role: string;
  question_number: number;
  total_questions: number;
  question: string;
}

export interface SubmitAnswerRequest {
  session_id: string;
  answer: string;
}

export interface AnswerFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  ideal_answer: string;
}

export interface SubmitAnswerResponse {
  session_id: string;
  question_number: number;
  feedback: AnswerFeedback;
  next_question?: string | null;
  interview_finished: boolean;
  overall_score?: number | null;
}

async function aiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  let response: Response;
  try {
    response = await fetch(`${AI_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error(
      `Failed to connect to PlaceD AI service at ${AI_BASE_URL}. Please ensure the service is running.`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;

    try {
      const jsonErr = JSON.parse(errorText);
      if (jsonErr && typeof jsonErr === "object") {
        if (typeof jsonErr.detail === "string") {
          errorMessage = jsonErr.detail;
        } else if (Array.isArray(jsonErr.detail)) {
          // FastAPI 422 validation errors
          errorMessage = jsonErr.detail
            .map((item: any) => item.msg || JSON.stringify(item))
            .join("; ");
        } else if (typeof jsonErr.message === "string") {
          errorMessage = jsonErr.message;
        }
      }
    } catch {
      // Keep errorText
    }

    throw new Error(
      errorMessage || `AI request failed with status ${response.status}`
    );
  }

  return response.json();
}

export const aiMockInterviewApi = {
  startInterview: (data: StartInterviewRequest): Promise<StartInterviewResponse> => {
    return aiRequest<StartInterviewResponse>("/mock-interview/start", {
      method: "POST",
      body: JSON.stringify({
        role: data.role,
        student_name: data.student_name || undefined,
        skills: data.skills || [],
        experience_level: data.experience_level || "Beginner",
      }),
    });
  },

  submitAnswer: (data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
    return aiRequest<SubmitAnswerResponse>("/mock-interview/answer", {
      method: "POST",
      body: JSON.stringify({
        session_id: data.session_id,
        answer: data.answer,
      }),
    });
  },
};
