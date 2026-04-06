'use strict';
const crypto = require('crypto');
const { Router } = require('express');
const { dbRun, dbGet, dbAll } = require('../db');
const { requireAgeVerified, verifyPostSignature, validateLength, LIMITS } = require('../auth');
const { awardAETH } = require('../aeth');
const { broadcast } = require('../ws');
const { createNotification } = require('./notifications');

const router = Router();

router.get('/feed', requireAgeVerified, async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 200');
    res.json(rows.map(r => ({ id: r.id, topic: r.topic, sender: r.sender_pubkey, content: r.payload, signature: r.signature, timestamp: r.timestamp })));
  } catch (e) {
    console.error('[Feed] GET error:', e.message);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/broadcast', requireAgeVerified, async (req, res) => {
  const { id, topic, sender, content, signature, timestamp } = req.body;
  if (!id || !content || !signature || !sender) return res.status(400).json({ error: 'Missing fields' });
  if (!validateLength(content, 'post_content'))
    return res.status(400).json({ error: 'content_too_long', max: LIMITS.post_content });
  const sigValid = await verifyPostSignature(content, signature, sender);
  if (!sigValid) return res.status(403).json({ error: 'invalid_post_signature' });
  try {
    await dbRun(
      'INSERT INTO messages (id, topic, sender_pubkey, payload, signature, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [id, topic || 'public', sender, content, signature, timestamp || Date.now()]
    );
    await awardAETH(sender, 50, 'post_published');
    broadcast({ type: 'new_post', post: { id, topic: topic || 'public', sender, content, signature, timestamp: timestamp || Date.now(), replies: [], signals: 0, amplifies: 0 } });
    res.status(201).json({ status: 'ok' });
  } catch {
    res.status(409).json({ error: 'Duplicate' });
  }
});

router.post('/:postId/reply', requireAgeVerified, async (req, res) => {
  const { postId } = req.params;
  const { content, sender } = req.body;
  if (!content || !sender) return res.status(400).json({ error: 'Missing fields' });
  if (!validateLength(content, 'reply_content'))
    return res.status(400).json({ error: 'content_too_long', max: LIMITS.reply_content });
  try {
    const post = await dbGet('SELECT id, sender_pubkey FROM messages WHERE id = ?', [postId]);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const id = crypto.randomUUID();
    const ts = Date.now();
    await dbRun('INSERT INTO replies (id, post_id, sender_pubkey, content, timestamp) VALUES (?, ?, ?, ?, ?)', [id, postId, sender, content, ts]);
    await awardAETH(post.sender_pubkey, 10, 'reply_received');
    await createNotification(post.sender_pubkey, 'reply', { postId, sender, preview: content.slice(0, 80) });
    const reply = { id, postId, sender, content, timestamp: ts };
    broadcast({ type: 'new_reply', postId, reply });
    res.status(201).json(reply);
  } catch (e) {
    console.error('[Feed] reply error:', e.message);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.get('/:postId/replies', requireAgeVerified, async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM replies WHERE post_id = ? ORDER BY timestamp ASC', [req.params.postId]);
    res.json(rows.map(r => ({ id: r.id, postId: r.post_id, sender: r.sender_pubkey, content: r.content, timestamp: r.timestamp })));
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/:postId/signal', requireAgeVerified, async (req, res) => {
  const { postId } = req.params;
  const { sender } = req.body;
  if (!sender) return res.status(400).json({ error: 'Missing sender' });
  try {
    await dbRun('INSERT INTO signals (post_id, sender_pubkey, timestamp) VALUES (?, ?, ?)', [postId, sender, Date.now()]);
    const post = await dbGet('SELECT sender_pubkey FROM messages WHERE id = ?', [postId]);
    if (post) {
      await awardAETH(post.sender_pubkey, 20, 'signal_received');
      await createNotification(post.sender_pubkey, 'signal', { postId, sender });
    }
    const row = await dbGet('SELECT COUNT(*) as cnt FROM signals WHERE post_id = ?', [postId]);
    broadcast({ type: 'signal_update', postId, count: row.cnt });
    res.status(201).json({ status: 'ok', count: row.cnt });
  } catch { res.status(409).json({ error: 'Already signaled' }); }
});

router.post('/:postId/amplify', requireAgeVerified, async (req, res) => {
  const { postId } = req.params;
  const { sender } = req.body;
  if (!sender) return res.status(400).json({ error: 'Missing sender' });
  try {
    await dbRun('INSERT INTO amplifies (post_id, sender_pubkey, timestamp) VALUES (?, ?, ?)', [postId, sender, Date.now()]);
    const row = await dbGet('SELECT COUNT(*) as cnt FROM amplifies WHERE post_id = ?', [postId]);
    broadcast({ type: 'amplify_update', postId, count: row.cnt });
    res.status(201).json({ status: 'ok', count: row.cnt });
  } catch { res.status(409).json({ error: 'Already amplified' }); }
});

module.exports = router;
