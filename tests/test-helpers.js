

/**
 * Sets up mocks for external API calls
 * @param {import('@playwright/test').BrowserContext} context Browser context to mock requests
 */
async function setupMocks(context) {
  // Mock the ipinfo.io API calls to return Ho Chi Minh City data
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
}

/**
 * @param {import('@playwright/test').Page} page Playwright page
 * @param {import('@playwright/test').Expect} expect Playwright expect
 */
async function verifyServerRunning(page, expect) {
  await page.goto('http://localhost:3000/', { timeout: 30000 });
  await expect(page.getByText('Device Management API is running')).toBeVisible({ timeout: 30000 });
}

/**
 * Verifies that a location object contains the expected data for Ho Chi Minh City
 * @param {object} location Location object to verify
 * @param {import('@playwright/test').Expect} expect Playwright expect
 */
function verifyHoChiMinhLocation(location, expect) {
  expect(location).toHaveProperty('city', 'Ho Chi Minh City');
  expect(location).toHaveProperty('region', 'Ho Chi Minh');
  expect(location).toHaveProperty('country', 'VN');
  expect(location).toHaveProperty('timezone', 'Asia/Ho_Chi_Minh');
}

/**
 * Introduces a delay in execution
 * @param {number} ms Milliseconds to wait
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  setupMocks,
  verifyServerRunning,
  verifyHoChiMinhLocation,
  delay
}; 