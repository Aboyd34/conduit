import React from 'react';

export const ROOMS = [
  {
    id: 'public',
    label: '# general',
    short: 'General',
    icon: '🏠',
    desc: 'Open channel. Everyone welcome.',
    accent: 'general',
    toolsTitle: 'Community Tools',
    tools: [
      { icon: '📌', label: 'Pinned Discussions', hint: 'Important room threads' },
      { icon: '📢', label: 'Announcements',      hint: 'Platform and room updates' },
      { icon: '👥', label: "Who's Online",       hint: 'Live room presence' },
      { icon: '🗳️', label: 'Quick Poll',         hint: 'Lightweight room votes' },
    ],
    trending:  ['Top post today', 'Most signaled discussion', 'New voices in the room'],
    resources: ['Community guide', 'Posting etiquette', 'Shareable room link'],
    pinned:    ['Welcome to Conduit', 'Privacy-first posting'],
  },
  {
    id: 'crypto',
    label: '# crypto',
    short: 'Crypto',
    icon: '🔷',
    desc: 'Web3, wallets, on-chain talk.',
    accent: 'crypto',
    toolsTitle: 'Wallet Tools',
    tools: [
      { icon: '👛', label: 'Wallet Panel',   hint: 'Quick wallet actions' },
      { icon: '📈', label: 'Token Tracker',  hint: 'BTC · ETH · AETH live' },
      { icon: '🧾', label: 'Block Explorer', hint: 'Recent on-chain lookups' },
      { icon: '🚨', label: 'Whale Alerts',   hint: 'Big moves and room chatter' },
    ],
    trending:  ['AETH discussion heating up', 'Latest wallet thread', 'Most amplified contract post'],
    resources: ['Base docs', 'Wallet safety guide', 'Contract links'],
    pinned:    ['Connect wallet safely', 'Airdrop claim guide'],
  },
  {
    id: 'tech',
    label: '# tech',
    short: 'Tech',
    icon: '🛠️',
    desc: 'Builders, devs, tools, projects.',
    accent: 'tech',
    toolsTitle: 'Dev Tools',
    tools: [
      { icon: '🧠', label: 'Conduit Terminal', hint: 'System-style dev panel' },
      { icon: '📦', label: 'GitHub Explorer',  hint: 'Repos and code links' },
      { icon: '📄', label: 'Share Code',        hint: 'Snippets and build notes' },
      { icon: '🛰',  label: 'Dev News',          hint: 'What builders are discussing' },
    ],
    trending:  ['Top repo discussion', 'Security thread trending', 'New build-in-public post'],
    resources: ['Docs', 'GitHub links', 'API references'],
    pinned:    ['Ship in public', 'Useful dev resources'],
  },
  {
    id: 'random',
    label: '# random',
    short: 'Random',
    icon: '🎲',
    desc: 'Anything goes. Keep it interesting.',
    accent: 'random',
    toolsTitle: 'Chaos Tools',
    tools: [
      { icon: '🎲', label: 'Random Prompt', hint: 'Kick off a thread' },
      { icon: '😂', label: 'Vibe Check',    hint: 'Fast reactions and polls' },
      { icon: '🪄', label: 'Meme Drop',     hint: 'Share something absurd' },
      { icon: '🎤', label: 'Open Mic',      hint: 'Unstructured conversation' },
    ],
    trending:  ['Wildest post today', 'Most amplified chaos', 'Unexpected room crossover'],
    resources: ['Room lore', 'Funny links', 'Pinned moments'],
    pinned:    ['No rules, still respect privacy', 'Best random posts this week'],
  },
  {
    id: 'aether',
    label: '# aether',
    short: 'Aether',
    icon: '⚡',
    desc: 'Holders only · 100 AETH required.',
    accent: 'aether',
    gated: true,
    toolsTitle: 'AETH Tools',
    tools: [
      { icon: '⚡', label: 'AETH Dashboard',    hint: 'Balance and status' },
      { icon: '🔥', label: 'Recycle Board',     hint: 'Most recycled posts' },
      { icon: '🏛️', label: 'Governance',        hint: 'High-signal room actions' },
      { icon: '🎁', label: 'Exclusive Drops',   hint: 'Aether-only events' },
    ],
    trending:  ['Top holder discussion', 'Recent claim activity', 'Most recycled post'],
    resources: ['AETH docs', 'Token mechanics', 'Claim walkthrough'],
    pinned:    ['Holder room rules', 'Governance roadmap'],
  },
];

export function getRoomMeta(roomId) {
  return ROOMS.find(r => r.id === roomId) || ROOMS[0];
}

export function estimateOnline(posts, roomId) {
  const roomPosts    = posts.filter(p => (p.topic || 'public') === roomId);
  const uniqueSenders = new Set(roomPosts.map(p => p.displaySender || p.sender).filter(Boolean));
  return Math.max(uniqueSenders.size, Math.min(999, roomPosts.length * 3 + 12));
}

export function getTrendingPosts(posts, roomId, limit = 3) {
  return posts
    .filter(p => (p.topic || 'public') === roomId)
    .sort((a, b) => ((b.signals||0)+(b.replies?.length||0)) - ((a.signals||0)+(a.replies?.length||0)))
    .slice(0, limit);
}
