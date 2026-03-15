import React, { useState, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0B0B0C; color: #EAEAF0; font-family: 'Inter', sans-serif; height: 100vh; overflow: hidden; }
  .conduit-app { display: grid; grid-template-columns: 220px 1fr 260px; height: 100vh; overflow: hidden; }
  .sidebar { background: #0f0f11; border-right: 1px solid #1e1e24; display: flex; flex-direction: column; transition: transform 0.22s cubic-bezier(0.4,0,0.2,1); overflow: hidden; }
  .sidebar-header { padding: 18px 16px 12px; border-bottom: 1px solid #1e1e24; }
  .logo { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 700; letter-spacing: 0.12em; color: #EAEAF0; }
  .logo span { color: #00E6A8; }
  .key-badge { margin-top: 10px; background: #111116; border: 1px solid #2a2a35; border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; gap: 8px; }
  .key-dot { width: 6px; height: 6px; border-radius: 50%; background: #00E6A8; box-shadow: 0 0 6px #00E6A8; flex-shrink: 0; }
  .key-text { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #7A7A85; }
  .rooms-label { padding: 14px 16px 6px; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #7A7A85; text-transform: uppercase; }
  .room-list { padding: 0 8px; flex: 1; overflow-y: auto; }
  .room-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #7A7A85; transition: all 0.15s; margin-bottom: 2px; }
  .room-item:hover { background: #161620; color: #EAEAF0; }
  .room-item.active { background: #161620; color: #EAEAF0; border-left: 2px solid #7C5CFF; padding-left: 8px; }
  .room-item.locked { opacity: 0.5; cursor: default; }
  .room-name { display: flex; align-items: center; gap: 6px; }
  .room-hash { color: #7C5CFF; font-weight: 600; }
  .room-count { font-size: 10px; background: #1e1e28; color: #7A7A85; padding: 1px 6px; border-radius: 10px; }
  .signal-strip { margin: 8px; padding: 10px 12px; background: #111116; border: 1px solid #1e1e24; border-radius: 8px; }
  .signal-label { font-size: 9px; font-weight: 600; letter-spacing: 0.1em; color: #7C5CFF; text-transform: uppercase; margin-bottom: 6px; }
  .signal-item { font-size: 11px; color: #7A7A85; padding: 3px 0; border-bottom: 1px solid #1a1a22; }
  .signal-item:last-child { border-bottom: none; }
  .main-feed { display: flex; flex-direction: column; overflow: hidden; background: #0B0B0C; }
  .room-header { padding: 14px 20px; border-bottom: 1px solid #1e1e24; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .room-title { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
  .room-title .hash { color: #7C5CFF; }
  .room-meta { font-size: 12px; color: #7A7A85; margin-top: 2px; }
  .header-actions { display: flex; gap: 8px; }
  .btn { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; font-family: 'Inter', sans-serif; }
  .btn-ghost { background: transparent; border: 1px solid #2a2a35; color: #7A7A85; }
  .btn-ghost:hover { border-color: #7C5CFF; color: #EAEAF0; }
  .btn-primary { background: #7C5CFF; color: white; }
  .btn-primary:hover { background: #6a4ce0; }
  .feed { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
  @keyframes roomEnter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .feed.entering { animation: roomEnter 0.2s ease; }
  .post { background: #111116; border: 1px solid #1e1e24; border-radius: 12px; padding: 14px 16px; transition: border-color 0.15s; }
  .post:hover { border-color: #2a2a35; }
  .post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .post-alias { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: #EAEAF0; }
  .post-key { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #7A7A85; }
  .post-time { font-size: 11px; color: #3a3a48; margin-left: auto; }
  .post-text { font-size: 14px; color: #CCCCD8; line-height: 1.55; }
  .post-actions { display: flex; gap: 14px; margin-top: 10px; }
  .post-action { font-size: 11px; color: #3a3a48; cursor: pointer; transition: color 0.15s; background: none; border: none; font-family: 'Inter', sans-serif; }
  .post-action:hover { color: #7C5CFF; }
  .verified-badge { font-size: 10px; color: #00E6A8; margin-left: auto; }
  .compose { padding: 14px 20px; border-top: 1px solid #1e1e24; display: flex; gap: 10px; flex-shrink: 0; }
  .compose-input { flex: 1; background: #111116; border: 1px solid #2a2a35; border-radius: 10px; padding: 10px 14px; color: #EAEAF0; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.15s; }
  .compose-input:focus { border-color: #7C5CFF; }
  .compose-input::placeholder { color: #3a3a48; }
  .right-panel { background: #0f0f11; border-left: 1px solid #1e1e24; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
  .panel-section { background: #111116; border: 1px solid #1e1e24; border-radius: 10px; padding: 12px 14px; }
  .panel-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #7A7A85; text-transform: uppercase; margin-bottom: 10px; }
  .stat-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; color: #7A7A85; border-bottom: 1px solid #1a1a22; }
  .stat-row:last-child { border-bottom: none; }
  .stat-val { color: #EAEAF0; font-family: 'JetBrains Mono', monospace; }
  .pulse { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #00E6A8; box-shadow: 0 0 8px #00E6A8; margin-right: 6px; animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @media (max-width: 768px) {
    .conduit-app { grid-template-columns: 1fr; }
    .sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 240px; z-index: 100; transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .right-panel { display: none; }
  }
`;

const ROOMS = [
  { id: "general",      name: "general",      count: 18 },
  { id: "builders",     name: "builders",     count: 7  },
  { id: "privacy",      name: "privacy",      count: 4  },
  { id: "cryptography", name: "cryptography", count: 2  },
  { id: "aether",       name: "aether",       locked: true, count: 0 },
];

const SIGNALS = [
  "Someone joined #builders",
  "3 new drops in #aether",
  "New room: #cryptography",
  "18 posts in #general",
  "12 identities online",
];

const DEMO_POSTS = {
  general: [
    { alias: "cipherfox", key: "3F8A..A91C", text: "Platforms shouldn't own your identity.", time: "2m ago" },
    { alias: "voidpulse", key: "9C2B..FF01", text: "Reading without an account feels different.", time: "5m ago" },
    { alias: "nullwave",  key: "A7D1..33EA", text: "This UI just changed.", time: "9m ago" },
  ],
  builders: [
    { alias: "hexframe",  key: "2E9A..C4B1", text: "Working on the relay federation spec.", time: "1m ago" },
    { alias: "cipherfox", key: "3F8A..A91C", text: "Room links are live — share conduit.app/r/builders", time: "8m ago" },
  ],
  privacy: [
    { alias: "ghostkey", key: "F1C3..8A22", text: "Ephemeral rooms should be default.", time: "3m ago" },
  ],
  cryptography: [
    { alias: "nullwave", key: "A7D1..33EA", text: "ZK proofs for Aether access would be clean.", time: "12m ago" },
  ],
};

export default function App() {
  const [activeRoom, setActiveRoom] = useState("general");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entering, setEntering] = useState(false);
  const [posts, setPosts] = useState(DEMO_POSTS["general"]);
  const feedRef = useRef(null);

  function handleRoomClick(room) {
    if (room.locked || room.id === activeRoom) return;
    setPosts([]);
    setSidebarOpen(false);
    setActiveRoom(room.id);
    setEntering(true);
    setTimeout(() => {
      setPosts(DEMO_POSTS[room.id] || []);
      if (feedRef.current) feedRef.current.scrollTop = 0;
    }, 60);
    setTimeout(() => setEntering(false), 300);
  }

  const currentRoom = ROOMS.find(r => r.id === activeRoom);

  return (
    <>
      <style>{STYLES}</style>
      <div className="conduit-app">

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <div className="logo">CONDUIT<span>.</span></div>
            <div className="key-badge">
              <div className="key-dot" />
              <span className="key-text">3F8A..A91C · LOCAL KEY ACTIVE</span>
            </div>
          </div>
          <div className="rooms-label">Rooms</div>
          <div className="room-list">
            {ROOMS.map(room => (
              <div
                key={room.id}
                className={`room-item ${room.id === activeRoom ? "active" : ""} ${room.locked ? "locked" : ""}`}
                onClick={() => handleRoomClick(room)}
              >
                <div className="room-name">
                  <span className="room-hash">#</span>{room.name}
                  {room.locked && <span> 🔒</span>}
                </div>
                {room.count > 0 && <span className="room-count">{room.count}</span>}
              </div>
            ))}
          </div>
          <div className="signal-strip">
            <div className="signal-label">⚡ Signals</div>
            {SIGNALS.map((s, i) => (
              <div key={i} className="signal-item">{s}</div>
            ))}
          </div>
        </aside>

        <div className="main-feed">
          <div className="room-header">
            <div>
              <div className="room-title">
                <span className="hash">#</span>{currentRoom?.name}
              </div>
              <div className="room-meta">
                <span className="pulse" />{currentRoom?.count || 0} posts today · relay active
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-ghost">Share</button>
              <button className="btn btn-primary">+ Thread</button>
            </div>
          </div>

          <div ref={feedRef} className={`feed ${entering ? "entering" : ""}`}>
            {posts.map((post, i) => (
              <div key={i} className="post">
                <div className="post-header">
                  <span className="post-alias">{post.alias}</span>
                  <span className="post-key">{post.key}</span>
                  <span className="post-time">{post.time}</span>
                </div>
                <div className="post-text">{post.text}</div>
                <div className="post-actions">
                  <button className="post-action">signal ↑</button>
                  <button className="post-action">reply</button>
                  <button className="post-action">quote</button>
                  <button className="post-action">copy hash</button>
                  <span className="verified-badge">✓ signed</span>
                </div>
              </div>
            ))}
          </div>

          <div className="compose">
            <input
              className="compose-input"
              placeholder="Your message is signed locally and relayed — not stored..."
            />
            <button className="btn btn-primary">Send</button>
          </div>
        </div>

        <aside className="right-panel">
          <div className="panel-section">
            <div className="panel-label">Network Pulse</div>
            <div className="stat-row"><span>Rooms active</span><span className="stat-val">5</span></div>
            <div className="stat-row"><span>Posts today</span><span className="stat-val">41</span></div>
            <div className="stat-row"><span>Identities online</span><span className="stat-val">12</span></div>
            <div className="stat-row"><span>Relays online</span><span className="stat-val">3</span></div>
          </div>
          <div className="panel-section">
            <div className="panel-label">Your Identity</div>
            <div className="stat-row"><span>Key</span><span className="stat-val">3F8A..A91C</span></div>
            <div className="stat-row"><span>Posts signed</span><span className="stat-val">421</span></div>
            <div className="stat-row"><span>Rooms joined</span><span className="stat-val">4</span></div>
            <div className="stat-row"><span>First seen</span><span className="stat-val">Mar 2026</span></div>
          </div>
          <div className="panel-section">
            <div className="panel-label">Aether</div>
            <div className="stat-row"><span>Status</span><span style={{color:"#7A7A85"}}>Locked 🔒</span></div>
            <div className="stat-row"><span>Required</span><span className="stat-val">100 AETH</span></div>
            <div className="stat-row"><span>Balance</span><span className="stat-val">—</span></div>
          </div>
        </aside>

      </div>
    </>
  );
}
