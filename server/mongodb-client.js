#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const readline = require('readline');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://melkamuwako5_db_user:YFweyhElTJBj5sXp@cluster0.x3jfm8p.mongodb.net/ethioheritage360?retryWrites=true&w=majority&appName=Cluster0';

// Create readline interface for interactive commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let client;
let db;
let connected = false;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorLog(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function displayHeader() {
  console.clear();
  colorLog('🌐 EthioHeritage360 - MongoDB Atlas Client', colors.cyan);
  colorLog('==========================================', colors.cyan);
  colorLog(`📅 ${new Date().toLocaleString()}`, colors.yellow);
  colorLog(`🔗 Database: ethioheritage360`, colors.green);
  colorLog(`📊 Status: ${connected ? '✅ Connected' : '❌ Disconnected'}`, connected ? colors.green : colors.red);
  console.log('');
}

async function connectToMongoDB() {
  try {
    colorLog('🚀 Connecting to MongoDB Atlas...', colors.yellow);
    
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      maxPoolSize: 5
    });
    
    await client.connect();
    db = client.db('ethioheritage360');
    connected = true;
    
    colorLog('✅ Successfully connected to MongoDB Atlas!', colors.green);
    
    // Get basic database info
    const stats = await db.stats();
    const collections = await db.listCollections().toArray();
    
    colorLog(`📁 Collections: ${collections.length}`, colors.cyan);
    colorLog(`💾 Database Size: ${(stats.dataSize / (1024*1024)).toFixed(2)} MB`, colors.cyan);
    colorLog(`📈 Documents: ${stats.objects}`, colors.cyan);
    console.log('');
    
    return true;
  } catch (error) {
    colorLog('❌ Failed to connect to MongoDB Atlas', colors.red);
    colorLog(`Error: ${error.message}`, colors.red);
    
    if (error.message.includes('ETIMEOUT')) {
      colorLog('', colors.white);
      colorLog('🔧 Network Timeout - This is likely due to:', colors.yellow);
      colorLog('  • Firewall blocking MongoDB ports', colors.white);
      colorLog('  • Corporate network restrictions', colors.white);
      colorLog('  • Local proxy settings', colors.white);
      colorLog('', colors.white);
      colorLog('💡 Alternative: Use Google Cloud Shell', colors.cyan);
      colorLog('  → https://console.cloud.google.com', colors.cyan);
    }
    
    connected = false;
    return false;
  }
}

async function executeCommand(command) {
  if (!connected) {
    colorLog('❌ Not connected to database. Use "connect" first.', colors.red);
    return;
  }

  const cmd = command.trim().toLowerCase();
  
  try {
    switch (cmd) {
      case 'show collections':
      case 'collections':
        const collections = await db.listCollections().toArray();
        colorLog(`📁 Collections (${collections.length}):`, colors.cyan);
        collections.forEach((col, index) => {
          console.log(`  ${index + 1}. ${col.name}`);
        });
        break;
        
      case 'stats':
      case 'db.stats()':
        const stats = await db.stats();
        colorLog('📊 Database Statistics:', colors.cyan);
        console.log(`  • Database: ${stats.db}`);
        console.log(`  • Collections: ${stats.collections}`);
        console.log(`  • Documents: ${stats.objects}`);
        console.log(`  • Data Size: ${(stats.dataSize / (1024*1024)).toFixed(2)} MB`);
        console.log(`  • Storage Size: ${(stats.storageSize / (1024*1024)).toFixed(2)} MB`);
        console.log(`  • Indexes: ${stats.indexes}`);
        break;
        
      case 'users':
      case 'db.users.count()':
        const userCount = await db.collection('users').countDocuments();
        colorLog(`👥 Total Users: ${userCount}`, colors.green);
        break;
        
      case 'user sample':
      case 'db.users.findone()':
        const sampleUser = await db.collection('users').findOne({}, { 
          projection: { password: 0, refreshToken: 0 } 
        });
        if (sampleUser) {
          colorLog('👤 Sample User:', colors.cyan);
          console.log(JSON.stringify(sampleUser, null, 2));
        } else {
          colorLog('No users found', colors.yellow);
        }
        break;
        
      case 'museums':
        const museumCount = await db.collection('museums').countDocuments();
        colorLog(`🏛️ Total Museums: ${museumCount}`, colors.green);
        break;
        
      case 'artifacts':
        const artifactCount = await db.collection('artifacts').countDocuments();
        colorLog(`🏺 Total Artifacts: ${artifactCount}`, colors.green);
        break;
        
      case 'collection counts':
      case 'counts':
        colorLog('📊 Document counts by collection:', colors.cyan);
        const allCollections = await db.listCollections().toArray();
        for (const col of allCollections.slice(0, 10)) { // Show first 10
          const count = await db.collection(col.name).countDocuments();
          console.log(`  • ${col.name}: ${count}`);
        }
        if (allCollections.length > 10) {
          console.log(`  ... and ${allCollections.length - 10} more collections`);
        }
        break;
        
      case 'ping':
        await db.admin().ping();
        colorLog('🏓 Pong! Database is responsive.', colors.green);
        break;
        
      default:
        // Try to execute as raw MongoDB command
        if (cmd.startsWith('db.')) {
          colorLog(`❓ Custom command not supported in this client: ${command}`, colors.yellow);
          colorLog('💡 Try using MongoDB Compass or mongosh for advanced queries', colors.cyan);
        } else {
          showHelp();
        }
    }
  } catch (error) {
    colorLog(`❌ Error executing command: ${error.message}`, colors.red);
  }
}

function showHelp() {
  colorLog('📋 Available Commands:', colors.cyan);
  console.log('');
  colorLog('Connection:', colors.yellow);
  console.log('  connect           - Connect to MongoDB Atlas');
  console.log('  disconnect        - Disconnect from database');
  console.log('  ping              - Test database connection');
  console.log('');
  colorLog('Database Info:', colors.yellow);
  console.log('  stats             - Show database statistics');
  console.log('  collections       - List all collections');
  console.log('  counts            - Show document counts by collection');
  console.log('');
  colorLog('Data Queries:', colors.yellow);
  console.log('  users             - Count total users');
  console.log('  museums           - Count total museums');
  console.log('  artifacts         - Count total artifacts');
  console.log('  user sample       - Show a sample user document');
  console.log('');
  colorLog('Other:', colors.yellow);
  console.log('  help              - Show this help');
  console.log('  clear             - Clear screen');
  console.log('  exit              - Exit application');
  console.log('');
}

function startInteractiveMode() {
  displayHeader();
  
  if (!connected) {
    colorLog('💡 Type "connect" to connect to your MongoDB Atlas database', colors.yellow);
    colorLog('💡 Type "help" to see available commands', colors.cyan);
    console.log('');
  }
  
  rl.setPrompt(connected ? '🍃 mongo> ' : '⭕ disconnected> ');
  rl.prompt();
  
  rl.on('line', async (input) => {
    const command = input.trim();
    
    if (command === '') {
      rl.prompt();
      return;
    }
    
    switch (command.toLowerCase()) {
      case 'exit':
      case 'quit':
        colorLog('👋 Goodbye!', colors.cyan);
        if (client) {
          await client.close();
        }
        process.exit(0);
        break;
        
      case 'clear':
        displayHeader();
        break;
        
      case 'connect':
        await connectToMongoDB();
        displayHeader();
        rl.setPrompt(connected ? '🍃 mongo> ' : '⭕ disconnected> ');
        break;
        
      case 'disconnect':
        if (client) {
          await client.close();
          connected = false;
          colorLog('🔌 Disconnected from MongoDB Atlas', colors.yellow);
          rl.setPrompt('⭕ disconnected> ');
        }
        break;
        
      case 'help':
        showHelp();
        break;
        
      default:
        await executeCommand(command);
    }
    
    console.log('');
    rl.prompt();
  });
  
  rl.on('close', async () => {
    colorLog('\n👋 Goodbye!', colors.cyan);
    if (client) {
      await client.close();
    }
    process.exit(0);
  });
}

// Handle process termination
process.on('SIGINT', async () => {
  colorLog('\n🛑 Interrupted. Closing connection...', colors.yellow);
  if (client) {
    await client.close();
  }
  process.exit(0);
});

// Start the application
console.log('🚀 Starting MongoDB Atlas Client...');
startInteractiveMode();
