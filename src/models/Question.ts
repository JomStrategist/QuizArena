import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestionDocument extends Document {
  trainerId: mongoose.Types.ObjectId;
  questionText: string;
  questionType: 'MCQ' | 'TRUE_FALSE';
  options: string[];
  correctOptionIndex: number;
  timeLimit: number;
  points: number;
  explanation?: string;
  category: string;
  topic?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  mediaUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestionDocument>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questionText: { type: String, required: true, trim: true },
    questionType: { type: String, enum: ['MCQ', 'TRUE_FALSE'], default: 'MCQ' },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number, required: true },
    timeLimit: { type: Number, default: 20 }, // Default 20s
    points: { type: Number, default: 1000 },
    explanation: { type: String },
    category: { type: String, required: true, default: 'General', index: true },
    topic: { type: String },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
    tags: { type: [String], default: [], index: true },
    mediaUrl: { type: String },
  },
  { timestamps: true }
);

QuestionSchema.index({ questionText: 'text', topic: 'text', category: 'text' });

export const QuestionModel: Model<IQuestionDocument> =
  mongoose.models.Question || mongoose.model<IQuestionDocument>('Question', QuestionSchema);
