import React, { useState } from 'react';
import PostCard from './PostCard.jsx';

const INITIAL_POSTS = [
  { id: 1, alias: 'Vx7r..K3mZ', time: '2m',  text: 'Zero-knowledge systems are becoming viable at scale. The next wave of privacy infra is here.', signals: 42 },
  { id: 2, alias: 'Qp2f..A9wL', time: '5m',  text: 'End-to-end encryption alone is not enough. Metadata reveals more than content ever could.', signals: 27 },
  { id: 3, alias: 'Jk8n..R1xD', time: '11m', text: 'Conduit makes surveillance obsolete. Build systems that work without trusting anyone.', signals: 18 },
  { id: 4, alias: 'Tn4w..B6pE', time: '18m', text: 'Mesh routing + onion layers. Latency cost is real but worth it for true anonymity.', signals: 11 },
];

export default function Feed() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [draft, setDraft]   = useState('');
  const [sending, setSending] = useState(false);

  function handleBroadcast() {
    if (!draft.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newPost = {
        id: Date.now(),
        alias: 'You',
        time: 'just now',
        text: draft.trim(),
        signals: 0,
      };
      setPosts(prev => [newPost, ...prev]);
      setDraft('');
      setSending(false);
    }, 400);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleBroadcast();
  }

  return (
    <div className="feed-container">
      {/* Compose bar */}
      <div className="feed-compose">
        <span className="feed-compose-dot" aria-hidden="true" />
        <input
          type="text"
          className="feed-compose-input"
          placeholder="Broadcast a signal…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          maxLength={500}
          aria-label="Compose broadcast"
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={handleBroadcast}
          disabled={!draft.trim() || sending}
          aria-label="Send broadcast"
        >
          {sending ? '…' : 'Send'}
        </button>
      </div>

      {/* Post list */}
      <div className="feed-list" role="feed" aria-label="Signal feed">
        {posts.length === 0 ? (
          <div className="feed-empty">
            <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>No signals yet. Be the first to broadcast.</p>
          </div>
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} />)
        )}
      </div>

      <style>{`
        .feed-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          border-right: 1px solid var(--border);
        }
        .feed-compose {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          background: var(--surface);
        }
        .feed-compose-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--success);
          flex-shrink: 0;
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(77,255,180,0.4); }
          50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(77,255,180,0); }
        }
        .feed-compose-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: var(--text-base);
          color: var(--text-primary);
          font-family: var(--font-ui);
        }
        .feed-compose-input::placeholder { color: var(--text-muted); }
        .feed-list {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-3) var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .feed-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: var(--space-16);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
