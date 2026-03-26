import React, { useState } from 'react';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function SearchView({ onViewProfile }) {
  const [query, setQuery] = useState('');

  return (
    <div style={{ padding: '2rem', background: '#07060f', minHeight: '100vh', color: '#f1f1f7' }}>

      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'monospace', fontSize: 18, color: '#5b8cff', letterSpacing: 2 }}>SEARCH</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Find signals, rooms, and identities</p>
      </header>

      {/* Search input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(91,140,255,0.2)',
        borderRadius: 12, padding: '10px 16px', marginBottom: '2rem',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}><SearchIcon /></span>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search rooms, signals, fingerprints…"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#f1f1f7', fontSize: 14, fontFamily: 'monospace',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16 }}>×</button>
        )}
      </div>

      {/* Empty state */}
      {!query && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '45vh', gap: 12, opacity: 0.4 }}>
          <SearchIcon />
          <p style={{ fontFamily: 'monospace', color: '#5b8cff', fontSize: 13 }}>Start typing to search</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            {['#general', '#aether', '#dev', '#privacy'].map(tag => (
              <button key={tag} onClick={() => setQuery(tag)} style={{
                padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(91,140,255,0.25)',
                background: 'rgba(91,140,255,0.08)', color: '#5b8cff',
                fontSize: 12, fontFamily: 'monospace', cursor: 'pointer',
              }}>{tag}</button>
            ))}
          </div>
        </div>
      )}

      {/* Results placeholder */}
      {query && (
        <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 13, textAlign: 'center', marginTop: '4rem' }}>
          Searching for &ldquo;{query}&rdquo;…
          <br /><span style={{ fontSize: 11, marginTop: 8, display: 'block' }}>Backend search coming soon</span>
        </div>
      )}
    </div>
  );
}
