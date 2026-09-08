import mongoose, { Schema, Document, Model } from 'mongoose';
import '@/models/Question';
import '@/models/User';

export interface IQuizDocument extends Document {
  trainerId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  instructions?: string;
  questionIds: mongoose.Types.ObjectId[];
  status: 'DRAFT' | 'READY' | 'ACTIVE' | 'ARCHIVED';
  defaultTimeLimit: number;
  defaultPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuizDocument>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, default: 'General', index: true },
    instructions: { type: String },
    questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    status: { type: String, enum: ['DRAFT', 'READY', 'ACTIVE', 'ARCHIVED'], default: 'READY', index: true },
    defaultTimeLimit: { type: Number, default: 20 },
    defaultPoints: { type: Number, default: 1000 },
  },
  { timestamps: true }
);

export const QuizModel: Model<IQuizDocument> =
  mongoose.models.Quiz || mongoose.model<IQuizDocument>('Quiz', QuizSchema);
