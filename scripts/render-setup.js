#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 EthioHeritage360 Render Deployment Setup');
console.log('============================================\n');

// Generate secure secrets
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

const jwtSecret = generateSecret();
const jwtRefreshSecret = generateSecret();

console.log('✅ Generated secure JWT secrets for Render');

// Create environment variables for Render
const renderEnvVars = `
# Copy these environment variables to your Render service settings:
# Render Dashboard → Your Service → Environment

# 🔐 Security (REQUIRED)
NODE_ENV=production
PORT=10000
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
BCRYPT_SALT_ROUNDS=12

# 🗄️ Database (REQUIRED) - Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ethioheritage360?retryWrites=true&w=majority
DB_NAME=ethioheritage360

# 🌐 CORS (Update with your Netlify URL)
ALLOWED_ORIGINS=https://your-netlify-app.netlify.app,https://your-domain.com

# 📧 Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=noreply@ethioheritage360.com
FROM_NAME=EthioHeritage360

# 🗺️ Map Services (Optional)
MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# ☁️ File Upload (Recommended - Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# 📊 Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# 🔍 Monitoring (Optional)
SENTRY_DSN=https://your-sentry-dsn
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# ⚡ Performance
CACHE_TTL=3600
MAX_FILE_SIZE=10485760
HEALTH_CHECK_ENABLED=true
MONITORING_ENABLED=true

# 🎯 Render-specific
RENDER=true
RENDER_EXTERNAL_URL=https://your-render-service.onrender.com
`;

// Write environment variables to file
fs.writeFileSync('.env.render-deploy', renderEnvVars);
console.log('✅ Created .env.render-deploy with generated secrets');

// Create Render deployment checklist
const renderChecklist = `
# 📋 Render Deployment Checklist for EthioHeritage360

## Pre-Deployment
- [ ] MongoDB Atlas cluster created and configured
- [ ] Render account created at render.com
- [ ] Git repository pushed to GitHub/GitLab
- [ ] All tests passing locally: \`cd server && npm test\`
- [ ] Build process working: \`cd server && npm run build\`

## Render Service Setup
- [ ] New Web Service created on Render
- [ ] Repository connected to Render
- [ ] Build settings configured:
  - Root Directory: server
  - Build Command: npm install && npm run build
  - Start Command: npm start
  - Runtime: Node

## Environment Variables (Copy from .env.render-deploy)
- [ ] NODE_ENV=production
- [ ] PORT=10000
- [ ] MONGODB_URI (from MongoDB Atlas)
- [ ] JWT_SECRET (generated)
- [ ] JWT_REFRESH_SECRET (generated)
- [ ] BCRYPT_SALT_ROUNDS=12
- [ ] DB_NAME=ethioheritage360
- [ ] ALLOWED_ORIGINS (your Netlify URL)
- [ ] Other optional variables as needed

## Database Configuration
- [ ] MongoDB Atlas IP whitelist configured (0.0.0.0/0 for Render)
- [ ] Database user has read/write permissions
- [ ] Connection string tested and working

## Testing and Verification
- [ ] Service deployed successfully on Render
- [ ] Health check endpoint working: https://your-service.onrender.com/api/health
- [ ] Database connection established (check logs)
- [ ] API endpoints responding correctly
- [ ] CORS working with frontend

## Frontend Integration
- [ ] Update Netlify environment variables:
  - VITE_API_BASE_URL=https://your-render-service.onrender.com/api
  - VITE_SOCKET_URL=https://your-render-service.onrender.com
- [ ] Test frontend-backend integration
- [ ] Authentication flow working end-to-end

## Optional Enhancements
- [ ] Custom domain configured
- [ ] SSL certificate active (automatic with Render)
- [ ] Monitoring and alerts configured
- [ ] Backup procedures documented
- [ ] Performance optimized

## Production Readiness
- [ ] All API endpoints tested
- [ ] File uploads working (if using Cloudinary)
- [ ] Email notifications working (if configured)
- [ ] Real-time features working (WebSocket/Socket.IO)
- [ ] Error handling and logging working
- [ ] Security headers configured

---

🎉 Your EthioHeritage360 backend will be live at: https://your-render-service.onrender.com

**Need help?**
- RENDER_DEPLOYMENT_GUIDE.md for detailed instructions
- DATABASE_SETUP.md for MongoDB Atlas configuration
- Render documentation: https://render.com/docs
`;

fs.writeFileSync('render-deployment-checklist.md', renderChecklist);
console.log('✅ Created render-deployment-checklist.md');

// Create quick setup script for dual deployment
const dualDeploymentInfo = `
# 🌟 Dual Deployment Architecture

Your EthioHeritage360 application now supports two deployment options:

## Option 1: Full Netlify (Recommended for simplicity)
- Frontend: Netlify (React app)
- Backend: Netlify Functions (Serverless)
- Database: MongoDB Atlas
- Files: Netlify Large Media or Cloudinary

## Option 2: Netlify + Render (Recommended for scalability)
- Frontend: Netlify (React app) 
- Backend: Render (Node.js server)
- Database: MongoDB Atlas
- Files: Cloudinary

## Configuration Files Created:
- netlify.toml - Netlify configuration
- render.yaml - Render service configuration
- .env.netlify - Netlify environment variables
- .env.render - Render environment variables
- netlify/functions/api.js - Serverless function handler
- server/Dockerfile.render - Docker configuration for Render

## Deployment Scripts Added:
- npm run build:netlify - Build for Netlify
- npm run deploy:netlify - Deploy to Netlify
- npm run build:render - Build for Render
- npm run setup:render - Setup Render deployment

Choose the deployment option that best fits your needs!
`;

fs.writeFileSync('DUAL_DEPLOYMENT_OPTIONS.md', dualDeploymentInfo);
console.log('✅ Created DUAL_DEPLOYMENT_OPTIONS.md');

// Display next steps
console.log('\n🎯 Next Steps for Render Deployment:');
console.log('=====================================');
console.log('1. Set up MongoDB Atlas (see DATABASE_SETUP.md)');
console.log('2. Create Render account at render.com');
console.log('3. Create new Web Service and connect your Git repository');
console.log('4. Copy environment variables from .env.render-deploy to Render');
console.log('5. Configure build settings and deploy');
console.log('6. Update frontend to use Render backend URL');
console.log('7. Follow render-deployment-checklist.md for complete setup');

console.log('\n📚 Documentation Created:');
console.log('- RENDER_DEPLOYMENT_GUIDE.md - Complete deployment guide');
console.log('- render-deployment-checklist.md - Step-by-step checklist');
console.log('- DUAL_DEPLOYMENT_OPTIONS.md - Comparison of deployment options');

console.log('\n🔐 IMPORTANT SECURITY NOTES:');
console.log('- Never commit .env.render-deploy to version control');
console.log('- Use the generated JWT secrets in production');
console.log('- Update ALLOWED_ORIGINS with your actual frontend URL');
console.log('- Configure MongoDB Atlas IP whitelist for Render (0.0.0.0/0)');

console.log('\n🚀 Render Benefits:');
console.log('- 750 hours/month free tier');
console.log('- Automatic HTTPS and custom domains');
console.log('- Built-in health checks and monitoring');
console.log('- Easy scaling options');
console.log('- Great for backend APIs with databases');

console.log('\n✨ Happy deploying to Render!');
