import React, { useState } from 'react';

const CODEX = [
  {
    id: 'identity',
    icon: '🔑',
    accent: 'var(--accent2)',
    title: 'Your Identity Is Yours',
    body: 'Conduit generates a cryptographic keypair in your browser. You own it. No one can impersonate you as long as you protect your keys. Do not share your private key with anyone — ever.',
  },
  {
    id: 'anonymous',
    icon: '👁️',
    accent: 'var(--accent1)',
    title: 'Anonymous Does Not Mean Unaccountable',
    body: 'Being anonymous is a right. Using anonymity to harm others is not. Every post is signed. Patterns of abuse are visible even without identity. Accountability exists without surveillance.',
  },
  {
    id: 'relay',
    icon: '📡',
    accent: 'var(--accent3)',
    title: 'The Relay Does Not Judge. The Community Does.',
    body: 'Conduit\'s server relays messages — it does not moderate them. The community signals, amplifies, and filters content. Low-signal posts fade. High-signal posts rise. That is the system.',
  },
  {
    id: 'signal',
    icon: '⚡',
    accent: 'var(--accent2)',
    title: 'Signal Is Trust',
    body: 'When you signal a post, you are vouching for it. When you amplify, you are spreading it. Use both with intention. Coordinated signal manipulation undermines the entire platform.',
  },
  {
    id: 'aether',
    icon: '🔷',
    accent: 'var(--accent3)',
    title: 'Aether Is Earned Access',
    body: 'The #aether room requires 100 AETH. That threshold exists to create a higher-signal environment — not to gatekeep conversation, but to ensure the people in the room have real stake in the platform.',
  },
];

const PROHIBITED = [
  {
    category: 'Illegal Content',
    icon: '🚫',
    severity: 'critical',
    items: [
      'Content that violates any applicable law or regulation',
      'Child sexual abuse material (CSAM) — zero tolerance, reported immediately',
      'Content that facilitates violence, trafficking, or terrorism',
      'Doxxing — publishing private personal information of real individuals',
    ],
  },
  {
    category: 'Harassment & Abuse',
    icon: '⚠️',
    severity: 'high',
    items: [
      'Targeted harassment of any individual across sessions or rooms',
      'Coordinated attacks on specific users using multiple keypairs',
      'Threats of physical harm, real or implied',
      'Sustained hostile behavior designed to drive users off the platform',
    ],
  },
  {
    category: 'Platform Manipulation',
    icon: '🤖',
    severity: 'high',
    items: [
      'Automated bots generating spam posts at scale',
      'Coordinated signal farming — artificially boosting posts through collusion',
      'Flooding rooms with low-quality content to suppress legitimate signals',
      'Impersonating the Conduit team or founder in posts',
    ],
  },
  {
    category: 'Aether Room Standards',
    icon: '🔷',
    severity: 'medium',
    items: [
      'Sharing #aether content outside the room without consent of participants',
      'Using the room to coordinate manipulation of Aether token markets',
      'Attempting to bypass the 100 AETH threshold through technical exploits',
    ],
  },
];

const ENFORCEMENT = [
  { step: '01', label: 'Signal Collapse', desc: 'Posts that violate conduct lose signal weight. The community\'s natural response suppresses them.' },
  { step: '02', label: 'Key Flagging',    desc: 'Repeat violators have their signing key flagged server-side. New posts from that key are rate-limited.' },
  { step: '03', label: 'Relay Block',     desc: 'Severe violations result in the signing key being blocked at the relay. Posts are not forwarded.' },
  { step: '04', label: 'Hard Removal',    desc: 'Illegal content (CSAM, credible violence threats) is removed immediately and reported to relevant authorities.' },
];

const SEVERITY_COLOR = {
  critical: '#ef4444',
  high:     '#f59e0b',
  medium:   'var(--accent2)',
};

export function ConductView() {
  const [openSection, setOpenSection] = useState(null);

  return (
    <div className="conduct-view">

      {/* Hero */}
      <div className="conduct-hero">
        <div className="conduct-hero-badge">RULES OF CONDUCT</div>
        <h1 className="conduct-hero-title">The Conduit Codex</h1>
        <p className="conduct-hero-sub">Privacy is a right. Accountability is a responsibility. These two things coexist here.</p>
      </div>

      {/* Codex principles */}
      <section className="conduct-section">
        <h2 className="conduct-section-title">⚡ The Codex</h2>
        <p className="conduct-section-desc">Five principles that define how Conduit works and how you operate within it.</p>
        <div className="conduct-codex-grid">
          {CODEX.map(c => (
            <div key={c.id} className="conduct-codex-card">
              <div className="conduct-codex-icon" style={{color: c.accent}}>{c.icon}</div>
              <h3 className="conduct-codex-title" style={{color: c.accent}}>{c.title}</h3>
              <p className="conduct-codex-body">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prohibited */}
      <section className="conduct-section">
        <h2 className="conduct-section-title">🚫 Prohibited Behavior</h2>
        <p className="conduct-section-desc">These behaviors will result in enforcement action up to and including permanent relay block.</p>
        <div className="conduct-prohibited">
          {PROHIBITED.map(cat => (
            <div key={cat.category} className="conduct-cat">
              <button
                className="conduct-cat-head"
                onClick={() => setOpenSection(openSection === cat.category ? null : cat.category)}
                type="button"
              >
                <span className="conduct-cat-icon">{cat.icon}</span>
                <span className="conduct-cat-name">{cat.category}</span>
                <span
                  className="conduct-cat-severity"
                  style={{background: SEVERITY_COLOR[cat.severity] + '22', color: SEVERITY_COLOR[cat.severity], border: `1px solid ${SEVERITY_COLOR[cat.severity]}44`}}
                >
                  {cat.severity}
                </span>
                <span className="conduct-cat-chevron">{openSection === cat.category ? '▲' : '▼'}</span>
              </button>
              {openSection === cat.category && (
                <ul className="conduct-cat-list">
                  {cat.items.map((item, i) => (
                    <li key={i}>
                      <span className="conduct-bullet" style={{background: SEVERITY_COLOR[cat.severity]}} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Enforcement */}
      <section className="conduct-section">
        <h2 className="conduct-section-title">🛡️ How Enforcement Works</h2>
        <p className="conduct-section-desc">Conduit does not have moderators. Enforcement is architectural and community-driven.</p>
        <div className="conduct-enforcement">
          {ENFORCEMENT.map(e => (
            <div key={e.step} className="conduct-enforce-card">
              <div className="conduct-enforce-step">{e.step}</div>
              <div className="conduct-enforce-content">
                <h3 className="conduct-enforce-label">{e.label}</h3>
                <p className="conduct-enforce-desc">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What Conduit is not */}
      <section className="conduct-section">
        <h2 className="conduct-section-title">📋 What Conduit Is Not</h2>
        <div className="conduct-nolist">
          {[
            'A platform for illegal activity of any kind',
            'A place where harassment is protected by anonymity',
            'A system that stores, sells, or monetizes your data',
            'A moderated space — the community is the filter',
            'Responsible for content posted by users',
          ].map((item, i) => (
            <div key={i} className="conduct-noitem">
              <span className="conduct-no-x">✕</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer stamp */}
      <div className="conduct-stamp">
        <span className="conduct-stamp-dot" />
        <span>Conduit Codex v1.0 · March 2026 · These rules exist to protect the platform, not control it.</span>
      </div>
    </div>
  );
}

export default ConductView;
