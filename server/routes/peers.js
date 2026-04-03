'use strict';
const { Router } = require('express');
const { dbRun, dbAll } = require('../db');
const { requireAgeVerified } = require('../auth');

const router = Router();

router.get('/', requireAgeVerified, async (req, res) => {
  try {
    res.json(
      (await dbAll('SELECT * FROM peers ORDER BY last_seen DESC'))
        .map(r => ({ pubkey: r.pubkey, lastSeen: r.last_seen, status: r.status || 'offline' }))
    );
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/', requireAgeVerified, async (req, res) => {
  const { pubkey, status } = req.body;
  if (!pubkey) return res.status(400).json({ error: 'pubkey required' });
  try {
    await dbRun(
      'INSERT OR REPLACE INTO peers (pubkey, last_seen, status, connection_type, metadata) VALUES (?, ?, ?, ?, ?)',
      [pubkey, Date.now(), status || 'online', 'relay', '{}']
    );
    res.status(201).json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

module.exports = router;
