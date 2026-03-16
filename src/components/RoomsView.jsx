import React, { useMemo, useState, useCallback } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import { PostCard } from './PostCard.jsx';
import PostBox from './PostBox.jsx';
import { AetherRoom } from './AetherRoom.jsx';
import { ROOMS, getRoomMeta, estimateOnline, getTrendingPosts } from './roomModules.js';
import './PostBox.css';

/* ─── Room Header ─────────────────────────────── */
function RoomHeader({ room, onlineCount, onStartThread, onShare }) {
  return (
    <header className={`room-header room-header--${room.accent}`}>
      <div className="room-header-left">
        <div className="room-header-badge">{room.icon}</div>
        <div>
          <h2 className="room-title">{room.label}</h2>
          <p className="room-subtitle">{room.desc}</p>
        </div>
      </div>
      <div className="room-meta">
        <span className="room-meta-pill">{onlineCount} online</span>
        {room.gated && <span className="room-meta-pill room-meta-pill--aether">100 AETH</span>}
      </div>
      <div className="room-actions">
        <button className="room-action-btn" onClick={onStartThread} type="button">Start Thread</button>
        <button className="room-action-btn room-action-btn--ghost" onClick={onShare} type="button">Share</button>
      </div>
    </header>
  );
}

/* ─── Tool Button (wired) ─────────────────────── */
function ToolButton({ tool, roomId }) {
  const [active, setActive] = useState(false);
  const [msg, setMsg] = useState('');

  const handleClick = useCallback(() => {
    setActive(true);
    setTimeout(() => setActive(false), 1200);

    // actions per tool label
    switch (tool.label) {
      case 'Pinned Discussions':
      case 'Governance':
        setMsg('📌 Pinned content coming soon');
        break;
      case 'Announcements':
        setMsg('📢 No new announcements');
        break;
      case "Who's Online":
        setMsg('👥 Presence tracking active');
        break;
      case 'Quick Poll':
      case 'Vibe Check':
        setMsg('🗳️ Polls launching next update');
        break;
      case 'Wallet Panel':
        setMsg('👛 Use the wallet button in the header');
        break;
      case 'Token Tracker':
        window.open('https://www.coingecko.com', '_blank', 'noopener');
        return;
      case 'Block Explorer':
        window.open('https://basescan.org', '_blank', 'noopener');
        return;
      case 'Whale Alerts':
        window.open('https://whale-alert.io', '_blank', 'noopener');
        return;
      case 'GitHub Explorer':
        window.open('https://github.com/Aboyd34/conduit', '_blank', 'noopener');
        return;
      case 'Dev News':
        window.open('https://news.ycombinator.com', '_blank', 'noopener');
        return;
      case 'Share Code':
        setMsg('📄 Code sharing in next update');
        break;
      case 'Conduit Terminal':
        setMsg('🧠 Terminal panel coming soon');
        break;
      case 'Random Prompt': {
        const prompts = [
          'If Conduit had a sound, what would it be?',
          'What\'s the most underrated tech of the last decade?',
          'One word: the internet in 2030.',
          'What would you build if compute was free?',
          'Best anonymous post you\'ve ever seen?',
        ];
        setMsg('🎲 ' + prompts[Math.floor(Math.random() * prompts.length)]);
        break;
      }
      case 'Meme Drop':
        setMsg('🪄 Meme drops coming in next update');
        break;
      case 'Open Mic':
        setMsg('🎤 Speak freely — that\'s the whole room');
        break;
      case 'AETH Dashboard':
        setMsg('⚡ Connect wallet to see AETH balance');
        break;
      case 'Recycle Board':
        setMsg('🔥 Most recycled posts shown in feed');
        break;
      case 'Exclusive Drops':
        setMsg('🎁 Drops announced in #aether room');
        break;
      default:
        setMsg('⚙️ Coming soon');
    }
    setTimeout(() => setMsg(''), 3000);
  }, [tool.label]);

  return (
    <div className="room-tool-btn-wrap">
      <button
        className={`room-tool-btn${active ? ' room-tool-btn--active' : ''}`}
        type="button"
        onClick={handleClick}
      >
        <span className="room-tool-icon">{tool.icon}</span>
        <span className="room-tool-copy">
          <span className="room-tool-label">{tool.label}</span>
          <span className="room-tool-hint">{tool.hint}</span>
        </span>
      </button>
      {msg && <p className="room-tool-feedback">{msg}</p>}
    </div>
  );
}

/* ─── Room Tools Panel ────────────────────────── */
function RoomTools({ room, mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && <div className="room-drawer-overlay" onClick={onClose} />}
      <aside className={`room-tools room-tools--${room.accent}${mobileOpen ? ' room-tools--open' : ''}`}>
        <div className="room-panel-head">
          <h3>{room.toolsTitle}</h3>
          <button className="room-panel-close" onClick={onClose} type="button">✕</button>
        </div>
        <div className="room-tool-list">
          {room.tools.map(tool => (
            <ToolButton key={tool.label} tool={tool} roomId={room.id} />
          ))}
        </div>
      </aside>
    </>
  );
}

/* ─── Room Sidebar ────────────────────────────── */
function RoomSidebar({ room, posts, roomId, mobileOpen, onClose }) {
  const trending = useMemo(() => getTrendingPosts(posts, roomId), [posts, roomId]);
  return (
    <>
      {mobileOpen && <div className="room-drawer-overlay" onClick={onClose} />}
      <aside className={`room-sidebar room-sidebar--${room.accent}${mobileOpen ? ' room-sidebar--open' : ''}`}>
        <div className="room-panel-head">
          <h3>Info</h3>
          <button className="room-panel-close" onClick={onClose} type="button">✕</button>
        </div>
        <section className="room-side-card">
          <div className="room-panel-head"><h3>Trending</h3><span>Live</span></div>
          <ul className="room-side-list">
            {(trending.length
              ? trending.map(p => ({ label: (p.content || '').slice(0, 72) }))
              : room.trending.map(t => ({ label: t }))
            ).map((item, i) => <li key={i}>{item.label}</li>)}
          </ul>
        </section>
        <section className="room-side-card">
          <div className="room-panel-head"><h3>Resources</h3><span>Links</span></div>
          <ul className="room-side-list">
            {room.resources.map(r => <li key={r}>{r}</li>)}
          </ul>
        </section>
        <section className="room-side-card">
          <div className="room-panel-head"><h3>Pinned</h3><span>Context</span></div>
          <ul className="room-side-list">
            {room.pinned.map(p => <li key={p}>{p}</li>)}
          </ul>
        </section>
      </aside>
    </>
  );
}

/* ─── Mobile Bar ──────────────────────────────── */
function MobileRoomBar({ onTools, onInfo }) {
  return (
    <div className="room-mobile-bar">
      <button className="room-mobile-btn" onClick={onTools} type="button">⚙️ Tools</button>
      <button className="room-mobile-btn" onClick={onInfo}  type="button">📊 Info</button>
    </div>
  );
}

/* ─── Share helper ────────────────────────────── */
function shareRoom(roomLabel) {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: `Conduit ${roomLabel}`, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      // small toast via alert fallback
      const el = document.createElement('div');
      el.textContent = '🔗 Link copied!';
      Object.assign(el.style, {
        position:'fixed', bottom:'1.5rem', left:'50%', transform:'translateX(-50%)',
        background:'#7C5CFF', color:'#fff', padding:'0.5rem 1.2rem',
        borderRadius:'999px', fontSize:'0.85rem', zIndex:9999,
        fontFamily:'Space Grotesk, sans-serif', fontWeight:700,
        boxShadow:'0 4px 24px rgba(0,0,0,0.4)',
      });
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    });
  }
}

/* ─── Standard Room ───────────────────────────── */
function StandardRoom({ room, posts, onViewProfile }) {
  const filtered    = useMemo(() => posts.filter(p => (p.topic || 'public') === room.id), [posts, room.id]);
  const onlineCount = useMemo(() => estimateOnline(posts, room.id), [posts, room.id]);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [infoOpen,  setInfoOpen]  = useState(false);
  const [threadMode, setThreadMode] = useState(false);

  return (
    <div className={`room-layout room-layout--${room.accent}`}>
      <RoomHeader
        room={room}
        onlineCount={onlineCount}
        onStartThread={() => setThreadMode(v => !v)}
        onShare={() => shareRoom(room.label)}
      />
      <MobileRoomBar onTools={() => setToolsOpen(true)} onInfo={() => setInfoOpen(true)} />
      <div className="room-grid">
        <RoomTools room={room} mobileOpen={toolsOpen} onClose={() => setToolsOpen(false)} />
        <main className={`room-feed room-feed--${room.accent}`}>
          {/* Compose */}
          <div className="room-feed-compose">
            <PostBox defaultTopic={room.id} />
          </div>
          {/* Thread mode banner */}
          {threadMode && (
            <div className="room-thread-banner">
              🧵 Thread mode — your next post starts a thread in {room.label}
              <button onClick={() => setThreadMode(false)} type="button">✕</button>
            </div>
          )}
          {/* Feed */}
          <div className="room-feed-stream">
            {filtered.length === 0 ? (
              <div className="feed-empty room-empty">
                <p className="feed-empty-icon">{room.icon}</p>
                <p className="feed-empty-text">No signals in {room.label} yet.</p>
                <p className="feed-empty-sub">Be the first to transmit.</p>
              </div>
            ) : (
              filtered.map(p => <PostCard key={p.id} post={p} onViewProfile={onViewProfile} />)
            )}
          </div>
        </main>
        <RoomSidebar room={room} posts={posts} roomId={room.id} mobileOpen={infoOpen} onClose={() => setInfoOpen(false)} />
      </div>
    </div>
  );
}

/* ─── RoomsView (main export) ─────────────────── */
export function RoomsView({ onViewProfile }) {
  const { posts } = useConduitSocket();
  const [activeRoom, setActiveRoom] = useState('public');
  const room = getRoomMeta(activeRoom);

  return (
    <div className="rooms-shell">
      {/* Rail */}
      <div className="rooms-rail">
        <div className="rooms-rail-header">
          <h2 className="rooms-rail-title">📡 Rooms</h2>
          <p className="rooms-rail-sub">Choose your environment</p>
        </div>
        <div className="rooms-rail-list">
          {ROOMS.map(item => {
            const count = posts.filter(p => (p.topic || 'public') === item.id).length;
            return (
              <button
                key={item.id}
                className={`rooms-rail-item${activeRoom === item.id ? ' rooms-rail-item--active' : ''}${item.gated ? ' rooms-rail-item--gated' : ''}`}
                onClick={() => setActiveRoom(item.id)}
                type="button"
              >
                <span className="rooms-rail-icon">{item.icon}</span>
                <span className="rooms-rail-copy">
                  <span className="rooms-rail-label">{item.label}</span>
                  <span className="rooms-rail-desc">{item.desc}</span>
                </span>
                <span className="rooms-rail-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage */}
      <div className="rooms-stage">
        {room.id === 'aether' ? (
          <div className={`room-layout room-layout--${room.accent}`}>
            <RoomHeader
              room={room}
              onlineCount={estimateOnline(posts, room.id)}
              onStartThread={() => {}}
              onShare={() => shareRoom(room.label)}
            />
            <MobileRoomBar onTools={() => {}} onInfo={() => {}} />
            <div className="room-grid">
              <RoomTools room={room} mobileOpen={false} onClose={() => {}} />
              <main className="room-feed room-feed--aether">
                <AetherRoom posts={posts} onViewProfile={onViewProfile} />
              </main>
              <RoomSidebar room={room} posts={posts} roomId={room.id} mobileOpen={false} onClose={() => {}} />
            </div>
          </div>
        ) : (
          <StandardRoom room={room} posts={posts} onViewProfile={onViewProfile} />
        )}
      </div>
    </div>
  );
}
