export interface SuggestionsRequestBody {
  lessonName?: string;
  step?: number;
}

export interface SuggestionsResponse {
  suggestions: string[];
}

export interface GeneratePlanRequestBody {
  lessonName?: string;
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
  step5?: string;
  subject?: string;
  grade?: string;
  userEmail?: string;
}

export interface GeneratePlanResponse {
  markdown: string;
  lessonPlanId?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
