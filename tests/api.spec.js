// @ts-check
const { test, expect } = require('@playwright/test');

const API_URL = 'http://localhost:3000/api';

test.describe('Device Management API Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('http://localhost:3000/');
    await expect(page.getByText('Device Management API is running')).toBeVisible();
    
    await context.route('**ipinfo.io**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ip: '103.149.12.123',
          city: 'Ho Chi Minh City',
          region: 'Ho Chi Minh',
          country: 'VN',
          loc: '10.8231,106.6297',
          org: 'AS131429 MOBIFONE Corporation',
          postal: '70000',
          timezone: 'Asia/Ho_Chi_Minh'
        })
      });
    });
  });

  test('GET /api/device/info should return device information', async ({ request }) => {
    const response = await request.get(`${API_URL}/device/info`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    
    const systemInfo = data.data;
    expect(systemInfo).toHaveProperty('timestamp');
    expect(systemInfo).toHaveProperty('monitors');
    expect(systemInfo).toHaveProperty('cpu');
    expect(systemInfo).toHaveProperty('ram');
    expect(systemInfo).toHaveProperty('operatingSystem');
    expect(systemInfo).toHaveProperty('ipAddress');
    
    expect(systemInfo).toHaveProperty('location');
    expect(systemInfo.location).toHaveProperty('city', 'Ho Chi Minh City');
    expect(systemInfo.location).toHaveProperty('region', 'Ho Chi Minh');
    expect(systemInfo.location).toHaveProperty('country', 'VN');
    expect(systemInfo.location).toHaveProperty('timezone', 'Asia/Ho_Chi_Minh');
    
    expect(systemInfo.cpu).toHaveProperty('model');
    expect(systemInfo.cpu).toHaveProperty('cores');
    expect(systemInfo.cpu).toHaveProperty('loadAverage');
    
    expect(systemInfo.ram).toHaveProperty('total');
    expect(systemInfo.ram).toHaveProperty('used');
    expect(systemInfo.ram).toHaveProperty('free');
    expect(systemInfo.ram).toHaveProperty('usagePercentage');
    
    expect(typeof systemInfo.monitors).toBe('number');
    expect(typeof systemInfo.ram.total).toBe('number');
    expect(typeof systemInfo.ram.used).toBe('number');
    expect(typeof systemInfo.ram.usagePercentage).toBe('number');
    expect(typeof systemInfo.cpu.cores).toBe('number');
    expect(typeof systemInfo.cpu.loadAverage).toBe('number');
  });

  test('POST /api/device/reboot should require deviceId', async ({ request }) => {
    const response = await request.post(`${API_URL}/device/reboot`, {
      data: {}
    });
    
    // Verify response has the expected error
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error', 'Device ID is required');
  });

  test('POST /api/device/reboot should accept valid request', async ({ request }) => {
    const response = await request.post(`${API_URL}/device/reboot`, {
      data: { deviceId: 'test-device-123' }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message');
  });

  test('POST /api/device/timezone should validate request fields', async ({ request }) => {
    const response = await request.post(`${API_URL}/device/timezone`, {
      data: {}
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error', 'Device ID and timezone are required');
  });

  test('POST /api/device/timezone should accept valid request', async ({ request }) => {
    const response = await request.post(`${API_URL}/device/timezone`, {
      data: { 
        deviceId: 'test-device-123',
        timezone: 'Asia/Ho_Chi_Minh'
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message');
  });

  test('POST /api/device/update should validate deviceId', async ({ request }) => {
    const response = await request.post(`${API_URL}/device/update`, {
      data: {}
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error', 'Device ID is required');
  });

  test('POST /api/device/update should accept valid request', async ({ request }) => {
    // Make a request with valid data
    const response = await request.post(`${API_URL}/device/update`, {
      data: { 
        deviceId: 'test-device-123',
        name: 'Test Device',
        description: 'Test description',
        location: 'Ho Chi Minh City',
        model: 'Test Model',
        tags: ['test', 'device']
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('data');
    
    expect(data.data).toHaveProperty('deviceId', 'test-device-123');
    expect(data.data).toHaveProperty('name', 'Test Device');
    expect(data.data).toHaveProperty('description', 'Test description');
    expect(data.data).toHaveProperty('location', 'Ho Chi Minh City');
    expect(data.data).toHaveProperty('model', 'Test Model');
    expect(data.data).toHaveProperty('tags');
    expect(data.data.tags).toEqual(['test', 'device']);
  });
}); 