'use strict';
const crypto = require('crypto');
const { dbRun, dbGet } = require('./db');

// Per-pubkey cooldown tracking (in-memory, resets on server restart)
// Tracks last action timestamp per pubkey per action type
const actionCooldowns = new Map();

const COOLDOWNS_MS = {
  post_published: 60 * 1000,       // 1 min between post awards
  reply_received: 30 * 1000,       // 30s between reply awards
  signal_received: 10 * 1000,      // 10s between signal awards
};

function isOnCooldown(pubkey, reason) {
  const cooldownMs = COOLDOWNS_MS[reason];
  if (!cooldownMs) return false;
  const key = `${pubkey}:${reason}`;
  const last = actionCooldowns.get(key) || 0;
  const now = Date.now();
  if (now - last < cooldownMs) return true;
  actionCooldowns.set(key, now);
  return false;
}

async function awardAETH(pubkey, amount, reason) {
  if (isOnCooldown(pubkey, reason)) return;
  const profile = await dbGet('SELECT aeth_balance, pioneer FROM profiles WHERE pubkey = ?', [pubkey]);
  if (!profile) return;
  const multiplier = profile.pioneer ? 2 : 1;
  const final = amount * multiplier;
  const cap = 50000;
  const current = profile.aeth_balance || 0;
  const awarded = Math.min(final, cap - current);
  if (awarded <= 0) return;
  await dbRun('UPDATE profiles SET aeth_balance = aeth_balance + ? WHERE pubkey = ?', [awarded, pubkey]);
  await dbRun(
    'INSERT INTO aeth_ledger (id, pubkey, amount, reason, timestamp) VALUES (?, ?, ?, ?, ?)',
    [crypto.randomUUID(), pubkey, awarded, reason, Date.now()]
  );
}

module.exports = { awardAETH };
