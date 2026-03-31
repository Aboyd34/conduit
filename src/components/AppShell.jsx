import React from 'react';
import TopBar from './TopBar';
import './AppShell.css';

export default function AppShell({ title, nav, children, rightSlot }) {
  return (
    <div className="app-shell">
      <TopBar title={title} rightSlot={rightSlot} />
      <div className="app-body">
        {nav && <aside className="app-rail">{nav}</aside>}
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
