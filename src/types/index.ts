export interface PuterUser {
  uuid: string;
  username: string;
}

export interface FSItem {
  id: string;
  uid: string;
  name: string;
  path: string;
  is_dir: boolean;
  parent_id: string | null;
  parent_uid: string | null;
  created: number;
  modified: number;
  accessed: number;
  size: number | null;
  writable: boolean;
}

export interface KVItem {
  key: string;
  value: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; puter_path?: string }>;
}

export interface AIResponse {
  index: number;
  message: {
    role: string;
    content: string;
    refusal: unknown;
    annotations: unknown[];
  };
  logprobs: unknown;
  finish_reason: string;
  usage?: {
    type: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ATSSuggestion {
  type: 'good' | 'improve';
  tip: string;
}

export interface ATSFeedback {
  score: number;
  tips: ATSSuggestion[];
}

export interface CategoryFeedback {
  score: number;
  tips: Array<{
    type: 'good' | 'improve';
    tip: string;
    explanation: string;
  }>;
}

export interface Feedback {
  overallScore: number;
  ATS: ATSFeedback;
  toneAndStyle: CategoryFeedback;
  content: CategoryFeedback;
  structure: CategoryFeedback;
  skills: CategoryFeedback;
}

export interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
  createdAt: string;
}

export type AnalysisStatus =
  | 'idle'
  | 'uploading'
  | 'converting'
  | 'preparing'
  | 'analyzing'
  | 'done'
  | 'error';
