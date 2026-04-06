'use strict';
const crypto = require('crypto');
const { Router } = require('express');
const { dbRun, dbGet, dbAll } = require('../db');
const { requireAgeVerified, verifySenderSignature, validateLength, LIMITS } = require('../auth');
const { broadcastToRoom } = require('../ws');

const router = Router();

router.get('/', requireAgeVerified, async (req, res) => {
  try {
    res.json(await dbAll('SELECT * FROM rooms WHERE is_private = 0 ORDER BY created_at DESC'));
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/', requireAgeVerified, async (req, res) => {
  const { name, description, owner_pubkey, is_private, is_gated, aeth_required } = req.body;
  if (!name || !owner_pubkey) return res.status(400).json({ error: 'Missing fields' });
  if (!validateLength(name, 'room_name'))
    return res.status(400).json({ error: 'room_name_too_long', max: LIMITS.room_name });
  if (description && !validateLength(description, 'room_description'))
    return res.status(400).json({ error: 'description_too_long', max: LIMITS.room_description });
  try {
    const id = crypto.randomUUID();
    const ts = Date.now();
    await dbRun(
      'INSERT INTO rooms (id, name, description, owner_pubkey, is_private, is_gated, aeth_required, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, description || '', owner_pubkey, is_private ? 1 : 0, is_gated ? 1 : 0, aeth_required || 0, ts]
    );
    await dbRun('INSERT INTO room_members (room_id, pubkey, joined_at, role) VALUES (?, ?, ?, ?)', [id, owner_pubkey, ts, 'owner']);
    res.status(201).json({ id, name, description, owner_pubkey, is_private, is_gated, aeth_required, created_at: ts });
  } catch (e) {
    console.error('[Rooms] create error:', e.message);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/:roomId/join', requireAgeVerified, async (req, res) => {
  const { roomId } = req.params;
  const { pubkey } = req.body;
  if (!pubkey) return res.status(400).json({ error: 'Missing pubkey' });
  try {
    const room = await dbGet('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.is_gated) {
      const profile = await dbGet('SELECT aeth_balance FROM profiles WHERE pubkey = ?', [pubkey]);
      if (!profile || profile.aeth_balance < room.aeth_required)
        return res.status(403).json({ error: 'insufficient_aeth', required: room.aeth_required, balance: profile?.aeth_balance || 0 });
    }
    await dbRun('INSERT INTO room_members (room_id, pubkey, joined_at, role) VALUES (?, ?, ?, ?)', [roomId, pubkey, Date.now(), 'member']);
    broadcastToRoom(roomId, { type: 'room_join', roomId, pubkey });
    res.status(201).json({ status: 'ok' });
  } catch { res.status(409).json({ error: 'Already a member' }); }
});

router.post('/:roomId/leave', requireAgeVerified, async (req, res) => {
  const { roomId } = req.params;
  const { pubkey } = req.body;
  if (!pubkey) return res.status(400).json({ error: 'Missing pubkey' });
  try {
    await dbRun('DELETE FROM room_members WHERE room_id = ? AND pubkey = ?', [roomId, pubkey]);
    broadcastToRoom(roomId, { type: 'room_leave', roomId, pubkey });
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.get('/:roomId/members', requireAgeVerified, async (req, res) => {
  try {
    res.json(await dbAll('SELECT pubkey, joined_at, role FROM room_members WHERE room_id = ? ORDER BY joined_at ASC', [req.params.roomId]));
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.get('/:roomId/messages', requireAgeVerified, async (req, res) => {
  const { roomId } = req.params;
  const { pubkey } = req.query;
  if (!pubkey) return res.status(400).json({ error: 'Missing pubkey query param' });
  try {
    const member = await dbGet('SELECT pubkey FROM room_members WHERE room_id = ? AND pubkey = ?', [roomId, pubkey]);
    if (!member) return res.status(403).json({ error: 'not_a_member' });
    res.json(await dbAll('SELECT * FROM room_messages WHERE room_id = ? ORDER BY timestamp DESC LIMIT 100', [roomId]));
  } catch (e) {
    res.status(500).json({ error: 'internal_server_error' });
  }
});

// FIXED: Room messages now require sender_signature to prevent impersonation
router.post('/:roomId/messages', requireAgeVerified, async (req, res) => {
  const { roomId } = req.params;
  const { sender_pubkey, content, sender_signature } = req.body;
  if (!sender_pubkey || !content) return res.status(400).json({ error: 'Missing fields' });
  if (!validateLength(content, 'room_message_content'))
    return res.status(400).json({ error: 'content_too_long', max: LIMITS.room_message_content });
  // Verify sender actually controls the pubkey
  if (!sender_signature) return res.status(400).json({ error: 'sender_signature required' });
  const payload = JSON.stringify({ content, sender_pubkey, room_id: roomId });
  const sigValid = await verifySenderSignature(payload, sender_signature, sender_pubkey);
  if (!sigValid) return res.status(403).json({ error: 'invalid_sender_signature' });
  try {
    const member = await dbGet('SELECT pubkey FROM room_members WHERE room_id = ? AND pubkey = ?', [roomId, sender_pubkey]);
    if (!member) return res.status(403).json({ error: 'not_a_member' });
    const id = crypto.randomUUID();
    const ts = Date.now();
    await dbRun('INSERT INTO room_messages (id, room_id, sender_pubkey, content, timestamp) VALUES (?, ?, ?, ?, ?)', [id, roomId, sender_pubkey, content, ts]);
    const msg = { id, roomId, sender_pubkey, content, timestamp: ts };
    broadcastToRoom(roomId, { type: 'room_message', msg });
    res.status(201).json(msg);
  } catch (e) {
    console.error('[Rooms] message error:', e.message);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

module.exports = router;
