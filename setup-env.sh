#!/bin/bash

#############################################
# Interactive Environment Setup Script
#############################################

echo "🔐 Pixelift - Environment Variables Setup"
echo ""
echo "This script will help you configure all required environment variables."
echo ""

# Function to read input with default value
read_var() {
    local var_name=$1
    local prompt=$2
    local default=$3
    local secret=$4

    echo ""
    if [ -n "$default" ]; then
        echo -e "\033[1;33m${prompt}\033[0m"
        echo -e "Default: ${default}"
    else
        echo -e "\033[1;33m${prompt}\033[0m"
    fi

    if [ "$secret" = "true" ]; then
        read -s value
    else
        read value
    fi

    if [ -z "$value" ] && [ -n "$default" ]; then
        value=$default
    fi

    echo "$value"
}

echo "================================================"
echo "Firebase Client SDK Configuration"
echo "================================================"
echo "Get these values from:"
echo "Firebase Console → Project Settings → General → Your apps"
echo ""

FIREBASE_API_KEY=$(read_var "FIREBASE_API_KEY" "Enter NEXT_PUBLIC_FIREBASE_API_KEY:" "" false)
FIREBASE_AUTH_DOMAIN=$(read_var "FIREBASE_AUTH_DOMAIN" "Enter NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:" "pixelift-ed3df.firebaseapp.com" false)
FIREBASE_PROJECT_ID=$(read_var "FIREBASE_PROJECT_ID" "Enter NEXT_PUBLIC_FIREBASE_PROJECT_ID:" "pixelift-ed3df" false)
FIREBASE_STORAGE_BUCKET=$(read_var "FIREBASE_STORAGE_BUCKET" "Enter NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:" "pixelift-ed3df.firebasestorage.app" false)
FIREBASE_MESSAGING_SENDER_ID=$(read_var "FIREBASE_MESSAGING_SENDER_ID" "Enter NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:" "" false)
FIREBASE_APP_ID=$(read_var "FIREBASE_APP_ID" "Enter NEXT_PUBLIC_FIREBASE_APP_ID:" "" false)

echo ""
echo "================================================"
echo "Firebase Admin SDK Configuration"
echo "================================================"
echo "Get these values from:"
echo "Firebase Console → Project Settings → Service Accounts"
echo "Click 'Generate New Private Key' and download JSON"
echo ""

FIREBASE_ADMIN_PROJECT_ID=$(read_var "FIREBASE_ADMIN_PROJECT_ID" "Enter FIREBASE_ADMIN_PROJECT_ID:" "pixelift-ed3df" false)
FIREBASE_ADMIN_CLIENT_EMAIL=$(read_var "FIREBASE_ADMIN_CLIENT_EMAIL" "Enter FIREBASE_ADMIN_CLIENT_EMAIL:" "firebase-adminsdk-fbavc@pixelift-ed3df.iam.gserviceaccount.com" false)

echo ""
echo "Enter FIREBASE_ADMIN_PRIVATE_KEY:"
echo "(Paste the entire private key including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)"
echo "Then press Ctrl+D when done:"
FIREBASE_ADMIN_PRIVATE_KEY=$(cat)

echo ""
echo "================================================"
echo "NextAuth Configuration"
echo "================================================"

# Generate NEXTAUTH_SECRET if not provided
echo ""
echo "Generating NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Generated: ${NEXTAUTH_SECRET:0:20}..."

NEXTAUTH_URL=$(read_var "NEXTAUTH_URL" "Enter NEXTAUTH_URL:" "http://138.68.79.23" false)

echo ""
echo "================================================"
echo "Replicate API Configuration"
echo "================================================"
echo "Get your API token from: https://replicate.com/account/api-tokens"
echo ""

REPLICATE_API_TOKEN=$(read_var "REPLICATE_API_TOKEN" "Enter REPLICATE_API_TOKEN:" "" true)

echo ""
echo "================================================"
echo "Redis Configuration"
echo "================================================"

REDIS_URL=$(read_var "REDIS_URL" "Enter REDIS_URL:" "redis://localhost:6379" false)

echo ""
echo "================================================"
echo "Optional: Webhook Secret"
echo "================================================"

WEBHOOK_SECRET=$(read_var "WEBHOOK_SECRET" "Enter WEBHOOK_SECRET (or press Enter to skip):" "pixelift_webhook_$(openssl rand -hex 8)" false)

#############################################
# Generate .env.local file
#############################################

echo ""
echo "================================================"
echo "Generating .env.local file..."
echo "================================================"

cat > .env.local << EOF
# Node Environment
NODE_ENV=production

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
NEXT_PUBLIC_FIREBASE_APP_ID=${FIREBASE_APP_ID}

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=${FIREBASE_ADMIN_PROJECT_ID}
FIREBASE_ADMIN_CLIENT_EMAIL=${FIREBASE_ADMIN_CLIENT_EMAIL}
FIREBASE_ADMIN_PRIVATE_KEY="${FIREBASE_ADMIN_PRIVATE_KEY}"

# NextAuth
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=${NEXTAUTH_URL}

# Replicate API
REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN}

# Redis
REDIS_URL=${REDIS_URL}

# Webhook (optional)
WEBHOOK_SECRET=${WEBHOOK_SECRET}
EOF

echo ""
echo "✅ .env.local file created successfully!"
echo ""
echo "📁 Location: $(pwd)/.env.local"
echo ""
echo "Next steps:"
echo "1. Review the file: cat .env.local"
echo "2. If everything looks good, restart the application: pm2 restart all"
echo ""
