import { NextResponse } from "next/server";

/**
 * GET /api/v1/docs
 * API Documentation
 */
export async function GET() {
  const docs = {
    version: "1.0.0",
    title: "Pixelift API",
    description: "REST API for AI-powered image upscaling",
    base_url: process.env.NEXT_PUBLIC_API_URL || "https://pixelift.pl",
    authentication: {
      type: "Bearer Token",
      description: "Include your API key in the Authorization header",
      example: "Authorization: Bearer pk_live_xxxxxxxxxxxxx",
    },
    endpoints: {
      "/api/v1/upscale": {
        method: "POST",
        description: "Submit an image upscaling job",
        authentication: "required",
        rate_limit: "Varies by plan (10-2000 req/hour)",
        request_body: {
          image_url: {
            type: "string",
            required: false,
            description: "URL of the image to upscale (either this or image_data required)",
          },
          image_data: {
            type: "string",
            required: false,
            description: "Base64-encoded image data (either this or image_url required)",
          },
          scale: {
            type: "number",
            required: false,
            default: 2,
            enum: [1, 2, 4, 8],
            description: "Upscaling factor (1=quality only, 2-8=upscale)",
          },
          enhance_face: {
            type: "boolean",
            required: false,
            default: false,
            description: "Enable face enhancement with GFPGAN",
          },
          denoise: {
            type: "boolean",
            required: false,
            default: false,
            description: "Remove grain and noise",
          },
          remove_artifacts: {
            type: "boolean",
            required: false,
            default: false,
            description: "Remove JPEG compression artifacts",
          },
          color_correction: {
            type: "boolean",
            required: false,
            default: false,
            description: "Apply automatic color correction",
          },
          preset: {
            type: "string",
            required: false,
            enum: ["enhance", "portrait", "landscape", "art", "restoration", "maximum"],
            description: "Apply predefined AI preset",
          },
          webhook_url: {
            type: "string",
            required: false,
            description: "URL to receive webhook notifications when job completes",
          },
        },
        response: {
          "202": {
            description: "Job accepted and queued",
            example: {
              success: true,
              data: {
                job_id: "user123-1234567890",
                status: "pending",
                estimated_time: "15-60s",
                message: "Job submitted successfully.",
              },
              meta: {
                requestId: "req_abc123",
                timestamp: "2025-01-18T12:00:00Z",
                rateLimit: {
                  remaining: 99,
                  limit: 100,
                  reset: "2025-01-18T13:00:00Z",
                },
              },
            },
          },
          "400": { description: "Invalid input" },
          "401": { description: "Missing or invalid API key" },
          "429": { description: "Rate limit exceeded" },
        },
      },
      "/api/v1/jobs/:id": {
        method: "GET",
        description: "Get job status and result",
        authentication: "required",
        parameters: {
          id: {
            type: "string",
            required: true,
            description: "Job ID returned from /api/v1/upscale",
          },
        },
        response: {
          "200": {
            description: "Job found",
            example: {
              success: true,
              data: {
                job_id: "user123-1234567890",
                status: "completed",
                created_at: "2025-01-18T12:00:00Z",
                started_at: "2025-01-18T12:00:05Z",
                completed_at: "2025-01-18T12:00:23Z",
                processing_time: 18.5,
                input: {
                  scale: 4,
                  enhance_face: true,
                  denoise: true,
                  remove_artifacts: false,
                  color_correction: false,
                },
                result: {
                  output_url: "https://replicate.delivery/...",
                  original_size: { width: 1920, height: 1080 },
                  output_size: { width: 7680, height: 4320 },
                  file_size: 15234567,
                  processing_time: 18.5,
                },
              },
            },
          },
          "404": { description: "Job not found" },
          "403": { description: "Access denied to this job" },
        },
      },
      "/api/v1/keys": {
        method: "GET, POST",
        description: "Manage API keys (requires user authentication via web session)",
        GET: {
          description: "List all API keys for authenticated user",
          response: {
            "200": {
              example: {
                success: true,
                data: {
                  keys: [
                    {
                      id: "key123",
                      name: "Production Key",
                      key: "pk_live_****xyz",
                      plan: "professional",
                      environment: "live",
                      is_active: true,
                      created_at: "2025-01-01T00:00:00Z",
                      last_used_at: "2025-01-18T12:00:00Z",
                    },
                  ],
                  count: 1,
                },
              },
            },
          },
        },
        POST: {
          description: "Create a new API key",
          request_body: {
            name: {
              type: "string",
              required: false,
              default: "Unnamed Key",
              description: "Friendly name for the API key",
            },
            environment: {
              type: "string",
              required: false,
              default: "live",
              enum: ["live", "test"],
              description: "Key environment",
            },
            plan: {
              type: "string",
              required: false,
              default: "free",
              enum: ["free", "starter", "professional", "enterprise"],
              description: "API plan with associated rate limits",
            },
          },
          response: {
            "201": {
              example: {
                success: true,
                data: {
                  id: "key123",
                  key: "pk_live_abc123xyz...", // Full key shown only once!
                  name: "Production Key",
                  plan: "professional",
                  environment: "live",
                  rate_limit: {
                    requestsPerHour: 500,
                    requestsPerDay: 5000,
                    concurrentJobs: 10,
                  },
                  created_at: "2025-01-18T12:00:00Z",
                  message: "⚠️ Save this key securely. It won't be shown again!",
                },
              },
            },
          },
        },
      },
    },
    webhooks: {
      description: "Receive notifications when jobs complete",
      events: [
        "job.processing",
        "job.completed",
        "job.failed",
      ],
      payload_example: {
        event: "job.completed",
        job_id: "user123-1234567890",
        status: "completed",
        result: {
          output_url: "https://replicate.delivery/...",
          original_size: { width: 1920, height: 1080 },
          output_size: { width: 7680, height: 4320 },
          file_size: 15234567,
          processing_time: 18.5,
        },
        timestamp: "2025-01-18T12:00:23Z",
      },
      verification: {
        header: "X-Webhook-Signature",
        algorithm: "HMAC-SHA256",
        description: "Verify webhook authenticity using signature in header",
      },
    },
    rate_limits: {
      free: {
        requests_per_hour: 10,
        requests_per_day: 50,
        concurrent_jobs: 1,
      },
      starter: {
        requests_per_hour: 100,
        requests_per_day: 1000,
        concurrent_jobs: 3,
      },
      professional: {
        requests_per_hour: 500,
        requests_per_day: 5000,
        concurrent_jobs: 10,
      },
      enterprise: {
        requests_per_hour: 2000,
        requests_per_day: 20000,
        concurrent_jobs: 50,
      },
    },
    errors: {
      UNAUTHORIZED: {
        code: 401,
        description: "Missing or invalid API key",
      },
      FORBIDDEN: {
        code: 403,
        description: "Access denied to resource",
      },
      INVALID_INPUT: {
        code: 400,
        description: "Invalid request parameters",
      },
      RATE_LIMIT_EXCEEDED: {
        code: 429,
        description: "Too many requests",
      },
      CONCURRENT_LIMIT_EXCEEDED: {
        code: 429,
        description: "Too many concurrent jobs",
      },
      JOB_NOT_FOUND: {
        code: 404,
        description: "Job ID not found",
      },
      INTERNAL_ERROR: {
        code: 500,
        description: "Unexpected server error",
      },
    },
    examples: {
      curl: {
        upscale_from_url: `curl -X POST https://pixelift.pl/api/v1/upscale \\
  -H "Authorization: Bearer pk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/image.jpg",
    "scale": 4,
    "enhance_face": true,
    "webhook_url": "https://your-app.com/webhooks/pixelift"
  }'`,
        check_status: `curl -X GET https://pixelift.pl/api/v1/jobs/user123-1234567890 \\
  -H "Authorization: Bearer pk_live_your_key_here"`,
      },
      javascript: `// Install: npm install axios

const axios = require('axios');

async function upscaleImage() {
  const response = await axios.post('https://pixelift.pl/api/v1/upscale', {
    image_url: 'https://example.com/image.jpg',
    scale: 4,
    enhance_face: true,
    webhook_url: 'https://your-app.com/webhooks/pixelift'
  }, {
    headers: {
      'Authorization': 'Bearer pk_live_your_key_here'
    }
  });

  const jobId = response.data.data.job_id;
  console.log('Job ID:', jobId);

  // Poll for result
  const checkStatus = async () => {
    const statusResponse = await axios.get(
      \`https://pixelift.pl/api/v1/jobs/\${jobId}\`,
      { headers: { 'Authorization': 'Bearer pk_live_your_key_here' } }
    );

    if (statusResponse.data.data.status === 'completed') {
      console.log('Result:', statusResponse.data.data.result.output_url);
    } else if (statusResponse.data.data.status === 'failed') {
      console.error('Job failed:', statusResponse.data.data.error);
    } else {
      setTimeout(checkStatus, 2000); // Check again in 2s
    }
  };

  checkStatus();
}

upscaleImage();`,
      python: `# Install: pip install requests

import requests
import time

API_KEY = 'pk_live_your_key_here'
BASE_URL = 'https://pixelift.pl/api/v1'

def upscale_image():
    # Submit job
    response = requests.post(
        f'{BASE_URL}/upscale',
        json={
            'image_url': 'https://example.com/image.jpg',
            'scale': 4,
            'enhance_face': True,
            'webhook_url': 'https://your-app.com/webhooks/pixelift'
        },
        headers={'Authorization': f'Bearer {API_KEY}'}
    )

    job_id = response.json()['data']['job_id']
    print(f'Job ID: {job_id}')

    # Poll for result
    while True:
        status_response = requests.get(
            f'{BASE_URL}/jobs/{job_id}',
            headers={'Authorization': f'Bearer {API_KEY}'}
        )

        data = status_response.json()['data']

        if data['status'] == 'completed':
            print(f"Result: {data['result']['output_url']}")
            break
        elif data['status'] == 'failed':
            print(f"Job failed: {data['error']}")
            break
        else:
            print('Processing...')
            time.sleep(2)

upscale_image()`,
    },
  };

  return NextResponse.json(docs, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}
