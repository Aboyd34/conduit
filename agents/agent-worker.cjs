'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const gatekeeper = require('./agent-gatekeeper.cjs');
const LOG = path.join(__dirname, '../logs/worker.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] [WORKER] ${msg}\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, line);
  process.stdout.write(line);
}
const TASKS = {
  deploy: () => execSync('npx hardhat run scripts/deploy-aether.cjs --network base-sepolia', { stdio: 'inherit' }),
  build: () => execSync('npm run build', { stdio: 'inherit' }),
};
function execute(action) {
  const check = gatekeeper.validate(action);
  if (!check.ok) { log(`REFUSED: ${check.reason}`); return check; }
  if (!TASKS[action]) { log(`NO TASK: ${action}`); return { ok: false, reason: `No task for "${action}".` }; }
  try { log(`START: ${action}`); TASKS[action](); log(`DONE: ${action}`); return { ok: true }; }
  catch (err) { log(`ERROR: ${err.message}`); return { ok: false, reason: err.message }; }
}
module.exports = { execute };
if (require.main === module) {
  const result = execute(process.argv[2]);
  console.log(JSON.stringify(result));
  process.exit(result.ok ? 0 : 1);
}
