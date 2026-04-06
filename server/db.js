'use strict';
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_DIR = process.env.NODE_ENV === 'production' ? path.join(__dirname, '..', 'data') : null;
if (DB_DIR && !fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = DB_DIR ? path.join(DB_DIR, 'conduit.db') : ':memory:';

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('[DB] open error:', err.message);
  else console.log(`[DB] ${DB_PATH === ':memory:' ? 'in-memory' : DB_PATH}`);
});

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err); else resolve(this);
    });
  });
}
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); });
  });
}
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
  });
}

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA journal_mode=WAL');
      db.run('PRAGMA foreign_keys=ON');
      db.run(`CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY, value TEXT)`);
      db.run(`CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY, topic TEXT, sender_pubkey TEXT,
        payload TEXT, signature TEXT, timestamp INTEGER)`);
      db.run(`CREATE TABLE IF NOT EXISTS peers (
        pubkey TEXT PRIMARY KEY, last_seen INTEGER,
        status TEXT, connection_type TEXT, metadata TEXT)`);
      db.run(`CREATE TABLE IF NOT EXISTS communities (
        id TEXT PRIMARY KEY, name TEXT, description TEXT,
        owner_pubkey TEXT, created_at INTEGER)`);
      db.run(`CREATE TABLE IF NOT EXISTS replies (
        id TEXT PRIMARY KEY, post_id TEXT NOT NULL,
        sender_pubkey TEXT, content TEXT NOT NULL, timestamp INTEGER NOT NULL)`);
      db.run(`CREATE TABLE IF NOT EXISTS signals (
        post_id TEXT NOT NULL, sender_pubkey TEXT NOT NULL, timestamp INTEGER NOT NULL,
        PRIMARY KEY (post_id, sender_pubkey))`);
      db.run(`CREATE TABLE IF NOT EXISTS amplifies (
        post_id TEXT NOT NULL, sender_pubkey TEXT NOT NULL, timestamp INTEGER NOT NULL,
        PRIMARY KEY (post_id, sender_pubkey))`);
      db.run(`CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
        owner_pubkey TEXT NOT NULL, is_private INTEGER DEFAULT 0,
        is_gated INTEGER DEFAULT 0, aeth_required INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL)`);
      db.run(`CREATE TABLE IF NOT EXISTS room_members (
        room_id TEXT NOT NULL, pubkey TEXT NOT NULL,
        joined_at INTEGER NOT NULL, role TEXT DEFAULT 'member',
        PRIMARY KEY (room_id, pubkey))`);
      db.run(`CREATE TABLE IF NOT EXISTS room_messages (
        id TEXT PRIMARY KEY, room_id TEXT NOT NULL,
        sender_pubkey TEXT NOT NULL, content TEXT NOT NULL, timestamp INTEGER NOT NULL)`);
      db.run(`CREATE TABLE IF NOT EXISTS direct_messages (
        id TEXT PRIMARY KEY, sender_pubkey TEXT NOT NULL,
        recipient_pubkey TEXT NOT NULL, content TEXT NOT NULL,
        timestamp INTEGER NOT NULL, read INTEGER DEFAULT 0)`);
      db.run(`CREATE TABLE IF NOT EXISTS profiles (
        pubkey TEXT PRIMARY KEY, display_name TEXT, bio TEXT, avatar TEXT,
        aeth_balance INTEGER DEFAULT 0, pioneer INTEGER DEFAULT 0,
        joined_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
      db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY, recipient_pubkey TEXT NOT NULL,
        type TEXT NOT NULL, data TEXT NOT NULL,
        read INTEGER DEFAULT 0, created_at INTEGER NOT NULL)`);
      db.run(`CREATE TABLE IF NOT EXISTS aeth_ledger (
        id TEXT PRIMARY KEY, pubkey TEXT NOT NULL,
        amount INTEGER NOT NULL, reason TEXT NOT NULL,
        timestamp INTEGER NOT NULL)`, (err) => {
        if (err) reject(err); else resolve();
      });
    });
  });
}

module.exports = { db, dbRun, dbGet, dbAll, initDb };
