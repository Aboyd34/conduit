import React, { useState, useEffect } from "react";

export default function AdminShell({ conduit, session }) {
  const [tab, setTab] = useState("overview");
  const [health, setHealth] = useState(null);
  const [peers, setPeers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [logs, setLogs] = useState([]);

  // Fetch system health
  useEffect(() => {
    fetch("/api/health", {
      headers: { "x-age-token": localStorage.getItem("age_token") || "" }
    })
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {});
  }, []);

  // Fetch peers
  useEffect(() => {
    fetch("/api/peers", {
      headers: { "x-age-token": localStorage.getItem("age_token") || "" }
    })
      .then((r) => r.json())
      .then(setPeers)
      .catch(() => {});
  }, []);

  // Fetch rooms
  useEffect(() => {
    fetch("/api/rooms", {
      headers: { "x-age-token": localStorage.getItem("age_token") || "" }
    })
      .then((r) => r.json())
      .then(setRooms)
      .catch(() => {});
  }, []);

  // Fake logs (you can wire real logs later)
  useEffect(() => {
    setLogs([
      { ts: Date.now(), msg: "Admin console initialized" },
      { ts: Date.now() - 5000, msg: "WebSocket clients connected: " + (conduit?.onlineMap ? Object.keys(conduit.onlineMap).length : 0) },
      { ts: Date.now() - 10000, msg: "System health check OK" }
    ]);
  }, [conduit]);

  return (
    <div className="admin-shell">
      <div className="admin-sidebar">
        {[
          ["overview", "Overview"],
          ["health", "System Health"],
          ["peers", "Peers"],
          ["rooms", "Rooms"],
          ["logs", "Logs"],
          ["ai", "AI & Automation"]
        ].map(([id, label]) => (
          <button
            key={id}
            className={`admin-tab ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === "overview" && <AdminOverview health={health} peers={peers} rooms={rooms} />}
        {tab === "health" && <AdminHealth health={health} />}
        {tab === "peers" && <AdminPeers peers={peers} />}
        {tab === "rooms" && <AdminRooms rooms={rooms} />}
        {tab === "logs" && <AdminLogs logs={logs} />}
        {tab === "ai" && <AdminAI />}
      </div>
    </div>
  );
}

/* ------------------------------
   SUBCOMPONENTS
------------------------------ */

function AdminOverview({ health, peers, rooms }) {
  return (
    <div className="admin-section">
      <div className="admin-title">OVERVIEW</div>

      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-value">{peers.length}</div>
          <div className="admin-card-label">Peers</div>
        </div>

        <div className="admin-card">
          <div className="admin-card-value">{rooms.length}</div>
          <div className="admin-card-label">Rooms</div>
        </div>

        <div className="admin-card">
          <div className="admin-card-value">{health?.ws_clients || 0}</div>
          <div className="admin-card-label">WS Clients</div>
        </div>
      </div>
    </div>
  );
}

function AdminHealth({ health }) {
  return (
    <div className="admin-section">
      <div className="admin-title">SYSTEM HEALTH</div>

      {!health && <div className="admin-empty">Loading…</div>}

      {health && (
        <div className="admin-kv">
          <div><b>Status:</b> {health.status}</div>
          <div><b>Uptime:</b> {Math.floor(health.uptime / 60)} min</div>
          <div><b>WS Clients:</b> {health.ws_clients}</div>
          <div><b>Timestamp:</b> {new Date(health.timestamp).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}

function AdminPeers({ peers }) {
  return (
    <div className="admin-section">
      <div className="admin-title">PEERS</div>

      {peers.length === 0 && <div className="admin-empty">No peers.</div>}

      {peers.map((p) => (
        <div key={p.pubkey} className="admin-row">
          <div className="admin-row-main">
            <div className="admin-row-key">{p.pubkey.slice(0, 12)}…</div>
            <div className="admin-row-sub">{p.status}</div>
          </div>
          <div className="admin-row-time">
            {new Date(p.lastSeen).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminRooms({ rooms }) {
  return (
    <div className="admin-section">
      <div className="admin-title">ROOMS</div>

      {rooms.length === 0 && <div className="admin-empty">No rooms.</div>}

      {rooms.map((r) => (
        <div key={r.id} className="admin-row">
          <div className="admin-row-main">
            <div className="admin-row-key">#{r.name}</div>
            <div className="admin-row-sub">{r.description}</div>
          </div>
          <div className="admin-row-time">
            {new Date(r.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminLogs({ logs }) {
  return (
    <div className="admin-section">
      <div className="admin-title">LOGS</div>

      {logs.map((l, i) => (
        <div key={i} className="admin-log">
          <span className="admin-log-time">
            {new Date(l.ts).toLocaleTimeString()}
          </span>
          <span className="admin-log-msg">{l.msg}</span>
        </div>
      ))}
    </div>
  );
}

function AdminAI() {
  return (
    <div className="admin-section">
      <div className="admin-title">AI & AUTOMATION</div>
      <div className="admin-empty">Coming soon.</div>
    </div>
  );
}
