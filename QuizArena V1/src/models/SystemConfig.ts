import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemConfigDocument extends Document {
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

const SystemConfigSchema = new Schema<ISystemConfigDocument>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, default: true },
  },
  { timestamps: true }
);

export const SystemConfigModel: Model<ISystemConfigDocument> =
  mongoose.models.SystemConfig || mongoose.model<ISystemConfigDocument>('SystemConfig', SystemConfigSchema);
