'use strict';
const fs = require('fs');
const path = require('path');
const gatekeeper = require('./agent-gatekeeper.cjs');
const LOG = path.join(__dirname, '../logs/builder.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] [BUILDER] ${msg}\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, line);
  process.stdout.write(line);
}
function generate(targetPath, content) {
  const check = gatekeeper.validate('build');
  if (!check.ok) { log(`REFUSED: ${check.reason}`); return check; }
  try { fs.mkdirSync(path.dirname(targetPath), { recursive: true }); fs.writeFileSync(targetPath, content, 'utf8'); log(`WRITTEN: ${targetPath}`); return { ok: true, path: targetPath }; }
  catch (err) { log(`ERROR: ${err.message}`); return { ok: false, reason: err.message }; }
}
module.exports = { generate };
if (require.main === module) {
  const [,,out,src] = process.argv;
  if (!out || !src) { console.error('Usage: node agent-builder.cjs <output> <source>'); process.exit(1); }
  const result = generate(path.resolve(out), fs.readFileSync(path.resolve(src), 'utf8'));
  console.log(JSON.stringify(result));
  process.exit(result.ok ? 0 : 1);
}
