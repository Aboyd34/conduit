import React from 'react';
import './TopBar.css';

export default function TopBar({ title, rightSlot }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <svg className="topbar-logo" width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="#7DF9FF" strokeWidth="1.5" />
          <path d="M8 14 Q14 6 20 14 Q14 22 8 14Z" fill="#7DF9FF" opacity="0.9" />
          <circle cx="14" cy="14" r="2.5" fill="#0A0A0C" />
        </svg>
      </div>

      <div className="topbar-center">
        <span className="topbar-title">{title || 'Conduit'}</span>
      </div>

      <div className="topbar-right">
        {rightSlot}
      </div>
    </header>
  );
}
