#!/usr/bin/env node

/**
 * Setup Directories Script
 * Creates necessary directories for the application
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_DIRECTORIES = [
  'logs',
  'uploads',
  'uploads/images',
  'uploads/documents',
  'uploads/artifacts',
  'uploads/courses',
  'uploads/events',
  'uploads/events/images',
  'uploads/lessons',
  'uploads/museums',
  'uploads/staff',
  'tmp'
];

function setupDirectories() {
  console.log('📁 Setting up required directories...');

  const serverRoot = path.join(__dirname, '..');

  REQUIRED_DIRECTORIES.forEach(dir => {
    const fullPath = path.join(serverRoot, dir);

    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (error) {
        console.error(`❌ Failed to create directory ${dir}:`, error.message);
      }
    } else {
      console.log(`✅ Directory already exists: ${dir}`);
    }
  });

  // Create .gitkeep files in empty directories
  REQUIRED_DIRECTORIES.forEach(dir => {
    const fullPath = path.join(serverRoot, dir);
    const gitkeepPath = path.join(fullPath, '.gitkeep');

    if (fs.existsSync(fullPath) && !fs.existsSync(gitkeepPath)) {
      try {
        fs.writeFileSync(gitkeepPath, '');
        console.log(`✅ Created .gitkeep in: ${dir}`);
      } catch (error) {
        console.error(`⚠️  Failed to create .gitkeep in ${dir}:`, error.message);
      }
    }
  });

  console.log('✅ Directory setup completed!');
}

// Run setup if called directly
if (require.main === module) {
  setupDirectories();
}

module.exports = setupDirectories;