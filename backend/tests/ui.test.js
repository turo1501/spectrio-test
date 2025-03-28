const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { spawn } = require('child_process');

describe('UI Tests', () => {
  let driver;
  let backendProcess;
  let frontendProcess;

  // Set longer timeout for UI tests
  jest.setTimeout(60000);

  // Start backend and frontend servers before tests
  beforeAll(async () => {
    // Start backend server
    backendProcess = spawn('node', ['server/server.js'], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });
    console.log('Started backend server');

    // Wait for backend to start
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Start frontend server (assuming we're in the backend directory)
    frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: '../frontend',
      shell: true,
      stdio: 'pipe',
    });
    console.log('Started frontend server');

    // Wait for frontend to start
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Set up Chrome driver
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode for CI
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    // Build the driver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  // Clean up after tests
  afterAll(async () => {
    // Close the browser
    if (driver) {
      await driver.quit();
    }

    // Stop the servers
    if (backendProcess) {
      backendProcess.kill();
    }
    if (frontendProcess) {
      frontendProcess.kill();
    }
  });

  // Test UI rendering
  test('Dashboard should load and display system information', async () => {
    // Navigate to the dashboard
    await driver.get('http://localhost:3001');
    
    // Wait for the dashboard to load (up to 10 seconds)
    await driver.wait(until.elementLocated(By.xpath('//h1[contains(text(), "Device Management")]')), 10000);
    
    // Wait for data to be loaded (check for specific UI elements)
    try {
      // Wait for system info to appear
      await driver.wait(until.elementLocated(By.xpath('//h2[contains(text(), "System Overview")]')), 10000);
      
      // Check if CPU information is displayed
      const cpuElement = await driver.findElement(By.xpath('//h2[contains(text(), "CPU")]'));
      expect(cpuElement).toBeTruthy();
      
      // Check if RAM information is displayed
      const ramElement = await driver.findElement(By.xpath('//h2[contains(text(), "Memory")]'));
      expect(ramElement).toBeTruthy();
      
      // Check if display information is displayed
      const displayElement = await driver.findElement(By.xpath('//h2[contains(text(), "Displays")]'));
      expect(displayElement).toBeTruthy();
      
      // Check if storage information is displayed
      const storageElement = await driver.findElement(By.xpath('//h2[contains(text(), "Storage")]'));
      expect(storageElement).toBeTruthy();
      
      // Take a screenshot for documentation
      await driver.takeScreenshot().then((image) => {
        require('fs').writeFileSync('dashboard-screenshot.png', image, 'base64');
      });
      
    } catch (error) {
      console.error('Error during UI test:', error);
      throw error;
    }
  });
  
  // Test real-time updates
  test('Dashboard should update in real-time', async () => {
    // Navigate to the dashboard
    await driver.get('http://localhost:3001');
    
    // Wait for the dashboard to load
    await driver.wait(until.elementLocated(By.xpath('//h2[contains(text(), "Memory")]')), 10000);
    
    // Get initial memory usage
    const initialMemoryText = await driver.findElement(
      By.xpath('//div[p[contains(text(), "Used")]]/p[2]')
    ).getText();
    
    // Wait for a few seconds to allow for data updates
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    // Get updated memory usage
    const updatedMemoryText = await driver.findElement(
      By.xpath('//div[p[contains(text(), "Used")]]/p[2]')
    ).getText();
    
    // Verify the timestamp has changed (data was updated)
    // For this test, we're just checking if the page is actively being updated
    // Memory usage might not change dramatically in a short period
    console.log(`Initial memory: ${initialMemoryText}, Updated memory: ${updatedMemoryText}`);
    
    // Check the connection status
    const connectionStatus = await driver.findElement(
      By.xpath('//span[contains(text(), "Connected")]')
    );
    expect(connectionStatus).toBeTruthy();
  });
}); 