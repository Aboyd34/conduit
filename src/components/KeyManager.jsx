import React, { useState, useEffect } from 'react';

/* Gracefully imports the key manager — falls back if module missing */
let _generateAndStoreKeys = async () => { throw new Error('Key module not loaded'); };
let _deleteKeys = () => {};
let _getPublicKey = () => null;

try {
  const mod = await import('../ConduitKeyManager.js').catch(() => null);
  if (mod) {
    _generateAndStoreKeys = mod.generateAndStoreKeys;
    _deleteKeys = mod.deleteKeys;
    _getPublicKey = mod.getPublicKey;
  }
} catch (_) {}

export default function KeyManager() {
  const [pubKey, setPubKey]   = useState(null);
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    try { setPubKey(_getPublicKey()); } catch (_) {}
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setStatus('');
    try {
      const key = await _generateAndStoreKeys();
      setPubKey(key);
      setStatus('success');
    } catch (e) {
      setStatus('error:' + e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDelete() {
    try { _deleteKeys(); } catch (_) {}
    setPubKey(null);
    setStatus('deleted');
  }

  async function handleCopy() {
    if (!pubKey) return;
    try {
      await navigator.clipboard.writeText(pubKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  }

  const truncated = pubKey ? pubKey.slice(0, 16) + '…' + pubKey.slice(-8) : null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      padding: 'var(--space-6)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      maxWidth: 420,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)' }}>Identity Keys</h3>
        {pubKey && <span className="chip success" style={{ marginLeft: 'auto' }}>Active</span>}
        {!pubKey && <span className="chip danger"  style={{ marginLeft: 'auto' }}>No Key</span>}
      </div>

      {/* Public key display */}
      {pubKey ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" aria-hidden="true">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
          <code style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }} title={pubKey}>{truncated}</code>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy public key'}
            style={{ padding: '3px 8px', fontSize: 'var(--text-xs)' }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      ) : (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          No identity key found. Generate one to authenticate on Conduit.
        </p>
      )}

      {/* Status messages */}
      {status === 'success' && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--success)' }}>✓ New key pair generated successfully.</p>
      )}
      {status === 'deleted' && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--warning)' }}>Key pair deleted.</p>
      )}
      {status.startsWith('error:') && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>✕ {status.replace('error:', '')}</p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleGenerate}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Generating…' : pubKey ? 'Regenerate Key' : 'Generate Key'}
        </button>
        {pubKey && (
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            aria-label="Delete identity keys"
          >
            Delete Keys
          </button>
        )}
      </div>
    </div>
  );
}
