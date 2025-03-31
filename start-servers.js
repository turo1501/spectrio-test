
const { spawn } = require('child_process');
const path = require('path');
const colors = require('colors/safe');

// Configuration
const BACKEND_DIR = path.join(__dirname, 'backend');
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const BACKEND_CMD = process.platform === 'win32' ? 'node' : 'node';
const FRONTEND_CMD = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Helper function to start a process
function startProcess(name, command, args, cwd, color) {
  console.log(color(`Starting ${name}...`));
  
  const proc = spawn(command, args, {
    cwd,
    stdio: 'pipe',
    shell: true
  });
  
  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(color(`[${name}] ${line.trim()}`));
    });
  });
  
  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.error(colors.red(`[${name} ERROR] ${line.trim()}`));
    });
  });
  
  proc.on('error', (err) => {
    console.error(colors.red(`[${name}] Failed to start: ${err.message}`));
  });
  
  proc.on('close', (code) => {
    console.log(color(`[${name}] Process exited with code ${code}`));
  });
  
  return proc;
}

// Start backend server
const backendProcess = startProcess(
  'Backend',
  BACKEND_CMD,
  ['server/server.js'],
  BACKEND_DIR,
  colors.cyan
);

// Start frontend server
const frontendProcess = startProcess(
  'Frontend',
  FRONTEND_CMD,
  ['run', 'dev'],
  FRONTEND_DIR,
  colors.green
);

// Handle script termination
process.on('SIGINT', () => {
  console.log(colors.yellow('\nShutting down servers...'));
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});

console.log(colors.yellow('Both servers starting. Press Ctrl+C to stop.'));
console.log(colors.yellow('Backend URL: http://localhost:3000'));
console.log(colors.yellow('Frontend URL: http://localhost:3001')); 