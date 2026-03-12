import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://localhost:3000/ws';

export function useConduitSocket() {
  const [posts, setPosts] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log('[Conduit] WebSocket connected');
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
      reconnectTimer.current = setTimeout(connect, 3000);
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

  return { posts, connected };
}
