import mongoose, { Schema } from 'mongoose';

export interface IMongoUser extends mongoose.Document {
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash: string;
  provider: "mongo-email";
  emailVerified: boolean;
  linkedFirebaseUid?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

const MongoUserSchema = new Schema<IMongoUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  normalizedEmail: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  provider: { type: String, default: "mongo-email" },
  emailVerified: { type: Boolean, default: false },
  linkedFirebaseUid: { type: String, index: true },
  lastLoginAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const MongoUser = mongoose.model<IMongoUser>('MongoUser', MongoUserSchema, 'mongo_users');
