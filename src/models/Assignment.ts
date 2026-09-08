import mongoose, { Schema, Document, Model } from 'mongoose';
import '@/models/Quiz';
import '@/models/User';

export interface IAssignmentDocument extends Document {
  quizId: mongoose.Types.ObjectId;
  quizTitle: string;
  trainerId: mongoose.Types.ObjectId;
  trainerName: string;
  title: string;
  studentEmails: string[];
  startDate: Date;
  dueDate: Date;
  maxAttempts: number;
  showScoreImmediately: boolean;
  showCorrectAnswers: boolean;
  quizSnapshot: any; // Immutable quiz & questions snapshot
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignmentDocument>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    quizTitle: { type: String, required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trainerName: { type: String, required: true },
    title: { type: String, required: true },
    studentEmails: { type: [String], required: true, index: true },
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true, index: true },
    maxAttempts: { type: Number, default: 1 },
    showScoreImmediately: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: true },
    quizSnapshot: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const AssignmentModel: Model<IAssignmentDocument> =
  mongoose.models.Assignment || mongoose.model<IAssignmentDocument>('Assignment', AssignmentSchema);
