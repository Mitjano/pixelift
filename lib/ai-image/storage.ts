/**
 * AI Image Storage - Persistent image storage
 * Downloads images from Replicate and stores them locally
 */

import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const DATA_DIR = path.join(process.cwd(), 'data');
const GENERATED_IMAGES_DIR = path.join(DATA_DIR, 'generated-images');

// Ensure directories exist
if (!fs.existsSync(GENERATED_IMAGES_DIR)) {
  fs.mkdirSync(GENERATED_IMAGES_DIR, { recursive: true });
}

/**
 * Download an image from a URL and save it locally
 * Returns the local path (relative to data directory)
 */
export async function saveImageFromUrl(
  url: string,
  imageId: string
): Promise<{ localPath: string; contentType: string } | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to download image from ${url}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/webp';
    const buffer = await response.arrayBuffer();

    // Determine file extension from content type
    let extension = 'webp';
    if (contentType.includes('png')) {
      extension = 'png';
    } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      extension = 'jpg';
    } else if (contentType.includes('svg')) {
      extension = 'svg';
    }

    const filename = `${imageId}.${extension}`;
    const localPath = path.join('generated-images', filename);
    const fullPath = path.join(DATA_DIR, localPath);

    fs.writeFileSync(fullPath, Buffer.from(buffer));

    return { localPath, contentType };
  } catch (error) {
    console.error('Error saving image from URL:', error);
    return null;
  }
}

/**
 * Get the full file path for a generated image
 */
export function getImageFilePath(localPath: string): string {
  return path.join(DATA_DIR, localPath);
}

/**
 * Check if an image file exists
 */
export function imageExists(localPath: string): boolean {
  const fullPath = path.join(DATA_DIR, localPath);
  return fs.existsSync(fullPath);
}

/**
 * Delete an image file
 */
export function deleteImageFile(localPath: string): boolean {
  try {
    const fullPath = path.join(DATA_DIR, localPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image file:', error);
    return false;
  }
}

/**
 * Validate that a path is safe (no path traversal)
 */
export function validateSafePath(localPath: string): boolean {
  const normalizedPath = path.normalize(localPath);
  const fullPath = path.join(DATA_DIR, normalizedPath);

  // Ensure the resolved path starts with DATA_DIR
  return fullPath.startsWith(DATA_DIR) && !normalizedPath.includes('..');
}
