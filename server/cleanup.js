'use strict';
const { dbRun } = require('./db');

function startCleanupJobs() {
  setInterval(async () => {
    try {
      await dbRun('DELETE FROM peers WHERE last_seen < ?', [Date.now() - 7 * 24 * 60 * 60 * 1000]);
      await dbRun('DELETE FROM notifications WHERE created_at < ? AND read = 1', [Date.now() - 30 * 24 * 60 * 60 * 1000]);
      console.log('[Cleanup] stale peers and old notifications pruned');
    } catch (e) {
      console.error('[Cleanup] error:', e.message);
    }
  }, 60 * 60 * 1000);
}

module.exports = { startCleanupJobs };
