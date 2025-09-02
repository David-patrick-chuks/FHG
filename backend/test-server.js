// Simple test to check basic imports
console.log('Testing basic imports...');

try {
  // Test basic Node.js functionality
  console.log('✓ Node.js is working');
  
  // Test if we can read environment variables
  require('dotenv').config();
  console.log('✓ dotenv loaded');
  
  // Test basic Express
  const express = require('express');
  console.log('✓ Express imported successfully');
  
  // Test if we can create a basic server
  const app = express();
  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });
  
  const server = app.listen(3001, () => {
    console.log('✓ Basic Express server started on port 3001');
    server.close(() => {
      console.log('✓ Test server closed successfully');
      console.log('\n🎉 Basic server functionality is working!');
      console.log('The issue is likely with database connections or environment variables.');
    });
  });
  
} catch (error) {
  console.error('❌ Error during basic test:', error.message);
  console.error('Stack trace:', error.stack);
}
