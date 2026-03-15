/**
 * Conduit Custom Icon System
 * All icons are inline SVGs — no external dependencies, no network requests.
 * Each icon accepts size (default 20) and color (default currentColor).
 */

import React from 'react';

const base = (path, size, color, viewBox = '0 0 24 24') => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    stroke={color}
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {path}
  </svg>
);

export function IconHome({ size = 20, color = 'currentColor' }) {
  return base(
    <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></>,
    size, color
  );
}

export function IconRooms({ size = 20, color = 'currentColor' }) {
  return base(
    <><circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 000 11.4M17.7 6.3a8 8 0 010 11.4"/><path d="M3.5 3.5a14 14 0 000 17M20.5 3.5a14 14 0 010 17"/></>,
    size, color
  );
}

export function IconPulse({ size = 20, color = 'currentColor' }) {
  return base(
    <><polyline points="2,12 6,12 8,4 10,20 12,10 14,14 16,12 22,12"/></>,
    size, color
  );
}

export function IconSearch({ size = 20, color = 'currentColor' }) {
  return base(
    <><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></>,
    size, color
  );
}

export function IconAirdrop({ size = 20, color = 'currentColor' }) {
  return base(
    <><path d="M12 2l3 6h6l-5 4 2 7-6-4-6 4 2-7L3 8h6l3-6z"/></>,
    size, color
  );
}

export function IconAlerts({ size = 20, color = 'currentColor' }) {
  return base(
    <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    size, color
  );
}

export function IconYou({ size = 20, color = 'currentColor' }) {
  return base(
    <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    size, color
  );
}

export function IconWallet({ size = 20, color = 'currentColor' }) {
  return base(
    <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/><path d="M2 10h20"/></>,
    size, color
  );
}

export function IconConduit({ size = 24, color = 'currentColor' }) {
  return base(
    <><polygon points="12,2 22,19 2,19" fill="none"/><line x1="12" y1="8" x2="12" y2="14"/><circle cx="12" cy="17" r="0.5" fill={color}/></>,
    size, color
  );
}

export function IconLock({ size = 20, color = 'currentColor' }) {
  return base(
    <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
    size, color
  );
}

export function IconKey({ size = 20, color = 'currentColor' }) {
  return base(
    <><circle cx="8" cy="15" r="4"/><path d="M11.1 12.1L21 3"/><path d="M19 3l2 2"/><path d="M17 5l2 2"/></>,
    size, color
  );
}

export function IconShield({ size = 20, color = 'currentColor' }) {
  return base(
    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    size, color
  );
}

export function IconEncrypt({ size = 20, color = 'currentColor' }) {
  return base(
    <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><line x1="12" y1="15" x2="12" y2="17"/></>,
    size, color
  );
}

export function IconBackup({ size = 20, color = 'currentColor' }) {
  return base(
    <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    size, color
  );
}

export function IconSignal({ size = 20, color = 'currentColor' }) {
  return base(
    <><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" fill="none"/></>,
    size, color
  );
}

export function IconAmplify({ size = 20, color = 'currentColor' }) {
  return base(
    <><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></>,
    size, color
  );
}

export function IconRecycle({ size = 20, color = 'currentColor' }) {
  return base(
    <><path d="M3 12a9 9 0 009 9 9 9 0 009-9 9 9 0 00-9-9"/><polyline points="3,9 3,3 9,3"/></>,
    size, color
  );
}
