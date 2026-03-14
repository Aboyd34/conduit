import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';
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

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setOffline(false);
      retryCount.current = 0;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'init') {
          setPosts(data.posts);
        } else if (data.type === 'new_post') {
          setPosts((prev) => [data.post, ...prev].slice(0, 100));
        }
      } catch (e) {
        console.error('[Conduit] WS parse error:', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      retryCount.current += 1;
      const delay = Math.min(BASE_DELAY_MS * 2 ** (retryCount.current - 1), MAX_DELAY_MS);
      reconnectTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => ws.close();
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
