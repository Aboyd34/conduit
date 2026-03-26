import React from 'react';

const icon = (path) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const I = {
  hash: icon(<path d="M5 9h14M4 15h14M10 3L8 21M16 3l-2 18" />),
  diamond: icon(<path d="M12 2l8 10-8 10L4 12 12 2z" />),
  code: icon(<><path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/><path d="M14 4l-4 16"/></>),
  waves: icon(<path d="M4 9c2 2 4 2 6 0s4-2 6 0 4 2 4 2M4 15c2 2 4 2 6 0s4-2 6 0 4 2 4 2" />),
  bolt: icon(<path d="M13 2L4 14h7l-1 8 10-12h-7l1-8z" />),
  pin: icon(<><path d="M9 4l6 6"/><path d="M15 4l-6 6"/><path d="M12 12v8"/></>),
  megaphone: icon(<><path d="M3 11v2"/><path d="M7 8l10-4v16L7 16z"/><path d="M7 16l1.5 4"/></>),
  users: icon(<><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/></>),
  poll: icon(<><path d="M6 18V9"/><path d="M12 18V5"/><path d="M18 18v-7"/></>),
  wallet: icon(<><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M15 12h5"/></>),
  chart: icon(<><path d="M4 18l6-6 4 3 6-7"/><path d="M20 8v5h-5"/></>),
  blocks: icon(<><rect x="4" y="4" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></>),
  alert: icon(<><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.8L2.6 18a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z"/></>),
  terminal: icon(<><path d="M4 6h16v12H4z"/><path d="M7 11l2 2-2 2"/><path d="M12 15h5"/></>),
  repo: icon(<><path d="M4 5a3 3 0 013-3h10a3 3 0 013 3v14a2 2 0 01-2 2H7a3 3 0 01-3-3z"/><path d="M8 7h8"/></>),
  file: icon(<><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/></>),
  satellite: icon(<><path d="M4 15l5 5"/><path d="M5 19l3-3"/><rect x="10" y="3" width="7" height="7" rx="1"/></>),
  dice: icon(<rect x="4" y="4" width="16" height="16" rx="3" />),
  smile: icon(<><circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.5 2.4 2 4 2s3-.5 4-2"/><path d="M9 10h.01M15 10h.01"/></>),
  wand: icon(<><path d="M3 21l10-10"/><path d="M14 4l1-1 1 1 1-1 1 1"/></>),
  mic: icon(<><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/></>),
  flame: icon(<path d="M12 3c2 3 5 4 5 9a5 5 0 01-10 0c0-2 1-4 3-6" />),
  bank: icon(<><path d="M3 10h18"/><path d="M4 10V7l8-4 8 4v3"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8M3 18h18"/></>),
  gift: icon(<><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18"/></>),
};

export const ROOMS = [
  { id: 'public', label: '# general', short: 'General', icon: I.hash, desc: 'Open channel. Everyone welcome.', accent: 'general', toolsTitle: 'Community Tools', tools: [
    { icon: I.pin, label: 'Pinned Discussions', hint: 'Important room threads' },
    { icon: I.megaphone, label: 'Announcements', hint: 'Platform and room updates' },
    { icon: I.users, label: "Who's Online", hint: 'Live room presence' },
    { icon: I.poll, label: 'Quick Poll', hint: 'Lightweight room votes' },
  ], trending: ['Top post today', 'Most signaled discussion', 'New voices in the room'], resources: ['Community guide', 'Posting etiquette', 'Shareable room link'], pinned: ['Welcome to Conduit', 'Privacy-first posting'] },
  { id: 'crypto', label: '# crypto', short: 'Crypto', icon: I.diamond, desc: 'Web3, wallets, on-chain talk.', accent: 'crypto', toolsTitle: 'Wallet Tools', tools: [
    { icon: I.wallet, label: 'Wallet Panel', hint: 'Quick wallet actions' },
    { icon: I.chart, label: 'Token Tracker', hint: 'BTC · ETH · AETH live' },
    { icon: I.blocks, label: 'Block Explorer', hint: 'Recent on-chain lookups' },
    { icon: I.alert, label: 'Whale Alerts', hint: 'Big moves and room chatter' },
  ], trending: ['AETH discussion heating up', 'Latest wallet thread', 'Most amplified contract post'], resources: ['Base docs', 'Wallet safety guide', 'Contract links'], pinned: ['Connect wallet safely', 'Airdrop claim guide'] },
  { id: 'tech', label: '# tech', short: 'Tech', icon: I.code, desc: 'Builders, devs, tools, projects.', accent: 'tech', toolsTitle: 'Dev Tools', tools: [
    { icon: I.terminal, label: 'Conduit Terminal', hint: 'System-style dev panel' },
    { icon: I.repo, label: 'GitHub Explorer', hint: 'Repos and code links' },
    { icon: I.file, label: 'Share Code', hint: 'Snippets and build notes' },
    { icon: I.satellite, label: 'Dev News', hint: 'What builders are discussing' },
  ], trending: ['Top repo discussion', 'Security thread trending', 'New build-in-public post'], resources: ['Docs', 'GitHub links', 'API references'], pinned: ['Ship in public', 'Useful dev resources'] },
  { id: 'random', label: '# random', short: 'Random', icon: I.waves, desc: 'Anything goes. Keep it interesting.', accent: 'random', toolsTitle: 'Chaos Tools', tools: [
    { icon: I.dice, label: 'Random Prompt', hint: 'Kick off a thread' },
    { icon: I.smile, label: 'Vibe Check', hint: 'Fast reactions and polls' },
    { icon: I.wand, label: 'Meme Drop', hint: 'Share something absurd' },
    { icon: I.mic, label: 'Open Mic', hint: 'Unstructured conversation' },
  ], trending: ['Wildest post today', 'Most amplified chaos', 'Unexpected room crossover'], resources: ['Room lore', 'Funny links', 'Pinned moments'], pinned: ['No rules, still respect privacy', 'Best random posts this week'] },
  { id: 'aether', label: '# aether', short: 'Aether', icon: I.bolt, desc: 'Holders only · 100 AETH required.', accent: 'aether', gated: true, toolsTitle: 'AETH Tools', tools: [
    { icon: I.bolt, label: 'AETH Dashboard', hint: 'Balance and status' },
    { icon: I.flame, label: 'Recycle Board', hint: 'Most recycled posts' },
    { icon: I.bank, label: 'Governance', hint: 'High-signal room actions' },
    { icon: I.gift, label: 'Exclusive Drops', hint: 'Aether-only events' },
  ], trending: ['Top holder discussion', 'Recent claim activity', 'Most recycled post'], resources: ['AETH docs', 'Token mechanics', 'Claim walkthrough'], pinned: ['Holder room rules', 'Governance roadmap'] },
];

export function getRoomMeta(roomId) {
  return ROOMS.find(r => r.id === roomId) || ROOMS[0];
}

export function estimateOnline(posts, roomId) {
  const roomPosts = posts.filter(p => (p.topic || 'public') === roomId);
  const uniqueSenders = new Set(roomPosts.map(p => p.displaySender || p.sender).filter(Boolean));
  return Math.max(uniqueSenders.size, Math.min(999, roomPosts.length * 3 + 12));
}

export function getTrendingPosts(posts, roomId, limit = 3) {
  return posts
    .filter(p => (p.topic || 'public') === roomId)
    .sort((a, b) => ((b.signals || 0) + (b.replies?.length || 0)) - ((a.signals || 0) + (a.replies?.length || 0)))
    .slice(0, limit);
}
