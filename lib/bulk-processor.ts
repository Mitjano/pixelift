/**
 * Bulk Image Processor
 * Handles batch processing of multiple images
 */

import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const DATA_DIR = path.join(process.cwd(), 'data');
const BULK_JOBS_FILE = path.join(DATA_DIR, 'bulk-jobs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==========================================
// Types
// ==========================================

export type BulkJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ProcessingType = 'upscale' | 'enhance' | 'restore' | 'background_remove' | 'compress';

export interface BulkJobImage {
  id: string;
  originalUrl: string;
  processedUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  creditsUsed?: number;
  processingTime?: number;
}

export interface BulkJob {
  id: string;
  userId: string;
  type: ProcessingType;
  status: BulkJobStatus;

  // Processing settings
  settings: {
    scale?: number;
    preset?: string;
    faceEnhance?: boolean;
    outputFormat?: string;
  };

  // Images
  images: BulkJobImage[];
  totalImages: number;
  processedImages: number;
  failedImages: number;

  // Credits
  estimatedCredits: number;
  actualCredits: number;

  // Timestamps
  createdAt: string;
  startedAt?: string;
  completedAt?: string;

  // Progress
  progress: number; // 0-100
}

export interface CreateBulkJobInput {
  userId: string;
  type: ProcessingType;
  imageUrls: string[];
  settings?: {
    scale?: number;
    preset?: string;
    faceEnhance?: boolean;
    outputFormat?: string;
  };
}

// ==========================================
// File Operations
// ==========================================

function ensureFile(): void {
  if (!fs.existsSync(BULK_JOBS_FILE)) {
    fs.writeFileSync(BULK_JOBS_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readJobs(): BulkJob[] {
  ensureFile();
  try {
    const data = fs.readFileSync(BULK_JOBS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeJobs(jobs: BulkJob[]): void {
  fs.writeFileSync(BULK_JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

// ==========================================
// Credit Calculation
// ==========================================

const CREDITS_PER_IMAGE: Record<ProcessingType, number> = {
  upscale: 1,
  enhance: 1,
  restore: 2,
  background_remove: 1,
  compress: 0.5,
};

const SCALE_MULTIPLIER: Record<number, number> = {
  1: 0.5, // Quality boost only
  2: 1,
  4: 2,
  8: 4,
};

export function calculateCreditsForJob(
  type: ProcessingType,
  imageCount: number,
  scale: number = 2
): number {
  const baseCredits = CREDITS_PER_IMAGE[type];
  const scaleMultiplier = SCALE_MULTIPLIER[scale] || 1;
  return Math.ceil(baseCredits * scaleMultiplier * imageCount);
}

// ==========================================
// Job Management
// ==========================================

/**
 * Create a new bulk processing job
 */
export function createBulkJob(input: CreateBulkJobInput): BulkJob {
  const jobs = readJobs();

  const images: BulkJobImage[] = input.imageUrls.map((url) => ({
    id: nanoid(),
    originalUrl: url,
    status: 'pending',
  }));

  const estimatedCredits = calculateCreditsForJob(
    input.type,
    images.length,
    input.settings?.scale
  );

  const job: BulkJob = {
    id: nanoid(),
    userId: input.userId,
    type: input.type,
    status: 'pending',
    settings: input.settings || {},
    images,
    totalImages: images.length,
    processedImages: 0,
    failedImages: 0,
    estimatedCredits,
    actualCredits: 0,
    createdAt: new Date().toISOString(),
    progress: 0,
  };

  jobs.push(job);
  writeJobs(jobs);

  return job;
}

/**
 * Get bulk job by ID
 */
export function getBulkJobById(id: string): BulkJob | undefined {
  const jobs = readJobs();
  return jobs.find((job) => job.id === id);
}

/**
 * Get all bulk jobs for a user
 */
export function getUserBulkJobs(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: BulkJobStatus;
  } = {}
): { jobs: BulkJob[]; total: number } {
  const { limit = 20, offset = 0, status } = options;

  let jobs = readJobs().filter((job) => job.userId === userId);

  if (status) {
    jobs = jobs.filter((job) => job.status === status);
  }

  // Sort by createdAt descending
  jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = jobs.length;
  const paginatedJobs = jobs.slice(offset, offset + limit);

  return { jobs: paginatedJobs, total };
}

/**
 * Update bulk job
 */
export function updateBulkJob(
  id: string,
  updates: Partial<Omit<BulkJob, 'id' | 'userId' | 'createdAt'>>
): BulkJob | undefined {
  const jobs = readJobs();
  const index = jobs.findIndex((job) => job.id === id);

  if (index === -1) {
    return undefined;
  }

  jobs[index] = { ...jobs[index], ...updates };
  writeJobs(jobs);

  return jobs[index];
}

/**
 * Update a specific image in a bulk job
 */
export function updateBulkJobImage(
  jobId: string,
  imageId: string,
  updates: Partial<Omit<BulkJobImage, 'id' | 'originalUrl'>>
): BulkJob | undefined {
  const jobs = readJobs();
  const jobIndex = jobs.findIndex((job) => job.id === jobId);

  if (jobIndex === -1) {
    return undefined;
  }

  const job = jobs[jobIndex];
  const imageIndex = job.images.findIndex((img) => img.id === imageId);

  if (imageIndex === -1) {
    return undefined;
  }

  job.images[imageIndex] = { ...job.images[imageIndex], ...updates };

  // Recalculate progress
  const completedCount = job.images.filter(
    (img) => img.status === 'completed' || img.status === 'failed'
  ).length;
  job.processedImages = job.images.filter((img) => img.status === 'completed').length;
  job.failedImages = job.images.filter((img) => img.status === 'failed').length;
  job.progress = Math.round((completedCount / job.totalImages) * 100);
  job.actualCredits = job.images.reduce((sum, img) => sum + (img.creditsUsed || 0), 0);

  // Update job status
  if (completedCount === job.totalImages) {
    job.status = job.failedImages === job.totalImages ? 'failed' : 'completed';
    job.completedAt = new Date().toISOString();
  }

  jobs[jobIndex] = job;
  writeJobs(jobs);

  return job;
}

/**
 * Start processing a bulk job
 */
export function startBulkJob(id: string): BulkJob | undefined {
  return updateBulkJob(id, {
    status: 'processing',
    startedAt: new Date().toISOString(),
  });
}

/**
 * Cancel a bulk job
 */
export function cancelBulkJob(id: string): BulkJob | undefined {
  const job = getBulkJobById(id);

  if (!job || job.status === 'completed' || job.status === 'failed') {
    return undefined;
  }

  return updateBulkJob(id, {
    status: 'cancelled',
    completedAt: new Date().toISOString(),
  });
}

/**
 * Delete a bulk job
 */
export function deleteBulkJob(id: string): boolean {
  const jobs = readJobs();
  const index = jobs.findIndex((job) => job.id === id);

  if (index === -1) {
    return false;
  }

  jobs.splice(index, 1);
  writeJobs(jobs);

  return true;
}

/**
 * Get next pending image from a job
 */
export function getNextPendingImage(jobId: string): BulkJobImage | undefined {
  const job = getBulkJobById(jobId);

  if (!job) {
    return undefined;
  }

  return job.images.find((img) => img.status === 'pending');
}

/**
 * Get bulk processing statistics for a user
 */
export function getUserBulkStats(userId: string): {
  totalJobs: number;
  totalImages: number;
  totalCreditsUsed: number;
  completedJobs: number;
  failedJobs: number;
  byType: Record<ProcessingType, number>;
} {
  const jobs = readJobs().filter((job) => job.userId === userId);

  const byType: Record<ProcessingType, number> = {
    upscale: 0,
    enhance: 0,
    restore: 0,
    background_remove: 0,
    compress: 0,
  };

  let totalImages = 0;
  let totalCreditsUsed = 0;
  let completedJobs = 0;
  let failedJobs = 0;

  for (const job of jobs) {
    totalImages += job.totalImages;
    totalCreditsUsed += job.actualCredits;
    byType[job.type] += job.totalImages;

    if (job.status === 'completed') completedJobs++;
    if (job.status === 'failed') failedJobs++;
  }

  return {
    totalJobs: jobs.length,
    totalImages,
    totalCreditsUsed,
    completedJobs,
    failedJobs,
    byType,
  };
}

// ==========================================
// Queue Management (for BullMQ integration)
// ==========================================

/**
 * Get all pending jobs ready for processing
 */
export function getPendingJobs(limit: number = 10): BulkJob[] {
  const jobs = readJobs().filter((job) => job.status === 'pending');
  return jobs.slice(0, limit);
}

/**
 * Get jobs that are currently processing
 */
export function getProcessingJobs(): BulkJob[] {
  return readJobs().filter((job) => job.status === 'processing');
}
