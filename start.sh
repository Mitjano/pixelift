#!/bin/bash
# Production start script for PM2
# This script loads environment variables from .env.local before starting the server

cd /var/www/pixelift
set -a
source .env.local
set +a
exec node .next/standalone/server.js
