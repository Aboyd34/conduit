import React, { useState, useCallback } from 'react';
import { broadcastSignal, broadcastAmplify } from '../api/gateway.js';

export function PostCard({ post = {}, onViewProfile }) {
  const {
    id,
    alias = 'Anon',
    sender,
    timestamp,
    ts,
    content = '',
    text = '',
    signals = 0,
    amplifies = 0,
    replies = [],
    topic = 'public',
  } = post;

  const [localSignals,   setLocalSignals]   = useState(Number(signals));
  const [localAmplifies, setLocalAmplifies] = useState(Number(amplifies));
  const [signaled,       setSignaled]       = useState(false);
  const [amplified,      setAmplified]      = useState(false);
  const [showReplies,    setShowReplies]    = useState(false);
  const [signalPulse, setSignalPulse] = useState(false);
  const [amplifyPulse, setAmplifyPulse] = useState(false);

  // BUG FIX 1: post.timestamp field was ignored — server uses `timestamp`, client expected `ts`
  const rawTime = timestamp || ts;
  const displayText  = content || text || 'Signal incoming.';
  const displayAlias = alias || (sender ? sender.slice(0, 12) + '...' : 'Anon');
  const displayTime  = rawTime
    ? new Date(rawTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'now';

  // BUG FIX 2: signal/amplify buttons had no actual API calls — wired up
  const handleSignal = useCallback(async () => {
    if (signaled || !id) return;
    setSignalPulse(true);
    setTimeout(() => setSignalPulse(false), 160);
    setSignaled(true);
    setLocalSignals(s => s + 1);
    try { await broadcastSignal(id); } catch { /* optimistic — ignore */ }
  }, [signaled, id]);

  const handleAmplify = useCallback(async () => {
    if (amplified || !id) return;
    setAmplifyPulse(true);
    setTimeout(() => setAmplifyPulse(false), 160);
    setAmplified(true);
    setLocalAmplifies(a => a + 1);
    try { await broadcastAmplify(id); } catch { /* optimistic — ignore */ }
  }, [amplified, id]);

  return (
    <div
      className="post-card rounded-xl p-4 transition-all"
      style={{ background: '#0f0e1f', border: '1px solid #1e1e2e', marginBottom: '0.65rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff9f', display: 'inline-block' }} className="pulse" />
        <span
          style={{ color: '#52525b', fontSize: '0.75rem', fontFamily: 'Space Grotesk', cursor: onViewProfile ? 'pointer' : 'default' }}
          onClick={() => onViewProfile && onViewProfile(sender)}
        >◉ {displayAlias}</span>
        <span style={{ color: '#3f3f46', fontSize: '0.7rem', marginLeft: 'auto' }}>{displayTime}</span>
        <span style={{ color: '#2a2a3e', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 4, border: '1px solid #1e1e2e' }}>#{topic}</span>
      </div>
      <p style={{ color: '#d4d4d8', fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>{displayText}</p>
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: '#52525b' }}>
        <button
          type="button"
          style={{ background: 'none', border: 'none', color: signaled ? '#00ff9f' : 'inherit', cursor: signaled ? 'default' : 'pointer' }}
          onClick={handleSignal}
          disabled={signaled}
          className={`post-card-action${signalPulse ? ' post-card-action--pulse' : ''}`}
        >
          Signal ({localSignals})
        </button>
        <button
          type="button"
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: amplified ? '#7a5cff' : 'inherit', cursor: amplified ? 'default' : 'pointer', borderRadius: 8, padding: '2px 8px' }}
          onClick={handleAmplify}
          disabled={amplified}
          className={`post-card-action${amplifyPulse ? ' post-card-action--pulse' : ''}`}
        >
          Amplify ({localAmplifies})
        </button>
        <button
          type="button"
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'inherit', cursor: 'pointer', borderRadius: 8, padding: '2px 8px' }}
          onClick={() => setShowReplies(v => !v)}
          className="post-card-action"
        >Reply{replies.length > 0 ? ` (${replies.length})` : ''}</button>
        <button type="button" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'inherit', cursor: 'pointer', marginLeft: 'auto', borderRadius: 8, padding: '2px 8px' }}
          onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
          onMouseOut={e => e.currentTarget.style.color = '#52525b'}
          className="post-card-action"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20V4" /><path d="M4 4h11l-2.5 4L15 12H4" />
          </svg>
        </button>
      </div>
      {/* BUG FIX 3: replies array was never rendered */}
      {showReplies && replies.length > 0 && (
        <div style={{ marginTop: '0.75rem', borderLeft: '2px solid #1e1e2e', paddingLeft: '0.75rem' }}>
          {replies.map((r, i) => (
            <div key={r.id || i} style={{ marginBottom: '0.4rem', color: '#a1a1aa', fontSize: '0.8rem' }}>
              <span style={{ color: '#52525b', marginRight: '0.4rem' }}>›</span>
              {r.content || r.text || ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostCard;
