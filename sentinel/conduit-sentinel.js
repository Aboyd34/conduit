#!/usr/bin/env node
/**
 * Conduit Sentinel
 * Watchdog agent that monitors, diagnoses, and auto-heals the Conduit stack.
 *
 * Watches:
 *   - Server process (port 3000 HTTP + /ws WebSocket)
 *   - Vite dev server (port 5173)
 *   - Dependency integrity (node_modules vs package.json)
 *   - Log stream for known fatal error patterns
 *
 * Heals:
 *   - Restarts crashed server process
 *   - Runs npm install on missing dependency errors
 *   - Restarts Vite if HMR dies
 *   - Reports all events to sentinel.log
 */

import { spawn, exec } from 'child_process';
import { createWriteStream, existsSync, readFileSync } from 'fs';
import { WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LOG_FILE = path.join(ROOT, 'sentinel.log');

const CONFIG = {
  serverPort: 3000,
  vitePort: 5173,
  healthEndpoint: 'http://localhost:3000/api/health',
  wsEndpoint: 'ws://localhost:3000/ws',
  checkIntervalMs: 10_000,   // check every 10s
  restartDelayMs: 3_000,     // wait 3s before restart
  maxRestarts: 5,            // max restarts before giving up
  restartWindowMs: 60_000,   // restart count resets after 1 min
};

const log = createWriteStream(LOG_FILE, { flags: 'a' });

function sentinel(msg, level = 'INFO') {
  const line = `[${new Date().toISOString()}] [SENTINEL] [${level}] ${msg}`;
  console.log(line);
  log.write(line + '\n');
}

// ---------------------------------------------------------------------------
// Diagnosis Engine
// ---------------------------------------------------------------------------

const KNOWN_ERRORS = [
  { pattern: /Cannot find module '([^']+)'/, action: 'npm_install', label: 'Missing module' },
  { pattern: /EADDRINUSE/, action: 'port_conflict', label: 'Port already in use' },
  { pattern: /ECONNREFUSED/, action: 'restart_server', label: 'Connection refused' },
  { pattern: /SyntaxError/, action: 'report_only', label: 'Syntax error — manual fix required' },
  { pattern: /Cannot find package/, action: 'npm_install', label: 'Missing package' },
];

function diagnose(errorText) {
  for (const { pattern, action, label } of KNOWN_ERRORS) {
    if (pattern.test(errorText)) {
      sentinel(`Diagnosed: ${label} → action: ${action}`, 'DIAG');
      return action;
    }
  }
  return 'restart_server';
}

// ---------------------------------------------------------------------------
// Heal Actions
// ---------------------------------------------------------------------------

function runNpmInstall() {
  return new Promise((resolve) => {
    sentinel('Running npm install...', 'HEAL');
    exec('npm install', { cwd: ROOT }, (err, stdout, stderr) => {
      if (err) {
        sentinel(`npm install failed: ${stderr}`, 'ERROR');
      } else {
        sentinel('npm install completed successfully.', 'HEAL');
      }
      resolve();
    });
  });
}

// ---------------------------------------------------------------------------
// Process Manager
// ---------------------------------------------------------------------------

class ConduitProcess {
  constructor(name, command, args) {
    this.name = name;
    this.command = command;
    this.args = args;
    this.process = null;
    this.restartCount = 0;
    this.restartWindowStart = Date.now();
    this.errorBuffer = '';
  }

  start() {
    sentinel(`Starting ${this.name}...`, 'PROC');
    this.process = spawn(this.command, this.args, {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    this.process.stdout.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg) sentinel(`[${this.name}] ${msg}`, 'OUT');
    });

    this.process.stderr.on('data', (d) => {
      const msg = d.toString();
      this.errorBuffer += msg;
      sentinel(`[${this.name}] ${msg.trim()}`, 'ERR');
    });

    this.process.on('exit', (code) => {
      sentinel(`${this.name} exited with code ${code}`, code === 0 ? 'INFO' : 'WARN');
      if (code !== 0) this.handleCrash();
    });
  }

  async handleCrash() {
    // Reset restart counter after window
    if (Date.now() - this.restartWindowStart > CONFIG.restartWindowMs) {
      this.restartCount = 0;
      this.restartWindowStart = Date.now();
    }

    if (this.restartCount >= CONFIG.maxRestarts) {
      sentinel(`${this.name} exceeded max restarts (${CONFIG.maxRestarts}). Manual intervention required.`, 'FATAL');
      return;
    }

    const action = diagnose(this.errorBuffer);
    this.errorBuffer = '';

    if (action === 'npm_install') await runNpmInstall();
    if (action === 'report_only') return;

    this.restartCount++;
    sentinel(`Restarting ${this.name} in ${CONFIG.restartDelayMs}ms (attempt ${this.restartCount}/${CONFIG.maxRestarts})...`, 'HEAL');
    setTimeout(() => this.start(), CONFIG.restartDelayMs);
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  isRunning() {
    return this.process && !this.process.killed;
  }
}

// ---------------------------------------------------------------------------
// Health Checks
// ---------------------------------------------------------------------------

function checkHttp(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => resolve(res.statusCode === 200))
      .on('error', () => resolve(false));
  });
}

function checkWebSocket(url) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url);
    const timer = setTimeout(() => { ws.terminate(); resolve(false); }, 3000);
    ws.on('open', () => { clearTimeout(timer); ws.close(); resolve(true); });
    ws.on('error', () => { clearTimeout(timer); resolve(false); });
  });
}

// ---------------------------------------------------------------------------
// Sentinel Main Loop
// ---------------------------------------------------------------------------

const serverProc = new ConduitProcess('conduit-server', 'npx', ['tsx', 'server.ts']);
const viteProc = new ConduitProcess('conduit-vite', 'npx', ['vite']);

async function healthLoop() {
  const httpOk = await checkHttp(CONFIG.healthEndpoint);
  const wsOk = await checkWebSocket(CONFIG.wsEndpoint);

  sentinel(`Health: HTTP=${httpOk ? 'OK' : 'FAIL'} WS=${wsOk ? 'OK' : 'FAIL'}`, 'CHECK');

  if (!httpOk && !serverProc.isRunning()) {
    sentinel('Server not running and HTTP down — restarting...', 'HEAL');
    serverProc.start();
  }

  if (!wsOk && serverProc.isRunning()) {
    sentinel('Server running but WebSocket unreachable — restarting server...', 'HEAL');
    serverProc.stop();
    setTimeout(() => serverProc.start(), CONFIG.restartDelayMs);
  }
}

async function main() {
  sentinel('Conduit Sentinel starting ⚡', 'BOOT');
  sentinel(`Monitoring: HTTP ${CONFIG.healthEndpoint} | WS ${CONFIG.wsEndpoint}`, 'BOOT');
  sentinel(`Check interval: ${CONFIG.checkIntervalMs / 1000}s | Max restarts: ${CONFIG.maxRestarts}`, 'BOOT');

  serverProc.start();
  viteProc.start();

  // Wait for processes to initialize before first health check
  setTimeout(() => {
    healthLoop();
    setInterval(healthLoop, CONFIG.checkIntervalMs);
  }, 8000);
}

main();
