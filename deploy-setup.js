#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 EthioHeritage360 Deployment Setup');
console.log('=====================================\n');

// Generate secure secrets
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

const jwtSecret = generateSecret();
const jwtRefreshSecret = generateSecret();

console.log('✅ Generated secure JWT secrets');

// Create environment variables for Netlify
const netlifyEnvVars = `
# Copy these environment variables to your Netlify site settings:
# Site Settings → Environment Variables

# 🔐 Security (REQUIRED)
NODE_ENV=production
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
BCRYPT_SALT_ROUNDS=12

# 🗄️ Database (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ethioheritage360?retryWrites=true&w=majority
DB_NAME=ethioheritage360

# 🌐 CORS (Update with your Netlify URL)
ALLOWED_ORIGINS=https://your-site-name.netlify.app

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
`;

// Write environment variables to file
fs.writeFileSync('.env.netlify', netlifyEnvVars);
console.log('✅ Created .env.netlify with generated secrets');

// Create deployment checklist
const checklist = `
# 📋 Deployment Checklist for EthioHeritage360

## Pre-Deployment
- [ ] Code committed and pushed to Git repository
- [ ] All tests passing locally
- [ ] Build process working: \`npm run build:netlify\`

## MongoDB Atlas Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created and configured
- [ ] Database user created with read/write permissions
- [ ] Network access configured (IP whitelist)
- [ ] Connection string obtained

## Netlify Setup
- [ ] Netlify account created
- [ ] Site connected to Git repository
- [ ] Build settings configured:
  - Base directory: (empty)
  - Build command: npm run build:netlify
  - Publish directory: client/dist
  - Functions directory: netlify/functions

## Environment Variables
Copy from .env.netlify file to Netlify Dashboard:
- [ ] NODE_ENV=production
- [ ] JWT_SECRET (generated)
- [ ] JWT_REFRESH_SECRET (generated)
- [ ] MONGODB_URI (from Atlas)
- [ ] DB_NAME=ethioheritage360
- [ ] ALLOWED_ORIGINS (your Netlify URL)
- [ ] Other optional variables as needed

## Testing
- [ ] Frontend loads at Netlify URL
- [ ] API health check: https://your-site.netlify.app/.netlify/functions/api/health
- [ ] Database connection working
- [ ] Authentication flow working
- [ ] File uploads working (if configured)

## Optional Enhancements
- [ ] Custom domain configured
- [ ] SSL certificate active (automatic with Netlify)
- [ ] Analytics enabled
- [ ] Error monitoring configured
- [ ] Performance optimization completed

## Post-Deployment
- [ ] Create initial admin user
- [ ] Test all major functionality
- [ ] Monitor logs and performance
- [ ] Set up backup procedures
- [ ] Document any custom configurations

---

🎉 Your EthioHeritage360 app will be live at: https://your-site-name.netlify.app

Need help? Check:
- DEPLOYMENT_GUIDE.md for detailed instructions
- DATABASE_SETUP.md for MongoDB Atlas configuration
- Netlify documentation: https://docs.netlify.com/
`;

fs.writeFileSync('deployment-checklist.md', checklist);
console.log('✅ Created deployment-checklist.md');

// Display next steps
console.log('\n🎯 Next Steps:');
console.log('==============');
console.log('1. Set up MongoDB Atlas (see DATABASE_SETUP.md)');
console.log('2. Copy environment variables from .env.netlify to Netlify');
console.log('3. Connect your Git repository to Netlify');
console.log('4. Deploy and test your application');
console.log('5. Follow deployment-checklist.md for complete setup');
console.log('\n📚 For detailed instructions, see DEPLOYMENT_GUIDE.md');

console.log('\n🔐 IMPORTANT SECURITY NOTES:');
console.log('- Never commit .env.netlify to version control');
console.log('- Use the generated JWT secrets in production');
console.log('- Update ALLOWED_ORIGINS with your actual domain');
console.log('- Regularly rotate your secrets');

console.log('\n✨ Happy deploying!');
