'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const LOG = path.join(__dirname, '../logs/watchdog.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] [WATCHDOG] ${msg}\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, line);
  process.stdout.write(line);
}
function watch(scriptPath, args = [], delay = 3000) {
  function start() {
    const p = spawn('node', [scriptPath, ...args], { stdio: 'inherit' });
    p.on('exit', code => { if (code !== 0) { log(`CRASHED (${code}), restarting...`); setTimeout(start, delay); } else { log('Stopped cleanly.'); } });
    p.on('error', err => { log(`ERROR: ${err.message}`); setTimeout(start, delay); });
  }
  log(`Watching: ${scriptPath}`);
  start();
}
module.exports = { watch };
if (require.main === module) {
  const [,,script,...args] = process.argv;
  if (!script) { console.error('Usage: node agent-watchdog.cjs <script>'); process.exit(1); }
  watch(path.resolve(script), args);
}
