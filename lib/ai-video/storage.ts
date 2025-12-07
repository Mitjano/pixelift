/**
 * AI Video Storage Module
 *
 * Obsługuje pobieranie i przechowywanie wygenerowanych wideo.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const VIDEOS_DIR = process.env.VIDEOS_STORAGE_PATH || './public/uploads/videos';
const THUMBNAILS_DIR = process.env.THUMBNAILS_STORAGE_PATH || './public/uploads/videos/thumbnails';

/**
 * Upewnij się, że katalogi istnieją
 */
function ensureDirectories(): void {
  [VIDEOS_DIR, THUMBNAILS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Pobierz wideo z URL i zapisz lokalnie
 */
export async function downloadAndSaveVideo(
  videoUrl: string,
  userId: string
): Promise<{
  success: boolean;
  localPath?: string;
  publicUrl?: string;
  fileSize?: number;
  error?: string;
}> {
  ensureDirectories();

  try {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'video/mp4';
    const extension = contentType.includes('webm') ? 'webm' : 'mp4';

    const filename = `${userId}_${uuidv4()}.${extension}`;
    const localPath = path.join(VIDEOS_DIR, filename);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(localPath, buffer);

    const publicUrl = `/uploads/videos/${filename}`;
    const fileSize = buffer.length;

    return {
      success: true,
      localPath,
      publicUrl,
      fileSize,
    };
  } catch (error) {
    console.error('Video download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Pobierz thumbnail i zapisz lokalnie
 */
export async function downloadAndSaveThumbnail(
  thumbnailUrl: string,
  userId: string
): Promise<{
  success: boolean;
  localPath?: string;
  publicUrl?: string;
  error?: string;
}> {
  ensureDirectories();

  try {
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error(`Failed to download thumbnail: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : 'jpg';

    const filename = `${userId}_${uuidv4()}_thumb.${extension}`;
    const localPath = path.join(THUMBNAILS_DIR, filename);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(localPath, buffer);

    const publicUrl = `/uploads/videos/thumbnails/${filename}`;

    return {
      success: true,
      localPath,
      publicUrl,
    };
  } catch (error) {
    console.error('Thumbnail download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Usuń wideo z dysku
 */
export function deleteVideo(localPath: string): boolean {
  try {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Video delete error:', error);
    return false;
  }
}

/**
 * Usuń thumbnail z dysku
 */
export function deleteThumbnail(localPath: string): boolean {
  try {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Thumbnail delete error:', error);
    return false;
  }
}

/**
 * Pobierz rozmiar pliku
 */
export function getFileSize(localPath: string): number | null {
  try {
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      return stats.size;
    }
    return null;
  } catch (error) {
    console.error('Get file size error:', error);
    return null;
  }
}

/**
 * Sprawdź czy plik istnieje
 */
export function fileExists(localPath: string): boolean {
  return fs.existsSync(localPath);
}

/**
 * Generuj unikalną ścieżkę dla wideo
 */
export function generateVideoPath(userId: string, extension: string = 'mp4'): {
  localPath: string;
  publicUrl: string;
} {
  ensureDirectories();
  const filename = `${userId}_${uuidv4()}.${extension}`;
  return {
    localPath: path.join(VIDEOS_DIR, filename),
    publicUrl: `/uploads/videos/${filename}`,
  };
}

/**
 * Wyczyść stare wideo (starsze niż X dni)
 */
export async function cleanupOldVideos(daysOld: number = 30): Promise<{
  deleted: number;
  errors: number;
}> {
  ensureDirectories();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  let deleted = 0;
  let errors = 0;

  try {
    const files = fs.readdirSync(VIDEOS_DIR);

    for (const file of files) {
      const filePath = path.join(VIDEOS_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile() && stats.mtime < cutoffDate) {
        try {
          fs.unlinkSync(filePath);
          deleted++;
        } catch {
          errors++;
        }
      }
    }

    // Cleanup thumbnails too
    const thumbFiles = fs.readdirSync(THUMBNAILS_DIR);
    for (const file of thumbFiles) {
      const filePath = path.join(THUMBNAILS_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile() && stats.mtime < cutoffDate) {
        try {
          fs.unlinkSync(filePath);
          deleted++;
        } catch {
          errors++;
        }
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }

  return { deleted, errors };
}

/**
 * Oblicz całkowity rozmiar przechowywanych wideo
 */
export function getTotalStorageSize(): {
  videos: number;
  thumbnails: number;
  total: number;
} {
  ensureDirectories();

  let videosSize = 0;
  let thumbnailsSize = 0;

  try {
    const videoFiles = fs.readdirSync(VIDEOS_DIR);
    for (const file of videoFiles) {
      const filePath = path.join(VIDEOS_DIR, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        videosSize += stats.size;
      }
    }

    const thumbFiles = fs.readdirSync(THUMBNAILS_DIR);
    for (const file of thumbFiles) {
      const filePath = path.join(THUMBNAILS_DIR, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        thumbnailsSize += stats.size;
      }
    }
  } catch (error) {
    console.error('Get storage size error:', error);
  }

  return {
    videos: videosSize,
    thumbnails: thumbnailsSize,
    total: videosSize + thumbnailsSize,
  };
}

/**
 * Formatuj rozmiar pliku do czytelnej postaci
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
