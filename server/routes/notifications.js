'use strict';
const crypto = require('crypto');
const { Router } = require('express');
const { dbRun, dbAll } = require('../db');
const { requireAgeVerified } = require('../auth');
const { broadcastTo } = require('../ws');

const router = Router();

async function createNotification(recipient_pubkey, type, data) {
  try {
    await dbRun(
      'INSERT INTO notifications (id, recipient_pubkey, type, data, read, created_at) VALUES (?, ?, ?, ?, 0, ?)',
      [crypto.randomUUID(), recipient_pubkey, type, JSON.stringify(data), Date.now()]
    );
    broadcastTo(recipient_pubkey, { type: 'notification', notification: { type, data } });
  } catch (e) {
    console.error('[Notifications] create error:', e.message);
  }
}

router.get('/:pubkey', requireAgeVerified, async (req, res) => {
  try {
    res.json(await dbAll('SELECT * FROM notifications WHERE recipient_pubkey = ? ORDER BY created_at DESC LIMIT 50', [req.params.pubkey]));
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/:id/read', requireAgeVerified, async (req, res) => {
  try {
    await dbRun('UPDATE notifications SET read = 1 WHERE id = ?', [req.params.id]);
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/read-all', requireAgeVerified, async (req, res) => {
  const { pubkey } = req.body;
  if (!pubkey) return res.status(400).json({ error: 'Missing pubkey' });
  try {
    await dbRun('UPDATE notifications SET read = 1 WHERE recipient_pubkey = ?', [pubkey]);
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

module.exports = router;
module.exports.createNotification = createNotification;
