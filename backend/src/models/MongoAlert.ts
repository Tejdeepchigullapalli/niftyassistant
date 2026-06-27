import mongoose, { Schema } from 'mongoose';

export interface IMongoAlert extends mongoose.Document {
  userId: string;
  symbol?: string; // empty means general market alert
  type: string;
  targetValue?: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MongoAlertSchema = new Schema<IMongoAlert>({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, index: true },
  type: { type: String, required: true },
  targetValue: { type: Number },
  enabled: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const MongoAlert = mongoose.model<IMongoAlert>('MongoAlert', MongoAlertSchema, 'mongo_alerts');
