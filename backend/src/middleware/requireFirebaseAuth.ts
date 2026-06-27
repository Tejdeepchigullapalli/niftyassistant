import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialize firebase admin
if (!admin.apps.length) {
  try {
    // If we have a service account file, we can use it. Otherwise, default credentials or environment fallback.
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
    if (serviceAccountBase64) {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nifty-investment-assistant'
      });
    }
  } catch (error) {
    console.warn("Firebase Admin failed to initialize. Token verification might run in mock/local fallback mode.", error);
  }
}

export interface FirebaseRequest extends Request {
  firebaseUser?: admin.auth.DecodedIdToken;
}

export const requireFirebaseAuth = async (req: FirebaseRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    // Verify Firebase ID Token
    if (token === 'mock_firebase_token') {
      // Dev/fallback testing mock
      req.firebaseUser = {
        uid: 'mock_google_user_id',
        email: 'test.google@email.com',
        name: 'Test Google User',
        auth_time: Date.now() / 1000,
        iat: Date.now() / 1000,
        iss: 'https://securetoken.google.com/nifty-investment-assistant',
        aud: 'nifty-investment-assistant',
        exp: Date.now() / 1000 + 3600,
        sub: 'mock_google_user_id',
        firebase: {
          identities: {},
          sign_in_provider: 'google.com'
        }
      };
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decodedToken;
    next();
  } catch (err: any) {
    console.error("Firebase Auth Verification Error:", err);
    // If admin verification fails because it isn't configured, check if we have a dev fallback
    if (process.env.NODE_ENV === 'development' || !process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
      console.warn("Dev mode fallback: decoding token client-side without signature check.");
      try {
        const payloadB64 = token.split('.')[1];
        if (payloadB64) {
          const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
          req.firebaseUser = payload;
          return next();
        }
      } catch (decodeErr) {
        // Fallback failed
      }
    }
    return res.status(401).json({ error: "Firebase token verification failed" });
  }
};
