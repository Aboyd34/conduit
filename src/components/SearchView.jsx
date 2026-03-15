import React, { useState, useMemo } from 'react';
import { PostCard } from './PostCard.jsx';

export function SearchView({ allPosts, onViewProfile }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | posts | senders | rooms

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allPosts.filter((p) => {
      if (filter === 'posts' || filter === 'all') {
        if (p.content?.toLowerCase().includes(q)) return true;
      }
      if (filter === 'senders' || filter === 'all') {
        const sender = p.displaySender || p.sender || '';
        if (sender.toLowerCase().includes(q)) return true;
      }
      if (filter === 'rooms' || filter === 'all') {
        if ((p.topic || 'public').toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [query, filter, allPosts]);

  return (
    <div className="search-view">
      <div className="search-header">
        <h2 className="view-title">🔍 Search</h2>
        <p className="view-sub">Find signals, senders, or rooms</p>
      </div>

      <div className="search-box">
        <input
          className="search-input"
          type="text"
          placeholder="Search signals..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      <div className="search-filters">
        {['all', 'posts', 'senders', 'rooms'].map((f) => (
          <button
            key={f}
            className={`room-btn ${filter === f ? 'room-btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {query && (
        <p className="search-result-count">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </p>
      )}

      <div className="feed">
        {!query ? (
          <div className="feed-empty">
            <p className="feed-empty-icon">🔍</p>
            <p className="feed-empty-text">Type something to search</p>
            <p className="feed-empty-sub">Search across all signals in the network</p>
          </div>
        ) : results.length === 0 ? (
          <div className="feed-empty">
            <p className="feed-empty-icon">📡</p>
            <p className="feed-empty-text">No results found</p>
            <p className="feed-empty-sub">Try a different keyword or filter</p>
          </div>
        ) : (
          results.map((post) => (
            <PostCard key={post.id} post={post} onViewProfile={onViewProfile} />
          ))
        )}
      </div>
    </div>
  );
}
