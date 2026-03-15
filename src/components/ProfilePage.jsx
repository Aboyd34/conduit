/**
 * ProfilePage — shows all posts from a specific pubkey
 * Triggered by clicking a sender name in the feed
 */

import React, { useEffect, useState } from 'react';
import { fetchFeed } from '../api/gateway.js';
import { SenderName } from './SenderName.jsx';
import { getPublicKey } from '../ConduitKeyManager.js';

export function ProfilePage({ pubkey, onClose }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const myPubkey = getPublicKey();
  const isMe = pubkey === myPubkey;

  useEffect(() => {
    fetchFeed()
      .then((all) => setPosts(all.filter((p) => p.sender === pubkey)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [pubkey]);

  return (
    <div className="profile-overlay">
      <div className="profile-card">
        <div className="profile-header">
          <button className="profile-close" onClick={onClose}>✕</button>
          <div className="profile-avatar">⚡</div>
          <div className="profile-identity">
            <SenderName senderPubkey={pubkey} />
            {isMe && <span className="profile-you-badge">You</span>}
          </div>
          <p className="profile-pubkey">{pubkey?.slice(0, 32)}...</p>
          <p className="profile-post-count">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="profile-feed">
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="text-muted">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <p className="post-content">{post.content}</p>
                <p className="post-time">{new Date(post.timestamp).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
