import mongoose, { Schema } from 'mongoose';

export interface IMongoReport extends mongoose.Document {
  userId?: string; // only for email users, Firebase users' reports will also be stored in this collection to reference GridFS
  ownerKey: string; // e.g. "mongo-user:<id>" or "firebase-user:<uid>"
  title: string;
  reportType: "company" | "portfolio";
  companySymbol?: string;
  includedSymbols: string[];
  gridFsFileId: string; // Reference to fs.files _id
  fileName: string;
  pageCount?: number;
  reportSnapshotId: string;
  generatedAt: Date;
  expiresAt: Date;
}

const MongoReportSchema = new Schema<IMongoReport>({
  userId: { type: String, index: true },
  ownerKey: { type: String, required: true, index: true },
  title: { type: String, required: true },
  reportType: { type: String, enum: ["company", "portfolio"], required: true },
  companySymbol: { type: String },
  includedSymbols: [{ type: String }],
  gridFsFileId: { type: String, required: true },
  fileName: { type: String, required: true },
  pageCount: { type: Number },
  reportSnapshotId: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Expiry cleanup index
MongoReportSchema.index({ expiresAt: 1 });

export const MongoReport = mongoose.model<IMongoReport>('MongoReport', MongoReportSchema, 'mongo_reports');
