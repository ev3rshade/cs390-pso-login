#!/usr/bin/env node

/**
 * MongoDB Connection Test
 * Tests if your MongoDB connection string is configured correctly
 * Usage: node test-connection.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader() {
  console.log('\n' + '='.repeat(70));
  log('🔌 MongoDB Connection Test', 'blue');
  console.log('='.repeat(70) + '\n');
}

function printFooter(success) {
  console.log('='.repeat(70));
  if (success) {
    log('✅ SUCCESS! Your MongoDB connection is working!', 'green');
    log('\nYou\'re ready to start coding! Run: npm run starter', 'cyan');
  } else {
    log('❌ Connection failed. Fix the issues above and try again.', 'red');
  }
  console.log('='.repeat(70) + '\n');
}

async function testConnection() {
  printHeader();

  // Step 1: Check if .env file exists
  log('Step 1: Checking for .env file...', 'cyan');
  if (!existsSync('.env')) {
    log('❌ .env file not found!', 'red');
    log('\nWhat to do:', 'yellow');
    log('  1. Copy .env.example to .env', 'yellow');
    log('  2. Add your MongoDB connection string', 'yellow');
    log('  3. Run this test again', 'yellow');
    printFooter(false);
    process.exit(1);
  }
  log('✅ .env file found', 'green');

  // Step 2: Load environment variables
  log('\nStep 2: Loading environment variables...', 'cyan');
  dotenv.config();
  
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    log('❌ MONGO_URI not found in .env file!', 'red');
    log('\nYour .env file should contain:', 'yellow');
    log('MONGO_URI=mongodb://localhost:27017/secure-login', 'yellow');
    log('or', 'yellow');
    log('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/secure-login', 'yellow');
    printFooter(false);
    process.exit(1);
  }
  log('✅ MONGO_URI found', 'green');

  // Step 3: Validate connection string format
  log('\nStep 3: Validating connection string format...', 'cyan');
  
  // Hide password in display
  let displayUri = mongoUri;
  if (mongoUri.includes('@')) {
    // For Atlas URIs, hide the password
    displayUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  }
  log(`Connection string: ${displayUri}`, 'blue');

  // Basic validation
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    log('❌ Invalid connection string format!', 'red');
    log('\nMust start with:', 'yellow');
    log('  mongodb://       (local)', 'yellow');
    log('  mongodb+srv://   (Atlas)', 'yellow');
    printFooter(false);
    process.exit(1);
  }

  // Check if it's a placeholder/example
  if (mongoUri.includes('<password>') || 
      mongoUri.includes('<username>') || 
      mongoUri.includes('your-connection-string')) {
    log('❌ You need to replace the placeholder with your actual connection string!', 'red');
    log('\nFor MongoDB Atlas:', 'yellow');
    log('  1. Go to MongoDB Atlas dashboard', 'yellow');
    log('  2. Click "Connect" on your cluster', 'yellow');
    log('  3. Choose "Connect your application"', 'yellow');
    log('  4. Copy the connection string', 'yellow');
    log('  5. Replace <password> with your actual password', 'yellow');
    log('  6. Add /secure-login at the end', 'yellow');
    printFooter(false);
    process.exit(1);
  }

  log('✅ Format looks good', 'green');

  // Step 4: Attempt connection
  log('\nStep 4: Attempting to connect to MongoDB...', 'cyan');
  log('(This may take a few seconds...)', 'blue');

  try {
    // Set timeout for connection
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    };

    await mongoose.connect(mongoUri, connectionOptions);
    
    log('✅ Successfully connected to MongoDB!', 'green');
    
    // Get connection info
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    
    log(`\nConnection Details:`, 'cyan');
    log(`  Database name: ${dbName}`, 'blue');
    log(`  Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Unknown'}`, 'blue');

    // Try a simple operation
    log('\nStep 5: Testing database operations...', 'cyan');
    const collections = await db.listCollections().toArray();
    log(`✅ Can access database (${collections.length} collections found)`, 'green');

    // Close connection
    await mongoose.connection.close();
    log('\n✅ Connection closed successfully', 'green');
    
    printFooter(true);
    process.exit(0);

  } catch (error) {
    log('❌ Connection failed!', 'red');
    log('\nError details:', 'yellow');
    console.log(error.message);
    
    log('\nCommon Issues & Solutions:', 'yellow');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      log('\n🔍 DNS/Network Error:', 'yellow');
      log('  • Check your internet connection', 'yellow');
      log('  • Verify the MongoDB server hostname is correct', 'yellow');
      log('  • For Atlas: Make sure the cluster URL is correct', 'yellow');
    }
    
    if (error.message.includes('Authentication failed') || error.message.includes('auth')) {
      log('\n🔍 Authentication Error:', 'yellow');
      log('  • Check your username and password', 'yellow');
      log('  • Make sure you replaced <password> with actual password', 'yellow');
      log('  • For Atlas: Verify user exists in Database Access', 'yellow');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      log('\n🔍 Connection Refused:', 'yellow');
      log('  • Is MongoDB running locally?', 'yellow');
      log('  • Try: brew services start mongodb-community (macOS)', 'yellow');
      log('  • Or use MongoDB Atlas (cloud) instead', 'yellow');
    }
    
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      log('\n🔍 Connection Timeout:', 'yellow');
      log('  • Check your internet connection', 'yellow');
      log('  • For Atlas: Make sure IP is whitelisted', 'yellow');
      log('  • Go to Network Access → Add IP Address → Allow Access from Anywhere', 'yellow');
    }

    if (error.message.includes('IP') || error.message.includes('not allowed')) {
      log('\n🔍 IP Not Whitelisted:', 'yellow');
      log('  • Go to MongoDB Atlas → Network Access', 'yellow');
      log('  • Click "Add IP Address"', 'yellow');
      log('  • Choose "Allow Access from Anywhere" (for development)', 'yellow');
      log('  • Wait a minute for changes to apply', 'yellow');
    }

    log('\nNeed more help?', 'cyan');
    log('  • Check QUICKSTART.md for setup instructions', 'blue');
    log('  • Run: npm run check (to verify other setup)', 'blue');
    
    printFooter(false);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  log('\n❌ Unexpected error:', 'red');
  console.error(error);
  process.exit(1);
});

// Run the test
testConnection();

