import React, { useState, useRef } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import {
  exportBackup,
  importBackup,
  exportKeys,
  importKeys,
} from '../crypto/backup.js';

/**
 * BackupManager — self-sovereign encrypted backup & restore
 * Lives inside the You view under a collapsible section
 */
export function BackupManager() {
  const { posts } = useConduitSocket();

  // Export states
  const [exporting,    setExporting]    = useState(false);
  const [exportMsg,    setExportMsg]    = useState('');
  const [showKeyExport,setShowKeyExport]= useState(false);
  const [passphrase,   setPassphrase]   = useState('');
  const [passConfirm,  setPassConfirm]  = useState('');
  const [keyExporting, setKeyExporting] = useState(false);
  const [keyExportMsg, setKeyExportMsg] = useState('');

  // Import states
  const [tab,          setTab]          = useState('export'); // 'export' | 'restore'
  const [restoreStep,  setRestoreStep]  = useState('idle');   // idle | keys | bundle | done
  const [restorePass,  setRestorePass]  = useState('');
  const [restoreMsg,   setRestoreMsg]   = useState('');
  const [restoredPosts,setRestoredPosts]= useState(null);

  const keyFileRef    = useRef();
  const bundleFileRef = useRef();

  // ---------------------------------------------------------------- export

  async function handleExportBundle() {
    setExporting(true); setExportMsg('');
    try {
      const count = await exportBackup(posts);
      setExportMsg(`✅ Downloaded backup with ${count} post${count !== 1 ? 's' : ''}`);
    } catch (e) {
      setExportMsg('❌ ' + e.message);
    } finally { setExporting(false); }
  }

  async function handleExportKeys() {
    if (passphrase !== passConfirm) { setKeyExportMsg('❌ Passphrases do not match'); return; }
    if (passphrase.length < 8)      { setKeyExportMsg('❌ Passphrase too short (min 8 chars)'); return; }
    setKeyExporting(true); setKeyExportMsg('');
    try {
      await exportKeys(passphrase);
      setKeyExportMsg('✅ Keys downloaded — store your .aetherkey file somewhere safe');
      setPassphrase(''); setPassConfirm('');
    } catch (e) {
      setKeyExportMsg('❌ ' + e.message);
    } finally { setKeyExporting(false); }
  }

  // ---------------------------------------------------------------- restore

  async function handleKeyFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRestoreMsg('');
    try {
      // Validate JSON structure before asking for passphrase
      JSON.parse(text);
      // Store text temporarily in state via a ref-like approach
      keyFileRef._text = text;
      setRestoreStep('keys');
    } catch {
      setRestoreMsg('❌ Invalid .aetherkey file');
    }
  }

  async function handleRestoreKeys() {
    if (!restorePass) { setRestoreMsg('❌ Enter your passphrase'); return; }
    setRestoreMsg('');
    try {
      const fingerprint = await importKeys(keyFileRef._text, restorePass);
      setRestoreMsg(`✅ Keys restored — identity: ${fingerprint.slice(0,12)}…`);
      setRestoreStep('bundle');
      setRestorePass('');
    } catch (e) {
      setRestoreMsg('❌ ' + e.message);
    }
  }

  async function handleBundleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreMsg('');
    try {
      const text   = await file.text();
      const bundle = await importBackup(text);
      setRestoredPosts(bundle.posts);
      setRestoreMsg(`✅ Restored ${bundle.posts.length} post${bundle.posts.length !== 1 ? 's' : ''} from ${new Date(bundle.exportedAt).toLocaleDateString()}`);
      setRestoreStep('done');
    } catch (e) {
      setRestoreMsg('❌ ' + e.message);
    }
  }

  // ---------------------------------------------------------------- render

  return (
    <div className="backup-manager">
      <div className="backup-tabs">
        <button
          className={`backup-tab ${tab === 'export' ? 'backup-tab--active' : ''}`}
          onClick={() => setTab('export')}
        >📦 Export</button>
        <button
          className={`backup-tab ${tab === 'restore' ? 'backup-tab--active' : ''}`}
          onClick={() => setTab('restore')}
        >🔓 Restore</button>
      </div>

      {/* ---- EXPORT TAB ---- */}
      {tab === 'export' && (
        <div className="backup-section">

          {/* Bundle */}
          <div className="backup-block">
            <div className="backup-block-header">
              <span className="backup-block-icon">📦</span>
              <div>
                <p className="backup-block-title">Data Backup</p>
                <p className="backup-block-desc">Downloads your posts as an encrypted <code>.aether</code> file. Only your keys can open it.</p>
              </div>
            </div>
            <button className="backup-btn" onClick={handleExportBundle} disabled={exporting}>
              {exporting ? 'Encrypting…' : 'Download .aether backup'}
            </button>
            {exportMsg && <p className="backup-msg">{exportMsg}</p>}
          </div>

          <div className="backup-divider" />

          {/* Key export */}
          <div className="backup-block">
            <div className="backup-block-header">
              <span className="backup-block-icon">🔑</span>
              <div>
                <p className="backup-block-title">Key Backup</p>
                <p className="backup-block-desc">Exports your identity keypair encrypted with a passphrase as a <code>.aetherkey</code> file. Lose this and you lose your identity.</p>
              </div>
            </div>

            <button
              className="backup-btn backup-btn--secondary"
              onClick={() => setShowKeyExport(v => !v)}
            >
              {showKeyExport ? 'Cancel' : 'Export keys…'}
            </button>

            {showKeyExport && (
              <div className="backup-key-form">
                <div className="backup-warning">
                  ⚠️ <strong>Store your .aetherkey file somewhere safe.</strong> If you lose it AND forget your passphrase, your identity is gone forever. No recovery exists.
                </div>
                <label className="backup-label">Passphrase</label>
                <input
                  type="password"
                  className="backup-input"
                  placeholder="Min 8 characters"
                  value={passphrase}
                  onChange={e => setPassphrase(e.target.value)}
                />
                <label className="backup-label">Confirm passphrase</label>
                <input
                  type="password"
                  className="backup-input"
                  placeholder="Repeat passphrase"
                  value={passConfirm}
                  onChange={e => setPassConfirm(e.target.value)}
                />
                <button
                  className="backup-btn"
                  onClick={handleExportKeys}
                  disabled={keyExporting || !passphrase || !passConfirm}
                >
                  {keyExporting ? 'Encrypting…' : 'Download .aetherkey'}
                </button>
                {keyExportMsg && <p className="backup-msg">{keyExportMsg}</p>}
              </div>
            )}
          </div>

          <div className="backup-info">
            <p>🔒 Both files are encrypted before leaving your device. The server never sees your keys or your backup.</p>
          </div>
        </div>
      )}

      {/* ---- RESTORE TAB ---- */}
      {tab === 'restore' && (
        <div className="backup-section">

          {restoreStep === 'idle' && (
            <div className="backup-block">
              <div className="backup-block-header">
                <span className="backup-block-icon">🔑</span>
                <div>
                  <p className="backup-block-title">Step 1 — Restore your keys</p>
                  <p className="backup-block-desc">Upload your <code>.aetherkey</code> file first. This restores your identity.</p>
                </div>
              </div>
              <label className="backup-upload-label">
                Choose .aetherkey file
                <input
                  type="file"
                  accept=".aetherkey,application/json"
                  style={{ display: 'none' }}
                  onChange={handleKeyFileUpload}
                />
              </label>
              {restoreMsg && <p className="backup-msg">{restoreMsg}</p>}
              <p className="backup-skip-hint">
                No key file? <button className="backup-link-btn" onClick={() => setRestoreStep('bundle')}>Skip to data restore</button> (uses current keys)
              </p>
            </div>
          )}

          {restoreStep === 'keys' && (
            <div className="backup-block">
              <div className="backup-block-header">
                <span className="backup-block-icon">🔓</span>
                <div>
                  <p className="backup-block-title">Enter your passphrase</p>
                  <p className="backup-block-desc">The passphrase you set when you exported your keys.</p>
                </div>
              </div>
              <input
                type="password"
                className="backup-input"
                placeholder="Your passphrase"
                value={restorePass}
                onChange={e => setRestorePass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRestoreKeys()}
                autoFocus
              />
              <button className="backup-btn" onClick={handleRestoreKeys} disabled={!restorePass}>
                Unlock keys
              </button>
              {restoreMsg && <p className="backup-msg">{restoreMsg}</p>}
            </div>
          )}

          {restoreStep === 'bundle' && (
            <div className="backup-block">
              <div className="backup-block-header">
                <span className="backup-block-icon">📦</span>
                <div>
                  <p className="backup-block-title">Step 2 — Restore your data</p>
                  <p className="backup-block-desc">Upload your <code>.aether</code> backup file.</p>
                </div>
              </div>
              <label className="backup-upload-label">
                Choose .aether file
                <input
                  type="file"
                  accept=".aether,application/json"
                  style={{ display: 'none' }}
                  onChange={handleBundleFileUpload}
                />
              </label>
              {restoreMsg && <p className="backup-msg">{restoreMsg}</p>}
            </div>
          )}

          {restoreStep === 'done' && (
            <div className="backup-done">
              <p className="backup-done-icon">✅</p>
              <p className="backup-done-title">Restore complete</p>
              {restoreMsg && <p className="backup-msg">{restoreMsg}</p>}
              {restoredPosts && (
                <p className="backup-done-sub">{restoredPosts.length} transmissions recovered. Reload the app to see them in your feed.</p>
              )}
              <button className="backup-btn" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>
                Reload Conduit
              </button>
            </div>
          )}

          <div className="backup-info">
            <p>🔒 Decryption happens entirely in your browser. Your passphrase and keys never touch the server.</p>
          </div>
        </div>
      )}
    </div>
  );
}
