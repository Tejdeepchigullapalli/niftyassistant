import mongoose, { Schema } from 'mongoose';

export interface IMongoPreference extends mongoose.Document {
  userId: string;
  theme: string;
  compactView: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MongoPreferenceSchema = new Schema<IMongoPreference>({
  userId: { type: String, required: true, unique: true, index: true },
  theme: { type: String, default: "dark" },
  compactView: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const MongoPreference = mongoose.model<IMongoPreference>('MongoPreference', MongoPreferenceSchema, 'mongo_preferences');
