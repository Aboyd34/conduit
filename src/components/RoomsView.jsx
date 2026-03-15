import React, { useMemo, useState } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import { PostCard } from './PostCard.jsx';
import PostBox from './PostBox.jsx';
import { AetherRoom } from './AetherRoom.jsx';
import { ROOMS, getRoomMeta, estimateOnline, getTrendingPosts } from './roomModules.js';

function RoomHeader({ room, onlineCount }) {
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
        <button className="room-action-btn">Start Thread</button>
        <button className="room-action-btn room-action-btn--ghost">Share</button>
      </div>
    </header>
  );
}

function RoomTools({ room, mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && <div className="room-drawer-overlay" onClick={onClose} />}
      <aside className={`room-tools room-tools--${room.accent} ${mobileOpen ? 'room-tools--open' : ''}`}>
        <div className="room-panel-head">
          <h3>{room.toolsTitle}</h3>
          <button className="room-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="room-tool-list">
          {room.tools.map(tool => (
            <button key={tool.label} className="room-tool-btn" type="button">
              <span className="room-tool-icon">{tool.icon}</span>
              <span className="room-tool-copy">
                <span className="room-tool-label">{tool.label}</span>
                <span className="room-tool-hint">{tool.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

function RoomSidebar({ room, posts, roomId, mobileOpen, onClose }) {
  const trending = useMemo(() => getTrendingPosts(posts, roomId), [posts, roomId]);
  return (
    <>
      {mobileOpen && <div className="room-drawer-overlay" onClick={onClose} />}
      <aside className={`room-sidebar room-sidebar--${room.accent} ${mobileOpen ? 'room-sidebar--open' : ''}`}>
        <div className="room-panel-head">
          <h3>Info</h3>
          <button className="room-panel-close" onClick={onClose}>✕</button>
        </div>
        <section className="room-side-card">
          <div className="room-panel-head"><h3>Trending</h3><span>Live</span></div>
          <ul className="room-side-list">
            {(trending.length ? trending.map(p => ({ label: (p.content||'').slice(0,72) })) : room.trending.map(t => ({ label: t })))
              .map((item, i) => <li key={i}>{item.label}</li>)}
          </ul>
        </section>
        <section className="room-side-card">
          <div className="room-panel-head"><h3>Resources</h3><span>Links</span></div>
          <ul className="room-side-list">{room.resources.map(r => <li key={r}>{r}</li>)}</ul>
        </section>
        <section className="room-side-card">
          <div className="room-panel-head"><h3>Pinned</h3><span>Context</span></div>
          <ul className="room-side-list">{room.pinned.map(p => <li key={p}>{p}</li>)}</ul>
        </section>
      </aside>
    </>
  );
}

function MobileRoomBar({ onTools, onInfo }) {
  return (
    <div className="room-mobile-bar">
      <button className="room-mobile-btn" onClick={onTools}>⚙️ Tools</button>
      <button className="room-mobile-btn" onClick={onInfo}>📊 Info</button>
    </div>
  );
}

function StandardRoom({ room, posts, onViewProfile }) {
  const filtered    = useMemo(() => posts.filter(p => (p.topic||'public') === room.id), [posts, room.id]);
  const onlineCount = useMemo(() => estimateOnline(posts, room.id), [posts, room.id]);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [infoOpen,  setInfoOpen]  = useState(false);

  return (
    <div className={`room-layout room-layout--${room.accent}`}>
      <RoomHeader room={room} onlineCount={onlineCount} />
      <MobileRoomBar onTools={() => setToolsOpen(true)} onInfo={() => setInfoOpen(true)} />
      <div className="room-grid">
        <RoomTools   room={room} mobileOpen={toolsOpen} onClose={() => setToolsOpen(false)} />
        <main className={`room-feed room-feed--${room.accent}`}>
          <div className="room-feed-compose"><PostBox /></div>
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

export function RoomsView({ onViewProfile }) {
  const { posts }    = useConduitSocket();
  const [activeRoom, setActiveRoom] = useState('public');
  const room = getRoomMeta(activeRoom);

  return (
    <div className="rooms-shell">
      <div className="rooms-rail">
        <div className="rooms-rail-header">
          <h2 className="rooms-rail-title">📡 Rooms</h2>
          <p className="rooms-rail-sub">Choose your environment</p>
        </div>
        <div className="rooms-rail-list">
          {ROOMS.map(item => {
            const count = posts.filter(p => (p.topic||'public') === item.id).length;
            return (
              <button
                key={item.id}
                className={`rooms-rail-item ${activeRoom === item.id ? 'rooms-rail-item--active' : ''} ${item.gated ? 'rooms-rail-item--gated' : ''}`}
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

      <div className="rooms-stage">
        {room.id === 'aether' ? (
          <div className={`room-layout room-layout--${room.accent}`}>
            <RoomHeader room={room} onlineCount={estimateOnline(posts, room.id)} />
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
