import React from 'react';

const TOKEN_TABLE = [
  { bucket: 'Founder allocation', pct: '25%', purpose: 'Builder upside, long-term ownership' },
  { bucket: 'Ecosystem reserve',  pct: '40%', purpose: 'Rewards, partnerships, growth' },
  { bucket: 'Treasury / runway',  pct: '20%', purpose: 'Hosting, ops, contractors, audits' },
  { bucket: 'Early supporters',   pct: '10%', purpose: 'Builders, collaborators, early believers' },
  { bucket: 'Community rewards',  pct: '5%',  purpose: 'Activity, referrals, room participation' },
];

const SECTIONS = [
  {
    id: 'why',
    icon: '\u26a1',
    title: 'Why I built this',
    accent: 'var(--accent2)',
    body: [
      'I built Conduit because I wanted a place to communicate that didn\'t treat the user as the product.',
      'Every major platform today — every chat app, every social feed, every messaging tool — is built around one assumption: that your identity, your behavior, and your data are assets to be collected, stored, and monetized by someone else.',
      'Conduit is my answer to that. A communication platform that is privacy-first by architecture, not by policy. One where your identity is generated locally in your own browser, your posts are signed and relayed without being stored against your name, and the server is a relay — not a record keeper.',
      'No accounts. No email. No password. No profile that someone else owns. Just communication.',
    ],
  },
  {
    id: 'what',
    icon: '\ud83d\udce1',
    title: 'What Conduit is',
    accent: 'var(--accent1)',
    bullets: [
      'Anyone can use it.',
      'Your identity is a cryptographic keypair generated in your browser on first visit.',
      'Posts are signed with that key and relayed through the network. The relay never knows who you are.',
      'Your keys live in your browser\u2019s local storage. Not on our servers. Not in a database.',
      'Clearing your browser data removes your local identity. There is no recovery unless you back it up yourself.',
    ],
    note: 'This is intentional. Conduit is not trying to hold your data. It is trying to not have it.',
  },
  {
    id: 'aether',
    icon: '\ud83d\udd36',
    title: 'What Aether is',
    accent: 'var(--accent2)',
    body: [
      'Aether is the premium layer built on top of Conduit.',
      'If Conduit is the open road, Aether is the private room at the end of it.',
    ],
    bullets: [
      'Access to the #aether holder-only room',
      'Governance-adjacent tools and signals',
      'Exclusive drops and early access',
      'Higher-signal utilities built for builders and serious participants',
    ],
    note: 'Aether is not required to use Conduit. It is a choice — a way to go deeper into the ecosystem if you want to.',
  },
  {
    id: 'money',
    icon: '\ud83d\udcb0',
    title: 'How money works',
    accent: 'var(--accent3)',
    body: [
      'I\u2019m the builder. I\u2019m also the owner. That means I need to be paid for my time.',
      'Conduit is free. Always. The open layer stays open.',
      'Aether creates value. Token access, premium features, exclusive rooms, and drops create a real money layer tied to participation — not to selling user data.',
    ],
    tokenTable: true,
  },
  {
    id: 'arch',
    icon: '\ud83d\udee1\ufe0f',
    title: 'How the system stays running',
    accent: 'var(--accent1)',
    body: [
      'Conduit is built so that no single part depends on every other part.',
      'The backend relay can run headlessly without a UI. The frontend can function without the backend if needed. The identity system is local. The token layer is optional.',
    ],
    bullets: [
      'If one thing breaks, the rest keeps going.',
      'If I disappear, the architecture doesn\u2019t collapse.',
      'If the community grows, the system can scale without being rewritten.',
    ],
    note: 'That\u2019s not an accident. That\u2019s the design.',
  },
  {
    id: 'who',
    icon: '\ud83d\udc64',
    title: 'Who this is for',
    accent: 'var(--accent2)',
    body: [
      'Conduit is for people who are tired of platforms that watch them.',
      'Aether is for people who want to go further — builders, holders, early believers who want a stake in something being built with intention.',
      'If that\u2019s you, you\u2019re in the right place.',
    ],
  },
];

export function FounderView() {
  return (
    <div className="founder-view">
      {/* Hero */}
      <div className="founder-hero">
        <div className="founder-hero-badge">FOUNDER NOTE</div>
        <h1 className="founder-hero-title">
          Conduit<span style={{color:'var(--accent3)'}}>.</span>
        </h1>
        <p className="founder-hero-sub">Written by the builder and owner &middot; March 2026</p>
        <p className="founder-hero-lead">
          A communication platform that is privacy-first by architecture, not by policy.
        </p>
      </div>

      {/* Sections */}
      <div className="founder-sections">
        {SECTIONS.map(s => (
          <div key={s.id} className="founder-section">
            <div className="founder-section-head">
              <span className="founder-section-icon" style={{color: s.accent}}>{s.icon}</span>
              <h2 className="founder-section-title" style={{color: s.accent}}>{s.title}</h2>
            </div>
            {s.body && s.body.map((p, i) => (
              <p key={i} className="founder-body">{p}</p>
            ))}
            {s.bullets && (
              <ul className="founder-bullets">
                {s.bullets.map((b, i) => (
                  <li key={i}><span className="founder-bullet-dot" style={{background: s.accent}} />{b}</li>
                ))}
              </ul>
            )}
            {s.tokenTable && (
              <div className="founder-token-table">
                <div className="founder-table-header">
                  <span>Bucket</span><span>%</span><span>Purpose</span>
                </div>
                {TOKEN_TABLE.map((row, i) => (
                  <div key={i} className="founder-table-row">
                    <span className="founder-table-bucket">{row.bucket}</span>
                    <span className="founder-table-pct" style={{color:'var(--accent3)'}}>{row.pct}</span>
                    <span className="founder-table-purpose">{row.purpose}</span>
                  </div>
                ))}
              </div>
            )}
            {s.note && <p className="founder-note">{s.note}</p>}
          </div>
        ))}
      </div>

      {/* Not building / building */}
      <div className="founder-dual">
        <div className="founder-dual-card founder-dual-card--no">
          <h3>What I&#39;m <span style={{color:'#ef4444'}}>not</span> building</h3>
          <ul>
            <li>A platform that sells your attention to advertisers</li>
            <li>A social network that owns your identity</li>
            <li>A product that requires your trust instead of earning it</li>
            <li>A fragile monolith that breaks when one piece fails</li>
          </ul>
        </div>
        <div className="founder-dual-card founder-dual-card--yes">
          <h3>What I <span style={{color:'var(--accent3)'}}>am</span> building</h3>
          <ul>
            <li>A communication tool built for people who value privacy</li>
            <li>A token ecosystem where access is earned, not assumed</li>
            <li>An architecture that cooperates instead of clings</li>
            <li>Something that can grow without being rebuilt from scratch</li>
          </ul>
        </div>
      </div>

      {/* Footer stamp */}
      <div className="founder-stamp">
        <span className="founder-stamp-dot" />
        <span>Built independently. Launched March 2026. This document is the record of intent.</span>
      </div>
    </div>
  );
}

export default FounderView;
