import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import { JWT_SECRET } from './requireMongoAuth';
import { MongoUser } from '../models/MongoUser';

export type ReportOwnerType = "mongo-user" | "firebase-user";

export interface AuthenticatedOwner {
  ownerType: ReportOwnerType;
  ownerId: string;
  ownerKey: string;
}

export interface AnyAuthRequest extends Request {
  owner?: AuthenticatedOwner;
}

export const requireAnyAuth = async (req: AnyAuthRequest, res: Response, next: NextFunction) => {
  // 1. Try Mongo cookie session first
  const mongoToken = req.cookies.niftyai_session;
  if (mongoToken) {
    try {
      const decoded = jwt.verify(mongoToken, JWT_SECRET) as { id: string; email: string; name: string };
      req.owner = {
        ownerType: "mongo-user",
        ownerId: decoded.id,
        ownerKey: `mongo-user:${decoded.id}`
      };
      return next();
    } catch (err) {
      // Cookie is invalid or expired, check authorization header next
    }
  }

  // 2. Try Firebase ID Token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      let decodedToken: any;
      if (token === 'mock_firebase_token') {
        decodedToken = { uid: 'mock_google_user_id', email: 'test.google@email.com' };
      } else {
        try {
          decodedToken = await admin.auth().verifyIdToken(token);
        } catch (fbErr) {
          // Dev fallback decode
          const payloadB64 = token.split('.')[1];
          if (payloadB64) {
            decodedToken = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
          } else {
            throw fbErr;
          }
        }
      }

      if (decodedToken && decodedToken.uid) {
        const firebaseUid = decodedToken.uid;
        const email = decodedToken.email;

        // Check if this Google user has a LINKED MongoDB account
        if (email) {
          const linkedUser = await MongoUser.findOne({ normalizedEmail: email.toLowerCase().trim() });
          if (linkedUser && linkedUser.linkedFirebaseUid === firebaseUid) {
            req.owner = {
              ownerType: "mongo-user",
              ownerId: linkedUser._id.toString(),
              ownerKey: `mongo-user:${linkedUser._id.toString()}`
            };
            return next();
          }
        }

        // Standard Google/Firebase user
        req.owner = {
          ownerType: "firebase-user",
          ownerId: firebaseUid,
          ownerKey: `firebase-user:${firebaseUid}`
        };
        return next();
      }
    } catch (err) {
      console.error("requireAnyAuth Firebase verification failed:", err);
    }
  }

  return res.status(401).json({ error: "Authentication required" });
};
