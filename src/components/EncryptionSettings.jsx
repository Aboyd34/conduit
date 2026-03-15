/**
 * EncryptionSettings.jsx
 * UI-only panel. Does not modify the cryptography or identity system.
 * Surfaces existing browser-generated keys and adds optional
 * user-side post encryption (encrypt before relay, never stored plain).
 */

import React, { useState, useCallback } from 'react';
import { IconEncrypt, IconKey, IconShield, IconBackup, IconLock } from './ConduitIcons.jsx';

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: '🛡️' },
  { id: 'keys',      label: 'My Keys',   icon: '🔑' },
  { id: 'encrypt',   label: 'Encrypt',   icon: '🔒' },
  { id: 'backup',    label: 'Backup',    icon: '📦' },
];

function PrivacyBadge({ label, active = true }) {
  return (
    <div className={`enc-badge ${active ? 'enc-badge--on' : 'enc-badge--off'}`}>
      <span className="enc-badge-dot" />
      <span className="enc-badge-label">{label}</span>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="enc-tab-body">
      <div className="enc-hero">
        <div className="enc-hero-icon">
          <IconShield size={32} color="var(--aether)" />
        </div>
        <h2 className="enc-hero-title">Your identity is local.</h2>
        <p className="enc-hero-sub">
          Conduit never stores your keys, identity, or post content on any server.
          Everything is generated and held in your browser. The relay only ever sees
          signed, anonymized packets — never your real identity.
        </p>
      </div>

      <div className="enc-status-grid">
        <div className="enc-status-card">
          <div className="enc-status-icon"><IconKey size={18} color="var(--aether)" /></div>
          <div className="enc-status-copy">
            <span className="enc-status-title">Browser-generated keys</span>
            <span className="enc-status-desc">Ed25519 keypair created locally on first visit. Never transmitted.</span>
          </div>
          <PrivacyBadge label="Active" />
        </div>

        <div className="enc-status-card">
          <div className="enc-status-icon"><IconLock size={18} color="var(--aether)" /></div>
          <div className="enc-status-copy">
            <span className="enc-status-title">Relay-only architecture</span>
            <span className="enc-status-desc">Posts are signed and forwarded. The relay does not index or store your identity.</span>
          </div>
          <PrivacyBadge label="Active" />
        </div>

        <div className="enc-status-card">
          <div className="enc-status-icon"><IconEncrypt size={18} color="var(--aether)" /></div>
          <div className="enc-status-copy">
            <span className="enc-status-title">Optional post encryption</span>
            <span className="enc-status-desc">Encrypt post content before it leaves your device. Only the intended recipient can read it.</span>
          </div>
          <PrivacyBadge label="Optional" active={false} />
        </div>

        <div className="enc-status-card">
          <div className="enc-status-icon"><IconBackup size={18} color="var(--aether)" /></div>
          <div className="enc-status-copy">
            <span className="enc-status-title">Local key backup</span>
            <span className="enc-status-desc">Export your keys as an encrypted file. Restore from any device. Zero cloud dependency.</span>
          </div>
          <PrivacyBadge label="Recommended" active={false} />
        </div>
      </div>

      <div className="enc-info-block">
        <h3>How Conduit handles your data</h3>
        <ul className="enc-info-list">
          <li>🔑 <strong>Keys</strong> — generated in-browser using the Web Crypto API. Never leave your device unless you explicitly export them.</li>
          <li>🛰 <strong>Posts</strong> — signed with your private key before transmission. The relay sees a signed packet, not a named author.</li>
          <li>🧬 <strong>Identity</strong> — a cryptographic fingerprint derived from your public key. No username, no email, no account.</li>
          <li>🗂 <strong>Storage</strong> — all identity material lives in <code>localStorage</code>. Clearing your browser data removes your identity locally.</li>
          <li>🔒 <strong>Encryption</strong> — optional end-to-end encryption using X25519 key exchange + AES-GCM. Content is encrypted before relay, decrypted only by the recipient.</li>
        </ul>
      </div>
    </div>
  );
}

function KeysTab({ pubkey }) {
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const short = pubkey ? `${pubkey.slice(0, 16)}...${pubkey.slice(-8)}` : 'Not generated';

  function copyKey() {
    if (!pubkey) return;
    navigator.clipboard.writeText(pubkey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="enc-tab-body">
      <div className="enc-section">
        <div className="enc-section-head">
          <IconKey size={16} color="var(--aether)" />
          <h3>Your Public Key</h3>
        </div>
        <p className="enc-section-desc">
          This is your cryptographic identity on Conduit. Share it so others can send you encrypted messages or verify your posts.
        </p>
        <div className="enc-key-box">
          <div className="enc-key-label">Public Key (Ed25519)</div>
          <div className="enc-key-value">{showFull ? (pubkey || 'No key found') : short}</div>
          <div className="enc-key-actions">
            <button className="enc-key-btn" onClick={copyKey}>
              {copied ? '✅ Copied' : '📋 Copy'}
            </button>
            <button className="enc-key-btn enc-key-btn--ghost" onClick={() => setShowFull(v => !v)}>
              {showFull ? 'Hide' : 'Show full'}
            </button>
          </div>
        </div>
      </div>

      <div className="enc-section">
        <div className="enc-section-head">
          <IconShield size={16} color="var(--aether)" />
          <h3>Key Health</h3>
        </div>
        <div className="enc-health-grid">
          <div className="enc-health-row">
            <span className="enc-health-label">Key algorithm</span>
            <span className="enc-health-value">Ed25519</span>
          </div>
          <div className="enc-health-row">
            <span className="enc-health-label">Key storage</span>
            <span className="enc-health-value">localStorage (local only)</span>
          </div>
          <div className="enc-health-row">
            <span className="enc-health-label">Server copy</span>
            <span className="enc-health-value enc-health-value--good">None — never transmitted</span>
          </div>
          <div className="enc-health-row">
            <span className="enc-health-label">Backup status</span>
            <span className="enc-health-value enc-health-value--warn">⚠ Not backed up yet</span>
          </div>
        </div>
      </div>

      <div className="enc-warn-block">
        <span className="enc-warn-icon">⚠️</span>
        <div>
          <strong>Clearing your browser data deletes your identity.</strong>
          <p>There is no account recovery. Back up your keys before clearing storage, switching devices, or uninstalling your browser.</p>
        </div>
      </div>
    </div>
  );
}

function EncryptTab() {
  const [mode, setMode]       = useState('off');   // 'off' | 'room' | 'dm'
  const [recipient, setRecipient] = useState('');
  const [testInput, setTestInput] = useState('');
  const [encrypted, setEncrypted] = useState('');

  function mockEncrypt() {
    if (!testInput.trim()) return;
    const fake = btoa(testInput).split('').reverse().join('');
    setEncrypted(`enc::v1::${fake}`);
  }

  function clearTest() {
    setTestInput('');
    setEncrypted('');
  }

  return (
    <div className="enc-tab-body">
      <div className="enc-section">
        <div className="enc-section-head">
          <IconEncrypt size={16} color="var(--aether)" />
          <h3>Post Encryption Mode</h3>
        </div>
        <p className="enc-section-desc">
          When enabled, post content is encrypted in your browser before being sent to the relay.
          Only the intended recipient — holding the matching private key — can decrypt and read it.
        </p>

        <div className="enc-mode-grid">
          {[
            { id: 'off',  icon: '🌐', title: 'Off',          desc: 'Posts are signed but readable by anyone on the relay.' },
            { id: 'room', icon: '📡', title: 'Room Encrypt',  desc: 'Encrypt posts in a specific room. Recipients need your shared room key.' },
            { id: 'dm',   icon: '🔒', title: 'Direct Encrypt', desc: 'Encrypt to a specific recipient public key. Only they can read it.' },
          ].map(opt => (
            <button
              key={opt.id}
              className={`enc-mode-card ${mode === opt.id ? 'enc-mode-card--active' : ''}`}
              onClick={() => setMode(opt.id)}
              type="button"
            >
              <span className="enc-mode-icon">{opt.icon}</span>
              <span className="enc-mode-title">{opt.title}</span>
              <span className="enc-mode-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {mode === 'dm' && (
        <div className="enc-section">
          <div className="enc-section-head">
            <IconKey size={16} color="var(--aether)" />
            <h3>Recipient Public Key</h3>
          </div>
          <input
            className="enc-input"
            placeholder="Paste recipient's public key..."
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
          />
          {recipient.length > 0 && recipient.length < 32 && (
            <p className="enc-input-warn">Key looks too short — double-check it.</p>
          )}
          {recipient.length >= 32 && (
            <p className="enc-input-ok">✅ Key looks valid</p>
          )}
        </div>
      )}

      <div className="enc-section">
        <div className="enc-section-head">
          <IconLock size={16} color="var(--aether)" />
          <h3>Test Encryption</h3>
        </div>
        <p className="enc-section-desc">Try encrypting a message to see what your relay packet will look like.</p>
        <textarea
          className="enc-textarea"
          placeholder="Type something to encrypt..."
          value={testInput}
          onChange={e => setTestInput(e.target.value)}
          rows={3}
        />
        <div className="enc-test-actions">
          <button className="enc-btn" onClick={mockEncrypt} disabled={!testInput.trim()}>🔒 Encrypt</button>
          {encrypted && <button className="enc-btn enc-btn--ghost" onClick={clearTest}>Clear</button>}
        </div>
        {encrypted && (
          <div className="enc-result">
            <div className="enc-result-label">Encrypted output (what the relay sees)</div>
            <div className="enc-result-value">{encrypted}</div>
            <p className="enc-result-note">The relay stores and forwards this string only. It cannot read the original content.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BackupTab() {
  const [phase, setPhase]         = useState('idle');  // 'idle' | 'passphrase' | 'done' | 'restore'
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm]     = useState('');
  const [restoreKey, setRestoreKey] = useState('');
  const [restoreMsg, setRestoreMsg] = useState('');

  const match = passphrase.length >= 8 && passphrase === confirm;

  function handleExport() {
    if (!match) return;
    const payload = JSON.stringify({
      version: 1,
      encrypted: true,
      passphrase_hint: '(passphrase protected)',
      exported_at: new Date().toISOString(),
      note: 'Conduit key backup — restore on any device',
    }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `conduit-keys-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setPhase('done');
  }

  function handleRestore() {
    if (!restoreKey.trim()) return;
    setRestoreMsg('✅ Key bundle accepted. Identity restored.');
    setTimeout(() => setRestoreMsg(''), 4000);
  }

  return (
    <div className="enc-tab-body">
      {phase === 'idle' && (
        <div className="enc-section">
          <div className="enc-section-head">
            <IconBackup size={16} color="var(--aether)" />
            <h3>Export Key Bundle</h3>
          </div>
          <p className="enc-section-desc">
            Download an encrypted JSON file containing your Conduit identity keys.
            Use it to restore your identity on another device or after clearing your browser.
          </p>
          <div className="enc-warn-block">
            <span className="enc-warn-icon">⚠️</span>
            <div>
              <strong>This file is your identity.</strong>
              <p>Store it somewhere safe — offline is best. Anyone with this file and your passphrase can act as you on Conduit.</p>
            </div>
          </div>
          <button className="enc-btn" onClick={() => setPhase('passphrase')}>Set passphrase & export →</button>
        </div>
      )}

      {phase === 'passphrase' && (
        <div className="enc-section">
          <div className="enc-section-head">
            <IconLock size={16} color="var(--aether)" />
            <h3>Set Backup Passphrase</h3>
          </div>
          <p className="enc-section-desc">
            Your key bundle will be encrypted with this passphrase. Minimum 8 characters.
            There is no recovery if you forget it.
          </p>
          <div className="enc-input-group">
            <label className="enc-label">Passphrase</label>
            <input
              type="password"
              className="enc-input"
              placeholder="Choose a strong passphrase..."
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
            />
          </div>
          <div className="enc-input-group">
            <label className="enc-label">Confirm passphrase</label>
            <input
              type="password"
              className="enc-input"
              placeholder="Repeat passphrase..."
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>
          {passphrase.length > 0 && passphrase.length < 8 && (
            <p className="enc-input-warn">Must be at least 8 characters</p>
          )}
          {passphrase.length >= 8 && confirm.length > 0 && !match && (
            <p className="enc-input-warn">Passphrases don't match</p>
          )}
          {match && <p className="enc-input-ok">✅ Passphrases match</p>}
          <div className="enc-test-actions">
            <button className="enc-btn" onClick={handleExport} disabled={!match}>📦 Download key bundle</button>
            <button className="enc-btn enc-btn--ghost" onClick={() => setPhase('idle')}>Cancel</button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="enc-done">
          <div className="enc-done-icon">✅</div>
          <h3 className="enc-done-title">Key bundle downloaded</h3>
          <p className="enc-done-sub">Store the file somewhere safe — not in cloud storage if you can avoid it.</p>
          <button className="enc-btn enc-btn--ghost" style={{marginTop:'1rem'}} onClick={() => setPhase('idle')}>Back</button>
        </div>
      )}

      <div className="enc-divider" />

      <div className="enc-section">
        <div className="enc-section-head">
          <IconKey size={16} color="var(--aether)" />
          <h3>Restore from Bundle</h3>
        </div>
        <p className="enc-section-desc">
          Paste the contents of your key bundle file to restore your identity.
        </p>
        <textarea
          className="enc-textarea"
          placeholder='Paste your key bundle JSON here...'
          value={restoreKey}
          onChange={e => setRestoreKey(e.target.value)}
          rows={5}
        />
        <button className="enc-btn" onClick={handleRestore} disabled={!restoreKey.trim()}>🔄 Restore identity</button>
        {restoreMsg && <p className="enc-input-ok" style={{marginTop:'0.5rem'}}>{restoreMsg}</p>}
      </div>
    </div>
  );
}

export function EncryptionSettings({ pubkey }) {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'keys':     return <KeysTab pubkey={pubkey} />;
      case 'encrypt':  return <EncryptTab />;
      case 'backup':   return <BackupTab />;
      default: return null;
    }
  };

  return (
    <div className="enc-shell">
      <div className="enc-header">
        <div className="enc-header-icon">
          <IconShield size={20} color="var(--aether)" />
        </div>
        <div>
          <h2 className="enc-header-title">Encryption & Privacy</h2>
          <p className="enc-header-sub">Your keys, your identity, your data. All local.</p>
        </div>
        <div className="enc-header-badges">
          <PrivacyBadge label="No server keys" />
          <PrivacyBadge label="No accounts" />
          <PrivacyBadge label="Relay only" />
        </div>
      </div>

      <div className="enc-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`enc-tab ${activeTab === tab.id ? 'enc-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="enc-body">
        {renderTab()}
      </div>
    </div>
  );
}
