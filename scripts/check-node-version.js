#!/usr/bin/env node
// ==============================================
// Node.js Version Check Script
// ==============================================

const { execSync } = require('child_process');

// Minimum required Node.js version
const MIN_NODE_VERSION = '18.0.0';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function parseVersion(version) {
  return version.replace('v', '').split('.').map(num => parseInt(num, 10));
}

function compareVersions(current, required) {
  const currentParts = parseVersion(current);
  const requiredParts = parseVersion(required);
  
  for (let i = 0; i < 3; i++) {
    if (currentParts[i] > requiredParts[i]) return 1;
    if (currentParts[i] < requiredParts[i]) return -1;
  }
  return 0;
}

try {
  // Get current Node.js version
  const nodeVersion = process.version;
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  
  log(colors.blue, '\n🔍 Checking Node.js and npm versions...');
  log(colors.blue, `Current Node.js version: ${nodeVersion}`);
  log(colors.blue, `Current npm version: ${npmVersion}`);
  
  // Check Node.js version
  if (compareVersions(nodeVersion, MIN_NODE_VERSION) < 0) {
    log(colors.red, '\n❌ ERROR: Node.js version is too old!');
    log(colors.red, `Minimum required version: ${MIN_NODE_VERSION}`);
    log(colors.red, `Your current version: ${nodeVersion}`);
    log(colors.yellow, '\n📋 To fix this issue:');
    log(colors.yellow, '1. Visit https://nodejs.org/');
    log(colors.yellow, '2. Download and install the latest LTS version');
    log(colors.yellow, '3. Restart your terminal and try again');
    process.exit(1);
  }
  
  // Check npm version
  const npmVersionParts = parseVersion(npmVersion);
  if (npmVersionParts[0] < 8) {
    log(colors.yellow, '\n⚠️  WARNING: npm version is outdated');
    log(colors.yellow, `Current npm version: ${npmVersion}`);
    log(colors.yellow, 'Recommended: npm 8.x or later');
    log(colors.yellow, '\n📋 To update npm:');
    log(colors.yellow, 'npm install -g npm@latest');
  }
  
  log(colors.green, '\n✅ Node.js and npm versions are compatible!');
  log(colors.green, '🚀 Ready to install EthioHeritage360 dependencies...\n');
  
} catch (error) {
  log(colors.red, '\n❌ ERROR: Failed to check Node.js/npm versions');
  log(colors.red, error.message);
  log(colors.yellow, '\n📋 Please ensure Node.js and npm are installed:');
  log(colors.yellow, '1. Visit https://nodejs.org/');
  log(colors.yellow, '2. Download and install the latest LTS version');
  log(colors.yellow, '3. Restart your terminal and try again');
  process.exit(1);
}
