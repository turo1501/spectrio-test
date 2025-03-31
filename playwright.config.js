// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Folder for test output such as screenshots, videos, etc. */
  outputDir: 'test-results/',

  /* Timeout for each test in milliseconds */
  timeout: 120 * 1000, // 2 minutes

  /* Run tests in files in parallel */
  fullyParallel: false, // Changed to false to avoid resource contention

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry tests to handle flaky tests */
  retries: process.env.CI ? 2 : 1, // Add retry for local tests as well

  /* Opt out of parallel tests on CI. */
  workers: 1, // Run tests sequentially to avoid server concurrency issues

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Browser default viewport size */
    viewport: { width: 1280, height: 720 },
    
    /* Add timeout for all actions */
    actionTimeout: 30000,
    
    /* Add timeout for navigation */
    navigationTimeout: 60000,
    
    /* Add timeout for waiting */
    expect: {
      timeout: 30000,
    },
  },

  /* Configure projects for different test groups */
  projects: [
    {
      name: 'api',
      testMatch: /api\.spec\.js/,
      timeout: 120 * 1000,
      use: {
        extraHTTPHeaders: {
          'Accept': 'application/json',
        },
      },
    },
    {
      name: 'websocket',
      testMatch: /websocket\.spec\.js/,
      timeout: 180 * 1000,
    },
    {
      name: 'ui',
      testMatch: /ui\.spec\.js/,
      timeout: 180 * 1000,
      use: {
        baseURL: 'http://localhost:3001',
      },
    },
    {
      name: 'stability',
      testMatch: /stability\.spec\.js/,
      timeout: 240 * 1000, // Longer timeout for stability tests
    },
    {
      name: 'location',
      testMatch: /location\.spec\.js/,
      timeout: 180 * 1000,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-web-security', 
            '--disable-background-timer-throttling',
            '--disable-background-networking',
            '--disable-gpu',
            '--disable-default-apps',
          ],
          slowMo: 100, // Slow down by 100ms to improve test stability
        },
        contextOptions: {
          ignoreHTTPSErrors: true, // Ignore SSL errors
        },
      },
    },
  ],

  /* Run your local dev server before starting the tests - commented out since we're using run-tests.js */
  /*
  webServer: [
    {
      command: 'cd backend && node server/server.js',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 60000, // Increase server startup timeout
    },
    {
      command: 'cd frontend && npm run dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 60000, // Increase server startup timeout
    },
  ],
  */
});

