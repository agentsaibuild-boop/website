#!/bin/bash
# Deploy script for SuperHosting
# Usage: ./deploy.sh

set -e

echo "🔨 Building site..."
npm run build

echo ""
echo "📦 Creating deployment package..."
cd dist
zip -r -q ../deploy.zip .
cd ..

echo ""
echo "✅ Deploy package ready: deploy.zip"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Go to SuperHosting Control Panel → File Manager"
echo "2. Open /public_html/ folder"
echo "3. Upload deploy.zip"
echo "4. Right-click → Extract"
echo "5. Delete deploy.zip"
echo "6. Done! Visit https://aibuildagents.bg to verify"
echo ""
echo "🔗 SuperHosting: https://cPanel.superhosting.bg"
