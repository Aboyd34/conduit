'use strict';
const { WebSocket } = require('ws');
const { dbAll } = require('./db');

const clients = new Set();
const clientMap = new Map();

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const c of clients) if (c.readyState === WebSocket.OPEN) c.send(msg);
}

function broadcastTo(pubkey, payload) {
  const ws = clientMap.get(pubkey);
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
}

async function broadcastToRoom(roomId, payload) {
  const members = await dbAll('SELECT pubkey FROM room_members WHERE room_id = ?', [roomId]);
  const msg = JSON.stringify(payload);
  for (const m of members) {
    const ws = clientMap.get(m.pubkey);
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function registerClient(ws, pubkey) {
  clients.add(ws);
  if (pubkey) clientMap.set(pubkey, ws);
}

function unregisterClient(ws, pubkey) {
  clients.delete(ws);
  if (pubkey) clientMap.delete(pubkey);
}

function getClientCount() {
  return clients.size;
}

module.exports = { clients, clientMap, broadcast, broadcastTo, broadcastToRoom, registerClient, unregisterClient, getClientCount };
