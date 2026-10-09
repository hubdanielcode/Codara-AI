export type CodeReview = {
  id: string;
  chat_id: string;
  original_code: string;
  corrected_code: string;
  errors: string[];
  suggestions: string[];
  improvements: string[];
  created_at: string;
  updated_at: string;
};

export type ReviewError = {
  description: string;
};

export type ReviewSuggestion = {
  description: string;
};

export type ReviewImprovement = {
  description: string;
};
