import mongoose, { Schema } from 'mongoose';

export type PositionStatus = "none" | "interested" | "purchased";

export interface IMongoCompanyState extends mongoose.Document {
  userId: string;
  symbol: string;
  positionStatus: PositionStatus;
  watchlisted: boolean;
  holding?: {
    quantity: number;
    averageBuyPrice: number;
    purchaseDate: string;
    notes?: string;
  };
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MongoCompanyStateSchema = new Schema<IMongoCompanyState>({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, required: true, index: true },
  positionStatus: { type: String, enum: ["none", "interested", "purchased"], default: "none" },
  watchlisted: { type: Boolean, default: false },
  holding: {
    quantity: { type: Number },
    averageBuyPrice: { type: Number },
    purchaseDate: { type: String },
    notes: { type: String }
  },
  note: { type: String }
}, {
  timestamps: true
});

// Unique index on userId and symbol
MongoCompanyStateSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const MongoCompanyState = mongoose.model<IMongoCompanyState>('MongoCompanyState', MongoCompanyStateSchema, 'mongo_company_states');
