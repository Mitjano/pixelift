import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/upscale/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  getUserByEmail: vi.fn(),
  updateUser: vi.fn(),
  createUsage: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendCreditsLowEmail: vi.fn(),
  sendCreditsDepletedEmail: vi.fn(),
  sendFirstUploadEmail: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  imageProcessingLimiter: {
    check: vi.fn(),
  },
  getClientIdentifier: vi.fn(),
  rateLimitResponse: vi.fn(),
}));

vi.mock('@/lib/validation', () => ({
  validateFileSize: vi.fn(),
  validateFileType: vi.fn(),
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
}));

vi.mock('@/lib/api-auth', () => ({
  authenticateRequest: vi.fn(),
}));

vi.mock('@/lib/image-processor', () => ({
  ImageProcessor: {
    getImageDimensions: vi.fn(),
    saveFile: vi.fn(),
    upscaleAdvanced: vi.fn(),
    upscaleFaithful: vi.fn(),
    downloadImage: vi.fn(),
  },
}));

vi.mock('@/lib/processed-images-db', () => ({
  ProcessedImagesDB: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

import { getUserByEmail, createUsage } from '@/lib/db';
import { sendCreditsDepletedEmail } from '@/lib/email';
import { imageProcessingLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit';
import { validateFileSize, validateFileType } from '@/lib/validation';
import { authenticateRequest } from '@/lib/api-auth';
import { ImageProcessor } from '@/lib/image-processor';
import { ProcessedImagesDB } from '@/lib/processed-images-db';

const mockGetUserByEmail = getUserByEmail as ReturnType<typeof vi.fn>;
const mockCreateUsage = createUsage as ReturnType<typeof vi.fn>;
const mockSendCreditsDepletedEmail = sendCreditsDepletedEmail as ReturnType<typeof vi.fn>;
const mockRateLimiterCheck = imageProcessingLimiter.check as ReturnType<typeof vi.fn>;
const mockGetClientIdentifier = getClientIdentifier as ReturnType<typeof vi.fn>;
const mockRateLimitResponse = rateLimitResponse as ReturnType<typeof vi.fn>;
const mockValidateFileSize = validateFileSize as ReturnType<typeof vi.fn>;
const mockValidateFileType = validateFileType as ReturnType<typeof vi.fn>;
const mockAuthenticateRequest = authenticateRequest as ReturnType<typeof vi.fn>;
const mockGetImageDimensions = ImageProcessor.getImageDimensions as ReturnType<typeof vi.fn>;
const mockSaveFile = ImageProcessor.saveFile as ReturnType<typeof vi.fn>;
const mockUpscaleAdvanced = ImageProcessor.upscaleAdvanced as ReturnType<typeof vi.fn>;
const mockUpscaleFaithful = ImageProcessor.upscaleFaithful as ReturnType<typeof vi.fn>;
const mockDownloadImage = ImageProcessor.downloadImage as ReturnType<typeof vi.fn>;
const mockProcessedImagesDBCreate = ProcessedImagesDB.create as ReturnType<typeof vi.fn>;
const mockProcessedImagesDBUpdate = ProcessedImagesDB.update as ReturnType<typeof vi.fn>;

describe('/api/upscale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Default mock implementations
    mockGetClientIdentifier.mockReturnValue('test-client');
    mockRateLimiterCheck.mockReturnValue({ allowed: true });
    mockValidateFileSize.mockReturnValue(true);
    mockValidateFileType.mockReturnValue(true);
  });

  const createFormDataRequest = (
    image: File | null,
    scale = '2',
    imageType = 'general'
  ): NextRequest => {
    const formData = new FormData();
    if (image) formData.append('image', image);
    formData.append('scale', scale);
    formData.append('imageType', imageType);

    return new NextRequest('http://localhost:3000/api/upscale', {
      method: 'POST',
      body: formData,
    });
  };

  const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024): File => {
    const content = new Uint8Array(size);
    return new File([content], name, { type });
  };

  describe('POST /api/upscale', () => {
    it('should return rate limit response when rate limited', async () => {
      mockRateLimiterCheck.mockReturnValue({ allowed: false, resetAt: Date.now() + 60000 });
      mockRateLimitResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 })
      );

      const request = createFormDataRequest(createMockFile());
      const response = await POST(request);

      expect(response.status).toBe(429);
    });

    it('should return 401 when not authenticated', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        success: false,
        error: 'Authentication required',
        statusCode: 401,
      });

      const request = createFormDataRequest(createMockFile());
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Authentication required');
    });

    it('should return 404 when user not found', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        success: true,
        user: { email: 'test@example.com' },
      });
      mockGetUserByEmail.mockResolvedValue(null);

      const request = createFormDataRequest(createMockFile());
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe('User not found');
    });

    it('should return 400 when no image provided', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        success: true,
        user: { email: 'test@example.com' },
      });
      mockGetUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        credits: 100,
      });

      const request = createFormDataRequest(null);
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('No image provided');
    });

    it('should return 400 when file is too large', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        success: true,
        user: { email: 'test@example.com' },
      });
      mockGetUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        credits: 100,
      });
      mockValidateFileSize.mockReturnValue(false);

      const request = createFormDataRequest(createMockFile());
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('File too large');
    });

    it('should return 400 when file type is invalid', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        success: true,
        user: { email: 'test@example.com' },
      });
      mockGetUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        credits: 100,
      });
      mockValidateFileType.mockReturnValue(false);

      const request = createFormDataRequest(createMockFile());
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid file type');
    });

    it('should return 402 when insufficient credits', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        success: true,
        user: { email: 'test@example.com' },
      });
      mockGetUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        credits: 0,
        name: 'Test User',
        totalUsage: 10,
      });
      mockSendCreditsDepletedEmail.mockResolvedValue(true);

      const request = createFormDataRequest(createMockFile());
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(402);
      expect(body.error).toBe('Insufficient credits');
      expect(body.required).toBeDefined();
      expect(body.available).toBe(0);
      expect(mockSendCreditsDepletedEmail).toHaveBeenCalled();
    });

    it('should process image successfully', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        success: true,
        user: { email: 'test@example.com' },
      });
      mockGetUserByEmail
        .mockResolvedValueOnce({
          id: '1',
          email: 'test@example.com',
          credits: 100,
          name: 'Test User',
          firstUploadAt: new Date().toISOString(),
        })
        .mockResolvedValueOnce({
          id: '1',
          email: 'test@example.com',
          credits: 98,
        });

      mockGetImageDimensions.mockResolvedValue({ width: 100, height: 100 });
      mockSaveFile.mockResolvedValue('/uploads/original/test.jpg');
      mockProcessedImagesDBCreate.mockResolvedValue({ id: 'img_123' });
      mockUpscaleAdvanced.mockResolvedValue('https://replicate.com/result.png');
      mockDownloadImage.mockResolvedValue(Buffer.from('processed'));
      mockProcessedImagesDBUpdate.mockResolvedValue({});
      mockCreateUsage.mockResolvedValue({});

      const request = createFormDataRequest(createMockFile(), '2', 'general');
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.imageId).toBe('img_123');
      expect(body.imageUrl).toContain('/api/processed-images/img_123/view');
      expect(body.scale).toBe(2);
      expect(body.imageType).toBe('general');
      expect(body.creditsUsed).toBeDefined();
      expect(body.creditsRemaining).toBe(98);
    });

    it('should use default scale and imageType when invalid', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        success: true,
        user: { email: 'test@example.com' },
      });
      mockGetUserByEmail
        .mockResolvedValueOnce({
          id: '1',
          email: 'test@example.com',
          credits: 100,
          firstUploadAt: new Date().toISOString(),
        })
        .mockResolvedValueOnce({
          id: '1',
          credits: 98,
        });

      mockGetImageDimensions.mockResolvedValue({ width: 100, height: 100 });
      mockSaveFile.mockResolvedValue('/uploads/test.jpg');
      mockProcessedImagesDBCreate.mockResolvedValue({ id: 'img_123' });
      mockUpscaleAdvanced.mockResolvedValue('https://replicate.com/result.png');
      mockDownloadImage.mockResolvedValue(Buffer.from('processed'));
      mockProcessedImagesDBUpdate.mockResolvedValue({});
      mockCreateUsage.mockResolvedValue({});

      const request = createFormDataRequest(createMockFile(), '999', 'invalid');
      const response = await POST(request);
      const body = await response.json();

      expect(body.scale).toBe(2); // Default
      expect(body.imageType).toBe('general'); // Default
    });

    it('should return 500 on processing error', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        success: true,
        user: { email: 'test@example.com' },
      });
      mockGetUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        credits: 100,
      });
      mockGetImageDimensions.mockRejectedValue(new Error('Processing failed'));

      const request = createFormDataRequest(createMockFile());
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe('Failed to process image');
      expect(body.details).toBe('Processing failed');
    });

    describe('Faithful mode (no AI)', () => {
      it('should process image with faithful mode (0 credits)', async () => {
        mockAuthenticateRequest.mockResolvedValue({
          success: true,
          user: { email: 'test@example.com' },
        });
        mockGetUserByEmail
          .mockResolvedValueOnce({
            id: '1',
            email: 'test@example.com',
            credits: 0, // Even 0 credits should work for faithful mode
            name: 'Test User',
            firstUploadAt: new Date().toISOString(),
          })
          .mockResolvedValueOnce({
            id: '1',
            email: 'test@example.com',
            credits: 0, // Still 0 after processing (free)
          });

        mockGetImageDimensions.mockResolvedValue({ width: 100, height: 100 });
        mockSaveFile.mockResolvedValue('/uploads/original/test.jpg');
        mockProcessedImagesDBCreate.mockResolvedValue({ id: 'img_faithful_123' });
        mockUpscaleFaithful.mockResolvedValue(Buffer.from('faithful_processed'));
        mockProcessedImagesDBUpdate.mockResolvedValue({});
        mockCreateUsage.mockResolvedValue({});

        const request = createFormDataRequest(createMockFile(), '2', 'faithful');
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.imageType).toBe('faithful');
        expect(body.model).toBe('Sharp Lanczos (No AI)');
        expect(body.creditsUsed).toBe(0);
        expect(mockUpscaleFaithful).toHaveBeenCalled();
        expect(mockUpscaleAdvanced).not.toHaveBeenCalled();
        expect(mockDownloadImage).not.toHaveBeenCalled();
      });

      it('should use upscaleFaithful for faithful imageType', async () => {
        mockAuthenticateRequest.mockResolvedValue({
          success: true,
          user: { email: 'test@example.com' },
        });
        mockGetUserByEmail
          .mockResolvedValueOnce({
            id: '1',
            email: 'test@example.com',
            credits: 10,
            firstUploadAt: new Date().toISOString(),
          })
          .mockResolvedValueOnce({
            id: '1',
            credits: 10, // No change - faithful is free
          });

        mockGetImageDimensions.mockResolvedValue({ width: 200, height: 200 });
        mockSaveFile.mockResolvedValue('/uploads/original/test.jpg');
        mockProcessedImagesDBCreate.mockResolvedValue({ id: 'img_456' });
        mockUpscaleFaithful.mockResolvedValue(Buffer.from('upscaled_content'));
        mockProcessedImagesDBUpdate.mockResolvedValue({});
        mockCreateUsage.mockResolvedValue({});

        const request = createFormDataRequest(createMockFile(), '4', 'faithful');
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.scale).toBe(4);
        expect(body.imageType).toBe('faithful');
        expect(mockUpscaleFaithful).toHaveBeenCalled();
      });

      it('should NOT use upscaleFaithful for general imageType', async () => {
        mockAuthenticateRequest.mockResolvedValue({
          success: true,
          user: { email: 'test@example.com' },
        });
        mockGetUserByEmail
          .mockResolvedValueOnce({
            id: '1',
            email: 'test@example.com',
            credits: 100,
            firstUploadAt: new Date().toISOString(),
          })
          .mockResolvedValueOnce({
            id: '1',
            credits: 98,
          });

        mockGetImageDimensions.mockResolvedValue({ width: 100, height: 100 });
        mockSaveFile.mockResolvedValue('/uploads/original/test.jpg');
        mockProcessedImagesDBCreate.mockResolvedValue({ id: 'img_789' });
        mockUpscaleAdvanced.mockResolvedValue('https://replicate.com/result.png');
        mockDownloadImage.mockResolvedValue(Buffer.from('ai_processed'));
        mockProcessedImagesDBUpdate.mockResolvedValue({});
        mockCreateUsage.mockResolvedValue({});

        const request = createFormDataRequest(createMockFile(), '2', 'general');
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.imageType).toBe('general');
        expect(mockUpscaleAdvanced).toHaveBeenCalled();
        expect(mockUpscaleFaithful).not.toHaveBeenCalled();
      });
    });
  });
});
