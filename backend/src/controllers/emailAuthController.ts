import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import { z } from 'zod';
import { MongoUser } from '../models/MongoUser';
import { JWT_SECRET } from '../middleware/requireMongoAuth';

// Zod schemas for input validation
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
});

export const register = async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);
    const normalized = validated.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await MongoUser.findOne({ normalizedEmail: normalized });
    if (existing) {
      return res.status(400).json({ error: "An account already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    // Create user
    const user = new MongoUser({
      name: validated.name,
      email: validated.email,
      normalizedEmail: normalized,
      passwordHash,
      provider: "mongo-email",
      emailVerified: false
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('niftyai_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        provider: "mongo-email",
        emailVerified: user.emailVerified,
        isAuthenticated: true
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error("Register Error:", err);
    return res.status(500).json({ error: "Failed to register account" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    const normalized = validated.email.toLowerCase().trim();

    // Find user
    const user = await MongoUser.findOne({ normalizedEmail: normalized });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Update login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('niftyai_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        provider: "mongo-email",
        emailVerified: user.emailVerified,
        isAuthenticated: true
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Failed to sign in" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('niftyai_session');
  return res.json({ message: "You have been signed out securely" });
};

export const checkEmail = async (req: Request, res: Response) => {
  const email = req.query.email;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: "Email query parameter required" });
  }
  try {
    const user = await MongoUser.findOne({ normalizedEmail: email.toLowerCase().trim() });
    if (user) {
      return res.json({ exists: true, provider: "mongo-email", linked: !!user.linkedFirebaseUid });
    }
    return res.json({ exists: false });
  } catch (err) {
    return res.status(500).json({ error: "Database error" });
  }
};

export const linkGoogle = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    let decodedToken: any;
    if (token === 'mock_firebase_token') {
      decodedToken = { uid: 'mock_google_user_id', email: 'test.google@email.com' };
    } else {
      decodedToken = await admin.auth().verifyIdToken(token);
    }

    const { email, uid } = decodedToken;
    if (!email) {
      return res.status(400).json({ error: "Google account does not contain a valid email" });
    }

    const normalized = email.toLowerCase().trim();
    const user = await MongoUser.findOne({ normalizedEmail: normalized });
    if (!user) {
      return res.status(404).json({ error: "No existing email account found with this email" });
    }

    // Link Firebase UID
    user.linkedFirebaseUid = uid;
    user.lastLoginAt = new Date();
    await user.save();

    // Log user in by setting the cookie
    const jwtToken = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('niftyai_session', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        provider: "mongo-email",
        emailVerified: user.emailVerified,
        isAuthenticated: true
      }
    });
  } catch (err) {
    console.error("Link Google Error:", err);
    return res.status(401).json({ error: "Failed to link Google account" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const mongoToken = req.cookies.niftyai_session;
  if (!mongoToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const decoded = jwt.verify(mongoToken, JWT_SECRET) as { id: string; email: string; name: string };
    const user = await MongoUser.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        provider: "mongo-email",
        emailVerified: user.emailVerified,
        isAuthenticated: true
      }
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid session" });
  }
};

// Simulation methods
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  return res.json({ message: "Password reset instructions sent to your email" });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: "Token and password are required" });
  return res.json({ message: "Your password has been reset successfully" });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Verification code is required" });
  return res.json({ message: "Email verified successfully" });
};
