import React, { useState } from 'react';
import './AdminShell.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: 'users', label: 'Users', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'rooms', label: 'Rooms', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id: 'media', label: 'Media', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { id: 'moderation', label: 'Moderation', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { id: 'system', label: 'System', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
  { id: 'logs', label: 'Logs', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  { id: 'ai', label: 'AI', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
];

const METRICS = [
  { label: 'Active Users', value: '—', color: 'var(--primary)' },
  { label: 'Rooms', value: '—', color: 'var(--success)' },
  { label: 'Media Items', value: '—', color: 'var(--warning)' },
  { label: 'Error Rate', value: '0%', color: 'var(--danger)' },
];

function OverviewPanel() {
  return (
    <div className="admin-panel">
      <div className="admin-metrics">
        {METRICS.map(m => (
          <div key={m.label} className="admin-metric-card">
            <span className="admin-metric-value" style={{ color: m.color }}>{m.value}</span>
            <span className="admin-metric-label">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-title">System Health</div>
          <div className="admin-status-row"><span className="chip success">API OK</span><span className="chip success">WS OK</span><span className="chip success">DB OK</span></div>
        </div>
        <div className="admin-card">
          <div className="admin-card-title">Quick Actions</div>
          <div className="admin-actions-row">
            <button className="btn btn-ghost">Pause Signups</button>
            <button className="btn btn-ghost">Read-only Mode</button>
            <button className="btn btn-danger">Emergency Lock</button>
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-title">Moderation Queue</div>
          <p className="text-secondary" style={{fontSize:'12px'}}>No pending items.</p>
        </div>
        <div className="admin-card">
          <div className="admin-card-title">Recent Admin Sessions</div>
          <p className="text-secondary" style={{fontSize:'12px'}}>No sessions logged.</p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPanel({ tab }) {
  return (
    <div className="admin-panel">
      <div className="admin-card" style={{padding:'40px',textAlign:'center'}}>
        <p className="text-muted mono" style={{fontSize:'13px'}}>// {tab} panel — coming soon</p>
      </div>
    </div>
  );
}

export default function AdminShell() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <div className="admin-header-left">
          <span className="admin-badge">ROOT</span>
          <span className="admin-title mono">CONDUIT ADMIN</span>
        </div>
        <nav className="admin-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-header-right">
          <span className="chip success">Status: OK</span>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' ? <OverviewPanel /> : <PlaceholderPanel tab={activeTab} />}
      </div>
    </div>
  );
}
