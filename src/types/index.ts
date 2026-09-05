export type UserRole = 'TRAINER' | 'STUDENT' | 'ADMIN';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organization?: string;
  createdAt: string;
}

export type QuestionType = 'MCQ' | 'TRUE_FALSE';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface IQuestion {
  _id: string;
  trainerId: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
  correctOptionIndex: number;
  timeLimit: number; // Seconds
  points: number;
  explanation?: string;
  category: string;
  topic?: string;
  difficulty: DifficultyLevel;
  tags: string[];
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuizStatus = 'DRAFT' | 'READY' | 'ACTIVE' | 'ARCHIVED';

export interface IQuiz {
  _id: string;
  trainerId: string;
  title: string;
  description?: string;
  category: string;
  instructions?: string;
  questions: IQuestion[]; // Populated or embedded question snapshots
  questionIds: string[];
  status: QuizStatus;
  defaultTimeLimit: number;
  defaultPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAssignment {
  _id: string;
  quizId: string;
  quizTitle: string;
  trainerId: string;
  trainerName: string;
  title: string;
  studentEmails: string[];
  startDate: string;
  dueDate: string;
  maxAttempts: number;
  showScoreImmediately: boolean;
  showCorrectAnswers: boolean;
  quizSnapshot: IQuiz;
  createdAt: string;
}

export type AssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';

export interface IStudentResponse {
  questionId: string;
  questionText: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  pointsEarned: number;
  responseTimeMs: number;
}

export interface IStudentAttempt {
  _id: string;
  assignmentId: string;
  studentEmail: string;
  studentName: string;
  quizSnapshot: IQuiz;
  attemptNumber: number;
  startTime: string;
  completionTime?: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  status: AssignmentStatus;
  responses: IStudentResponse[];
  createdAt: string;
}

export type LiveSessionStage = 
  | 'LOBBY'
  | 'STARTING'
  | 'QUESTION_ACTIVE'
  | 'QUESTION_LOCKED'
  | 'SHOWING_RESULT'
  | 'FINAL_PODIUM'
  | 'CLOSED';

export interface ILiveParticipant {
  socketId: string;
  email?: string;
  displayName: string;
  score: number;
  rank: number;
  previousRank: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredCount: number;
  lastResponseTimeMs?: number;
  lastPointsEarned?: number;
  lastIsCorrect?: boolean;
}

export interface ILiveSession {
  _id: string;
  quizCode: string; // 6-digit string
  quizId: string;
  quizTitle: string;
  trainerId: string;
  trainerName: string;
  stage: LiveSessionStage;
  currentQuestionIndex: number;
  totalQuestions: number;
  quizSnapshot: IQuiz;
  questionStartTimestamp?: number;
  questionEndTimestamp?: number;
  participants: Record<string, ILiveParticipant>; // Keyed by displayName/email
  createdAt: string;
  closedAt?: string;
}

export interface ILiveSessionResult {
  _id: string;
  quizCode: string;
  quizTitle: string;
  trainerId: string;
  totalParticipants: number;
  averageScore: number;
  rankings: {
    rank: number;
    displayName: string;
    email?: string;
    totalScore: number;
    correctAnswers: number;
    wrongAnswers: number;
    unansweredCount: number;
  }[];
  questionStats: {
    questionIndex: number;
    questionText: string;
    correctCount: number;
    wrongCount: number;
    optionDistribution: Record<number, number>; // index -> count
    avgResponseTimeMs: number;
  }[];
  createdAt: string;
}

// Import Preview Diagnostic interface
export interface IImportParseDiagnostic {
  rowOrIndex: number;
  questionText: string;
  status: 'VALID' | 'ERROR';
  errorMessage?: string;
  parsedQuestion?: Partial<IQuestion>;
}

export interface IImportPreviewSummary {
  fileName: string;
  fileType: 'EXCEL' | 'WORD';
  totalParsed: number;
  validCount: number;
  errorCount: number;
  diagnostics: IImportParseDiagnostic[];
  validQuestions: Partial<IQuestion>[];
}
