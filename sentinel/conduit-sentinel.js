#!/usr/bin/env node
/**
 * Conduit Sentinel
 * Watchdog agent that monitors, diagnoses, and auto-heals the Conduit stack.
 */

import { spawn, exec } from 'child_process';
import { createWriteStream } from 'fs';
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
  checkIntervalMs: 15_000,
  restartDelayMs: 4_000,
  maxRestarts: 5,
  restartWindowMs: 60_000,
};

const log = createWriteStream(LOG_FILE, { flags: 'a' });

function sentinel(msg, level = 'INFO') {
  const line = `[${new Date().toISOString()}] [SENTINEL] [${level}] ${msg}`;
  console.log(line);
  log.write(line + '\n');
}

// ---------------------------------------------------------------------------
// Kill process on a port before restarting
// ---------------------------------------------------------------------------

function killPort(port) {
  return new Promise((resolve) => {
    // Windows: find and kill the PID using the port
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
      if (err || !stdout.trim()) return resolve();
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && /^\d+$/.test(pid)) pids.add(pid);
      }
      if (pids.size === 0) return resolve();
      let done = 0;
      for (const pid of pids) {
        exec(`taskkill /PID ${pid} /F`, () => {
          done++;
          if (done === pids.size) {
            sentinel(`Killed ${pids.size} process(es) on port ${port}`, 'HEAL');
            resolve();
          }
        });
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Diagnosis Engine
// ---------------------------------------------------------------------------

const KNOWN_ERRORS = [
  { pattern: /Cannot find module '([^']+)'/, action: 'npm_install', label: 'Missing module' },
  { pattern: /EADDRINUSE/, action: 'port_conflict', label: 'Port already in use' },
  { pattern: /Cannot find package/, action: 'npm_install', label: 'Missing package' },
  { pattern: /SyntaxError/, action: 'report_only', label: 'Syntax error — manual fix required' },
  { pattern: /ENOENT.*tsx/, action: 'set_temp', label: 'tsx temp dir missing' },
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

function runNpmInstall() {
  return new Promise((resolve) => {
    sentinel('Running npm install...', 'HEAL');
    exec('npm install', { cwd: ROOT }, (err, stdout, stderr) => {
      if (err) sentinel(`npm install failed: ${stderr}`, 'ERROR');
      else sentinel('npm install completed.', 'HEAL');
      resolve();
    });
  });
}

// ---------------------------------------------------------------------------
// Process Manager
// ---------------------------------------------------------------------------

class ConduitProcess {
  constructor(name, command, args, env = {}) {
    this.name = name;
    this.command = command;
    this.args = args;
    this.env = env;
    this.process = null;
    this.restartCount = 0;
    this.restartWindowStart = Date.now();
    this.errorBuffer = '';
    this._stopping = false;
  }

  start() {
    if (this._stopping) return;
    sentinel(`Starting ${this.name}...`, 'PROC');

    this.process = spawn(this.command, this.args, {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...this.env },
      shell: false,  // avoid shell injection warning
      windowsVerbatimArguments: false,
    });

    this.process.stdout.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg) sentinel(`[${this.name}] ${msg}`, 'OUT');
    });

    this.process.stderr.on('data', (d) => {
      const msg = d.toString();
      this.errorBuffer += msg;
      const trimmed = msg.trim();
      if (trimmed) sentinel(`[${this.name}] ${trimmed}`, 'ERR');
    });

    this.process.on('exit', (code) => {
      if (this._stopping) return;
      sentinel(`${this.name} exited with code ${code}`, code === 0 ? 'INFO' : 'WARN');
      if (code !== 0 || code === null) this.handleCrash();
    });
  }

  async handleCrash() {
    if (this._stopping) return;

    if (Date.now() - this.restartWindowStart > CONFIG.restartWindowMs) {
      this.restartCount = 0;
      this.restartWindowStart = Date.now();
    }

    if (this.restartCount >= CONFIG.maxRestarts) {
      sentinel(`${this.name} exceeded max restarts. Manual intervention required.`, 'FATAL');
      this.restartCount = 0; // reset so Sentinel keeps trying
      return;
    }

    const action = diagnose(this.errorBuffer);
    this.errorBuffer = '';

    if (action === 'npm_install') await runNpmInstall();
    if (action === 'report_only') return;
    if (action === 'port_conflict') {
      await killPort(CONFIG.serverPort);
    }
    if (action === 'set_temp') {
      process.env.TEMP = `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Temp`;
      process.env.TMP = process.env.TEMP;
    }

    this.restartCount++;
    sentinel(`Restarting ${this.name} in ${CONFIG.restartDelayMs}ms (attempt ${this.restartCount}/${CONFIG.maxRestarts})...`, 'HEAL');
    setTimeout(() => this.start(), CONFIG.restartDelayMs);
  }

  stop() {
    this._stopping = true;
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }

  resume() {
    this._stopping = false;
    this.restartCount = 0;
  }

  isRunning() {
    return this.process && !this.process.killed && this.process.exitCode === null;
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

const userTemp = `C:\\Users\\${process.env.USERNAME || 'Anthony Boyd'}\\AppData\\Local\\Temp`;
process.env.TEMP = userTemp;
process.env.TMP = userTemp;

const serverProc = new ConduitProcess(
  'conduit-server',
  'node',
  ['--import', 'tsx/esm', 'server.ts'],
  { TEMP: userTemp, TMP: userTemp }
);

const viteProc = new ConduitProcess(
  'conduit-vite',
  'node',
  ['node_modules/.bin/vite'],
  { TEMP: userTemp, TMP: userTemp }
);

async function healthLoop() {
  const httpOk = await checkHttp(CONFIG.healthEndpoint);
  const wsOk = await checkWebSocket(CONFIG.wsEndpoint);

  sentinel(`Health: HTTP=${httpOk ? 'OK' : 'FAIL'} WS=${wsOk ? 'OK' : 'FAIL'}`, 'CHECK');

  if (!httpOk && !serverProc.isRunning()) {
    sentinel('Server down — restarting...', 'HEAL');
    await killPort(CONFIG.serverPort);
    serverProc.resume();
    serverProc.start();
    return;
  }

  if (!wsOk && serverProc.isRunning()) {
    sentinel('WS unreachable — killing port and restarting server...', 'HEAL');
    serverProc.stop();
    await killPort(CONFIG.serverPort);
    await new Promise(r => setTimeout(r, 1000));
    serverProc.resume();
    serverProc.start();
  }
}

async function main() {
  sentinel('Conduit Sentinel starting ⚡', 'BOOT');
  sentinel(`Monitoring: HTTP ${CONFIG.healthEndpoint} | WS ${CONFIG.wsEndpoint}`, 'BOOT');
  sentinel(`TEMP set to: ${userTemp}`, 'BOOT');

  // Kill any stale processes on startup
  await killPort(CONFIG.serverPort);

  serverProc.start();
  viteProc.start();

  setTimeout(() => {
    healthLoop();
    setInterval(healthLoop, CONFIG.checkIntervalMs);
  }, 10000);
}

process.on('SIGINT', () => {
  sentinel('Sentinel shutting down...', 'BOOT');
  serverProc.stop();
  viteProc.stop();
  process.exit(0);
});

main();
