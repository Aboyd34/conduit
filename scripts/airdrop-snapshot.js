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
 * Deps: npm install  (better-sqlite3 merkletreejs keccak ethers are in devDependencies)
 *
 * SCORING:
 *   Every eligible wallet starts at BASE_ALLOC (1,000 AETH).
 *   +50  AETH per post they published
 *   +20  AETH per signal their posts received
 *   +10  AETH per reply  their posts received
 *   Pioneer (active before PIONEER_CUTOFF) → entire allocation × 2
 *   Hard cap: MAX_ALLOC per wallet (50,000 AETH)
 *
 * LEAF ENCODING (must match Aether.sol claimAirdrop):
 *   leaf = keccak256(keccak256(abi.encodePacked(address, uint256)))
 *   i.e.  keccak256(solidityPackedKeccak256(['address','uint256'], [...]))
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
const MAX_ALLOC      = 50_000n;
const DECIMALS       = 18n;
const ONE_AETH       = 10n ** DECIMALS;

function isEthAddress(s) { return /^0x[0-9a-fA-F]{40}$/.test(s); }

function requireDep(name) {
  try { return require(name); }
  catch { throw new Error(`Missing dep: npm install ${name}`); }
}

async function main() {
  const Database       = requireDep('better-sqlite3');
  const { MerkleTree } = requireDep('merkletreejs');
  const keccak256buf   = requireDep('keccak');          // returns Buffer
  const { solidityPackedKeccak256 } = requireDep('ethers');

  console.log('\u2554' + '\u2550'.repeat(46) + '\u2557');
  console.log('\u2551   Conduit Airdrop Snapshot Generator      \u2551');
  console.log('\u255a' + '\u2550'.repeat(46) + '\u255d\n');

  if (!fs.existsSync(DB_PATH)) {
    console.error(`\u274c DB not found: ${DB_PATH}`);
    process.exit(1);
  }
  const db = new Database(DB_PATH, { readonly: true });
  console.log(`\ud83d\udcc2 DB: ${DB_PATH}`);

  // Load wallet links
  const WALLETS_FILE = path.join(process.cwd(), 'wallets.json');
  let walletMap = {};
  if (fs.existsSync(WALLETS_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));
      walletMap = Object.fromEntries(
        Object.entries(raw)
          .filter(([, a]) => isEthAddress(a))
          .map(([pk, a]) => [pk, a.toLowerCase()])
      );
      console.log(`\ud83d\udd17 Wallet links: ${Object.keys(walletMap).length}`);
    } catch (e) { console.warn(`\u26a0\ufe0f  wallets.json parse error: ${e.message}`); }
  } else {
    console.warn('\u26a0\ufe0f  wallets.json not found \u2014 run the /api/admin/export-wallets endpoint first.');
  }

  // Query DB
  let messages, signals, replies, peers;
  try {
    messages = db.prepare('SELECT id, sender_pubkey, timestamp FROM messages').all();
    signals  = db.prepare('SELECT post_id FROM signals').all();
    replies  = db.prepare('SELECT post_id FROM replies').all();
    try   { peers = db.prepare('SELECT pubkey, last_seen FROM peers').all(); }
    catch { peers = []; console.warn('  peers table not found \u2014 skipping.'); }
  } catch (e) { console.error('\u274c DB error:', e.message); process.exit(1); }

  console.log(`\n\ud83d\udcca Posts:${messages.length}  Signals:${signals.length}  Replies:${replies.length}  Peers:${peers.length}`);

  // Score pubkeys
  const postAuthor = new Map();
  for (const m of messages) postAuthor.set(m.id, m.sender_pubkey);

  const scores = new Map();
  function getS(pk) {
    if (!scores.has(pk)) scores.set(pk, { posts:0, signalsReceived:0, repliesReceived:0, pioneer:false });
    return scores.get(pk);
  }
  for (const m of messages) {
    const s = getS(m.sender_pubkey);
    s.posts++;
    if (m.timestamp && m.timestamp < PIONEER_CUTOFF) s.pioneer = true;
  }
  for (const sig of signals) { const a = postAuthor.get(sig.post_id); if (a) getS(a).signalsReceived++; }
  for (const rep of replies)  { const a = postAuthor.get(rep.post_id); if (a) getS(a).repliesReceived++; }
  for (const p of peers) { const s = getS(p.pubkey); if (p.last_seen && p.last_seen < PIONEER_CUTOFF) s.pioneer = true; }

  // Allocations
  const allocations = [];
  let totalAETH = 0n;
  let skippedNoWallet = 0, skippedBadAddr = 0, cappedCount = 0;
  const seen = new Set();

  for (const [pubkey, score] of scores.entries()) {
    const rawAddr = walletMap[pubkey];
    if (!rawAddr) { skippedNoWallet++; continue; }
    const addr = rawAddr.toLowerCase();
    if (!isEthAddress(addr)) { skippedBadAddr++; continue; }
    if (seen.has(addr)) { console.warn(`  \u26a0\ufe0f  Dup wallet ${addr} \u2014 skipping`); continue; }
    seen.add(addr);

    let amount = BASE_ALLOC
      + BigInt(score.posts)           * PER_POST
      + BigInt(score.signalsReceived) * PER_SIGNAL
      + BigInt(score.repliesReceived) * PER_REPLY;
    if (score.pioneer) amount = amount * 2n;
    if (amount > MAX_ALLOC) { amount = MAX_ALLOC; cappedCount++; }

    allocations.push({ address: addr, amountWei: (amount * ONE_AETH).toString(), amountAETH: amount.toString(), score });
    totalAETH += amount;
  }

  allocations.sort((a, b) => a.address.localeCompare(b.address));

  console.log(`\n\ud83c\udfc6 Eligible: ${allocations.length}  Skipped(no wallet): ${skippedNoWallet}  Capped: ${cappedCount}`);
  console.log(`   Total AETH: ${totalAETH.toLocaleString()}`);

  if (allocations.length === 0) { console.error('\u274c No eligible wallets.'); process.exit(1); }
  if (dryRun) { console.log('\n\u2705 Dry run \u2014 no file written.'); process.exit(0); }

  // Build Merkle tree
  // Leaf = keccak256(keccak256(abi.encodePacked(address, amount)))
  // Outer keccak256 is applied by MerkleTree.js hash function
  // Inner hash = solidityPackedKeccak256 — must match Aether.sol claimAirdrop
  console.log('\n\ud83c\udf33 Building Merkle tree...');

  function keccakBuf(data) {
    return keccak256buf('keccak256').update(data).digest();
  }

  const leaves = allocations.map((a) => {
    const innerHash = Buffer.from(
      solidityPackedKeccak256(['address', 'uint256'], [a.address, a.amountWei]).slice(2),
      'hex'
    );
    // Double-hash: outer keccak256 applied here to match Solidity `bytes.concat(keccak256(...))`
    return keccakBuf(innerHash);
  });

  const tree = new MerkleTree(leaves, keccakBuf, { sortPairs: true });
  const merkleRoot = '0x' + tree.getRoot().toString('hex');

  console.log(`   Leaves: ${leaves.length}  Depth: ${tree.getDepth()}`);
  console.log(`   Merkle root: ${merkleRoot}`);

  // Attach proofs + self-verify first 5
  console.log('\n\ud83d\udd0d Verifying spot proofs...');
  let fail = 0;
  const finalAllocations = allocations.map((a, i) => {
    const proof = tree.getProof(leaves[i]).map(x => '0x' + x.data.toString('hex'));
    if (i < 5) {
      const valid = tree.verify(tree.getProof(leaves[i]), leaves[i], tree.getRoot());
      if (valid) console.log(`  \u2705 ${a.address} \u2014 ${a.amountAETH} AETH`);
      else { console.error(`  \u274c PROOF INVALID: ${a.address}`); fail++; }
    }
    return { address: a.address, amountWei: a.amountWei, amountAETH: a.amountAETH, proof, score: a.score };
  });
  if (fail > 0) { console.error('\n\u274c Proof verification failed. Do NOT deploy.'); process.exit(1); }

  // Write output
  const output = {
    generatedAt:  new Date().toISOString(),
    merkleRoot,
    totalWallets: finalAllocations.length,
    totalAETH:    totalAETH.toString(),
    scoring: { baseAlloc: BASE_ALLOC.toString(), perPost: PER_POST.toString(),
               perSignal: PER_SIGNAL.toString(), perReply: PER_REPLY.toString(),
               maxAlloc: MAX_ALLOC.toString(), pioneerCutoff: new Date(PIONEER_CUTOFF).toISOString() },
    allocations: finalAllocations,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\n\u2705 Snapshot saved \u2192 ${OUT_PATH}`);
  console.log(`\nNEXT: MERKLE_ROOT=${merkleRoot}`);
  console.log('  npx hardhat run scripts/set-merkle-root.js --network base-sepolia');
  console.log('  npx hardhat run scripts/open-airdrop.js --network base-sepolia\n');
}

main().catch((e) => { console.error('\n\u274c Fatal:', e.message); process.exit(1); });
