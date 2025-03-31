const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const deviceRoutes = require('../router/deviceRoutes');
const systemService = require('../service/systemService');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('Device Management API is running');
});

// API routes
app.use('/api/device', deviceRoutes);

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send initial system information
  sendSystemInfo(ws);
  
  // Send updated system information every 3 seconds
  const intervalId = setInterval(() => {
    sendSystemInfo(ws);
  }, 3000);
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
    clearInterval(intervalId);
  });
  
  // Handle errors
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    clearInterval(intervalId);
  });
});

// Function to get and send system information
async function sendSystemInfo(ws) {
  try {
    // Get system information using the service
    const systemInfo = await systemService.getSystemInfo();
    
    // Send data to client if connection is open
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(systemInfo));
    }
  } catch (error) {
    console.error('Error getting system info:', error);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        error: 'Failed to get system information',
        message: error.message 
      }));
    }
  }
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Handle promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

