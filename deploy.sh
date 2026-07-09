#!/bin/bash

# ==========================================
# Zippy Deployment Script
# ==========================================

SERVER="root@82.29.164.22"
API_SRC="./ZipppybackendNEw"
ADMIN_SRC="./zippiAdmin"
STABLE_SRC="./zippyStable"
API_DEST="/var/www/zippy/api"
ADMIN_DEST="/var/www/zippy/admin"
STABLE_DEST="/var/www/zippy/stable"

echo "====================================="
echo "🚀 Starting Zippy Deployment..."
echo "====================================="

# 1. Build Admin Panel
echo ""
echo "=> 📦 Building Admin Panel..."
cd $ADMIN_SRC
npm run build
cd ..

# 2. Build Stable App
echo ""
echo "=> 📦 Building Stable App..."
cd $STABLE_SRC
npm run build
cd ..

# 3. Upload Admin Panel
echo ""
echo "=> 🚀 Uploading Admin Panel to server..."
scp -r $ADMIN_SRC/dist/* $SERVER:$ADMIN_DEST/

# 4. Upload Stable App
echo ""
echo "=> 🚀 Uploading Stable App to server..."
scp -r $STABLE_SRC/dist/* $SERVER:$STABLE_DEST/

# 5. Upload Backend API
echo ""
echo "=> 🚀 Uploading Backend API (ignoring node_modules)..."
# Using rsync ensures we only upload changed files and skip heavy folders like node_modules
rsync -avz --exclude 'node_modules' --exclude '.env' --exclude '.git' --exclude 'scratch' $API_SRC/ $SERVER:$API_DEST/

# 6. Restart Server PM2
echo ""
echo "=> 🔄 Restarting Backend server on PM2..."
ssh $SERVER "cd $API_DEST && npm install --production && pm2 restart 0"

echo ""
echo "====================================="
echo "✅ Deployment Successful!"
echo "====================================="
