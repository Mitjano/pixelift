/**
 * Prisma Client Singleton
 * Ensures a single instance of PrismaClient is used across the application
 * Compatible with Prisma 7
 *
 * Note: In Prisma 7, the database URL is configured via prisma.config.ts
 * and loaded from DATABASE_URL environment variable automatically.
 */

import { PrismaClient } from './generated/prisma';

// Create a global variable to store the Prisma client in development
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Only create Prisma client when USE_POSTGRES is enabled
const USE_POSTGRES = process.env.USE_POSTGRES === 'true';

// Create the Prisma client with logging configuration (lazy)
const prismaClientSingleton = (): PrismaClient | null => {
  // Skip Prisma client creation when not using PostgreSQL
  if (!USE_POSTGRES) {
    return null;
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
};

// Use the global instance in development to prevent too many connections
// Returns null if USE_POSTGRES is not enabled
const prismaInstance = globalThis.__prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production' && prismaInstance) {
  globalThis.__prisma = prismaInstance;
}

// Export prisma (may be null if USE_POSTGRES is false)
export const prisma = prismaInstance as PrismaClient;

// Export types for convenience
export * from './generated/prisma';
