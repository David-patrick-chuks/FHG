import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const app = express();
const port = 3000;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/test', (_req, res) => {
  res.json({ 
    message: 'Hello from simple server!',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple server running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
  console.log(`📍 Test endpoint: http://localhost:${port}/test`);
});
