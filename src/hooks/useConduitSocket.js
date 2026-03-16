import { useEffect, useRef, useState, useCallback } from 'react';

function getWsUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

function getApiUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return window.location.origin;
}

const MAX_RETRIES   = 15;
const BASE_DELAY_MS = 3000;
const MAX_DELAY_MS  = 30000;
const PAGE_SIZE     = 20;

// —— Keep-alive: ping the REST /health endpoint every 9 minutes
// Prevents Render free tier from spinning down mid-session
let keepAliveInterval = null;
function startKeepAlive() {
  if (keepAliveInterval) return;
  const API_URL = getApiUrl();
  keepAliveInterval = setInterval(() => {
    fetch(`${API_URL}/health`, { method: 'GET', cache: 'no-store' })
      .catch(() => {}); // silent — we don't care about the response
  }, 9 * 60 * 1000); // every 9 minutes
}
function stopKeepAlive() {
  if (keepAliveInterval) { clearInterval(keepAliveInterval); keepAliveInterval = null; }
}

export function useConduitSocket(onNotification) {
  const [allPosts, setAllPosts] = useState([]);
  const [page, setPage]         = useState(1);
  const [connected, setConnected] = useState(false);
  const [offline, setOffline]   = useState(false);
  const [status, setStatus]     = useState('connecting'); // 'connecting' | 'live' | 'reconnecting' | 'offline'
  const wsRef             = useRef(null);
  const reconnectTimer    = useRef(null);
  const retryCount        = useRef(0);
  const myPubkeyRef       = useRef(null);
  const mountedRef        = useRef(true);

  function setMyPubkey(key) { myPubkeyRef.current = key; }

  const posts   = allPosts.slice(0, page * PAGE_SIZE);
  const hasMore = allPosts.length > page * PAGE_SIZE;
  function loadMore() { if (hasMore) setPage(p => p + 1); }

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (retryCount.current >= MAX_RETRIES) {
      setOffline(true);
      setStatus('offline');
      stopKeepAlive();
      return;
    }

    setStatus(retryCount.current === 0 ? 'connecting' : 'reconnecting');

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setConnected(true);
      setOffline(false);
      setStatus('live');
      retryCount.current = 0;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      startKeepAlive();
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'init') {
          setAllPosts(data.posts);
          setPage(1);

        } else if (data.type === 'new_post') {
          setAllPosts(prev => [data.post, ...prev].slice(0, 500));

        } else if (data.type === 'new_reply') {
          setAllPosts(prev => prev.map(p =>
            p.id === data.postId
              ? { ...p, replies: [...(p.replies || []), data.reply] }
              : p
          ));
          const me = myPubkeyRef.current;
          if (me && onNotification) {
            setAllPosts(prev => {
              const post = prev.find(p => p.id === data.postId);
              if (post && (post.displaySender === me || post.sender === me)) {
                onNotification({
                  id: `reply-${data.reply.id}`,
                  type: 'reply',
                  postId: data.postId,
                  preview: data.reply.content?.slice(0, 60),
                  timestamp: data.reply.timestamp,
                });
              }
              return prev;
            });
          }

        } else if (data.type === 'signal_update') {
          setAllPosts(prev => prev.map(p =>
            p.id === data.postId ? { ...p, signals: data.count } : p
          ));
          const me = myPubkeyRef.current;
          if (me && onNotification) {
            setAllPosts(prev => {
              const post = prev.find(p => p.id === data.postId);
              if (post && (post.displaySender === me || post.sender === me)) {
                onNotification({
                  id: `signal-${data.postId}-${data.count}`,
                  type: 'signal',
                  postId: data.postId,
                  preview: post.content?.slice(0, 60),
                  timestamp: Date.now(),
                });
              }
              return prev;
            });
          }

        } else if (data.type === 'amplify_update') {
          setAllPosts(prev => prev.map(p =>
            p.id === data.postId ? { ...p, amplifies: data.count } : p
          ));
        }
      } catch (e) {
        console.warn('[Conduit] WS parse error:', e);
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setConnected(false);
      retryCount.current += 1;
      const delay = Math.min(BASE_DELAY_MS * 2 ** (retryCount.current - 1), MAX_DELAY_MS);
      setStatus('reconnecting');
      reconnectTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Warm up the backend immediately with an HTTP ping before WS connect
    fetch(`${getApiUrl()}/health`, { method: 'GET', cache: 'no-store' })
      .finally(() => { if (mountedRef.current) connect(); });

    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
      stopKeepAlive();
    };
  }, [connect]);

  return { posts, allPosts, connected, offline, status, hasMore, loadMore, setMyPubkey };
}
