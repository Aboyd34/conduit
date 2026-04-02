import React, { useState } from 'react';

const INITIAL_SIGNALS = [
  { tag: '#ZK',      text: 'Zero-knowledge thread',     delta: '+14', trend: 'up' },
  { tag: '#E2E',     text: 'Encryption protocol debate', delta: '+9',  trend: 'up' },
  { tag: '#Mesh',    text: 'P2P routing breakthrough',   delta: '+7',  trend: 'up' },
  { tag: '#Privacy', text: 'Browser fingerprint bypass', delta: '+5',  trend: 'up' },
  { tag: '#OpSec',   text: 'OPSEC thread gaining traction', delta: '+3', trend: 'up' },
];

export default function IntelPanel() {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside
      className="intel-panel"
      aria-label="Intel panel"
      style={{
        width: expanded ? 224 : 0,
        minWidth: expanded ? 224 : 0,
        overflow: 'hidden',
        transition: 'width 0.25s cubic-bezier(0.16,1,0.3,1), min-width 0.25s cubic-bezier(0.16,1,0.3,1)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Trending Signals</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>Live activity</p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setExpanded(false)}
          aria-label="Collapse intel panel"
          style={{ padding: '4px 6px' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      {/* Signal list */}
      <div
        role="list"
        aria-label="Trending topics"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          padding: 'var(--space-2) var(--space-2)',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {INITIAL_SIGNALS.map((s, i) => (
          <button
            key={s.tag}
            role="listitem"
            className="intel-signal-row"
            aria-label={`${s.tag}: ${s.text}, ${s.delta}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-2)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background var(--transition), border-color var(--transition)',
              animationDelay: `${i * 50}ms`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface-raised)';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <span style={{
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--primary)',
              flexShrink: 0,
              marginTop: 1,
              fontWeight: 600,
            }}>{s.tag}</span>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              flex: 1,
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>{s.text}</p>
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--success)',
              flexShrink: 0,
              fontFamily: 'var(--font-mono)',
            }}>{s.delta}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
