#!/bin/bash
set -e

echo "=== Pixelift Local Deployment Script ==="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "1. Committing local changes..."
git add -A
if git diff --staged --quiet; then
    echo "   No changes to commit"
else
    read -p "   Enter commit message: " commit_message
    git commit -m "$commit_message"
fi

echo "2. Pushing to GitHub..."
git push origin master

echo "3. Deploying to production server..."
sshpass -p '0PRIngless' ssh -o StrictHostKeyChecking=no root@138.68.79.23 "bash /root/upsizer/deploy.sh"

echo "=== Deployment Complete ==="
echo "Visit: https://pixelift.pl"
