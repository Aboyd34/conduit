'use strict';
const fs = require('fs');
const path = require('path');
const LOG = path.join(__dirname, '../logs/gatekeeper.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] [GATEKEEPER] ${msg}\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, line);
  process.stdout.write(line);
}
const ALLOWED_ACTIONS = ['deploy', 'airdrop', 'build', 'watch', 'generate'];
function validate(action) {
  if (!action) { log('BLOCKED: No action.'); return { ok: false, reason: 'No action.' }; }
  if (!ALLOWED_ACTIONS.includes(action)) { log(`BLOCKED: "${action}"`); return { ok: false, reason: `"${action}" not permitted.` }; }
  log(`ALLOWED: ${action}`);
  return { ok: true };
}
module.exports = { validate };
if (require.main === module) {
  const result = validate(process.argv[2]);
  console.log(JSON.stringify(result));
  process.exit(result.ok ? 0 : 1);
}
