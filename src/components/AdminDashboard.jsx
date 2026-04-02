import React, { useState, useMemo } from 'react';
import './AdminShell.css';

/* ─── Metric card ─── */
function MetricCard({ label, value, delta, color = 'var(--primary)', icon }) {
  return (
    <div className="admin-metric">
      <div className="admin-metric__icon" style={{ color }} aria-hidden="true">{icon}</div>
      <div className="admin-metric__body">
        <div className="admin-metric__value mono" style={{ color }}>{value}</div>
        <div className="admin-metric__label">{label}</div>
        {delta !== undefined && (
          <div className={`admin-metric__delta ${delta >= 0 ? 'up' : 'down'}`}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Progress bar ─── */
function ProgressBar({ label, value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="admin-progress">
      <div className="admin-progress__header">
        <span className="mono" style={{ color, fontSize: 'var(--text-xs)' }}>{label}</span>
        <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{value} · {pct}%</span>
      </div>
      <div className="admin-progress__track">
        <div className="admin-progress__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ─── Section header ─── */
function SectionHeader({ children }) {
  return (
    <div className="admin-section-header">{children}</div>
  );
}

const ROOM_COLORS = {
  general: '#5b8cff', dev: '#9b5cff', privacy: 'var(--success)',
  aether: 'var(--warning)', random: 'var(--danger)',
};
const TABS = [
  { id: 'overview',    label: 'Overview'    },
  { id: 'users',       label: 'Users'       },
  { id: 'rooms',       label: 'Rooms'       },
  { id: 'moderation',  label: 'Moderation'  },
  { id: 'system',      label: 'System'      },
  { id: 'logs',        label: 'Logs'        },
];

export default function AdminDashboard({ conduit = {}, session = {} }) {
  const [tab,         setTab]         = useState('overview');
  const [userSearch,  setUserSearch]  = useState('');
  const [logFilter,   setLogFilter]   = useState('');
  const [readOnly,    setReadOnly]    = useState(false);
  const [pauseSignup, setPauseSignup] = useState(false);

  const posts    = conduit.posts    || {};
  const ROOMS    = Object.keys(posts).length ? Object.keys(posts) : ['general','dev','privacy','aether','random'];

  const allPosts = useMemo(() =>
    ROOMS.flatMap(r => (posts[r] || []).map(p => ({ ...p, room: r }))),
    [posts]
  );

  const totalPosts   = allPosts.filter(p => !p.removed).length;
  const totalUsers   = new Set(allPosts.map(p => p.fingerprint)).size;
  const flaggedPosts = allPosts.filter(p => p.flagged && !p.removed);
  const activeRooms  = ROOMS.length;

  /* ── Mock log stream ── */
  const LOGS = [
    { id: 1, ts: '07:18:01', level: 'info',  actor: 'system',  msg: 'Node health check passed.' },
    { id: 2, ts: '07:17:44', level: 'warn',  actor: 'admin',   msg: 'Signup rate limit triggered.' },
    { id: 3, ts: '07:16:30', level: 'info',  actor: 'user',    msg: 'New room proposal submitted.' },
    { id: 4, ts: '07:15:12', level: 'error', actor: 'relay',   msg: 'Relay timeout: node-04.' },
    { id: 5, ts: '07:14:50', level: 'info',  actor: 'system',  msg: 'Backup completed successfully.' },
    { id: 6, ts: '07:12:03', level: 'warn',  actor: 'ai',      msg: 'Moderation model flagged 3 posts.' },
  ];
  const filteredLogs = LOGS.filter(l =>
    !logFilter || l.msg.toLowerCase().includes(logFilter.toLowerCase()) || l.level === logFilter
  );

  return (
    <div className="admin-shell">

      {/* ── Top status bar ── */}
      <div className="admin-topstrip">
        <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', fontWeight: 700, letterSpacing: '0.1em' }}>ROOT IDENTITY</span>
        <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{session?.fingerprint?.slice(0,16) || 'unverified'}…</span>
        <span className="chip success" style={{ marginLeft: 'auto' }}>Status: OK</span>
        {readOnly  && <span className="chip warning">READ-ONLY</span>}
        {pauseSignup && <span className="chip danger">SIGNUPS PAUSED</span>}
      </div>

      {/* ── Tab nav ── */}
      <nav className="admin-tabs" role="tablist" aria-label="Admin sections">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`admin-tab ${tab === t.id ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </nav>

      {/* ── Content ── */}
      <div className="admin-content" role="tabpanel">

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div className="admin-section">
            <div className="admin-metrics-row">
              <MetricCard label="Active Users"  value={totalUsers}  delta={12}  color="var(--primary)"  icon="👤" />
              <MetricCard label="Total Signals" value={totalPosts}  delta={8}   color="#5b8cff"         icon="⚡" />
              <MetricCard label="Active Rooms"  value={activeRooms} delta={0}   color="var(--success)"  icon="💬" />
              <MetricCard label="Error Rate"    value="0.3%"        delta={-2}  color="var(--danger)"   icon="⚠" />
            </div>

            <div className="admin-row-2col">
              <div className="admin-card">
                <SectionHeader>System Health</SectionHeader>
                {[
                  { label: 'CPU', value: 34, max: 100, color: 'var(--primary)' },
                  { label: 'Memory', value: 61, max: 100, color: '#9b5cff' },
                  { label: 'Storage', value: 48, max: 100, color: 'var(--warning)' },
                  { label: 'Relay latency', value: 22, max: 100, color: 'var(--success)' },
                ].map(b => <ProgressBar key={b.label} {...b} />)}
              </div>

              <div className="admin-card">
                <SectionHeader>Signals per Room</SectionHeader>
                {ROOMS.map(room => {
                  const count = (posts[room] || []).filter(p => !p.removed).length;
                  return (
                    <ProgressBar
                      key={room}
                      label={`#${room}`}
                      value={count}
                      max={Math.max(1, totalPosts)}
                      color={ROOM_COLORS[room] || 'var(--primary)'}
                    />
                  );
                })}
              </div>
            </div>

            <div className="admin-card">
              <SectionHeader>Quick Controls</SectionHeader>
              <div className="admin-controls-row">
                <button
                  className={`btn ${pauseSignup ? 'btn-danger' : 'btn-ghost'}`}
                  onClick={() => setPauseSignup(v => !v)}
                >{pauseSignup ? '▶ Resume Signups' : '⏸ Pause Signups'}</button>
                <button
                  className={`btn ${readOnly ? 'btn-danger' : 'btn-ghost'}`}
                  onClick={() => setReadOnly(v => !v)}
                >{readOnly ? '✎ Disable Read-only' : '🔒 Read-only Mode'}</button>
                <button className="btn btn-ghost">↺ Restart Relay</button>
                <button className="btn btn-ghost">⬇ Export Logs</button>
              </div>
            </div>
          </div>
        )}

        {/* ══ USERS ══ */}
        {tab === 'users' && (
          <div className="admin-section">
            <div className="admin-card">
              <SectionHeader>User Search & Management</SectionHeader>
              <input
                className="input"
                placeholder="Search by fingerprint, alias, or key…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                aria-label="Search users"
              />
              <table className="admin-table" aria-label="User list">
                <thead><tr>
                  <th>Fingerprint</th><th>Alias</th><th>Signals</th><th>Status</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {Array.from(new Set(allPosts.map(p => p.fingerprint)))
                    .filter(fp => fp && (!userSearch || fp.includes(userSearch)))
                    .slice(0, 20)
                    .map(fp => {
                      const userPosts = allPosts.filter(p => p.fingerprint === fp);
                      return (
                        <tr key={fp}>
                          <td className="mono" style={{ color: 'var(--primary)', fontSize: 'var(--text-xs)' }}>{fp?.slice(0,16)}…</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{userPosts[0]?.alias || '—'}</td>
                          <td className="mono">{userPosts.length}</td>
                          <td><span className="chip success" style={{ fontSize: '10px' }}>Active</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                              <button className="btn btn-ghost btn-sm">Rate limit</button>
                              <button className="btn btn-danger btn-sm">Lock</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  }
                  {allPosts.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ ROOMS ══ */}
        {tab === 'rooms' && (
          <div className="admin-section">
            <div className="admin-card">
              <SectionHeader>Room Management</SectionHeader>
              <table className="admin-table" aria-label="Room list">
                <thead><tr>
                  <th>Room</th><th>Signals</th><th>Members</th><th>Flags</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {ROOMS.map(room => {
                    const roomPosts = (posts[room] || []).filter(p => !p.removed);
                    const flags     = roomPosts.filter(p => p.flagged).length;
                    const members   = new Set(roomPosts.map(p => p.fingerprint)).size;
                    return (
                      <tr key={room}>
                        <td className="mono" style={{ color: ROOM_COLORS[room] || 'var(--primary)' }}>#{room}</td>
                        <td className="mono">{roomPosts.length}</td>
                        <td className="mono">{members}</td>
                        <td>{flags > 0 ? <span className="chip danger" style={{ fontSize: '10px' }}>{flags}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                            <button className="btn btn-ghost btn-sm">Slow mode</button>
                            <button className="btn btn-ghost btn-sm">Lock</button>
                            <button className="btn btn-danger btn-sm">Archive</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ MODERATION ══ */}
        {tab === 'moderation' && (
          <div className="admin-section">
            <SectionHeader>Moderation Queue — {flaggedPosts.length} flagged</SectionHeader>
            {flaggedPosts.length === 0 ? (
              <div className="admin-empty">
                <span style={{ fontSize: 32 }}>✅</span>
                <p>No flagged content. Queue is clear.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {flaggedPosts.map(post => (
                  <div key={post.id} className="admin-moditem">
                    <div className="admin-moditem__header">
                      <span className="mono" style={{ color: ROOM_COLORS[post.room], fontSize: 'var(--text-xs)' }}>#{post.room}</span>
                      <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{post.fingerprint?.slice(0,16)}…</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-1)' }}>
                        <button className="btn btn-ghost btn-sm">Dismiss</button>
                        <button className="btn btn-ghost btn-sm">Warn</button>
                        <button className="btn btn-ghost btn-sm">Restrict</button>
                        <button className="btn btn-danger btn-sm" onClick={() => conduit.removePost && conduit.removePost(post.room, post.id)}>Redact</button>
                      </div>
                    </div>
                    <p className="admin-moditem__text">{post.text || post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ SYSTEM ══ */}
        {tab === 'system' && (
          <div className="admin-section">
            <div className="admin-row-2col">
              <div className="admin-card">
                <SectionHeader>Node Health</SectionHeader>
                {[
                  { node: 'relay-01', status: 'online',  latency: '12ms' },
                  { node: 'relay-02', status: 'online',  latency: '18ms' },
                  { node: 'relay-03', status: 'online',  latency: '9ms'  },
                  { node: 'relay-04', status: 'offline', latency: '—'    },
                ].map(n => (
                  <div key={n.node} className="admin-node-row">
                    <span className="admin-node-dot" style={{ background: n.status === 'online' ? 'var(--success)' : 'var(--danger)' }} />
                    <span className="mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', flex: 1 }}>{n.node}</span>
                    <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{n.latency}</span>
                    <span className={`chip ${n.status === 'online' ? 'success' : 'danger'}`} style={{ fontSize: '10px' }}>{n.status}</span>
                  </div>
                ))}
              </div>

              <div className="admin-card">
                <SectionHeader>Error Rates (1h)</SectionHeader>
                {[
                  { label: 'Auth errors',    value: 3,  max: 100, color: 'var(--danger)'  },
                  { label: 'Relay timeouts', value: 1,  max: 100, color: 'var(--warning)' },
                  { label: 'DB misses',      value: 7,  max: 100, color: '#9b5cff'        },
                  { label: 'AI failures',    value: 0,  max: 100, color: 'var(--success)' },
                ].map(b => <ProgressBar key={b.label} {...b} />)}
              </div>
            </div>
          </div>
        )}

        {/* ══ LOGS ══ */}
        {tab === 'logs' && (
          <div className="admin-section">
            <div className="admin-card">
              <SectionHeader>Event Stream</SectionHeader>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                <input
                  className="input"
                  placeholder="Filter logs…"
                  value={logFilter}
                  onChange={e => setLogFilter(e.target.value)}
                  aria-label="Filter logs"
                  style={{ flex: 1, minWidth: 160 }}
                />
                {['','info','warn','error'].map(l => (
                  <button
                    key={l}
                    className={`btn btn-ghost btn-sm ${logFilter === l ? 'btn-primary' : ''}`}
                    onClick={() => setLogFilter(l)}
                  >{l || 'All'}</button>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>⬇ Export</button>
              </div>
              <div className="admin-log-stream" role="log" aria-live="polite" aria-label="Event log">
                {filteredLogs.map(log => (
                  <div key={log.id} className={`admin-log-row admin-log-row--${log.level}`}>
                    <span className="mono admin-log-ts">{log.ts}</span>
                    <span className={`chip ${log.level === 'error' ? 'danger' : log.level === 'warn' ? 'warning' : 'success'}`} style={{ fontSize: '10px', minWidth: 44 }}>{log.level}</span>
                    <span className="mono admin-log-actor">{log.actor}</span>
                    <span className="admin-log-msg">{log.msg}</span>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>No log entries match your filter.</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
