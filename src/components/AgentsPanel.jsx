import React, { useState, useEffect } from 'react';

const AGENTS = [
  {
    id: 'watchdog',
    name: 'Watchdog',
    icon: '\ud83d\udc41',
    role: 'System health observer',
    desc: 'Monitors processes and detects failures in real time.',
    accent: 'var(--accent3)',
    accentBg: 'rgba(0,255,178,0.06)',
    accentBorder: 'rgba(0,255,178,0.18)',
  },
  {
    id: 'overseer',
    name: 'Overseer',
    icon: '\ud83d\udee1\ufe0f',
    role: 'Recovery & policy enforcer',
    desc: 'Decides what to do when something fails \u2014 restart, isolate, or escalate.',
    accent: 'var(--accent1)',
    accentBg: 'rgba(0,212,255,0.06)',
    accentBorder: 'rgba(0,212,255,0.18)',
  },
  {
    id: 'codex',
    name: 'Codex',
    icon: '\ud83e\udde0',
    role: 'Behavior auditor & analyst',
    desc: 'Analyzes events, audits behavior, and reports system state.',
    accent: 'var(--accent2)',
    accentBg: 'rgba(122,92,255,0.06)',
    accentBorder: 'rgba(122,92,255,0.18)',
  },
];

const STATUS_CYCLE = ['online', 'online', 'online', 'syncing', 'online', 'online', 'idle'];

function useAgentStatus(id) {
  const [status, setStatus] = useState('online');
  const [uptime, setUptime] = useState(() => Math.floor(Math.random() * 9000) + 100);

  useEffect(() => {
    const tick = setInterval(() => {
      setUptime(u => u + 1);
      setStatus(STATUS_CYCLE[Math.floor(Math.random() * STATUS_CYCLE.length)]);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(tick);
  }, [id]);

  return { status, uptime };
}

function AgentCard({ agent }) {
  const { status, uptime } = useAgentStatus(agent.id);
  const mins = String(Math.floor(uptime / 60)).padStart(2, '0');
  const secs = String(uptime % 60).padStart(2, '0');

  const dotColor = status === 'online' ? 'var(--accent3)'
    : status === 'syncing' ? 'var(--accent1)'
    : 'var(--text-muted)';

  const dotGlow = status === 'online' ? '0 0 8px rgba(0,255,178,0.7)'
    : status === 'syncing' ? '0 0 8px rgba(0,212,255,0.7)'
    : 'none';

  return (
    <div className="agent-card" style={{ borderColor: agent.accentBorder, background: agent.accentBg }}>
      <div className="agent-card-top">
        <div className="agent-icon" style={{ borderColor: agent.accentBorder }}>{agent.icon}</div>
        <div className="agent-info">
          <span className="agent-name" style={{ color: agent.accent }}>{agent.name}</span>
          <span className="agent-role">{agent.role}</span>
        </div>
        <div className="agent-status-dot" style={{ background: dotColor, boxShadow: dotGlow }} />
      </div>
      <p className="agent-desc">{agent.desc}</p>
      <div className="agent-footer">
        <span className="agent-status-label" style={{ color: dotColor }}>
          {status === 'online' ? '\u25cf ONLINE' : status === 'syncing' ? '\u21bb SYNCING' : '\u25cb IDLE'}
        </span>
        <span className="agent-uptime">UP {mins}:{secs}</span>
      </div>
    </div>
  );
}

export function AgentsPanel() {
  return (
    <div className="agents-panel">
      <div className="agents-panel-header">
        <h2 className="agents-panel-title">Aether Agents</h2>
        <p className="agents-panel-sub">Core · Running headless · Independent</p>
      </div>
      <div className="agents-grid">
        {AGENTS.map(a => <AgentCard key={a.id} agent={a} />)}
      </div>
      <div className="agents-arch-note">
        <span className="agents-arch-dot" />
        <span>Core runs independent of Connect. No single point of failure.</span>
      </div>
    </div>
  );
}

export default AgentsPanel;
