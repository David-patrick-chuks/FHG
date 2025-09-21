#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up development environment for MailQuill Backend...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the backend directory');
  process.exit(1);
}

console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('🔍 Checking Chrome installation...');

// Check for Chrome on different platforms
const platform = process.platform;
let chromeFound = false;
let chromePath = '';

if (platform === 'win32') {
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe')
  ];
  
  for (const chromeExe of chromePaths) {
    if (fs.existsSync(chromeExe)) {
      chromeFound = true;
      chromePath = chromeExe;
      break;
    }
  }
} else {
  // macOS/Linux
  try {
    const whichResult = execSync('which google-chrome-stable || which google-chrome || which chromium-browser || which chromium', { encoding: 'utf8' });
    chromePath = whichResult.trim();
    chromeFound = true;
  } catch (e) {
    // Chrome not found
  }
}

if (chromeFound) {
  console.log(`✅ Chrome found at: ${chromePath}`);
  console.log('🎉 Development environment is ready!');
  console.log('\n📝 To start development server:');
  console.log('   npm run dev:local');
} else {
  console.log('⚠️  Chrome not found. Puppeteer will use bundled Chromium.');
  console.log('   For better performance, install Google Chrome:');
  if (platform === 'win32') {
    console.log('   https://www.google.com/chrome/');
  } else if (platform === 'darwin') {
    console.log('   brew install --cask google-chrome');
  } else {
    console.log('   sudo apt-get install google-chrome-stable');
  }
  console.log('\n📝 To start development server:');
  console.log('   npm run dev');
}

console.log('\n🔧 Environment variables:');
console.log('   NODE_ENV=development');
console.log('   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false (for dev:local)');
console.log('\n✨ Happy coding!');
