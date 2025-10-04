#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables are set and valid
 */

// Load environment variables from .env file (if available)
try {
    require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
} catch (error) {
    console.log('ℹ️  dotenv not available or .env file not found, using system environment variables');
}

const fs = require('fs');
const path = require('path');

const REQUIRED_ENV_VARS = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET'
];

const OPTIONAL_ENV_VARS = [
    'OPENAI_API_KEY',
    'OPENAI_API_BASE',
    'JWT_EXPIRE',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS'
];

function validateEnvironment() {
    console.log('🔍 Validating environment configuration...');
    
    const errors = [];
    const warnings = [];
    
    // Check required environment variables
    REQUIRED_ENV_VARS.forEach(varName => {
        if (!process.env[varName]) {
            errors.push(`❌ Missing required environment variable: ${varName}`);
        } else {
            console.log(`✅ ${varName}: Set`);
        }
    });
    
    // Check optional environment variables
    OPTIONAL_ENV_VARS.forEach(varName => {
        if (!process.env[varName]) {
            warnings.push(`⚠️  Optional environment variable not set: ${varName}`);
        } else {
            console.log(`✅ ${varName}: Set`);
        }
    });
    
    // Validate specific environment variables
    if (process.env.PORT) {
        const port = parseInt(process.env.PORT);
        if (isNaN(port) || port < 1 || port > 65535) {
            errors.push(`❌ Invalid PORT value: ${process.env.PORT} (must be a number between 1-65535)`);
        }
    }
    
    if (process.env.NODE_ENV) {
        const validEnvs = ['development', 'production', 'test'];
        if (!validEnvs.includes(process.env.NODE_ENV)) {
            warnings.push(`⚠️  NODE_ENV should be one of: ${validEnvs.join(', ')}`);
        }
    }
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
        warnings.push(`⚠️  .env file not found at ${envPath}`);
    }
    
    // Print warnings
    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    // Print errors and exit if any
    if (errors.length > 0) {
        console.log('\n❌ Environment validation failed:');
        errors.forEach(error => console.log(`   ${error}`));
        console.log('\nPlease fix the above issues before starting the server.');
        process.exit(1);
    }
    
    console.log('\n✅ Environment validation passed!');
    return true;
}

// Run validation if called directly
if (require.main === module) {
    validateEnvironment();
}

module.exports = validateEnvironment;
