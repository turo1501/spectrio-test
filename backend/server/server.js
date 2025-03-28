const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const os = require('os');
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
function sendSystemInfo(ws) {
  try {
    // Get system information
    const systemInfo = {
      operatingSystem: `${os.type()} ${os.release()}`,
      hostName: os.hostname(),
      uptime: formatUptime(os.uptime()),
      cpu: {
        model: os.cpus()[0].model,
        cores: os.cpus().length,
        speed: Math.round(os.cpus()[0].speed / 100) / 10, // GHz
        loadAverage: os.loadavg()[0]
      },
      ram: {
        total: Math.round(os.totalmem() / (1024 * 1024)),
        free: Math.round(os.freemem() / (1024 * 1024)),
        used: Math.round((os.totalmem() - os.freemem()) / (1024 * 1024))
      },
      platform: os.platform(),
      arch: os.arch(),
      // Get network interfaces and extract IP and MAC addresses
      ...extractNetworkInfo(),
      // Mock display information
      monitors: 1,
      displayInfo: [
        {
          model: 'Generic Display',
          resolution: '1920x1080',
          connection: 'HDMI'
        }
      ],
      // Mock disk information
      disk: [
        {
          fs: 'C:',
          type: 'NTFS',
          size: 500,
          used: 250,
          available: 250,
          use: 50
        }
      ],
      // Add location for demo purposes
      location: 'Hanoi - Vietnam - Asia'
    };
    
    // Send data to client
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(systemInfo));
    }
  } catch (error) {
    console.error('Error getting system info:', error);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ error: 'Failed to get system information' }));
    }
  }
}

// Helper function to extract network information
function extractNetworkInfo() {
  const networkInterfaces = os.networkInterfaces();
  const networkInfo = { network: { interface: 'Unknown', rx_bytes: 0, tx_bytes: 0, rx_sec: 0, tx_sec: 0 } };
  let ipAddress = 'Unknown';
  let macAddress = 'Unknown';
  
  // Extract IP and MAC address from network interfaces
  for (const [ifname, iface] of Object.entries(networkInterfaces)) {
    for (const info of iface) {
      // Skip internal interfaces and IPv6
      if (!info.internal && info.family === 'IPv4') {
        ipAddress = info.address;
        macAddress = info.mac;
        networkInfo.network.interface = ifname;
        // Mock network traffic data
        networkInfo.network.rx_bytes = Math.round(Math.random() * 1000);
        networkInfo.network.tx_bytes = Math.round(Math.random() * 1000);
        networkInfo.network.rx_sec = Math.round(Math.random() * 100);
        networkInfo.network.tx_sec = Math.round(Math.random() * 100);
        break;
      }
    }
    if (ipAddress !== 'Unknown') break;
  }
  
  return { ipAddress, macAddress, ...networkInfo };
}

// Helper function to format uptime
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  let formattedUptime = '';
  if (days > 0) formattedUptime += `${days}d `;
  if (hours > 0 || days > 0) formattedUptime += `${hours}h `;
  formattedUptime += `${minutes}m`;
  
  return formattedUptime;
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

