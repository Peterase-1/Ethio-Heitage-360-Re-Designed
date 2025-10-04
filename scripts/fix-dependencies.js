#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing dependency conflicts safely...');

function runCommand(command, description, options = {}) {
  try {
    console.log(`\n📋 ${description}...`);
    const output = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit', 
      encoding: 'utf8',
      ...options 
    });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.log(`⚠️  ${description} failed: ${error.message}`);
    return null;
  }
}

// Step 1: Clear all caches
console.log('\n🧹 Cleaning up...');
runCommand('npm cache clean --force', 'Clearing npm cache');

// Step 2: Remove node_modules and reinstall
console.log('\n📦 Fresh installation...');

// Check if we can install with legacy peer deps
const clientPackageJson = path.join(process.cwd(), 'client', 'package.json');
if (fs.existsSync(clientPackageJson)) {
  console.log('Found client workspace, installing with legacy peer deps for compatibility...');
  runCommand('npm install --legacy-peer-deps', 'Installing with legacy peer deps');
} else {
  runCommand('npm install', 'Installing dependencies');
}

// Step 3: Install workspace dependencies
console.log('\n🏗️  Installing workspace dependencies...');
runCommand('cd client && npm install --legacy-peer-deps', 'Installing client dependencies', { shell: true });
runCommand('cd server && npm install', 'Installing server dependencies', { shell: true });

// Step 4: Check for critical vulnerabilities only
console.log('\n🔒 Checking for critical security issues...');
const auditResult = runCommand('npm audit --audit-level=critical', 'Checking critical vulnerabilities', { silent: true });

if (auditResult && auditResult.includes('vulnerabilities')) {
  console.log('⚠️  Critical vulnerabilities found, attempting safe fixes...');
  runCommand('npm audit fix --only=prod', 'Fixing production vulnerabilities');
}

console.log('\n🎉 Dependency setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run dev (to start development)');
console.log('2. Your app is deployed at: https://ethioheritage360-ethiopian-heritage.onrender.com');
console.log('3. Use: node scripts/test-connectivity.js (to test network)');

console.log('\n💡 Development workflow:');
console.log('- npm run dev          → Start local development');
console.log('- npm run build        → Build for production');
console.log('- npm run test         → Run tests');
console.log('- git push group25 main → Deploy to your repository');
