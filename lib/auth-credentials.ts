/**
 * Email/Password Authentication Module
 * Handles user registration and authentication with email/password
 */

import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

// Check if PostgreSQL should be used
const USE_POSTGRES = process.env.USE_POSTGRES === 'true';

// Lazy import Prisma only when needed
let prismaModule: typeof import('./prisma') | null = null;

async function getPrisma() {
  if (!prismaModule) {
    prismaModule = await import('./prisma');
  }
  return prismaModule.prisma;
}

// For JSON file storage fallback
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PASSWORD_RESET_FILE = path.join(DATA_DIR, 'password-resets.json');

interface UserWithPassword {
  id: string;
  email: string;
  name?: string;
  password?: string;
  authProvider?: string;
  emailVerified?: boolean;
  [key: string]: any;
}

interface PasswordResetToken {
  id: string;
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

function ensureFile(filePath: string, defaultData: any = []) {
  if (!fs.existsSync(filePath)) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

function readJSON<T>(filePath: string, defaultData: T): T {
  ensureFile(filePath, defaultData);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return defaultData;
  }
}

function writeJSON(filePath: string, data: any) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Register a new user with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; user?: UserWithPassword; error?: string }> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  // Validate password strength
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const hashedPassword = await hashPassword(password);

  if (USE_POSTGRES) {
    const prisma = await getPrisma();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      // If user exists but has no password (OAuth user), allow setting password
      if (!existingUser.password) {
        const updatedUser = await prisma.user.update({
          where: { email: normalizedEmail },
          data: {
            password: hashedPassword,
            authProvider: existingUser.authProvider || 'email',
          }
        });
        return {
          success: true,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name || undefined,
            authProvider: updatedUser.authProvider || undefined,
            emailVerified: updatedUser.emailVerified,
          }
        };
      }
      return { success: false, error: 'User already exists' };
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || undefined,
        password: hashedPassword,
        authProvider: 'email',
        role: 'user',
        status: 'active',
        credits: 3, // Free starting credits
        emailVerified: false,
      }
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name || undefined,
        authProvider: newUser.authProvider || undefined,
        emailVerified: newUser.emailVerified,
      }
    };
  }

  // JSON file storage fallback
  const users = readJSON<UserWithPassword[]>(USERS_FILE, []);
  const existingUser = users.find(u => u.email === normalizedEmail);

  if (existingUser) {
    if (!existingUser.password) {
      existingUser.password = hashedPassword;
      existingUser.authProvider = existingUser.authProvider || 'email';
      writeJSON(USERS_FILE, users);
      return {
        success: true,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          authProvider: existingUser.authProvider,
          emailVerified: existingUser.emailVerified,
        }
      };
    }
    return { success: false, error: 'User already exists' };
  }

  const newUser: UserWithPassword = {
    id: nanoid(),
    email: normalizedEmail,
    name: name || undefined,
    password: hashedPassword,
    authProvider: 'email',
    role: 'user',
    status: 'active',
    credits: 3,
    totalUsage: 0,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  return {
    success: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      authProvider: newUser.authProvider,
      emailVerified: newUser.emailVerified,
    }
  };
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserWithPassword; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (USE_POSTGRES) {
    const prisma = await getPrisma();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!user.password) {
      return { success: false, error: 'Please use your social login method (Google/Facebook)' };
    }

    if (user.status === 'banned') {
      return { success: false, error: 'Account is banned' };
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'Account is suspended' };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        image: user.image || undefined,
        authProvider: user.authProvider || undefined,
        emailVerified: user.emailVerified,
      }
    };
  }

  // JSON file storage fallback
  const users = readJSON<UserWithPassword[]>(USERS_FILE, []);
  const user = users.find(u => u.email === normalizedEmail);

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (!user.password) {
    return { success: false, error: 'Please use your social login method (Google/Facebook)' };
  }

  if (user.status === 'banned') {
    return { success: false, error: 'Account is banned' };
  }

  if (user.status === 'suspended') {
    return { success: false, error: 'Account is suspended' };
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  writeJSON(USERS_FILE, users);

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      authProvider: user.authProvider,
      emailVerified: user.emailVerified,
    }
  };
}

/**
 * Generate a password reset token
 */
export async function createPasswordResetToken(
  email: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (USE_POSTGRES) {
    const prisma = await getPrisma();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Create new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        email: normalizedEmail,
        expiresAt,
      }
    });

    return { success: true, token };
  }

  // JSON file storage fallback
  const users = readJSON<UserWithPassword[]>(USERS_FILE, []);
  const user = users.find(u => u.email === normalizedEmail);

  if (!user) {
    return { success: true };
  }

  const resetTokens = readJSON<PasswordResetToken[]>(PASSWORD_RESET_FILE, []);

  // Remove existing tokens for this user
  const filteredTokens = resetTokens.filter(t => t.userId !== user.id);

  // Create new token
  const token = crypto.randomBytes(32).toString('hex');
  const newResetToken: PasswordResetToken = {
    id: nanoid(),
    token,
    userId: user.id,
    email: normalizedEmail,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  filteredTokens.push(newResetToken);
  writeJSON(PASSWORD_RESET_FILE, filteredTokens);

  return { success: true, token };
}

/**
 * Reset password using token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  const hashedPassword = await hashPassword(newPassword);

  if (USE_POSTGRES) {
    const prisma = await getPrisma();

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    if (resetToken.usedAt) {
      return { success: false, error: 'Reset token has already been used' };
    }

    if (new Date(resetToken.expiresAt) < new Date()) {
      return { success: false, error: 'Reset token has expired' };
    }

    // Update password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    });

    return { success: true };
  }

  // JSON file storage fallback
  const resetTokens = readJSON<PasswordResetToken[]>(PASSWORD_RESET_FILE, []);
  const resetToken = resetTokens.find(t => t.token === token);

  if (!resetToken) {
    return { success: false, error: 'Invalid or expired reset token' };
  }

  if (resetToken.usedAt) {
    return { success: false, error: 'Reset token has already been used' };
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    return { success: false, error: 'Reset token has expired' };
  }

  // Update password
  const users = readJSON<UserWithPassword[]>(USERS_FILE, []);
  const user = users.find(u => u.id === resetToken.userId);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  user.password = hashedPassword;
  user.updatedAt = new Date().toISOString();
  writeJSON(USERS_FILE, users);

  // Mark token as used
  resetToken.usedAt = new Date().toISOString();
  writeJSON(PASSWORD_RESET_FILE, resetTokens);

  return { success: true };
}

/**
 * Get user by email (for NextAuth)
 */
export async function getUserByEmailForAuth(email: string): Promise<UserWithPassword | null> {
  const normalizedEmail = email.toLowerCase().trim();

  if (USE_POSTGRES) {
    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      image: user.image || undefined,
      password: user.password || undefined,
      authProvider: user.authProvider || undefined,
      emailVerified: user.emailVerified,
    };
  }

  const users = readJSON<UserWithPassword[]>(USERS_FILE, []);
  return users.find(u => u.email === normalizedEmail) || null;
}
