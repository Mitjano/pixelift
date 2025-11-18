# Pixelift Enterprise API

REST API for AI-powered image upscaling with Real-ESRGAN and GFPGAN.

## Features

- **Asynchronous Processing**: Submit jobs via REST API, receive results via webhooks
- **Rate Limiting**: Configurable limits per plan (10-2000 requests/hour)
- **Job Queue**: BullMQ + Redis for reliable background processing
- **Webhooks**: Get notified when jobs complete
- **Multiple Plans**: Free, Starter, Professional, Enterprise
- **Authentication**: Secure API key authentication
- **Documentation**: Full API docs at `/api/v1/docs`

## Quick Start

### 1. Prerequisites

- Node.js 18+
- Redis server (local or cloud like Upstash)
- Replicate API account
- Firebase project

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

**Required variables:**
- `REPLICATE_API_TOKEN` - Get from [replicate.com](https://replicate.com)
- `REDIS_URL` - Redis connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- Firebase credentials

### 4. Start Redis (Development)

```bash
# macOS/Linux with Homebrew
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine

# Windows - use WSL or Redis for Windows
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Start Background Worker

The worker processes jobs from the queue. In production, run this separately:

```typescript
// Create worker.ts in project root
import { startWorker } from './lib/queue';

startWorker();
console.log('Worker started. Press Ctrl+C to stop.');

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await stopWorker();
  process.exit(0);
});
```

Run it:
```bash
ts-node worker.ts
```

## API Usage

### Authentication

Include your API key in the `Authorization` header:

```bash
Authorization: Bearer pk_live_your_key_here
```

### Create API Key

1. Log in to Pixelift dashboard
2. Navigate to Settings → API Keys
3. Click "Generate New Key"
4. Save the key securely (shown only once!)

Or via API (requires user session):

```bash
curl -X POST http://localhost:3000/api/v1/keys \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Key",
    "environment": "live",
    "plan": "professional"
  }'
```

### Submit Upscale Job

```bash
curl -X POST http://localhost:3000/api/v1/upscale \
  -H "Authorization: Bearer pk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/image.jpg",
    "scale": 4,
    "enhance_face": true,
    "denoise": true,
    "webhook_url": "https://your-app.com/webhooks/pixelift"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "user123-1705584000000",
    "status": "pending",
    "estimated_time": "15-60s",
    "message": "Job submitted successfully."
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-01-18T12:00:00Z",
    "rateLimit": {
      "remaining": 99,
      "limit": 100,
      "reset": "2025-01-18T13:00:00Z"
    }
  }
}
```

### Check Job Status

```bash
curl -X GET http://localhost:3000/api/v1/jobs/user123-1705584000000 \
  -H "Authorization: Bearer pk_live_xxxxx"
```

**Response (completed):**
```json
{
  "success": true,
  "data": {
    "job_id": "user123-1705584000000",
    "status": "completed",
    "created_at": "2025-01-18T12:00:00Z",
    "completed_at": "2025-01-18T12:00:18Z",
    "processing_time": 18.5,
    "result": {
      "output_url": "https://replicate.delivery/...",
      "original_size": {"width": 1920, "height": 1080},
      "output_size": {"width": 7680, "height": 4320},
      "file_size": 15234567,
      "processing_time": 18.5
    }
  }
}
```

### Webhooks

When a job completes, Pixelift sends a POST request to your `webhook_url`:

```json
{
  "event": "job.completed",
  "job_id": "user123-1705584000000",
  "status": "completed",
  "result": {
    "output_url": "https://replicate.delivery/...",
    "original_size": {"width": 1920, "height": 1080},
    "output_size": {"width": 7680, "height": 4320},
    "file_size": 15234567,
    "processing_time": 18.5
  },
  "timestamp": "2025-01-18T12:00:18Z"
}
```

**Verify webhook signature:**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  return signature === expectedSignature;
}

// In your webhook handler:
const signature = req.headers['x-webhook-signature'];
const isValid = verifyWebhook(req.body, signature, process.env.WEBHOOK_SECRET);

if (!isValid) {
  return res.status(401).send('Invalid signature');
}
```

## Rate Limits

| Plan | Requests/Hour | Requests/Day | Concurrent Jobs |
|------|--------------|--------------|-----------------|
| Free | 10 | 50 | 1 |
| Starter | 100 | 1,000 | 3 |
| Professional | 500 | 5,000 | 10 |
| Enterprise | 2,000 | 20,000 | 50 |

Rate limit info is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 2025-01-18T13:00:00Z
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/upscale` | POST | Submit upscale job |
| `/api/v1/jobs/:id` | GET | Get job status/result |
| `/api/v1/keys` | GET | List API keys (requires session) |
| `/api/v1/keys` | POST | Create API key (requires session) |
| `/api/v1/docs` | GET | API documentation |

## Full Documentation

Visit `/api/v1/docs` for complete API reference with examples in:
- cURL
- JavaScript (Node.js)
- Python

## Production Deployment

### Redis Setup

**Option 1: Upstash (Recommended)**
1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy connection string to `REDIS_URL`

**Option 2: Redis Cloud**
1. Create account at [redis.com](https://redis.com)
2. Create database
3. Copy connection string

### Worker Deployment

Deploy the worker as a separate service/container:

**DigitalOcean App Platform:**
```yaml
name: pixelift-worker
services:
  - name: worker
    source_dir: /
    run_command: node worker.js
    environment_slug: node-js
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "worker.js"]
```

### Environment Variables

Set all variables from `.env.example` in your production environment.

**Important:**
- Use strong `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- Use production Redis URL
- Set `WEBHOOK_SECRET` for signature verification
- Enable HTTPS for production (`NEXTAUTH_URL`)

## Monitoring

Monitor your API with:

**Job Queue:**
- Use BullMQ Board for visual monitoring
- Track failed jobs, processing times, queue size

**Rate Limits:**
- Redis keys: `ratelimit:*` - request counts
- Redis keys: `concurrent:*` - active jobs

**Logs:**
- Worker logs show job processing
- API logs show authentication, rate limits

## Troubleshooting

### Redis Connection Errors

```bash
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:** Ensure Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

### Rate Limit Issues

**429 Too Many Requests**

Check your plan limits and upgrade if needed. Rate limits reset hourly.

### Job Stuck in "pending"

Ensure the worker is running:
```bash
ts-node worker.ts
```

Check worker logs for errors.

### Webhook Not Received

1. Ensure your webhook URL is publicly accessible
2. Check webhook signature verification
3. Respond with 2xx status code quickly (<5s)

## Support

- Email: sales@pixelift.pl
- Documentation: `/api/v1/docs`
- Issues: GitHub repository

## License

ISC License - Pixelift 2025
