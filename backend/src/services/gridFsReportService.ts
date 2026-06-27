import mongoose from 'mongoose';

let bucket: mongoose.mongo.GridFSBucket;

export const getGridFSBucket = (): mongoose.mongo.GridFSBucket => {
  if (bucket) return bucket;
  const conn = mongoose.connection;
  if (!conn.db) {
    throw new Error("MongoDB connection db is not initialized yet");
  }
  bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'fs'
  });
  return bucket;
};

export const uploadReportToGridFS = (
  fileName: string,
  buffer: Buffer,
  contentType: string = 'application/pdf'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const gridBucket = getGridFSBucket();
      const uploadStream = gridBucket.openUploadStream(fileName, {
        contentType
      });

      uploadStream.on('error', (err) => reject(err));
      uploadStream.on('finish', () => {
        resolve(uploadStream.id.toString());
      });

      uploadStream.end(buffer);
    } catch (err) {
      reject(err);
    }
  });
};

export const deleteReportFromGridFS = async (fileIdStr: string): Promise<void> => {
  const gridBucket = getGridFSBucket();
  const fileId = new mongoose.Types.ObjectId(fileIdStr);
  await gridBucket.delete(fileId);
};

export const downloadReportFromGridFS = (fileIdStr: string, res: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const gridBucket = getGridFSBucket();
      const fileId = new mongoose.Types.ObjectId(fileIdStr);
      const downloadStream = gridBucket.openDownloadStream(fileId);

      downloadStream.on('error', (err) => reject(err));
      downloadStream.on('end', () => resolve());
      downloadStream.pipe(res);
    } catch (err) {
      reject(err);
    }
  });
};
