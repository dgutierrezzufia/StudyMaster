
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  isReused?: boolean; // Indica si la pregunta ya se ha visto antes
}

export interface QuizAttempt {
  id: string;
  date: string;
  score: number;
  total: number;
  questions: QuizQuestion[];
  userAnswers: (number | null)[];
  isReviewed?: boolean;
  isRetry?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Note {
  id: string;
  text: string;
  date: string;
}

export interface Topic {
  id: string;
  name: string;
  content: string;
  summary?: string;
  quizHistory: QuizAttempt[];
  chatHistory: ChatMessage[];
  notes: Note[];
  nextReviewDate?: string; 
}

export interface Subject {
  id: string;
  ownerId: string;
  name: string;
  icon: string;
  topics: Topic[];
}

export interface AuthorizedUser {
  id: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  name?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  isAdmin: boolean;
}

export type ViewState = 
  | { type: 'login' }
  | { type: 'dashboard' }
  | { type: 'subject'; subjectId: string }
  | { type: 'topic'; subjectId: string; topicId: string }
  | { type: 'results' }
  | { type: 'retos' } // Nueva vista dedicada
  | { type: 'admin' };
