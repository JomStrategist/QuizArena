import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudentAttemptDocument extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentEmail: string;
  studentName: string;
  quizSnapshot: any;
  attemptNumber: number;
  startTime: Date;
  completionTime?: Date;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  responses: {
    questionId: string;
    questionText: string;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
    pointsEarned: number;
    responseTimeMs: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentAttemptSchema = new Schema<IStudentAttemptDocument>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    studentEmail: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    quizSnapshot: { type: Schema.Types.Mixed, required: true },
    attemptNumber: { type: Number, default: 1 },
    startTime: { type: Date, default: Date.now },
    completionTime: { type: Date },
    totalScore: { type: Number, default: 0 },
    maxPossibleScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    unansweredCount: { type: Number, default: 0 },
    status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'EXPIRED'], default: 'IN_PROGRESS', index: true },
    responses: [
      {
        questionId: String,
        questionText: String,
        selectedOptionIndex: Number,
        correctOptionIndex: Number,
        isCorrect: Boolean,
        pointsEarned: Number,
        responseTimeMs: Number,
      },
    ],
  },
  { timestamps: true }
);

export const StudentAttemptModel: Model<IStudentAttemptDocument> =
  mongoose.models.StudentAttempt || mongoose.model<IStudentAttemptDocument>('StudentAttempt', StudentAttemptSchema);
