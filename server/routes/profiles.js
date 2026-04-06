'use strict';
const { Router } = require('express');
const { dbRun, dbGet, dbAll } = require('../db');
const { requireAgeVerified, validateLength, LIMITS } = require('../auth');

const PIONEER_CUTOFF = new Date('2026-06-01').getTime();
const router = Router();

router.get('/:pubkey', requireAgeVerified, async (req, res) => {
  try {
    const profile = await dbGet('SELECT * FROM profiles WHERE pubkey = ?', [req.params.pubkey]);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/', requireAgeVerified, async (req, res) => {
  const { pubkey, display_name, bio, avatar } = req.body;
  if (!pubkey) return res.status(400).json({ error: 'Missing pubkey' });
  if (display_name && !validateLength(display_name, 'display_name'))
    return res.status(400).json({ error: 'display_name_too_long', max: LIMITS.display_name });
  if (bio && !validateLength(bio, 'bio'))
    return res.status(400).json({ error: 'bio_too_long', max: LIMITS.bio });
  try {
    const ts = Date.now();
    const existing = await dbGet('SELECT pubkey FROM profiles WHERE pubkey = ?', [pubkey]);
    if (existing) {
      await dbRun(
        'UPDATE profiles SET display_name = ?, bio = ?, avatar = ?, updated_at = ? WHERE pubkey = ?',
        [display_name || '', bio || '', avatar || '', ts, pubkey]
      );
    } else {
      const pioneer = ts < PIONEER_CUTOFF ? 1 : 0;
      await dbRun(
        'INSERT INTO profiles (pubkey, display_name, bio, avatar, aeth_balance, pioneer, joined_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [pubkey, display_name || '', bio || '', avatar || '', pioneer ? 1000 : 0, pioneer, ts, ts]
      );
    }
    res.status(201).json({ status: 'ok', pioneer: ts < PIONEER_CUTOFF });
  } catch (e) {
    console.error('[Profiles] upsert error:', e.message);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.get('/:pubkey/aeth', requireAgeVerified, async (req, res) => {
  try {
    const profile = await dbGet('SELECT aeth_balance, pioneer FROM profiles WHERE pubkey = ?', [req.params.pubkey]);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const ledger = await dbAll('SELECT * FROM aeth_ledger WHERE pubkey = ? ORDER BY timestamp DESC LIMIT 50', [req.params.pubkey]);
    res.json({ balance: profile.aeth_balance, pioneer: !!profile.pioneer, ledger });
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

module.exports = router;
