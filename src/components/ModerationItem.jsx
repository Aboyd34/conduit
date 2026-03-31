import React, { useState } from 'react';
import './ModerationItem.css';

/**
 * ModerationItem — renders a flagged post/photo/comment
 * with admin actions: Dismiss, Warn, Restrict, Redact
 */
export default function ModerationItem({ item = {}, onAction }) {
  const {
    id, type = 'post', author, handle, timestamp,
    content, reason, flagCount = 1
  } = item;

  const [actioned, setActioned] = useState(null);

  function handleAction(action) {
    setActioned(action);
    onAction && onAction({ id, action });
  }

  if (actioned) {
    return (
      <div className="mod-item mod-item--actioned">
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          ✓ {actioned.toUpperCase()} — {handle || id}
        </span>
      </div>
    );
  }

  return (
    <article className="mod-item">
      <div className="mod-item-header">
        <div className="mod-item-meta">
          <span className="mod-item-type chip">{type}</span>
          <span className="mod-item-author">{author || 'Unknown'}</span>
          <span className="mod-item-handle text-muted">@{handle || 'anon'}</span>
          <span className="mod-item-dot">·</span>
          <span className="mod-item-time text-muted">{timestamp || 'unknown time'}</span>
        </div>
        <div className="mod-item-flags">
          <span className="chip danger">⚑ {flagCount} flag{flagCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {reason && (
        <div className="mod-item-reason">
          <span className="mono" style={{ fontSize: 11, color: 'var(--warning)' }}>Reason: {reason}</span>
        </div>
      )}

      <div className="mod-item-content">{content}</div>

      <div className="mod-item-actions">
        <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => handleAction('dismiss')}>
          Dismiss
        </button>
        <button className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--warning)' }} onClick={() => handleAction('warn')}>
          Warn
        </button>
        <button className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--primary)' }} onClick={() => handleAction('restrict')}>
          Restrict
        </button>
        <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => handleAction('redact')}>
          Redact
        </button>
      </div>
    </article>
  );
}
