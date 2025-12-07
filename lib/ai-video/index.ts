/**
 * AI Video Module - Main Export
 *
 * Centralne eksporty dla modułu AI Video
 */

// Models & Configuration
export {
  type VideoProvider,
  type VideoModelId,
  type AspectRatio,
  type Resolution,
  type Duration,
  type VideoModelConfig,
  VIDEO_MODELS,
  getActiveModels,
  getModelsByProvider,
  getModelConfig,
  supportsResolution,
  supportsDuration,
  estimateCost,
  getToolTypeForModel,
  DEFAULT_VIDEO_SETTINGS,
} from './models';

// Generation
export {
  type VideoGenerationInput,
  type VideoGenerationResult,
  generateVideo,
  checkGenerationStatus,
  cancelGeneration,
} from './generate';

// Storage
export {
  downloadAndSaveVideo,
  downloadAndSaveThumbnail,
  deleteVideo as deleteVideoFile,
  deleteThumbnail,
  getFileSize,
  fileExists,
  generateVideoPath,
  cleanupOldVideos,
  getTotalStorageSize,
  formatFileSize,
} from './storage';

// Database
export {
  type CreateVideoParams,
  type UpdateVideoParams,
  type VideoGenerationStatus,
  createVideoRecord,
  updateVideoRecord,
  getVideoById,
  getVideoByJobId,
  getUserVideos,
  countUserVideos,
  getPublicVideos,
  deleteVideo as deleteVideoRecord,
  setVideoPublic,
  likeVideo,
  incrementViews,
  getProcessingVideos,
  markTimedOutVideos,
  getUserVideoStats,
  getRecentUserVideos,
} from './db';
