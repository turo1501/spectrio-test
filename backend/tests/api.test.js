const request = require('supertest');
const WebSocket = require('ws');
const http = require('http');
const { spawn } = require('child_process');

// Server URL
const baseUrl = 'http://localhost:3000';
const wsUrl = 'ws://localhost:3000';

describe('Device Management API Tests', () => {
  let serverProcess;

  // Start the server before tests
  beforeAll(async () => {
    // Start the server in a child process
    serverProcess = spawn('node', ['server/server.js'], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  // Stop the server after tests
  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  // Test REST API endpoints
  describe('REST API Endpoints', () => {
    // Test root endpoint
    test('GET / should return status 200', async () => {
      const response = await request(baseUrl).get('/');
      expect(response.status).toBe(200);
    });

    // Test device info endpoint
    test('GET /api/device should return device information', async () => {
      const response = await request(baseUrl).get('/api/device');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.monitors).toBeDefined();
      expect(response.body.ram).toBeDefined();
      expect(response.body.operatingSystem).toBeDefined();
    });

    // Test specific metric endpoint
    test('GET /api/device/metrics/ram should return RAM information', async () => {
      const response = await request(baseUrl).get('/api/device/metrics/ram');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.total).toBeDefined();
      expect(response.body.used).toBeDefined();
      expect(response.body.free).toBeDefined();
      expect(typeof response.body.usagePercentage).toBe('number');
    });
  });

  // Test WebSocket connection
  describe('WebSocket Connection', () => {
    test('Should connect to WebSocket server and receive data', (done) => {
      const ws = new WebSocket(wsUrl);
      
      ws.on('open', () => {
        console.log('WebSocket connection established in test');
      });

      ws.on('message', (data) => {
        try {
          const parsedData = JSON.parse(data.toString());
          expect(parsedData).toBeDefined();
          expect(parsedData.monitors).toBeDefined();
          expect(parsedData.ram).toBeDefined();
          expect(parsedData.operatingSystem).toBeDefined();
          ws.close();
          done();
        } catch (error) {
          done(error);
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    }, 10000); // Longer timeout for WebSocket connection
  });
}); 