'use strict';
const crypto = require('crypto');
const { Router } = require('express');
const { dbRun, dbAll } = require('../db');
const { requireAgeVerified, verifySenderSignature, validateLength, LIMITS } = require('../auth');
const { broadcastTo } = require('../ws');
const { createNotification } = require('./notifications');

const router = Router();

router.get('/:pubkey', requireAgeVerified, async (req, res) => {
  const { pubkey } = req.params;
  const { with: withPubkey } = req.query;
  if (!withPubkey) return res.status(400).json({ error: 'Missing with param' });
  try {
    const msgs = await dbAll(`
      SELECT * FROM direct_messages
      WHERE (sender_pubkey = ? AND recipient_pubkey = ?)
         OR (sender_pubkey = ? AND recipient_pubkey = ?)
      ORDER BY timestamp ASC LIMIT 200`,
      [pubkey, withPubkey, withPubkey, pubkey]
    );
    res.json(msgs);
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

// FIXED: DMs now require sender_signature to prevent impersonation
router.post('/', requireAgeVerified, async (req, res) => {
  const { sender_pubkey, recipient_pubkey, content, sender_signature } = req.body;
  if (!sender_pubkey || !recipient_pubkey || !content)
    return res.status(400).json({ error: 'Missing fields' });
  if (!validateLength(content, 'dm_content'))
    return res.status(400).json({ error: 'content_too_long', max: LIMITS.dm_content });
  // Verify sender actually controls the pubkey they claim
  if (!sender_signature) return res.status(400).json({ error: 'sender_signature required' });
  const payload = JSON.stringify({ content, sender_pubkey, recipient_pubkey });
  const sigValid = await verifySenderSignature(payload, sender_signature, sender_pubkey);
  if (!sigValid) return res.status(403).json({ error: 'invalid_sender_signature' });
  try {
    const id = crypto.randomUUID();
    const ts = Date.now();
    await dbRun(
      'INSERT INTO direct_messages (id, sender_pubkey, recipient_pubkey, content, timestamp, read) VALUES (?, ?, ?, ?, ?, 0)',
      [id, sender_pubkey, recipient_pubkey, content, ts]
    );
    const msg = { id, sender_pubkey, recipient_pubkey, content, timestamp: ts };
    broadcastTo(recipient_pubkey, { type: 'dm', msg });
    await createNotification(recipient_pubkey, 'dm', { sender: sender_pubkey, preview: content.slice(0, 80) });
    res.status(201).json(msg);
  } catch (e) {
    console.error('[DM] send error:', e.message);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/:msgId/read', requireAgeVerified, async (req, res) => {
  try {
    await dbRun('UPDATE direct_messages SET read = 1 WHERE id = ?', [req.params.msgId]);
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

module.exports = router;
