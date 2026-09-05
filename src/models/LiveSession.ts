import mongoose, { Schema, Document, Model } from 'mongoose';
import '@/models/Quiz';
import '@/models/User';

export interface ILiveSessionDocument extends Document {
  quizCode: string;
  quizId: mongoose.Types.ObjectId;
  quizTitle: string;
  trainerId: mongoose.Types.ObjectId;
  trainerName: string;
  sessionType: 'CONDUCT' | 'LIVE_GAME';
  questionTime: number;
  pointsMode: string;
  stage: 'LOBBY' | 'STARTING' | 'QUESTION_ACTIVE' | 'QUESTION_LOCKED' | 'SHOWING_RESULT' | 'FINAL_PODIUM' | 'FINAL_SCOREBOARD' | 'CLOSED';
  currentQuestionIndex: number;
  quizSnapshot: any;
  questionStartTimestamp?: number;
  questionEndTimestamp?: number;
  stageStartTimestamp?: number;
  participants: Record<string, any>;
  answers: Record<string, any>;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LiveSessionSchema = new Schema<ILiveSessionDocument>(
  {
    quizCode: { type: String, required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    quizTitle: { type: String, required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trainerName: { type: String, required: true },
    sessionType: { type: String, enum: ['CONDUCT', 'LIVE_GAME'], default: 'LIVE_GAME' },
    questionTime: { type: Number, default: 30 },
    pointsMode: { type: String, default: 'QUIZ_SETTINGS' },
    stage: {
      type: String,
      enum: ['LOBBY', 'STARTING', 'QUESTION_ACTIVE', 'QUESTION_LOCKED', 'SHOWING_RESULT', 'FINAL_PODIUM', 'FINAL_SCOREBOARD', 'CLOSED'],
      default: 'LOBBY',
      index: true,
    },
    currentQuestionIndex: { type: Number, default: 0 },
    quizSnapshot: { type: Schema.Types.Mixed, required: true },
    questionStartTimestamp: { type: Number },
    questionEndTimestamp: { type: Number },
    stageStartTimestamp: { type: Number },
    participants: { type: Schema.Types.Mixed, default: {} },
    answers: { type: Schema.Types.Mixed, default: {} },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const LiveSessionModel: Model<ILiveSessionDocument> =
  mongoose.models.LiveSession || mongoose.model<ILiveSessionDocument>('LiveSession', LiveSessionSchema);
