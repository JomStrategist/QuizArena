import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestionDocument extends Document {
  trainerId: mongoose.Types.ObjectId;
  questionText: string;
  questionType: 'MCQ' | 'TRUE_FALSE' | 'DRAG_AND_DROP' | 'CORRECT_SEQUENCE' | 'PROMPT_BUILDER' | 'SOLUTION_CHALLENGE' | 'SCENARIO_QUESTIONS';
  options: string[];
  correctOptionIndex?: number;
  correctOrder?: number[];
  categories?: { id: string; title: string; description?: string }[];
  categoryAssignments?: Record<string, string>;
  promptBlocks?: { role?: string[]; context?: string[]; task?: string[]; outputFormat?: string[] };
  solutionChallengeData?: any;
  promptBuilderData?: any;
  scenarioQuestionsData?: any;
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
    questionType: {
      type: String,
      enum: ['MCQ', 'TRUE_FALSE', 'DRAG_AND_DROP', 'CORRECT_SEQUENCE', 'PROMPT_BUILDER', 'SOLUTION_CHALLENGE', 'SCENARIO_QUESTIONS'],
      default: 'MCQ',
    },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number },
    correctOrder: { type: [Number] },
    categories: { type: Schema.Types.Mixed },
    categoryAssignments: { type: Schema.Types.Mixed },
    promptBlocks: { type: Schema.Types.Mixed },
    solutionChallengeData: { type: Schema.Types.Mixed },
    promptBuilderData: { type: Schema.Types.Mixed },
    scenarioQuestionsData: { type: Schema.Types.Mixed },
    timeLimit: { type: Number, default: 20 },
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
