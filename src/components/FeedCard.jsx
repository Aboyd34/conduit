import React, { useState } from 'react';
import './FeedCard.css';

export default function FeedCard({ post = {} }) {
  const {
    avatar, name, handle, timestamp, keyFragment,
    text, images = [], reactions = 0, comments = 0,
    shares = 0, views = 0
  } = post;

  const [liked, setLiked] = useState(false);

  const displayImages = images.slice(0, 4);
  const extra = images.length > 4 ? images.length - 4 : 0;

  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <div className="feed-card-avatar">
          {avatar
            ? <img src={avatar} alt={name} />
            : <span>{(name || '?')[0].toUpperCase()}</span>
          }
        </div>
        <div className="feed-card-meta">
          <span className="feed-card-name">{name || 'Anonymous'}</span>
          <span className="feed-card-handle">@{handle || 'anon'}</span>
          <span className="feed-card-dot">·</span>
          <span className="feed-card-time">{timestamp || 'now'}</span>
        </div>
        {keyFragment && (
          <span className="feed-card-key mono">Key: {keyFragment}</span>
        )}
      </div>

      {text && <p className="feed-card-text">{text}</p>}

      {displayImages.length > 0 && (
        <div className={`feed-card-images count-${Math.min(displayImages.length, 4)}`}>
          {displayImages.map((src, i) => (
            <div key={i} className="feed-card-img-wrap">
              <img src={src} alt="" />
              {extra > 0 && i === 3 && (
                <div className="feed-card-img-more">+{extra}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="feed-card-stats">
        <span>⚡ {reactions}</span>
        <span>💬 {comments}</span>
        <span>🔁 {shares}</span>
        <span>👁 {views}</span>
      </div>

      <div className="feed-card-actions">
        <button
          className={`feed-action-btn ${liked ? 'active' : ''}`}
          onClick={() => setLiked(l => !l)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Signal
        </button>
        <button className="feed-action-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Comment
        </button>
        <button className="feed-action-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          Amplify
        </button>
        <button className="feed-action-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share Privately
        </button>
      </div>
    </article>
  );
}
