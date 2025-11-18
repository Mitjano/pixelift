# Pixelift Enterprise API - Deployment Guide

## Quick Start (Local Development)

### 1. Install Redis

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Windows (WSL or Docker):**
```bash
# Docker
docker run -d -p 6379:6379 --name redis redis:alpine

# Or download from: https://github.com/microsoftarchive/redis/releases
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### 2. Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

### 3. Start the Worker

Open a **second terminal** and run:

```bash
npm run worker
```

You should see:
```
🚀 Starting Pixelift Image Processing Worker...
✅ Worker started successfully!
💡 Processing jobs from queue...
```

### 4. Start Next.js App

In your first terminal:

```bash
npm run dev
```

### 5. Test the API

1. Go to http://localhost:3000/dashboard/api
2. Create a new API key
3. Copy the key (shown only once!)
4. Test with curl:

```bash
curl -X POST http://localhost:3000/api/v1/upscale \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    "scale": 2,
    "enhance_face": false
  }'
```

## Production Deployment

### Option 1: DigitalOcean App Platform (Recommended)

**1. Setup Redis:**
- Use **Upstash Redis** (free tier available)
- Sign up at https://upstash.com
- Create database, copy `REDIS_URL`

**2. Deploy Next.js App:**

Create `app.yaml`:
```yaml
name: pixelift-api
services:
  # Main Next.js app
  - name: web
    github:
      repo: your-username/pixelift
      branch: main
    source_dir: /
    build_command: npm run build
    run_command: npm start
    environment_slug: node-js
    envs:
      - key: REDIS_URL
        value: ${redis.REDIS_URL}
      - key: REPLICATE_API_TOKEN
        value: ${_REPLICATE_TOKEN}
      - key: NEXTAUTH_SECRET
        value: ${_NEXTAUTH_SECRET}
    http_port: 3000

  # Background worker
  - name: worker
    github:
      repo: your-username/pixelift
      branch: main
    source_dir: /
    build_command: npm install && npm run build
    run_command: npm run worker:prod
    environment_slug: node-js
    envs:
      - key: REDIS_URL
        value: ${redis.REDIS_URL}
      - key: REPLICATE_API_TOKEN
        value: ${_REPLICATE_TOKEN}
```

**3. Deploy:**
```bash
doctl apps create --spec app.yaml
```

### Option 2: Vercel + Separate Worker

**1. Deploy Next.js to Vercel:**
```bash
vercel deploy
```

Add environment variables in Vercel dashboard.

**2. Deploy Worker Separately:**

**Option A: Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Option B: Render**
- Create account at render.com
- New Web Service → Background Worker
- Build command: `npm install`
- Start command: `npm run worker:prod`
- Add environment variables

### Redis Options for Production

| Provider | Free Tier | Price | Recommended For |
|----------|-----------|-------|-----------------|
| **Upstash** | 10,000 commands/day | $0.20/100k | ✅ Best choice |
| Redis Cloud | 30MB storage | $5/mo | Medium traffic |
| AWS ElastiCache | No free tier | ~$15/mo | Enterprise |
| DigitalOcean | No free tier | $15/mo | Self-hosted |

**Recommended:** Upstash (easiest setup, generous free tier)

## Environment Variables Checklist

Copy to production:

```bash
# Required
REDIS_URL=redis://...
REPLICATE_API_TOKEN=r8_...
NEXTAUTH_SECRET=... # generate with: openssl rand -base64 32
NEXTAUTH_URL=https://yourdomain.com

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Optional
WEBHOOK_SECRET=... # for webhook signature verification
```

## Monitoring & Troubleshooting

### Check Worker is Running

**Logs should show:**
```
✅ Worker started successfully!
🔄 Processing job job_123456
✅ Job job_123456 completed in 18.5s
```

### Common Issues

**1. "Redis connection refused"**
```bash
# Check Redis is running
redis-cli ping

# Check REDIS_URL is correct
echo $REDIS_URL
```

**2. "Jobs stuck in pending"**
- Ensure worker is running
- Check worker logs for errors
- Verify Replicate API token is valid

**3. "Rate limit errors in production"**
- Check Redis connection
- Verify rate limit keys: `redis-cli KEYS ratelimit:*`

### Monitor Queue

Install BullMQ Board (optional):
```bash
npm install -g @bull-board/cli
bull-board $REDIS_URL
```

Open http://localhost:3000/admin to see queue status.

## Scaling

### Horizontal Scaling

Run **multiple workers** for higher throughput:

```bash
# Terminal 1
npm run worker

# Terminal 2
npm run worker

# Terminal 3
npm run worker
```

BullMQ automatically distributes jobs across workers.

### Vertical Scaling

Increase worker concurrency in [lib/queue.ts:268](lib/queue.ts#L268):

```typescript
concurrency: 10, // Process 10 jobs simultaneously (default: 5)
```

## Cost Estimation

**For 10,000 API requests/month:**

| Service | Cost |
|---------|------|
| DigitalOcean App (Web) | $5/mo |
| DigitalOcean App (Worker) | $5/mo |
| Upstash Redis | Free |
| Replicate API | ~$50/mo |
| **Total** | **~$60/mo** |

**Revenue potential:**
- 10 Professional customers @ $299/mo = $2,990/mo
- **Profit: ~$2,930/mo**

## Support

- Issues: GitHub repository
- Email: sales@pixelift.pl
- Docs: `/api/v1/docs`

## Security Checklist

- [ ] Use strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set `WEBHOOK_SECRET` for signature verification
- [ ] Use environment-specific API keys (test vs live)
- [ ] Enable rate limiting (already configured)
- [ ] Monitor failed jobs and errors
- [ ] Backup Firebase data regularly

## Next Steps

1. ✅ Deploy to production
2. 📊 Set up analytics (track API usage)
3. 💳 Integrate Stripe for billing
4. 📧 Add email notifications for limits
5. 🎨 Create customer dashboard
6. 📱 Build mobile SDKs

---

**Ready to deploy? Start with Upstash Redis + DigitalOcean App Platform for easiest setup.**
