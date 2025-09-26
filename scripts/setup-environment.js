#!/usr/bin/env node
// ==============================================
// Environment Setup Script
// ==============================================

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function createEnvFile(templatePath, outputPath, replacements = {}) {
  try {
    if (fs.existsSync(outputPath)) {
      log(colors.yellow, `⚠️  ${outputPath} already exists, skipping...`);
      return false;
    }
    
    if (!fs.existsSync(templatePath)) {
      log(colors.red, `❌ Template file not found: ${templatePath}`);
      return false;
    }
    
    let content = fs.readFileSync(templatePath, 'utf8');
    
    // Apply replacements
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, replacements[key]);
    });
    
    fs.writeFileSync(outputPath, content);
    log(colors.green, `✅ Created: ${outputPath}`);
    return true;
  } catch (error) {
    log(colors.red, `❌ Error creating ${outputPath}: ${error.message}`);
    return false;
  }
}

function generateSecureKeys() {
  const crypto = require('crypto');
  return {
    JWT_SECRET: crypto.randomBytes(64).toString('hex'),
    SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
    UPLOAD_SECRET: crypto.randomBytes(32).toString('hex')
  };
}

function main() {
  log(colors.cyan, '\n🚀 EthioHeritage360 Environment Setup');
  log(colors.cyan, '=====================================\n');
  
  const projectRoot = path.resolve(__dirname, '..');
  const serverDir = path.join(projectRoot, 'server');
  const clientDir = path.join(projectRoot, 'client');
  
  // Generate secure keys
  const secureKeys = generateSecureKeys();
  
  log(colors.blue, '📋 Setting up environment files...\n');
  
  // Server environment
  const serverEnvTemplate = path.join(serverDir, '.env.example');
  const serverEnvOutput = path.join(serverDir, '.env');
  
  const serverReplacements = {
    JWT_SECRET: secureKeys.JWT_SECRET,
    SESSION_SECRET: secureKeys.SESSION_SECRET,
    UPLOAD_SECRET: secureKeys.UPLOAD_SECRET
  };
  
  createEnvFile(serverEnvTemplate, serverEnvOutput, serverReplacements);
  
  // Client environment
  const clientEnvOutput = path.join(clientDir, '.env');
  const clientEnvContent = `# ==============================================
# EthioHeritage360 Client Configuration
# ==============================================

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Environment
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_3D_VIEWER=true
REACT_APP_ENABLE_AR_FEATURES=false
REACT_APP_ENABLE_ANALYTICS=true

# External Services
REACT_APP_MAPBOX_TOKEN=your-mapbox-token-here
REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id-here

# Development Settings
GENERATE_SOURCEMAP=true
ESLINT_NO_DEV_ERRORS=false
`;

  if (!fs.existsSync(clientEnvOutput)) {
    fs.writeFileSync(clientEnvOutput, clientEnvContent);
    log(colors.green, `✅ Created: ${clientEnvOutput}`);
  } else {
    log(colors.yellow, `⚠️  ${clientEnvOutput} already exists, skipping...`);
  }
  
  // Create necessary directories
  log(colors.blue, '\n📁 Creating project directories...\n');
  
  const directories = [
    path.join(serverDir, 'logs'),
    path.join(serverDir, 'uploads'),
    path.join(serverDir, 'tmp'),
    path.join(clientDir, 'public', 'uploads')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(colors.green, `✅ Created directory: ${dir}`);
    } else {
      log(colors.yellow, `⚠️  Directory already exists: ${dir}`);
    }
  });
  
  // Create .gitignore entries if needed
  const gitignoreContent = `
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Uploads
uploads/
tmp/

# Dependencies
node_modules/

# Build outputs
dist/
build/
.vite/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
`;

  const gitignorePath = path.join(projectRoot, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent.trim());
    log(colors.green, `✅ Created: ${gitignorePath}`);
  }
  
  log(colors.green, '\n🎉 Environment setup completed successfully!\n');
  
  // Display next steps
  log(colors.cyan, '📋 Next Steps:');
  log(colors.blue, '1. Review and update the generated .env files');
  log(colors.blue, '2. Set your MongoDB connection string');
  log(colors.blue, '3. Add any required API keys (Mapbox, Google, etc.)');
  log(colors.blue, '4. Run: npm run db:setup');
  log(colors.blue, '5. Run: npm run dev');
  
  log(colors.yellow, '\n⚠️  Important Security Note:');
  log(colors.yellow, '- Never commit .env files to version control');
  log(colors.yellow, '- Change generated secrets for production');
  log(colors.yellow, '- Use strong passwords for admin accounts\n');
}

if (require.main === module) {
  main();
}

module.exports = { createEnvFile, generateSecureKeys };
