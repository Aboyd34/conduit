import { useEffect, useRef, useState, useCallback } from 'react';

// Auto-detect the correct WebSocket URL:
// - If VITE_WS_URL is explicitly set, use it
// - Otherwise derive from the current page URL (works on Render, Vercel, any host)
function getWsUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/ws`;
}

const MAX_RETRIES = 10;
const BASE_DELAY_MS = 3000;
const MAX_DELAY_MS = 30000;

export function useConduitSocket() {
  const [posts, setPosts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [offline, setOffline] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const retryCount = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (retryCount.current >= MAX_RETRIES) {
      console.warn('[Conduit] WebSocket max retries reached — backend offline');
      setOffline(true);
      return;
    }

    const WS_URL = getWsUrl();
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setOffline(false);
      retryCount.current = 0;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      console.log('[Conduit] Connected to', WS_URL);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'init') {
          setPosts(data.posts);

        } else if (data.type === 'new_post') {
          setPosts((prev) => [data.post, ...prev].slice(0, 100));

        } else if (data.type === 'new_reply') {
          setPosts((prev) => prev.map((p) =>
            p.id === data.postId
              ? { ...p, replies: [...(p.replies || []), data.reply] }
              : p
          ));

        } else if (data.type === 'signal_update') {
          setPosts((prev) => prev.map((p) =>
            p.id === data.postId ? { ...p, signals: data.count } : p
          ));

        } else if (data.type === 'amplify_update') {
          setPosts((prev) => prev.map((p) =>
            p.id === data.postId ? { ...p, amplifies: data.count } : p
          ));
        }
      } catch (e) {
        console.error('[Conduit] WS parse error:', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      retryCount.current += 1;
      const delay = Math.min(BASE_DELAY_MS * 2 ** (retryCount.current - 1), MAX_DELAY_MS);
      console.log(`[Conduit] WS closed, retrying in ${delay}ms (attempt ${retryCount.current})`);
      reconnectTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = (err) => {
      console.error('[Conduit] WS error:', err);
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { posts, connected, offline };
}
