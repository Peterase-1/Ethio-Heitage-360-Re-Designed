#!/usr/bin/env node
// ==============================================
// System Health Check Script
// ==============================================

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  services: [
    {
      name: 'Backend API',
      url: process.env.BACKEND_URL || 'http://localhost:5000',
      healthPath: '/api/health',
      timeout: 5000
    },
    {
      name: 'Frontend',
      url: process.env.FRONTEND_URL || 'http://localhost:3000',
      healthPath: '/health',
      timeout: 5000
    },
    {
      name: 'MongoDB',
      url: process.env.MONGODB_UI_URL || 'http://localhost:8081',
      healthPath: '/',
      timeout: 3000
    }
  ]
};

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

function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: Date.now() - startTime
        });
      });
    });
    
    const startTime = Date.now();
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkService(service) {
  const url = `${service.url}${service.healthPath}`;
  
  try {
    log(colors.blue, `🔍 Checking ${service.name}...`);
    
    const response = await makeRequest(url, service.timeout);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      log(colors.green, `✅ ${service.name} is healthy (${response.responseTime}ms)`);
      return {
        name: service.name,
        status: 'healthy',
        responseTime: response.responseTime,
        statusCode: response.statusCode
      };
    } else {
      log(colors.yellow, `⚠️  ${service.name} returned status ${response.statusCode}`);
      return {
        name: service.name,
        status: 'warning',
        responseTime: response.responseTime,
        statusCode: response.statusCode
      };
    }
  } catch (error) {
    log(colors.red, `❌ ${service.name} is not accessible: ${error.message}`);
    return {
      name: service.name,
      status: 'unhealthy',
      error: error.message
    };
  }
}

function checkSystemRequirements() {
  log(colors.blue, '\n🔧 Checking system requirements...');
  
  const checks = [];
  
  try {
    const nodeVersion = process.version;
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    
    log(colors.green, `✅ Node.js: ${nodeVersion}`);
    log(colors.green, `✅ npm: ${npmVersion}`);
    
    checks.push({ name: 'Node.js', version: nodeVersion, status: 'ok' });
    checks.push({ name: 'npm', version: npmVersion, status: 'ok' });
  } catch (error) {
    log(colors.red, `❌ Error checking Node.js/npm: ${error.message}`);
    checks.push({ name: 'Node.js/npm', status: 'error', error: error.message });
  }
  
  try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
    log(colors.green, `✅ Docker: ${dockerVersion}`);
    checks.push({ name: 'Docker', version: dockerVersion, status: 'ok' });
  } catch (error) {
    log(colors.yellow, `⚠️  Docker not available: ${error.message}`);
    checks.push({ name: 'Docker', status: 'unavailable' });
  }
  
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    log(colors.green, `✅ Git: ${gitVersion}`);
    checks.push({ name: 'Git', version: gitVersion, status: 'ok' });
  } catch (error) {
    log(colors.yellow, `⚠️  Git not available: ${error.message}`);
    checks.push({ name: 'Git', status: 'unavailable' });
  }
  
  return checks;
}

function checkEnvironmentVariables() {
  log(colors.blue, '\n🌍 Checking environment variables...');
  
  const requiredVars = [
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET'
  ];
  
  const missing = [];
  const present = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
      log(colors.green, `✅ ${varName} is set`);
    } else {
      missing.push(varName);
      log(colors.red, `❌ ${varName} is missing`);
    }
  });
  
  return { present, missing };
}

function generateReport(serviceResults, systemChecks, envCheck) {
  const timestamp = new Date().toISOString();
  
  const report = {
    timestamp,
    summary: {
      healthy: serviceResults.filter(s => s.status === 'healthy').length,
      warning: serviceResults.filter(s => s.status === 'warning').length,
      unhealthy: serviceResults.filter(s => s.status === 'unhealthy').length,
      total: serviceResults.length
    },
    services: serviceResults,
    system: systemChecks,
    environment: envCheck
  };
  
  // Save report to file
  const fs = require('fs');
  const path = require('path');
  
  try {
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, `health-check-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    log(colors.blue, `📄 Report saved to: ${reportPath}`);
  } catch (error) {
    log(colors.yellow, `⚠️  Could not save report: ${error.message}`);
  }
  
  return report;
}

async function main() {
  log(colors.cyan, '\n🏥 EthioHeritage360 Health Check');
  log(colors.cyan, '==================================\n');
  
  // Check system requirements
  const systemChecks = checkSystemRequirements();
  
  // Check environment variables
  const envCheck = checkEnvironmentVariables();
  
  // Check services
  log(colors.blue, '\n🌐 Checking services...');
  const serviceResults = [];
  
  for (const service of CONFIG.services) {
    const result = await checkService(service);
    serviceResults.push(result);
  }
  
  // Generate report
  const report = generateReport(serviceResults, systemChecks, envCheck);
  
  // Summary
  log(colors.cyan, '\n📊 Health Check Summary');
  log(colors.cyan, '=======================');
  log(colors.green, `✅ Healthy services: ${report.summary.healthy}`);
  log(colors.yellow, `⚠️  Warning services: ${report.summary.warning}`);
  log(colors.red, `❌ Unhealthy services: ${report.summary.unhealthy}`);
  
  if (envCheck.missing.length > 0) {
    log(colors.red, `❌ Missing environment variables: ${envCheck.missing.join(', ')}`);
  }
  
  // Exit code
  const hasErrors = report.summary.unhealthy > 0 || envCheck.missing.length > 0;
  
  if (hasErrors) {
    log(colors.red, '\n💥 Health check failed - some issues detected');
    process.exit(1);
  } else {
    log(colors.green, '\n🎉 All systems healthy!');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(error => {
    log(colors.red, `💥 Health check crashed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { checkService, checkSystemRequirements };
