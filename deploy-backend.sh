#!/bin/bash

# ==========================================
# PRODUCTION DEPLOYMENT SCRIPT FOR AWS EC2
# ==========================================

set -e  # Exit on error

echo "🚀 Starting deployment to production..."

# Configuration
EC2_USER="ubuntu"
EC2_HOST="api.prephire.co"
PROJECT_DIR="/home/ubuntu/ai-interview-platform/ai-interview-platform-backend"
PM2_APP_NAME="prephire-backend"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Step 1: Committing and pushing changes...${NC}"
git add .
git commit -m "feat: Enterprise-grade rate limit protection with API key health tracking" || echo "No changes to commit"
git push origin main

echo -e "${YELLOW}🔐 Step 2: Connecting to EC2 and deploying...${NC}"
ssh ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
  set -e
  
  echo "📂 Navigating to project directory..."
  cd /home/ubuntu/ai-interview-platform/ai-interview-platform-backend
  
  echo "⬇️  Pulling latest changes..."
  git pull origin main
  
  echo "📦 Installing dependencies..."
  npm install --production
  
  echo "🔄 Restarting PM2 application..."
  pm2 restart prephire-backend || pm2 start app.js --name prephire-backend
  
  echo "💾 Saving PM2 configuration..."
  pm2 save
  
  echo "✅ Deployment complete!"
  
  echo "📊 Application status:"
  pm2 status
  
  echo "📝 Recent logs:"
  pm2 logs prephire-backend --lines 20 --nostream
ENDSSH

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📊 Monitoring:${NC}"
echo "  - Logs: ssh ${EC2_USER}@${EC2_HOST} 'pm2 logs ${PM2_APP_NAME}'"
echo "  - Status: ssh ${EC2_USER}@${EC2_HOST} 'pm2 status'"
echo "  - Restart: ssh ${EC2_USER}@${EC2_HOST} 'pm2 restart ${PM2_APP_NAME}'"
