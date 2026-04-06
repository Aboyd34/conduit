'use strict';
const { Router } = require('express');
const { dbRun, dbAll } = require('../db');
const { requireAgeVerified } = require('../auth');

const router = Router();

router.get('/', requireAgeVerified, async (req, res) => {
  try {
    res.json(await dbAll('SELECT * FROM communities'));
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/', requireAgeVerified, async (req, res) => {
  const { id, name, description, owner_pubkey } = req.body;
  if (!id || !name || !owner_pubkey) return res.status(400).json({ error: 'Missing fields' });
  try {
    await dbRun(
      'INSERT OR REPLACE INTO communities (id, name, description, owner_pubkey, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, name, description || '', owner_pubkey, Date.now()]
    );
    res.status(201).json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

module.exports = router;
