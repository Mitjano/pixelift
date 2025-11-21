#!/bin/bash

#############################################
# Pixelift - Automated Deployment Script
# For DigitalOcean VPS (Droplet)
#############################################

set -e  # Exit on any error

echo "🚀 Starting Pixelift deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root: sudo bash deploy-digitalocean-vps.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Running as root${NC}"

#############################################
# 1. Update system
#############################################
echo ""
echo -e "${YELLOW}📦 Updating system...${NC}"
apt-get update -y
apt-get upgrade -y

#############################################
# 2. Install Node.js 20.x
#############################################
echo ""
echo -e "${YELLOW}📦 Installing Node.js 20.x...${NC}"

# Remove old Node.js if exists
apt-get remove -y nodejs npm 2>/dev/null || true

# Install Node.js 20.x from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version

echo -e "${GREEN}✅ Node.js installed${NC}"

#############################################
# 3. Install Redis
#############################################
echo ""
echo -e "${YELLOW}📦 Installing Redis...${NC}"

apt-get install -y redis-server

# Configure Redis to start on boot
systemctl enable redis-server
systemctl start redis-server

# Test Redis
redis-cli ping

echo -e "${GREEN}✅ Redis installed and running${NC}"

#############################################
# 4. Install PM2 (Process Manager)
#############################################
echo ""
echo -e "${YELLOW}📦 Installing PM2...${NC}"

npm install -g pm2

echo -e "${GREEN}✅ PM2 installed${NC}"

#############################################
# 5. Install Nginx
#############################################
echo ""
echo -e "${YELLOW}📦 Installing Nginx...${NC}"

apt-get install -y nginx

systemctl enable nginx
systemctl start nginx

echo -e "${GREEN}✅ Nginx installed${NC}"

#############################################
# 6. Clone repository
#############################################
echo ""
echo -e "${YELLOW}📦 Cloning repository...${NC}"

# Create app directory
mkdir -p /var/www
cd /var/www

# Remove old installation if exists
rm -rf upsizer

# Clone repo
git clone https://github.com/Mitjano/upsizer.git
cd upsizer

echo -e "${GREEN}✅ Repository cloned${NC}"

#############################################
# 7. Setup environment variables
#############################################
echo ""
echo -e "${YELLOW}⚙️  Setting up environment variables...${NC}"

cat > .env.local << 'EOF'
# Node Environment
NODE_ENV=production

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pixelift-ed3df.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pixelift-ed3df
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pixelift-ed3df.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=pixelift-ed3df
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbavc@pixelift-ed3df.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="YOUR_PRIVATE_KEY"

# NextAuth
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET
NEXTAUTH_URL=http://138.68.79.23:3000

# Replicate API
REPLICATE_API_TOKEN=YOUR_REPLICATE_TOKEN

# Redis (local)
REDIS_URL=redis://localhost:6379

# Webhook (optional)
WEBHOOK_SECRET=your_webhook_secret_123
EOF

echo -e "${YELLOW}⚠️  IMPORTANT: Edit /var/www/upsizer/.env.local and fill in your values!${NC}"
echo -e "${YELLOW}   Run: nano /var/www/upsizer/.env.local${NC}"
echo ""
read -p "Press ENTER after you've edited .env.local file..."

#############################################
# 8. Install dependencies
#############################################
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"

npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"

#############################################
# 9. Build application
#############################################
echo ""
echo -e "${YELLOW}🔨 Building application...${NC}"

npm run build

echo -e "${GREEN}✅ Application built${NC}"

#############################################
# 10. Setup PM2 ecosystem
#############################################
echo ""
echo -e "${YELLOW}⚙️  Setting up PM2...${NC}"

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'pixelift-web',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/upsizer',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'pixelift-worker',
      script: 'npm',
      args: 'run worker:prod',
      cwd: '/var/www/upsizer',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

# Start applications with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}✅ PM2 configured and applications started${NC}"

#############################################
# 11. Configure Nginx
#############################################
echo ""
echo -e "${YELLOW}⚙️  Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/pixelift << 'EOF'
server {
    listen 80;
    server_name 138.68.79.23;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/pixelift /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx

echo -e "${GREEN}✅ Nginx configured${NC}"

#############################################
# 12. Setup firewall
#############################################
echo ""
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo -e "${GREEN}✅ Firewall configured${NC}"

#############################################
# Done!
#############################################
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📊 Application status:"
pm2 status
echo ""
echo -e "🌐 Your application is now running at:"
echo -e "${GREEN}   http://138.68.79.23${NC}"
echo ""
echo -e "📝 Useful commands:"
echo -e "   ${YELLOW}pm2 status${NC}         - Check application status"
echo -e "   ${YELLOW}pm2 logs${NC}           - View logs"
echo -e "   ${YELLOW}pm2 restart all${NC}    - Restart applications"
echo -e "   ${YELLOW}pm2 stop all${NC}       - Stop applications"
echo -e "   ${YELLOW}systemctl status nginx${NC} - Check Nginx status"
echo ""
echo -e "⚠️  NEXT STEPS:"
echo -e "1. Update .env.local with your real values: ${YELLOW}nano /var/www/upsizer/.env.local${NC}"
echo -e "2. Restart applications: ${YELLOW}pm2 restart all${NC}"
echo -e "3. Open http://138.68.79.23 in your browser"
echo ""
