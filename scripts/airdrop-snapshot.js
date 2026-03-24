/**
 * Airdrop Snapshot + Merkle Tree Generator
 *
 * Reads Conduit SQLite DB, scores every wallet by on-chain activity,
 * builds a sorted Merkle tree, and writes airdrop-snapshot.json
 * (which the Express server reads at startup to serve proofs).
 *
 * Usage:
 *   node scripts/airdrop-snapshot.js
 *   node scripts/airdrop-snapshot.js --db /path/to/conduit.db --out airdrop-snapshot.json
 *   node scripts/airdrop-snapshot.js --dry-run   (print stats, no file written)
 *
 * Deps: npm install better-sqlite3 merkletreejs keccak ethers
 *
 * SCORING:
 *   Every eligible wallet starts at BASE_ALLOC (1,000 AETH).
 *   +50  AETH per post they published
 *   +20  AETH per signal their posts received
 *   +10  AETH per reply  their posts received
 *   Pioneer (active before PIONEER_CUTOFF) → entire allocation × 2
 *   Hard cap: MAX_ALLOC per wallet (50,000 AETH)
 *
 * WALLET LINKING:
 *   Conduit is anonymous — users are identified by signing pubkey.
 *   To claim an airdrop they must have connected a wallet in the app.
 *   Those links are stored in localStorage as `conduit_wallet_link`.
 *   Export them server-side (or ask users to submit) → wallets.json:
 *   { "<pubkey>": "0x<wallet>" }
 */

const fs   = require('fs');
const path = require('path');

// ─── Arg parsing ─────────────────────────────────────────────────────────────
const argv    = process.argv.slice(2);
const dryRun  = argv.includes('--dry-run');
const dbIdx   = argv.indexOf('--db');
const outIdx  = argv.indexOf('--out');
const DB_PATH  = dbIdx  >= 0 ? argv[dbIdx  + 1] : path.join(process.cwd(), 'conduit.db');
const OUT_PATH = outIdx >= 0 ? argv[outIdx + 1] : path.join(process.cwd(), 'airdrop-snapshot.json');

// ─── Scoring constants ───────────────────────────────────────────────────────
const PIONEER_CUTOFF = new Date('2026-06-01T00:00:00Z').getTime();
const BASE_ALLOC     = 1_000n;
const PER_POST       = 50n;
const PER_SIGNAL     = 20n;
const PER_REPLY      = 10n;
const MAX_ALLOC      = 50_000n;   // AETH, before parseUnits
const DECIMALS       = 18n;
const ONE_AETH       = 10n ** DECIMALS;

// ─── Validation helpers ──────────────────────────────────────────────────────
function isEthAddress(s) { return /^0x[0-9a-fA-F]{40}$/.test(s); }

// ─── Lazy-load heavy deps (fail with clear message if not installed) ──────────
function requireDep(name) {
  try { return require(name); }
  catch { throw new Error(`Missing dependency: run  npm install ${name}  first.`); }
}

async function main() {
  const Database      = requireDep('better-sqlite3');
  const { MerkleTree } = requireDep('merkletreejs');
  const { keccak256: keccak } = requireDep('keccak');
  const { keccak256, solidityPackedKeccak256 } = requireDep('ethers');

  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Conduit Airdrop Snapshot Generator      ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // ── Load DB ──────────────────────────────────────────────────────────────
  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Database not found at: ${DB_PATH}`);
    console.error('   Copy your production conduit.db here or pass --db /path/to/conduit.db');
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });
  console.log(`📂 Loaded DB: ${DB_PATH}`);

  // ── Load wallet links ─────────────────────────────────────────────────────
  const WALLETS_FILE = path.join(process.cwd(), 'wallets.json');
  let walletMap = {};
  if (fs.existsSync(WALLETS_FILE)) {
    try {
      walletMap = JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));
      // Normalize all addresses to lowercase
      walletMap = Object.fromEntries(
        Object.entries(walletMap)
          .filter(([, addr]) => isEthAddress(addr))
          .map(([pk, addr]) => [pk, addr.toLowerCase()])
      );
      console.log(`🔗 Wallet links loaded: ${Object.keys(walletMap).length}`);
    } catch (e) {
      console.warn(`⚠️  Could not parse wallets.json: ${e.message}. Continuing without wallet links.`);
    }
  } else {
    console.warn('⚠️  wallets.json not found — no wallets will be eligible.');
    console.warn('   Create wallets.json mapping { pubkey: "0x..." } to proceed.');
  }

  // ── Query DB ──────────────────────────────────────────────────────────────
  let messages, signals, replies, peers;
  try {
    messages = db.prepare('SELECT id, sender_pubkey, timestamp FROM messages').all();
    signals  = db.prepare('SELECT post_id FROM signals').all();
    replies  = db.prepare('SELECT post_id FROM replies').all();
    // peers table may not exist in older schemas — graceful fallback
    try { peers = db.prepare('SELECT pubkey, last_seen FROM peers').all(); }
    catch { peers = []; console.warn('  peers table not found — skipping peer pioneer check.'); }
  } catch (e) {
    console.error('❌ DB query failed:', e.message);
    process.exit(1);
  }

  console.log(`\n📊 DB Stats:`);
  console.log(`   Posts:   ${messages.length}`);
  console.log(`   Signals: ${signals.length}`);
  console.log(`   Replies: ${replies.length}`);
  console.log(`   Peers:   ${peers.length}`);

  // ── Build post index for fast lookup ─────────────────────────────────────
  const postAuthor = new Map(); // postId -> pubkey
  for (const m of messages) postAuthor.set(m.id, m.sender_pubkey);

  // ── Score each pubkey ─────────────────────────────────────────────────────
  const scores = new Map(); // pubkey -> { posts, signalsReceived, repliesReceived, pioneer }

  function getScore(pubkey) {
    if (!scores.has(pubkey)) scores.set(pubkey, { posts: 0, signalsReceived: 0, repliesReceived: 0, pioneer: false });
    return scores.get(pubkey);
  }

  for (const m of messages) {
    const s = getScore(m.sender_pubkey);
    s.posts++;
    if (m.timestamp && m.timestamp < PIONEER_CUTOFF) s.pioneer = true;
  }

  for (const sig of signals) {
    const author = postAuthor.get(sig.post_id);
    if (author) getScore(author).signalsReceived++;
  }

  for (const rep of replies) {
    const author = postAuthor.get(rep.post_id);
    if (author) getScore(author).repliesReceived++;
  }

  for (const p of peers) {
    const s = getScore(p.pubkey);
    if (p.last_seen && p.last_seen < PIONEER_CUTOFF) s.pioneer = true;
  }

  // ── Calculate allocations ─────────────────────────────────────────────────
  const allocations = [];
  let totalAETH = 0n;
  let skippedNoWallet = 0;
  let skippedBadAddress = 0;
  let cappedCount = 0;
  const dedupWallets = new Set(); // prevent one wallet claiming multiple pubkeys

  for (const [pubkey, score] of scores.entries()) {
    const rawAddr = walletMap[pubkey];
    if (!rawAddr) { skippedNoWallet++; continue; }

    const addr = rawAddr.toLowerCase();
    if (!isEthAddress(addr)) { skippedBadAddress++; continue; }

    // De-duplicate: if a wallet already claimed via another pubkey, skip
    if (dedupWallets.has(addr)) {
      console.warn(`  ⚠️  Wallet ${addr} linked to multiple pubkeys — taking first occurrence.`);
      continue;
    }
    dedupWallets.add(addr);

    let amount = BASE_ALLOC
      + BigInt(score.posts)           * PER_POST
      + BigInt(score.signalsReceived) * PER_SIGNAL
      + BigInt(score.repliesReceived) * PER_REPLY;

    // Pioneer doubles before cap
    if (score.pioneer) amount = amount * 2n;

    // Apply hard cap
    if (amount > MAX_ALLOC) { amount = MAX_ALLOC; cappedCount++; }

    const amountWei  = amount * ONE_AETH;
    totalAETH += amount;

    allocations.push({
      address:    addr,
      amountWei:  amountWei.toString(),
      amountAETH: amount.toString(),
      score:      { ...score },
    });
  }

  // Sort by address for deterministic tree
  allocations.sort((a, b) => a.address.localeCompare(b.address));

  console.log(`\n🏆 Allocation Summary:`);
  console.log(`   Eligible wallets:            ${allocations.length}`);
  console.log(`   Skipped (no wallet link):    ${skippedNoWallet}`);
  console.log(`   Skipped (bad address):       ${skippedBadAddress}`);
  console.log(`   Capped at ${MAX_ALLOC.toLocaleString()} AETH:          ${cappedCount}`);
  console.log(`   Total AETH to distribute:    ${totalAETH.toLocaleString()}`);

  if (allocations.length === 0) {
    console.error('\n❌ No eligible wallets found. Check wallets.json and DB schema.');
    process.exit(1);
  }

  if (dryRun) {
    console.log('\n✅ Dry run complete — no file written.');
    process.exit(0);
  }

  // ── Build Merkle tree ─────────────────────────────────────────────────────
  console.log('\n🌳 Building Merkle tree...');

  // Leaf = keccak256(abi.encodePacked(address, uint256))
  // Must exactly match the Solidity contract's verification logic
  const leaves = allocations.map((a) =>
    Buffer.from(
      solidityPackedKeccak256(
        ['address', 'uint256'],
        [a.address, a.amountWei]
      ).slice(2),
      'hex'
    )
  );

  const tree = new MerkleTree(leaves, keccak, { sortPairs: true });
  const merkleRoot = tree.getHexRoot();

  console.log(`   Leaves:      ${leaves.length}`);
  console.log(`   Tree depth:  ${tree.getDepth()}`);
  console.log(`   Merkle root: ${merkleRoot}`);

  // ── Attach proofs ─────────────────────────────────────────────────────────
  const finalAllocations = allocations.map((a, i) => ({
    address:    a.address,
    amountWei:  a.amountWei,
    amountAETH: a.amountAETH,
    proof:      tree.getHexProof(leaves[i]),
    score:      a.score,
  }));

  // ── Quick self-verification pass ──────────────────────────────────────────
  console.log('\n🔍 Verifying proofs (spot check first 5)...');
  let verifyFail = 0;
  for (let i = 0; i < Math.min(5, finalAllocations.length); i++) {
    const a = finalAllocations[i];
    const leaf = leaves[i];
    const valid = tree.verify(a.proof.map(p => Buffer.from(p.slice(2), 'hex')), leaf, tree.getRoot());
    if (!valid) { console.error(`  ❌ Proof invalid for ${a.address}`); verifyFail++; }
    else console.log(`  ✅ ${a.address} — ${a.amountAETH} AETH`);
  }
  if (verifyFail > 0) { console.error('\n❌ Proof verification failed. Do not deploy this snapshot.'); process.exit(1); }

  // ── Write output ──────────────────────────────────────────────────────────
  const output = {
    generatedAt:  new Date().toISOString(),
    merkleRoot,
    totalWallets: finalAllocations.length,
    totalAETH:    totalAETH.toString(),
    scoring: {
      baseAlloc:   BASE_ALLOC.toString(),
      perPost:     PER_POST.toString(),
      perSignal:   PER_SIGNAL.toString(),
      perReply:    PER_REPLY.toString(),
      maxAlloc:    MAX_ALLOC.toString(),
      pioneerCutoff: new Date(PIONEER_CUTOFF).toISOString(),
    },
    allocations: finalAllocations,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\n✅ Snapshot saved → ${OUT_PATH}`);

  // ── Final instructions ────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────');
  console.log('NEXT STEPS:');
  console.log(`  1. Set MERKLE_ROOT=${merkleRoot} in .env`);
  console.log('  2. Run: npx hardhat run scripts/set-merkle-root.js --network base-sepolia');
  console.log('  3. Run: npx hardhat run scripts/open-airdrop.js --network base-sepolia');
  console.log('  4. Copy airdrop-snapshot.json to your server root so the API can serve proofs');
  console.log('─────────────────────────────────────────────────\n');
}

main().catch((e) => { console.error('\n❌ Fatal:', e.message); process.exit(1); });
