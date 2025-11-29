// Application state machine states
export type AppState = 'idle' | 'loading' | 'clarifying' | 'complete' | 'error';

// Message types for conversation history
export type MessageRole = 'user' | 'assistant';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: number;
}

// AI Response types - discriminated union
export type AIResponse =
  | { type: 'clarification'; questions: string[] }
  | { type: 'prd'; prd: PRDDocument };

// PRD Document structure
export interface Feature {
  name: string;
  description: string;
}

export interface Requirement {
  id: string;
  description: string;
}

export interface UserStory {
  story: string;
  acceptanceCriteria: string[];
}

export interface Phase {
  phase: string;
  tasks: string[];
}

export interface Assumption {
  topic: string;
  assumed: string;
  validateBy: string;
}

export interface PRDDocument {
  title: string;
  summary: string;
  problemStatement: string;
  targetUsers: string;
  coreFeatures: Feature[];
  functionalRequirements: Requirement[];
  nonFunctionalRequirements: Requirement[];
  userStories: UserStory[];
  outOfScope: string[];
  technicalConsiderations: string[];
  implementationRoadmap: Phase[];
  assumptions?: Assumption[];
}

// Persisted state for localStorage
export interface PersistedState {
  state: AppState;
  messages: Message[];
  prd: PRDDocument | null;
  clarificationRound: number;
  originalIdea: string;
}

// Error types for contextual messages
export type ErrorType = 'timeout' | 'rate_limit' | 'server_error' | 'network' | 'parse_error' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  retryable: boolean;
}
