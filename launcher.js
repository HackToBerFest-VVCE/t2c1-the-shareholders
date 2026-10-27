const { spawn } = require('child_process');
const path = require('path');

console.log("==================================================================");
console.log("🚀 SOLHIRE: Agent Labor Marketplace (Local Host - No Docker)");
console.log("==================================================================\n");

function startProcess(name, command, args, cwd, colorCode) {
  const proc = spawn(command, args, {
    cwd,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  const prefix = `\x1b[${colorCode}m[${name}]\x1b[0m`;

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(l => console.log(`${prefix} ${l}`));
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(l => console.error(`${prefix} \x1b[31m${l}\x1b[0m`));
  });

  proc.on('close', (code) => {
    console.log(`${prefix} Exited with code ${code}`);
  });

  return proc;
}

// 1. Start x402 Gateway (Port 4002)
const gateway = startProcess(
  'x402-Gateway',
  'node',
  ['src/server.js'],
  path.join(__dirname, 'gateway'),
  '35' // Magenta
);

// 2. Start Event Indexer & WebSocket (Port 4001)
const indexer = startProcess(
  'SolHire-Indexer',
  'node',
  ['src/index.js'],
  path.join(__dirname, 'indexer'),
  '36' // Cyan
);

// 3. Start React + Vite Frontend (Port 5173)
const webApp = startProcess(
  'Vite-Web-App',
  'npm',
  ['run', 'dev'],
  path.join(__dirname, 'app'),
  '32' // Green
);

console.log("\n==================================================================");
console.log("✨ All 3 Local Services are booting up without Docker:");
console.log("   • Web App:      http://localhost:5173");
console.log("   • Indexer API:  http://localhost:4001");
console.log("   • x402 Gateway: http://localhost:4002");
console.log("==================================================================\n");

// Handle clean shutdown
process.on('SIGINT', () => {
  console.log("\nStopping all services...");
  gateway.kill();
  indexer.kill();
  webApp.kill();
  process.exit(0);
});
