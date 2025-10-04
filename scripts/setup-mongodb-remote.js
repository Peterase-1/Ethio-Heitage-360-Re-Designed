#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🌐 MongoDB Atlas Remote Setup');
console.log('===============================\n');

// Your MongoDB Atlas configuration
const MONGODB_CONFIG = {
  username: 'melkamuwako5',
  password: 'rhkLGujTdrlrQkAu', 
  cluster: 'ethioheritage360.tuhmybp.mongodb.net',
  database: 'ethioheritage360',
  appName: 'ethioheritage360'
};

// Generate connection string
const mongoURI = `mongodb+srv://${MONGODB_CONFIG.username}:${MONGODB_CONFIG.password}@${MONGODB_CONFIG.cluster}/${MONGODB_CONFIG.database}?retryWrites=true&w=majority&appName=${MONGODB_CONFIG.appName}`;

console.log('📊 Database Configuration:');
console.log('- Username:', MONGODB_CONFIG.username);
console.log('- Password:', '*'.repeat(MONGODB_CONFIG.password.length));
console.log('- Cluster:', MONGODB_CONFIG.cluster);
console.log('- Database:', MONGODB_CONFIG.database);
console.log('- App Name:', MONGODB_CONFIG.appName);

// Generate secure secrets
const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const jwtSecret = generateSecret(32);
const jwtRefreshSecret = generateSecret(32);

console.log('\n🔐 Generated secure JWT secrets');

// Create environment file for server
const serverEnvContent = `# MongoDB Atlas Remote Configuration
# Generated on ${new Date().toISOString()}

# Database Connection
MONGODB_URI=${mongoURI}
DB_NAME=${MONGODB_CONFIG.database}
NODE_ENV=development

# Authentication
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=30d

# Security
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Health Check
HEALTH_CHECK_ENABLED=true
MONITORING_ENABLED=true

# Optional - Add these if you need them
# CLOUDINARY_CLOUD_NAME=your-cloudinary-name
# CLOUDINARY_API_KEY=your-cloudinary-key
# CLOUDINARY_API_SECRET=your-cloudinary-secret
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
`;

// Write to server/.env
const serverEnvPath = path.join(__dirname, '..', 'server', '.env');
fs.writeFileSync(serverEnvPath, serverEnvContent);
console.log('✅ Created server/.env with MongoDB Atlas configuration');

// Create Render environment variables
const renderEnvContent = `# Copy these environment variables to Render Dashboard
# Go to: https://dashboard.render.com → Your Service → Environment

# 🗄️ Database (REQUIRED)
MONGODB_URI=${mongoURI}
DB_NAME=${MONGODB_CONFIG.database}

# 🔐 Security (REQUIRED)
NODE_ENV=production
PORT=10000
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
BCRYPT_SALT_ROUNDS=12

# ⚡ Performance
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
CACHE_TTL=3600
HEALTH_CHECK_ENABLED=true
MONITORING_ENABLED=true

# 🌐 CORS (Update with your frontend URL)
ALLOWED_ORIGINS=https://your-netlify-app.netlify.app,https://your-domain.com

# 📧 Email (Optional - add if needed)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# ☁️ File Upload (Optional - Cloudinary recommended)
# CLOUDINARY_CLOUD_NAME=your-cloudinary-name
# CLOUDINARY_API_KEY=your-cloudinary-key  
# CLOUDINARY_API_SECRET=your-cloudinary-secret
`;

fs.writeFileSync('.env.render-remote', renderEnvContent);
console.log('✅ Created .env.render-remote for Render deployment');

// Create Netlify environment variables
const netlifyEnvContent = `# Copy these environment variables to Netlify Dashboard
# Go to: https://app.netlify.com → Site Settings → Environment Variables

# 🗄️ Database (REQUIRED for Netlify Functions)
MONGODB_URI=${mongoURI}
DB_NAME=${MONGODB_CONFIG.database}

# 🔐 Security (REQUIRED)
NODE_ENV=production
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
BCRYPT_SALT_ROUNDS=12

# ⚡ Performance
CACHE_TTL=3600
HEALTH_CHECK_ENABLED=true
`;

fs.writeFileSync('.env.netlify-remote', netlifyEnvContent);
console.log('✅ Created .env.netlify-remote for Netlify Functions');

// Create MongoDB test configuration
const testEnvContent = `MONGODB_URI=${mongoURI}
DB_NAME=${MONGODB_CONFIG.database}
NODE_ENV=test
`;

const serverTestEnvPath = path.join(__dirname, '..', 'server', '.env.test');
fs.writeFileSync(serverTestEnvPath, testEnvContent);
console.log('✅ Updated server/.env.test with MongoDB Atlas configuration');

// Create setup instructions
const setupInstructions = `
# 🎯 MongoDB Atlas Remote Setup Complete!

## ✅ Files Created:
1. server/.env - Local development environment
2. .env.render-remote - Render deployment variables
3. .env.netlify-remote - Netlify Functions variables  
4. server/.env.test - Updated test configuration

## 🚀 Next Steps:

### 1. Test MongoDB Connection Locally
\`\`\`bash
cd server
npm run test:mongodb
\`\`\`

### 2. Add Variables to Render Dashboard
1. Go to: https://dashboard.render.com
2. Select your service: ethioheritage360-api
3. Go to Environment tab
4. Copy variables from .env.render-remote

### 3. Add Variables to Netlify Dashboard (if using Netlify Functions)
1. Go to: https://app.netlify.com
2. Select your site
3. Go to Site Settings → Environment Variables
4. Copy variables from .env.netlify-remote

### 4. Deploy and Test
- Render: Manual deploy from dashboard
- Netlify: Push to Git triggers auto-deploy

## 🔗 Your MongoDB Connection String:
${mongoURI.replace(MONGODB_CONFIG.password, '*'.repeat(MONGODB_CONFIG.password.length))}

## 🛠️ Troubleshooting:
- Run: npm run test:mongodb
- Check: MONGODB_ATLAS_REMOTE_SETUP.md
- Verify: MongoDB Atlas Network Access (0.0.0.0/0)

Happy deploying! 🎉
`;

fs.writeFileSync('MONGODB_REMOTE_SETUP_COMPLETE.md', setupInstructions);
console.log('✅ Created setup completion guide');

console.log('\n🎉 MongoDB Atlas Remote Setup Complete!');
console.log('==========================================');
console.log('✅ Database connection configured');
console.log('✅ Environment files created');
console.log('✅ Secure JWT secrets generated');
console.log('✅ Ready for deployment to Render/Netlify');

console.log('\n🔧 Next Steps:');
console.log('1. Test connection: cd server && npm run test:mongodb');
console.log('2. Copy .env.render-remote to Render Dashboard');
console.log('3. Deploy your application');
console.log('4. Check MONGODB_REMOTE_SETUP_COMPLETE.md for details');

console.log('\n🔐 Security Notes:');
console.log('- .env files are in .gitignore (not committed)');
console.log('- Use generated JWT secrets in production');
console.log('- MongoDB Atlas requires Network Access: 0.0.0.0/0');

console.log('\n🌐 Your Database:');
console.log('- Cluster:', MONGODB_CONFIG.cluster);
console.log('- Database:', MONGODB_CONFIG.database);
console.log('- Username:', MONGODB_CONFIG.username);
console.log('- Remote access: ✅ Configured');

console.log('\n📚 Documentation:');
console.log('- MONGODB_ATLAS_REMOTE_SETUP.md - Complete guide');
console.log('- RENDER_TROUBLESHOOTING.md - Deployment issues');
console.log('- MONGODB_REMOTE_SETUP_COMPLETE.md - Next steps');

console.log('\n🚀 Ready to deploy! Your remote MongoDB Atlas database is configured.');
