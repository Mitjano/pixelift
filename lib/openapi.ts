/**
 * OpenAPI 3.0 Specification for Pixelift API
 */

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Pixelift API',
    description: `
# Pixelift API Documentation

Pixelift provides AI-powered image processing services including:
- **Image Upscaling** - Increase image resolution up to 8x using Real-ESRGAN
- **Quality Enhancement** - Improve image quality without resizing
- **Face Enhancement** - Enhance faces using GFPGAN
- **Background Removal** - Remove backgrounds from images
- **Image Compression** - Optimize images for web

## Authentication

All API endpoints require authentication using an API key. Include your API key in the request header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

You can generate API keys in your [dashboard](/dashboard/api-keys).

## Rate Limits

Rate limits depend on your plan:
- **Free**: 10 requests/minute
- **Starter**: 60 requests/minute
- **Pro**: 300 requests/minute
- **Business**: 1000 requests/minute
- **Enterprise**: Custom limits

## Credits

Each image processing operation consumes credits based on the operation type and image size.
    `,
    version: '1.0.0',
    contact: {
      name: 'Pixelift Support',
      email: 'support@pixelift.pl',
      url: 'https://pixelift.pl',
    },
    license: {
      name: 'Proprietary',
    },
  },
  servers: [
    {
      url: 'https://pixelift.pl/api',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Image Processing',
      description: 'AI-powered image processing endpoints',
    },
    {
      name: 'History',
      description: 'Image processing history management',
    },
    {
      name: 'User',
      description: 'User account and credits management',
    },
    {
      name: 'Payments',
      description: 'Stripe payment and subscription management',
    },
    {
      name: 'API Keys',
      description: 'API key management for programmatic access',
    },
  ],
  paths: {
    '/upscale': {
      post: {
        tags: ['Image Processing'],
        summary: 'Upscale an image',
        description: 'Upscale an image using Real-ESRGAN AI model. Supports 2x, 4x, and 8x upscaling.',
        operationId: 'upscaleImage',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file to upscale (JPEG, PNG, WebP)',
                  },
                  scale: {
                    type: 'integer',
                    enum: [2, 4, 8],
                    default: 2,
                    description: 'Upscaling factor',
                  },
                  preset: {
                    type: 'string',
                    enum: ['quality_boost', 'portrait', 'landscape', 'art', 'restoration', 'maximum'],
                    default: 'quality_boost',
                    description: 'Processing preset',
                  },
                  face_enhance: {
                    type: 'boolean',
                    default: false,
                    description: 'Enable face enhancement using GFPGAN',
                  },
                },
              },
            },
            'application/json': {
              schema: {
                type: 'object',
                required: ['image_url'],
                properties: {
                  image_url: {
                    type: 'string',
                    format: 'uri',
                    description: 'URL of image to upscale',
                  },
                  scale: {
                    type: 'integer',
                    enum: [2, 4, 8],
                    default: 2,
                  },
                  preset: {
                    type: 'string',
                    enum: ['quality_boost', 'portrait', 'landscape', 'art', 'restoration', 'maximum'],
                    default: 'quality_boost',
                  },
                  face_enhance: {
                    type: 'boolean',
                    default: false,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Image upscaled successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProcessingResult',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/BadRequest',
          },
          '401': {
            $ref: '#/components/responses/Unauthorized',
          },
          '402': {
            $ref: '#/components/responses/InsufficientCredits',
          },
          '429': {
            $ref: '#/components/responses/RateLimitExceeded',
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    '/enhance': {
      post: {
        tags: ['Image Processing'],
        summary: 'Enhance image quality',
        description: 'Improve image quality without changing resolution.',
        operationId: 'enhanceImage',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file to enhance',
                  },
                  strength: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1,
                    default: 0.5,
                    description: 'Enhancement strength (0-1)',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Image enhanced successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProcessingResult',
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '402': { $ref: '#/components/responses/InsufficientCredits' },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    '/background-remove': {
      post: {
        tags: ['Image Processing'],
        summary: 'Remove background from image',
        description: 'Remove the background from an image, leaving only the subject.',
        operationId: 'removeBackground',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                  },
                  output_format: {
                    type: 'string',
                    enum: ['png', 'webp'],
                    default: 'png',
                    description: 'Output format (PNG for transparency)',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Background removed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProcessingResult',
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '402': { $ref: '#/components/responses/InsufficientCredits' },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    '/history': {
      get: {
        tags: ['History'],
        summary: 'Get processing history',
        description: 'Retrieve your image processing history with pagination and filters.',
        operationId: 'getHistory',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
            description: 'Number of entries to return',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Number of entries to skip',
          },
          {
            name: 'type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['upscale', 'enhance', 'restore', 'background_remove', 'compress', 'packshot'],
            },
            description: 'Filter by processing type',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed'],
            },
            description: 'Filter by status',
          },
          {
            name: 'stats',
            in: 'query',
            schema: { type: 'boolean', default: false },
            description: 'Include usage statistics',
          },
        ],
        responses: {
          '200': {
            description: 'History retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HistoryResponse',
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
        security: [{ bearerAuth: [] }],
      },
      delete: {
        tags: ['History'],
        summary: 'Delete all history',
        description: 'Delete all your image processing history.',
        operationId: 'deleteHistory',
        responses: {
          '200': {
            description: 'History deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    deletedCount: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    '/history/{id}': {
      get: {
        tags: ['History'],
        summary: 'Get history entry',
        description: 'Get a single history entry by ID.',
        operationId: 'getHistoryEntry',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Entry retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HistoryEntry',
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        security: [{ bearerAuth: [] }],
      },
      delete: {
        tags: ['History'],
        summary: 'Delete history entry',
        description: 'Delete a single history entry.',
        operationId: 'deleteHistoryEntry',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Entry deleted successfully',
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    '/user/credits': {
      get: {
        tags: ['User'],
        summary: 'Get credit balance',
        description: 'Get your current credit balance and usage.',
        operationId: 'getCredits',
        responses: {
          '200': {
            description: 'Credits retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    credits: { type: 'integer', description: 'Available credits' },
                    totalUsage: { type: 'integer', description: 'Total credits used' },
                    plan: { type: 'string', description: 'Current subscription plan' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    '/stripe/checkout': {
      post: {
        tags: ['Payments'],
        summary: 'Create checkout session',
        description: 'Create a Stripe checkout session for subscription or one-time purchase.',
        operationId: 'createCheckout',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type'],
                properties: {
                  type: {
                    type: 'string',
                    enum: ['subscription', 'onetime'],
                  },
                  planId: {
                    type: 'string',
                    description: 'For subscriptions: starter, pro, business, enterprise',
                  },
                  packageId: {
                    type: 'string',
                    description: 'For one-time: starter, basic, standard, pro, business',
                  },
                  billingPeriod: {
                    type: 'string',
                    enum: ['monthly', 'yearly'],
                    default: 'monthly',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Checkout session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: { type: 'string' },
                    url: { type: 'string', format: 'uri' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    '/stripe/portal': {
      get: {
        tags: ['Payments'],
        summary: 'Get customer portal URL',
        description: 'Get Stripe customer portal URL for subscription management.',
        operationId: 'getPortal',
        responses: {
          '200': {
            description: 'Portal URL retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', format: 'uri' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
        security: [{ bearerAuth: [] }],
      },
    },
  },
  components: {
    schemas: {
      ProcessingResult: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Processing job ID' },
          status: { type: 'string', enum: ['completed', 'processing', 'failed'] },
          output_url: { type: 'string', format: 'uri', description: 'URL of processed image' },
          original_width: { type: 'integer' },
          original_height: { type: 'integer' },
          processed_width: { type: 'integer' },
          processed_height: { type: 'integer' },
          credits_used: { type: 'integer' },
          processing_time: { type: 'integer', description: 'Processing time in ms' },
        },
      },
      HistoryEntry: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: {
            type: 'string',
            enum: ['upscale', 'enhance', 'restore', 'background_remove', 'compress', 'packshot'],
          },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'completed', 'failed'],
          },
          preset: { type: 'string' },
          scale: { type: 'integer' },
          originalUrl: { type: 'string' },
          processedUrl: { type: 'string' },
          creditsUsed: { type: 'integer' },
          processingTime: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time' },
        },
      },
      HistoryResponse: {
        type: 'object',
        properties: {
          entries: {
            type: 'array',
            items: { $ref: '#/components/schemas/HistoryEntry' },
          },
          total: { type: 'integer' },
          limit: { type: 'integer' },
          offset: { type: 'integer' },
          hasMore: { type: 'boolean' },
          stats: {
            type: 'object',
            properties: {
              totalImages: { type: 'integer' },
              totalCreditsUsed: { type: 'integer' },
              byType: { type: 'object' },
              byStatus: { type: 'object' },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'object' },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request - invalid parameters',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized - invalid or missing API key',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      InsufficientCredits: {
        description: 'Insufficient credits',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      RateLimitExceeded: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: 'Rate limit exceeded',
              code: 'RATE_LIMIT',
              details: {
                limit: 60,
                remaining: 0,
                reset: 1699999999,
              },
            },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'API key authentication. Get your key from the dashboard.',
      },
    },
  },
};

export type OpenAPISpec = typeof openApiSpec;
