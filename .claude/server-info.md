# DigitalOcean Server Info - PIXELIFT PRODUCTION

## Server Details
- **Provider**: DigitalOcean
- **Droplet Name**: pixelift-production
- **IPv4**: 138.68.79.23
- **Private IP**: 10.114.0.2
- **Region**: FRA1 (Frankfurt)
- **Specs**: 4 GB RAM / 25 GB Disk
- **OS**: Ubuntu 22.04 (LTS) x64

## SSH Access
```bash
ssh root@138.68.79.23
```
**Password**: fiG@jHc7@VzC6RyZ^VfW

## Quick Deploy (from local machine)
```bash
# Rsync files to server (excludes node_modules, .next, .git, uploads, .env.local)
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'uploads' \
  --exclude '.env.local' \
  --exclude 'prisma/*.db' \
  -e "sshpass -p 'fiG@jHc7@VzC6RyZ^VfW' ssh -o StrictHostKeyChecking=accept-new" \
  /Users/mch/Documents/pixelift/ root@138.68.79.23:/var/www/pixelift/

# Then build and restart on server
sshpass -p 'fiG@jHc7@VzC6RyZ^VfW' ssh root@138.68.79.23 "cd /var/www/pixelift && npm ci --legacy-peer-deps && NODE_OPTIONS='--max-old-space-size=3072' npm run build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && pm2 restart pixelift-web"
```

## Manual Deployment Commands (on server)
```bash
# Connect to server
ssh root@138.68.79.23

# Go to project directory
cd /var/www/pixelift

# Install dependencies
npm ci --legacy-peer-deps

# Build with memory limit (4GB server)
NODE_OPTIONS='--max-old-space-size=3072' npm run build

# Copy static files (standalone mode)
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# Restart PM2
pm2 restart pixelift-web

# Check logs
pm2 logs pixelift-web --lines 30
```

## PM2 Process
- **Name**: pixelift-web
- Uses dotenv-cli for environment variables

## Important Notes
- ALWAYS deploy changes to server after local commits
- Server does NOT have git - use rsync to sync files
- Next.js runs in standalone mode (requires manual static file copy)
- Domain: pixelift.pl
