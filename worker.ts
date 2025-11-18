/**
 * Background Worker for Image Processing
 *
 * This worker processes jobs from the BullMQ queue.
 * Run separately from the Next.js app in production.
 *
 * Usage:
 *   Development: npx tsx worker.ts
 *   Production: node worker.js (after build)
 */

import { startWorker, stopWorker } from './lib/queue';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🚀 Starting Pixelift Image Processing Worker...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📍 Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);

// Start the worker
startWorker();

console.log('✅ Worker started successfully!');
console.log('💡 Processing jobs from queue...');
console.log('⏹️  Press Ctrl+C to stop');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down worker...');

  try {
    await stopWorker();
    console.log('✅ Worker stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error stopping worker:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');

  try {
    await stopWorker();
    console.log('✅ Worker stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error stopping worker:', error);
    process.exit(1);
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
