// API Key Types
export interface ApiKey {
  id: string;
  key: string;
  userId: string;
  name: string;
  plan: ApiPlan;
  rateLimit: RateLimitConfig;
  createdAt: Date;
  lastUsedAt: Date | null;
  isActive: boolean;
  environment: "live" | "test";
}

export type ApiPlan = "free" | "starter" | "professional" | "enterprise";

export interface RateLimitConfig {
  requestsPerHour: number;
  requestsPerDay: number;
  concurrentJobs: number;
}

// Job Types
export interface UpscaleJob {
  id: string;
  apiKeyId: string;
  userId: string;
  status: JobStatus;
  input: JobInput;
  result?: JobResult;
  error?: string;
  webhookUrl?: string;
  priority: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  processingTime?: number; // in seconds
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface JobInput {
  imageUrl?: string;
  imageData?: string; // base64
  scale: number;
  enhanceFace: boolean;
  denoise: boolean;
  removeArtifacts: boolean;
  colorCorrection: boolean;
  preset?: string;
}

export interface JobResult {
  outputUrl: string;
  originalSize: { width: number; height: number };
  outputSize: { width: number; height: number };
  fileSize: number; // in bytes
  processingTime: number; // in seconds
}

// Usage Tracking
export interface ApiUsage {
  apiKeyId: string;
  userId: string;
  endpoint: string;
  timestamp: Date;
  creditsUsed: number;
  jobId?: string;
  successful: boolean;
  errorCode?: string;
}

// Webhook Types
export interface WebhookPayload {
  event: WebhookEvent;
  jobId: string;
  status: JobStatus;
  result?: JobResult;
  error?: string;
  timestamp: Date;
}

export type WebhookEvent = "job.created" | "job.processing" | "job.completed" | "job.failed";

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: Date;
  rateLimit?: {
    remaining: number;
    limit: number;
    reset: Date;
  };
}

// Rate Limit Presets
export const RATE_LIMITS: Record<ApiPlan, RateLimitConfig> = {
  free: {
    requestsPerHour: 10,
    requestsPerDay: 50,
    concurrentJobs: 1,
  },
  starter: {
    requestsPerHour: 100,
    requestsPerDay: 1000,
    concurrentJobs: 3,
  },
  professional: {
    requestsPerHour: 500,
    requestsPerDay: 5000,
    concurrentJobs: 10,
  },
  enterprise: {
    requestsPerHour: 2000,
    requestsPerDay: 20000,
    concurrentJobs: 50,
  },
};
