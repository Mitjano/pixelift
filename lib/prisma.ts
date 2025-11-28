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
  var prisma: PrismaClient | undefined;
}

// Create the Prisma client with logging configuration
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
};

// Use the global instance in development to prevent too many connections
const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };

// Export types for convenience
export * from './generated/prisma';
