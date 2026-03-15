/**
 * Airdrop Snapshot Tool
 * Reads Conduit DB, scores users by activity, builds a Merkle tree
 *
 * Usage:
 *   node scripts/airdrop-snapshot.js [--db path/to/conduit.db] [--out snapshot.json]
 *
 * Scoring formula:
 *   base allocation:   1,000 AETH per eligible wallet
 *   +50 AETH per post published
 *   +20 AETH per signal received
 *   +10 AETH per reply received
 *   pioneer bonus x2: wallets connected before PIONEER_CUTOFF
 *
 * Requires:
 *   npm install better-sqlite3 merkletreejs keccak ethers
 */

const Database = require('better-sqlite3');
const { MerkleTree } = require('merkletreejs');
const { keccak256, solidityPackedKeccak256, parseUnits } = require('ethers');
const fs = require('fs');
const path = require('path');

const PIONEER_CUTOFF = new Date('2026-06-01').getTime();
const BASE_ALLOC     = 1_000n;
const PER_POST       = 50n;
const PER_SIGNAL     = 20n;
const PER_REPLY      = 10n;
const MAX_ALLOC      = 50_000n; // cap per wallet

function parseArgs() {
  const args = process.argv.slice(2);
  const dbPath = args[args.indexOf('--db') + 1]  || 'conduit.db';
  const outPath = args[args.indexOf('--out') + 1] || 'airdrop-snapshot.json';
  return { dbPath, outPath };
}

async function main() {
  const { dbPath, outPath } = parseArgs();

  if (!fs.existsSync(dbPath)) {
    console.error(`DB not found at ${dbPath}. Copy your production conduit.db here first.`);
    process.exit(1);
  }

  const db = new Database(dbPath, { readonly: true });
  console.log('Reading Conduit DB...');

  // Load wallet links (pubkey -> wallet address from localStorage exports)
  // In production: export conduit_wallet_link from your users somehow
  // For now we read from a wallets.json file if present
  let walletMap = {};
  if (fs.existsSync('wallets.json')) {
    walletMap = JSON.parse(fs.readFileSync('wallets.json', 'utf8'));
    console.log(`Loaded ${Object.keys(walletMap).length} wallet links from wallets.json`);
  }

  const messages = db.prepare('SELECT * FROM messages').all();
  const signals  = db.prepare('SELECT * FROM signals').all();
  const replies  = db.prepare('SELECT * FROM replies').all();
  const peers    = db.prepare('SELECT * FROM peers').all();

  console.log(`Posts: ${messages.length}, Signals: ${signals.length}, Replies: ${replies.length}, Peers: ${peers.length}`);

  // Build score map keyed by sender_pubkey
  const scores = {};

  function ensureEntry(pubkey) {
    if (!scores[pubkey]) scores[pubkey] = { pubkey, posts: 0, signalsReceived: 0, repliesReceived: 0, pioneer: false };
  }

  for (const m of messages) {
    ensureEntry(m.sender_pubkey);
    scores[m.sender_pubkey].posts++;
    if (m.timestamp < PIONEER_CUTOFF) scores[m.sender_pubkey].pioneer = true;
  }

  for (const s of signals) {
    // Signal on a post -> credit the post's author
    const post = messages.find((m) => m.id === s.post_id);
    if (post) {
      ensureEntry(post.sender_pubkey);
      scores[post.sender_pubkey].signalsReceived++;
    }
  }

  for (const r of replies) {
    const post = messages.find((m) => m.id === r.post_id);
    if (post) {
      ensureEntry(post.sender_pubkey);
      scores[post.sender_pubkey].repliesReceived++;
    }
  }

  // Also credit peers who registered but never posted
  for (const p of peers) {
    ensureEntry(p.pubkey);
    if (p.last_seen < PIONEER_CUTOFF) scores[p.pubkey].pioneer = true;
  }

  // Calculate allocations
  const allocations = []; // { address, amountWei }
  let totalAllocated = 0n;
  let skipped = 0;

  for (const [pubkey, score] of Object.entries(scores)) {
    const wallet = walletMap[pubkey];
    if (!wallet) { skipped++; continue; }

    let amount = BASE_ALLOC
      + BigInt(score.posts)           * PER_POST
      + BigInt(score.signalsReceived) * PER_SIGNAL
      + BigInt(score.repliesReceived) * PER_REPLY;

    if (amount > MAX_ALLOC) amount = MAX_ALLOC;
    if (score.pioneer) amount *= 2n;
    if (amount > MAX_ALLOC) amount = MAX_ALLOC;

    const amountWei = parseUnits(amount.toString(), 18);
    allocations.push({ address: wallet.toLowerCase(), amountWei: amountWei.toString(), score });
    totalAllocated += amount;
  }

  console.log(`\nEligible wallets: ${allocations.length}`);
  console.log(`Skipped (no wallet linked): ${skipped}`);
  console.log(`Total AETH to distribute: ${totalAllocated.toLocaleString()}`);

  // Build Merkle tree
  const leaves = allocations.map((a) =>
    solidityPackedKeccak256(['address', 'uint256'], [a.address, a.amountWei])
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  console.log(`\nMerkle root: ${root}`);

  // Attach proofs to each allocation
  const snapshot = allocations.map((a, i) => ({
    address: a.address,
    amountWei: a.amountWei,
    amountAETH: (BigInt(a.amountWei) / BigInt(1e18)).toString(),
    proof: tree.getHexProof(leaves[i]),
    score: a.score,
  }));

  const output = {
    generatedAt: new Date().toISOString(),
    merkleRoot: root,
    totalWallets: snapshot.length,
    totalAETH: totalAllocated.toString(),
    allocations: snapshot,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Snapshot saved to ${outPath}`);
  console.log(`\nNext: call aether.setMerkleRoot("${root}") then setAirdropOpen(true)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
