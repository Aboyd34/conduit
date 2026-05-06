import { useEffect, useRef, useState, useCallback } from 'react';

function getWsUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.DEV || window.location.hostname === 'localhost'
    ? window.location.hostname + ':3001'
    : 'conduit-api1.onrender.com';
  return `${protocol}//${host}/ws`;
}

function getApiUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return import.meta.env.DEV || window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://conduit-api1.onrender.com';
}

const MAX_RETRIES   = 15;
const BASE_DELAY_MS = 3000;
const MAX_DELAY_MS  = 30000;
const PAGE_SIZE     = 20;
const KEEPALIVE_MS  = 9 * 60 * 1000;

let keepAliveInterval = null;
function startKeepAlive(apiUrl) {
  if (keepAliveInterval) return;
  keepAliveInterval = setInterval(() => {
    fetch(`${apiUrl}/api/health`, { method: 'GET', cache: 'no-store' }).catch(() => {});
  }, KEEPALIVE_MS);
}
function stopKeepAlive() {
  if (keepAliveInterval) { clearInterval(keepAliveInterval); keepAliveInterval = null; }
}

export function useConduitSocket(onNotification) {
  const [allPosts,  setAllPosts]  = useState([]);
  const [page,      setPage]      = useState(1);
  const [connected, setConnected] = useState(false);
  const [offline,   setOffline]   = useState(false);
  const [status,    setStatus]    = useState('connecting');
  const wsRef          = useRef(null);
  const reconnectTimer = useRef(null);
  const retryCount     = useRef(0);
  const myPubkeyRef    = useRef(null);
  const mountedRef     = useRef(true);
  // BUG FIX 8: onNotification was stale in closure — store in ref so latest callback is always used
  const onNotifRef     = useRef(onNotification);
  useEffect(() => { onNotifRef.current = onNotification; }, [onNotification]);

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

    let ws;
    try {
      ws = new WebSocket(getWsUrl());
    } catch {
      setOffline(true);
      setStatus('offline');
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setConnected(true);
      setOffline(false);
      setStatus('live');
      retryCount.current = 0;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      startKeepAlive(getApiUrl());
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'init') {
          setAllPosts(data.posts ?? []); setPage(1);
        } else if (data.type === 'new_post') {
          setAllPosts(prev => [data.post, ...prev].slice(0, 500));
        } else if (data.type === 'new_reply') {
          setAllPosts(prev => prev.map(p =>
            p.id === data.postId
              ? { ...p, replies: [...(p.replies || []), data.reply] }
              : p
          ));
          const me = myPubkeyRef.current;
          // Use ref so notification callback is never stale
          setAllPosts(prev => {
            const post = prev.find(p => p.id === data.postId);
            if (me && post && (post.displaySender === me || post.sender === me)) {
              onNotifRef.current?.({
                id: `reply-${data.reply.id}`,
                type: 'reply',
                postId: data.postId,
                preview: data.reply.content?.slice(0, 60),
                timestamp: data.reply.timestamp,
              });
            }
            return prev;
          });
        } else if (data.type === 'signal_update') {
          setAllPosts(prev => prev.map(p =>
            p.id === data.postId ? { ...p, signals: data.count } : p
          ));
          const me = myPubkeyRef.current;
          setAllPosts(prev => {
            const post = prev.find(p => p.id === data.postId);
            if (me && post && (post.displaySender === me || post.sender === me)) {
              onNotifRef.current?.({
                id: `signal-${data.postId}-${data.count}`,
                type: 'signal',
                postId: data.postId,
                preview: post.content?.slice(0, 60),
                timestamp: Date.now(),
              });
            }
            return prev;
          });
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
    fetch(`${getApiUrl()}/api/health`, { method: 'GET', cache: 'no-store' })
      .catch(() => {})
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
