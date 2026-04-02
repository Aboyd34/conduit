import React, { useState, useCallback } from 'react';
import './FeedCard.css';

/* ─── Media grid ─── */
function MediaGrid({ media = [] }) {
  if (!media.length) return null;
  const visible = media.slice(0, 4);
  const overflow = media.length - 4;
  return (
    <div className={`feed-media-grid feed-media-grid--${Math.min(visible.length, 4)}`}>
      {visible.map((src, i) => (
        <div key={i} className="feed-media-cell">
          <img src={src} alt="" loading="lazy" />
          {i === 3 && overflow > 0 && (
            <div className="feed-media-overflow">+{overflow}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Reactions bar ─── */
const REACTIONS = [
  { emoji: '👍', label: 'like' },
  { emoji: '🔥', label: 'fire' },
  { emoji: '💡', label: 'insight' },
  { emoji: '🔒', label: 'secure' },
];

function ReactionPicker({ onReact }) {
  return (
    <div className="reaction-picker" role="menu" aria-label="Pick a reaction">
      {REACTIONS.map(r => (
        <button key={r.label} className="reaction-option" onClick={() => onReact(r.label)} aria-label={r.label}>
          {r.emoji}
        </button>
      ))}
    </div>
  );
}

/* ─── Main FeedCard ─── */
export default function FeedCard({
  post = {},
  onViewProfile,
  onComment,
  onShare,
  onFlag,
}) {
  const {
    id,
    alias       = 'Anon',
    handle      = '',
    sender      = '',
    avatar      = null,
    timestamp,
    ts,
    content     = '',
    text        = '',
    media       = [],
    signals     = 0,
    amplifies   = 0,
    comments    = 0,
    views       = 0,
    replies     = [],
    topic       = 'public',
    pubkey      = '',
    verified    = false,
  } = post;

  const [localSignals,   setLocalSignals]   = useState(Number(signals));
  const [localAmplifies, setLocalAmplifies] = useState(Number(amplifies));
  const [signaled,       setSignaled]       = useState(false);
  const [amplified,      setAmplified]      = useState(false);
  const [showReplies,    setShowReplies]    = useState(false);
  const [showReactions,  setShowReactions]  = useState(false);
  const [myReaction,     setMyReaction]     = useState(null);

  const rawTime     = timestamp || ts;
  const displayText = content || text || '';
  const displayAlias= alias || (sender ? sender.slice(0, 12) + '…' : 'Anon');
  const displayTime = rawTime
    ? new Date(rawTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'now';
  const keyShort    = pubkey ? pubkey.slice(0, 6) + '…' + pubkey.slice(-4) : null;

  const handleSignal = useCallback(() => {
    if (signaled) return;
    setSignaled(true);
    setLocalSignals(s => s + 1);
  }, [signaled]);

  const handleAmplify = useCallback(() => {
    if (amplified) return;
    setAmplified(true);
    setLocalAmplifies(a => a + 1);
  }, [amplified]);

  const handleReact = (label) => {
    setMyReaction(label);
    setShowReactions(false);
    setLocalSignals(s => s + 1);
  };

  return (
    <article className="feed-card" aria-label={`Post by ${displayAlias}`}>

      {/* ── Header ── */}
      <header className="feed-card__header">
        <button
          className="feed-card__avatar"
          onClick={() => onViewProfile && onViewProfile(sender)}
          aria-label={`View profile of ${displayAlias}`}
        >
          {avatar
            ? <img src={avatar} alt={displayAlias} width="36" height="36" />
            : <span className="feed-card__avatar-initials">{displayAlias[0].toUpperCase()}</span>
          }
          {verified && <span className="feed-card__verified" aria-label="Verified">✓</span>}
        </button>

        <div className="feed-card__meta">
          <div className="feed-card__name-row">
            <span className="feed-card__name">{displayAlias}</span>
            {handle && <span className="feed-card__handle">@{handle}</span>}
            {keyShort && (
              <span className="feed-card__key mono" title={pubkey}>Key: {keyShort}</span>
            )}
          </div>
          <div className="feed-card__sub-row">
            <time className="feed-card__time" dateTime={rawTime}>{displayTime}</time>
            <span className="chip" style={{ fontSize: '10px', padding: '1px 7px' }}>#{topic}</span>
          </div>
        </div>

        <button className="feed-card__more" aria-label="More options">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
      </header>

      {/* ── Body ── */}
      {displayText && (
        <p className="feed-card__text">{displayText}</p>
      )}

      {/* ── Media ── */}
      <MediaGrid media={media} />

      {/* ── Stats ── */}
      <div className="feed-card__stats">
        <span>⚡ {localSignals} signals</span>
        <span>💬 {comments} comments</span>
        <span>⟳ {localAmplifies} shares</span>
        <span>👁 {views} views</span>
      </div>

      {/* ── Actions ── */}
      <footer className="feed-card__actions">
        <div style={{ position: 'relative' }}>
          <button
            className={`feed-card__action ${signaled ? 'feed-card__action--active' : ''}`}
            onClick={() => !myReaction ? setShowReactions(v => !v) : handleSignal()}
            aria-label={signaled ? 'Signaled' : 'Signal this post'}
            aria-pressed={signaled}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            {myReaction ? REACTIONS.find(r => r.label === myReaction)?.emoji : 'Like'}
          </button>
          {showReactions && (
            <ReactionPicker onReact={handleReact} />
          )}
        </div>

        <button
          className="feed-card__action"
          onClick={() => onComment && onComment(id)}
          aria-label="Comment"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Comment
        </button>

        <button
          className={`feed-card__action ${amplified ? 'feed-card__action--amplified' : ''}`}
          onClick={handleAmplify}
          aria-label={amplified ? 'Amplified' : 'Amplify (repost)'}
          aria-pressed={amplified}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          Repost
        </button>

        <button
          className="feed-card__action"
          onClick={() => onShare && onShare(id)}
          aria-label="Share privately"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          Share
        </button>

        <button
          className="feed-card__action feed-card__action--flag"
          onClick={() => onFlag && onFlag(id)}
          aria-label="Flag post"
          style={{ marginLeft: 'auto' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
        </button>
      </footer>

      {/* ── Replies ── */}
      {replies.length > 0 && (
        <button
          className="feed-card__replies-toggle"
          onClick={() => setShowReplies(v => !v)}
          aria-expanded={showReplies}
        >
          {showReplies ? 'Hide' : `Show ${replies.length}`} repl{replies.length === 1 ? 'y' : 'ies'}
        </button>
      )}
      {showReplies && (
        <div className="feed-card__replies" role="list">
          {replies.map((r, i) => (
            <div key={r.id || i} className="feed-card__reply" role="listitem">
              <span className="feed-card__reply-alias mono">{r.alias || 'Anon'}</span>
              <p>{r.content || r.text || ''}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
