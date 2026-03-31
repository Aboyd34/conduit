import React, { useState, lazy, Suspense } from 'react'
import './AdminShell.css'
import Chip from './ui/Chip.jsx'

const OverviewPanel    = lazy(() => import('../features/admin/panels/OverviewPanel.jsx'))
const UsersPanel       = lazy(() => import('../features/admin/panels/UsersPanel.jsx'))
const ModerationPanel  = lazy(() => import('../features/admin/panels/ModerationPanel.jsx'))
const LogsPanel        = lazy(() => import('../features/admin/panels/LogsPanel.jsx'))
const SystemPanel      = lazy(() => import('../features/admin/panels/SystemPanel.jsx'))

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'users',       label: 'Users' },
  { id: 'rooms',       label: 'Rooms' },
  { id: 'media',       label: 'Media' },
  { id: 'moderation',  label: 'Moderation' },
  { id: 'system',      label: 'System' },
  { id: 'logs',        label: 'Logs' },
  { id: 'ai',          label: 'AI' },
]

function Loader() {
  return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }} className="animate-pulse">Loading panel…</div>
}

function PlaceholderPanel({ tab }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      // {tab} panel — wiring in progress
    </div>
  )
}

export default function AdminShell({ conduit, session }) {
  const [activeTab, setActiveTab] = useState('overview')

  function renderPanel() {
    switch (activeTab) {
      case 'overview':   return <OverviewPanel conduit={conduit} />
      case 'users':      return <UsersPanel />
      case 'moderation': return <ModerationPanel />
      case 'logs':       return <LogsPanel />
      case 'system':     return <SystemPanel />
      default:           return <PlaceholderPanel tab={activeTab} />
    }
  }

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
              {t.label}
            </button>
          ))}
        </nav>
        <div className="admin-header-right">
          <Chip variant="success">Status: OK</Chip>
        </div>
      </div>

      <div className="admin-content">
        <Suspense fallback={<Loader />}>
          {renderPanel()}
        </Suspense>
      </div>
    </div>
  )
}
