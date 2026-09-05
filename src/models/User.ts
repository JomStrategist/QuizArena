import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: 'TRAINER' | 'STUDENT' | 'ADMIN';
  avatarUrl?: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['TRAINER', 'STUDENT', 'ADMIN'], default: 'TRAINER' },
    avatarUrl: { type: String },
    organization: { type: String, default: 'KVJ Analytics' },
  },
  { timestamps: true }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
