import { useEffect, useRef, useState } from 'react';

// Stores notifications in memory + localStorage
const STORAGE_KEY = 'conduit_notifications';

function loadStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveStored(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50))); }
  catch {}
}

export function useNotifications(myPubkey) {
  const [notifications, setNotifications] = useState(() => loadStored());
  const [unread, setUnread] = useState(0);
  const seenRef = useRef(new Set(loadStored().map((n) => n.id)));

  // Called externally when a WS event arrives
  function addNotification(notif) {
    if (seenRef.current.has(notif.id)) return;
    seenRef.current.add(notif.id);
    setNotifications((prev) => {
      const next = [notif, ...prev].slice(0, 50);
      saveStored(next);
      return next;
    });
    setUnread((u) => u + 1);
  }

  function markAllRead() {
    setUnread(0);
  }

  function clearAll() {
    setNotifications([]);
    setUnread(0);
    seenRef.current = new Set();
    localStorage.removeItem(STORAGE_KEY);
  }

  return { notifications, unread, addNotification, markAllRead, clearAll };
}
