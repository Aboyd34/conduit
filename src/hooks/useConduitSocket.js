import { useEffect, useRef, useState, useCallback } from 'react';

function getWsUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

const MAX_RETRIES = 10;
const BASE_DELAY_MS = 3000;
const MAX_DELAY_MS = 30000;
const PAGE_SIZE = 20;

export function useConduitSocket(onNotification) {
  const [allPosts, setAllPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [connected, setConnected] = useState(false);
  const [offline, setOffline] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const retryCount = useRef(0);
  const myPubkeyRef = useRef(null);

  // Expose setter so App can tell us who "me" is
  function setMyPubkey(key) { myPubkeyRef.current = key; }

  const posts = allPosts.slice(0, page * PAGE_SIZE);
  const hasMore = allPosts.length > page * PAGE_SIZE;

  function loadMore() {
    if (hasMore) setPage((p) => p + 1);
  }

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (retryCount.current >= MAX_RETRIES) {
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
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'init') {
          setAllPosts(data.posts);
          setPage(1);

        } else if (data.type === 'new_post') {
          setAllPosts((prev) => [data.post, ...prev].slice(0, 500));

        } else if (data.type === 'new_reply') {
          setAllPosts((prev) => prev.map((p) =>
            p.id === data.postId
              ? { ...p, replies: [...(p.replies || []), data.reply] }
              : p
          ));
          // Notify if someone replied to MY post
          const me = myPubkeyRef.current;
          if (me && onNotification) {
            setAllPosts((prev) => {
              const post = prev.find((p) => p.id === data.postId);
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
          setAllPosts((prev) => prev.map((p) =>
            p.id === data.postId ? { ...p, signals: data.count } : p
          ));
          // Notify if someone signaled MY post
          const me = myPubkeyRef.current;
          if (me && onNotification) {
            setAllPosts((prev) => {
              const post = prev.find((p) => p.id === data.postId);
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
          setAllPosts((prev) => prev.map((p) =>
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

  return { posts, allPosts, connected, offline, hasMore, loadMore, setMyPubkey };
}
