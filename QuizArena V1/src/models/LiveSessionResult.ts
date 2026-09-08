import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILiveSessionResultDocument extends Document {
  quizCode: string;
  quizTitle: string;
  trainerId: mongoose.Types.ObjectId;
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
    optionDistribution: Record<number, number>;
    avgResponseTimeMs: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const LiveSessionResultSchema = new Schema<ILiveSessionResultDocument>(
  {
    quizCode: { type: String, required: true, index: true },
    quizTitle: { type: String, required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    totalParticipants: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    rankings: [
      {
        rank: Number,
        displayName: String,
        email: String,
        totalScore: Number,
        correctAnswers: Number,
        wrongAnswers: Number,
        unansweredCount: Number,
      },
    ],
    questionStats: [
      {
        questionIndex: Number,
        questionText: String,
        correctCount: Number,
        wrongCount: Number,
        optionDistribution: Schema.Types.Mixed,
        avgResponseTimeMs: Number,
      },
    ],
  },
  { timestamps: true }
);

export const LiveSessionResultModel: Model<ILiveSessionResultDocument> =
  mongoose.models.LiveSessionResult ||
  mongoose.model<ILiveSessionResultDocument>('LiveSessionResult', LiveSessionResultSchema);
