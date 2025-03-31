#!/usr/bin/env node

/**
 * Enhanced test runner for the System Monitoring App
 * 
 * Features:
 * - Runs all test categories or specific categories
 * - Provides colorized output
 * - Handles test failures gracefully
 * - Generates summary reports
 * - Allows for selective retries of failed tests
 */

const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds
const BACKEND_PORT = 3000;
const FRONTEND_PORT = 3001;
const TEST_TIMEOUT = 120000; // 2 minutes

// Command line arguments
const args = process.argv.slice(2);
const options = args.filter(arg => arg.startsWith('--')).map(arg => arg.slice(2));

/**
 * Check if a port is in use
 * @param {number} port Port number to check
 * @returns {Promise<boolean>} True if port is in use
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const command = process.platform === 'win32' 
      ? `netstat -ano | findstr :${port} | findstr LISTENING` 
      : `lsof -i:${port} -t`;
    
    exec(command, (error, stdout) => {
      resolve(!!stdout.trim());
    });
  });
}

/**
 * Wait for a specified number of milliseconds
 * @param {number} ms Milliseconds to wait
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Start the backend server
 * @returns {Promise<any>} Child process
 */
async function startBackend() {
  console.log(chalk.blue('🚀 Starting backend server...'));
  
  // Check if backend is already running
  if (await isPortInUse(BACKEND_PORT)) {
    console.log(chalk.yellow(`⚠️ Backend server already running on port ${BACKEND_PORT}`));
    return null;
  }
  
  return new Promise((resolve) => {
    const backend = exec('cd backend && npm start', {
      env: { ...process.env, PORT: BACKEND_PORT.toString() }
    });
    
    backend.stdout.on('data', (data) => {
      process.stdout.write(chalk.gray(`[Backend] ${data}`));
      if (data.includes('Server is running on port')) {
        console.log(chalk.green('✅ Backend server started successfully'));
        resolve(backend);
      }
    });
    
    backend.stderr.on('data', (data) => {
      process.stderr.write(chalk.red(`[Backend Error] ${data}`));
    });
    
    // Resolve after a timeout even if we don't see the expected message
    setTimeout(() => {
      console.log(chalk.yellow('⚠️ Backend startup timeout - proceeding anyway'));
      resolve(backend);
    }, 10000);
  });
}

/**
 * Start the frontend server
 * @returns {Promise<any>} Child process
 */
async function startFrontend() {
  console.log(chalk.blue('🚀 Starting frontend server...'));
  
  // Check if frontend is already running
  if (await isPortInUse(FRONTEND_PORT)) {
    console.log(chalk.yellow(`⚠️ Frontend server already running on port ${FRONTEND_PORT}`));
    return null;
  }
  
  return new Promise((resolve) => {
    const frontend = exec('cd frontend && npm run dev', {
      env: { ...process.env, PORT: FRONTEND_PORT.toString() }
    });
    
    frontend.stdout.on('data', (data) => {
      process.stdout.write(chalk.gray(`[Frontend] ${data}`));
      if (data.includes('ready - started server on') || data.includes('http://localhost:3001')) {
        console.log(chalk.green('✅ Frontend server started successfully'));
        resolve(frontend);
      }
    });
    
    frontend.stderr.on('data', (data) => {
      process.stderr.write(chalk.red(`[Frontend Error] ${data}`));
    });
    
    // Resolve after a timeout even if we don't see the expected message
    setTimeout(() => {
      console.log(chalk.yellow('⚠️ Frontend startup timeout - proceeding anyway'));
      resolve(frontend);
    }, 20000);
  });
}

/**
 * Run tests with retries
 * @param {string} testPattern Test file pattern to run
 * @param {boolean} uiMode Whether to run in UI mode
 * @returns {Promise<boolean>} True if tests passed
 */
async function runTestsWithRetry(testPattern, uiMode = false) {
  let success = false;
  let attempt = 0;
  
  while (!success && attempt < MAX_RETRIES) {
    attempt++;
    console.log(chalk.blue(`\n🧪 Running tests (Attempt ${attempt}/${MAX_RETRIES}): ${testPattern}`));
    
    try {
      // Build the command
      let command = `npx playwright test ${testPattern}`;
      if (uiMode) {
        command += ' --ui';
      }
      
      // Add longer timeout
      command += ` --timeout=${TEST_TIMEOUT}`;
      
      // Run the command
      execSync(command, { stdio: 'inherit' });
      
      console.log(chalk.green(`\n✅ Tests passed successfully on attempt ${attempt}!`));
      success = true;
    } catch (error) {
      console.log(chalk.red(`\n❌ Tests failed on attempt ${attempt}`));
      
      if (attempt < MAX_RETRIES) {
        console.log(chalk.yellow(`⏳ Waiting ${RETRY_DELAY/1000} seconds before retrying...`));
        await sleep(RETRY_DELAY);
      }
    }
  }
  
  return success;
}

/**
 * Generate a test report
 * @param {Object} testResults Test results
 */
function generateReport(testResults) {
  console.log(chalk.blue('\n📊 Test Report'));
  console.log('─'.repeat(50));
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const [file, result] of Object.entries(testResults)) {
    totalTests++;
    if (result) {
      passedTests++;
      console.log(`${chalk.green('✓')} ${file}`);
    } else {
      console.log(`${chalk.red('✗')} ${file}`);
    }
  }
  
  console.log('─'.repeat(50));
  console.log(`Total: ${totalTests}, Passed: ${passedTests}, Failed: ${totalTests - passedTests}`);
  console.log(`Pass Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
}

/**
 * Create an interactive command-line interface
 * @param {Object} processes Server processes to manage
 * @returns {Object} Interface object
 */
function createInterface(processes) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'test> '
  });
  
  rl.on('line', async (line) => {
    const command = line.trim();
    
    if (command === 'quit' || command === 'exit') {
      // Stop all processes and exit
      console.log(chalk.blue('Shutting down...'));
      
      for (const proc of Object.values(processes)) {
        if (proc) {
          proc.kill();
        }
      }
      
      rl.close();
      process.exit(0);
    } else if (command.startsWith('run ')) {
      // Run specific tests
      const testPattern = command.substring(4);
      await runTestsWithRetry(testPattern);
      rl.prompt();
    } else if (command === 'help') {
      // Show help
      console.log(chalk.blue('\nAvailable commands:'));
      console.log('  run <test-pattern>  - Run tests matching the pattern');
      console.log('  quit                - Stop servers and exit');
      console.log('  help                - Show this help\n');
      rl.prompt();
    } else {
      console.log(chalk.red(`Unknown command: ${command}`));
      console.log('Type "help" for available commands');
      rl.prompt();
    }
  });
  
  rl.on('close', () => {
    console.log(chalk.blue('Goodbye!'));
    process.exit(0);
  });
  
  return rl;
}

/**
 * Main function
 */
async function main() {
  // Clear console
  console.clear();
  
  console.log(chalk.blue('═════════════════════════════════════════'));
  console.log(chalk.blue('      System Monitoring App Tester       '));
  console.log(chalk.blue('═════════════════════════════════════════'));
  
  // Start servers
  const processes = {
    backend: await startBackend(),
    frontend: await startFrontend()
  };
  
  // Give servers time to fully initialize
  console.log(chalk.blue('\n⏳ Waiting for servers to stabilize...'));
  await sleep(10000);
  
  // Check if we should run specific tests or use UI mode
  const uiMode = args.includes('--ui-mode') || args.includes('--ui');
  const specificTests = args.find(arg => !arg.startsWith('--'));
  
  // Default test patterns
  const testPatterns = [
    'tests/api.spec.js',
    'tests/websocket.spec.js',
    'tests/ui.spec.js',
    'tests/location.spec.js',
    'tests/stability.spec.js'
  ];
  
  const testResults = {};
  
  if (specificTests) {
    // Run specific tests
    testResults[specificTests] = await runTestsWithRetry(specificTests, uiMode);
  } else if (uiMode) {
    // Run in UI mode (interactive)
    console.log(chalk.blue('\n🖥️ Starting Playwright UI mode...'));
    try {
      execSync('npx playwright test --ui', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('\n❌ UI mode exited with an error'));
    }
  } else {
    // Run all tests sequentially with retry
    for (const testPattern of testPatterns) {
      testResults[testPattern] = await runTestsWithRetry(testPattern);
    }
    
    // Generate a report
    generateReport(testResults);
  }
  
  // If this is a direct command-line invocation
  if (!args.includes('--interactive')) {
    // Stop all processes and exit
    for (const proc of Object.values(processes)) {
      if (proc) {
        proc.kill();
      }
    }
    
    // Exit with success if all tests passed
    process.exit(Object.values(testResults).every(result => result) ? 0 : 1);
  } else {
    // Start interactive mode
    console.log(chalk.blue('\n🖥️ Interactive mode - type "help" for commands'));
    const rl = createInterface(processes);
    rl.prompt();
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`\n❌ Fatal error: ${error.message}`));
  process.exit(1);
}); 