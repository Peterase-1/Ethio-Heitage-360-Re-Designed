#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up development environment...');

// Function to run commands safely
function runCommand(command, description) {
  try {
    console.log(`\n📋 ${description}...`);
    const output = execSync(command, { stdio: 'pipe', encoding: 'utf8' });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.log(`⚠️  ${description} failed: ${error.message}`);
    return null;
  }
}

// Clear npm cache for fresh start
runCommand('npm cache clean --force', 'Clearing npm cache');

// Verify npm configuration
runCommand('npm config list', 'Checking npm configuration');

// Create necessary directories
const directories = [
  'logs',
  'temp',
  'cache',
  '.vscode'
];

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create VS Code settings for better development experience
const vscodeSettings = {
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/logs/*.log": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/logs": true
  },
  "npm.enableScriptExplorer": true,
  "typescript.preferences.includePackageJsonAutoImports": "on"
};

const vscodeSettingsPath = path.join(process.cwd(), '.vscode', 'settings.json');
if (!fs.existsSync(vscodeSettingsPath)) {
  fs.writeFileSync(vscodeSettingsPath, JSON.stringify(vscodeSettings, null, 2));
  console.log('✅ Created VS Code settings');
}

// Create .gitignore additions for development
const gitignoreAdditions = `
# Development files
logs/
temp/
cache/
*.log
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;

const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const currentGitignore = fs.readFileSync(gitignorePath, 'utf8');
  if (!currentGitignore.includes('# Development files')) {
    fs.appendFileSync(gitignorePath, gitignoreAdditions);
    console.log('✅ Updated .gitignore with development patterns');
  }
}

// Install dependencies with better error handling
console.log('\n📦 Installing dependencies...');
console.log('This may take a few minutes with improved caching...');

runCommand('npm install', 'Installing root dependencies');
runCommand('npm run install:all', 'Installing workspace dependencies');

console.log('\n🎉 Development environment setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run dev (to start development servers)');
console.log('2. Run: npm run test (to run tests)');
console.log('3. Run: npm run health:check (to verify setup)');
console.log('\n💡 Tips:');
console.log('- Use npm run dev for local development');
console.log('- Dependencies are now cached for faster installs');
console.log('- Network retries are configured for better connectivity');
