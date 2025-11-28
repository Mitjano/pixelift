/**
 * Image History Management
 * Tracks processed images for user history and analytics
 */

import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'image-history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==========================================
// Types
// ==========================================

export type ImageProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ImageProcessingType = 'upscale' | 'enhance' | 'restore' | 'background_remove' | 'compress' | 'packshot';

export interface ImageHistoryEntry {
  id: string;
  userId: string;
  type: ImageProcessingType;
  status: ImageProcessingStatus;
  preset?: string;
  scale?: number;

  // Original image info
  originalUrl: string;
  originalWidth?: number;
  originalHeight?: number;
  originalSize?: number;
  originalFormat?: string;

  // Processed image info
  processedUrl?: string;
  processedWidth?: number;
  processedHeight?: number;
  processedSize?: number;
  processedFormat?: string;

  // Processing details
  creditsUsed: number;
  processingTime?: number; // in milliseconds
  model?: string; // AI model used
  settings?: Record<string, unknown>; // Additional settings
  error?: string;

  // Timestamps
  createdAt: string;
  completedAt?: string;
  expiresAt?: string; // When the image URLs expire
}

export interface CreateImageHistoryInput {
  userId: string;
  type: ImageProcessingType;
  preset?: string;
  scale?: number;
  originalUrl: string;
  originalWidth?: number;
  originalHeight?: number;
  originalSize?: number;
  originalFormat?: string;
  model?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateImageHistoryInput {
  status?: ImageProcessingStatus;
  processedUrl?: string;
  processedWidth?: number;
  processedHeight?: number;
  processedSize?: number;
  processedFormat?: string;
  creditsUsed?: number;
  processingTime?: number;
  error?: string;
  completedAt?: string;
  expiresAt?: string;
}

// ==========================================
// File Operations
// ==========================================

function ensureFile(): void {
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readHistory(): ImageHistoryEntry[] {
  ensureFile();
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeHistory(history: ImageHistoryEntry[]): void {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

// ==========================================
// CRUD Operations
// ==========================================

/**
 * Create a new image history entry
 */
export function createImageHistory(input: CreateImageHistoryInput): ImageHistoryEntry {
  const history = readHistory();

  const entry: ImageHistoryEntry = {
    id: nanoid(),
    userId: input.userId,
    type: input.type,
    status: 'pending',
    preset: input.preset,
    scale: input.scale,
    originalUrl: input.originalUrl,
    originalWidth: input.originalWidth,
    originalHeight: input.originalHeight,
    originalSize: input.originalSize,
    originalFormat: input.originalFormat,
    model: input.model,
    settings: input.settings,
    creditsUsed: 0,
    createdAt: new Date().toISOString(),
  };

  history.push(entry);
  writeHistory(history);

  return entry;
}

/**
 * Get image history entry by ID
 */
export function getImageHistoryById(id: string): ImageHistoryEntry | undefined {
  const history = readHistory();
  return history.find((entry) => entry.id === id);
}

/**
 * Update image history entry
 */
export function updateImageHistory(
  id: string,
  updates: UpdateImageHistoryInput
): ImageHistoryEntry | undefined {
  const history = readHistory();
  const index = history.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return undefined;
  }

  history[index] = { ...history[index], ...updates };
  writeHistory(history);

  return history[index];
}

/**
 * Get all image history for a user
 */
export function getUserImageHistory(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    type?: ImageProcessingType;
    status?: ImageProcessingStatus;
    sortBy?: 'createdAt' | 'completedAt';
    sortOrder?: 'asc' | 'desc';
  } = {}
): { entries: ImageHistoryEntry[]; total: number } {
  const {
    limit = 20,
    offset = 0,
    type,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  let history = readHistory().filter((entry) => entry.userId === userId);

  // Apply filters
  if (type) {
    history = history.filter((entry) => entry.type === type);
  }
  if (status) {
    history = history.filter((entry) => entry.status === status);
  }

  // Sort
  history.sort((a, b) => {
    const aValue = a[sortBy] || '';
    const bValue = b[sortBy] || '';
    const comparison = aValue.localeCompare(bValue);
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const total = history.length;

  // Paginate
  const entries = history.slice(offset, offset + limit);

  return { entries, total };
}

/**
 * Delete image history entry
 */
export function deleteImageHistory(id: string): boolean {
  const history = readHistory();
  const index = history.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return false;
  }

  history.splice(index, 1);
  writeHistory(history);

  return true;
}

/**
 * Delete all image history for a user
 */
export function deleteUserImageHistory(userId: string): number {
  const history = readHistory();
  const filtered = history.filter((entry) => entry.userId !== userId);
  const deletedCount = history.length - filtered.length;

  writeHistory(filtered);

  return deletedCount;
}

/**
 * Get user statistics
 */
export function getUserImageStats(userId: string): {
  totalImages: number;
  totalCreditsUsed: number;
  byType: Record<ImageProcessingType, number>;
  byStatus: Record<ImageProcessingStatus, number>;
  averageProcessingTime: number;
} {
  const history = readHistory().filter((entry) => entry.userId === userId);

  const byType: Record<ImageProcessingType, number> = {
    upscale: 0,
    enhance: 0,
    restore: 0,
    background_remove: 0,
    compress: 0,
    packshot: 0,
  };

  const byStatus: Record<ImageProcessingStatus, number> = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  let totalCreditsUsed = 0;
  let totalProcessingTime = 0;
  let processedCount = 0;

  for (const entry of history) {
    byType[entry.type]++;
    byStatus[entry.status]++;
    totalCreditsUsed += entry.creditsUsed || 0;

    if (entry.processingTime) {
      totalProcessingTime += entry.processingTime;
      processedCount++;
    }
  }

  return {
    totalImages: history.length,
    totalCreditsUsed,
    byType,
    byStatus,
    averageProcessingTime: processedCount > 0 ? totalProcessingTime / processedCount : 0,
  };
}

/**
 * Clean up expired entries (older than specified days)
 */
export function cleanupExpiredHistory(daysOld: number = 30): number {
  const history = readHistory();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const filtered = history.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    return entryDate > cutoffDate;
  });

  const deletedCount = history.length - filtered.length;
  writeHistory(filtered);

  return deletedCount;
}

/**
 * Mark entry as processing
 */
export function markAsProcessing(id: string): ImageHistoryEntry | undefined {
  return updateImageHistory(id, { status: 'processing' });
}

/**
 * Mark entry as completed
 */
export function markAsCompleted(
  id: string,
  result: {
    processedUrl: string;
    processedWidth?: number;
    processedHeight?: number;
    processedSize?: number;
    processedFormat?: string;
    creditsUsed: number;
    processingTime?: number;
    expiresAt?: string;
  }
): ImageHistoryEntry | undefined {
  return updateImageHistory(id, {
    status: 'completed',
    processedUrl: result.processedUrl,
    processedWidth: result.processedWidth,
    processedHeight: result.processedHeight,
    processedSize: result.processedSize,
    processedFormat: result.processedFormat,
    creditsUsed: result.creditsUsed,
    processingTime: result.processingTime,
    completedAt: new Date().toISOString(),
    expiresAt: result.expiresAt,
  });
}

/**
 * Mark entry as failed
 */
export function markAsFailed(id: string, error: string): ImageHistoryEntry | undefined {
  return updateImageHistory(id, {
    status: 'failed',
    error,
    completedAt: new Date().toISOString(),
  });
}
