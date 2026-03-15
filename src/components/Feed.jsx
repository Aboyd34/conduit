import React from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import { SenderName } from './SenderName.jsx';

export default function Feed() {
  const { posts, connected } = useConduitSocket();

  return (
    <div className="feed-container">
      <div className="feed-header">
        <span className={`conn-dot ${connected ? 'online' : 'offline'}`} />
        <span className="conn-label">{connected ? 'Live' : 'Reconnecting...'}</span>
      </div>

      {!posts.length ? (
        <p className="text-muted">No posts yet. Be the first.</p>
      ) : (
        <div className="feed">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <p className="post-sender">
                <SenderName senderPubkey={post.sender} />
              </p>
              <p className="post-content">{post.content}</p>
              <p className="post-time">{new Date(post.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
