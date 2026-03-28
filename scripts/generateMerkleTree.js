#!/usr/bin/env node
/**
 * generateMerkleTree.js
 * Conduit AETH Airdrop — Merkle Tree Generator
 *
 * Pulls activity data from your Conduit API/Supabase,
 * scores each user, builds a MerkleTree, and outputs:
 *   - scripts/output/merkleRoot.txt   ← paste into MerkleAirdrop constructor
 *   - scripts/output/proofs.json      ← serve this so users can fetch their proof
 *   - scripts/output/allocations.json ← human-readable allocation list
 *
 * Usage:
 *   node scripts/generateMerkleTree.js
 *
 * Env vars needed (create scripts/.env):
 *   API_URL=https://your-conduit-backend.com
 *   API_SECRET=your-admin-secret-if-any
 */

import { MerkleTree } from 'merkletreejs'
import { keccak256, encodePacked } from 'viem'
import { parseUnits } from 'viem'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'output')
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

const API_URL = process.env.API_URL || 'http://localhost:3001'
const PIONEER_CUTOFF = new Date('2026-06-01T00:00:00Z')

// ─── SCORING CONFIG ─────────────────────────────────────────
const SCORE = {
  post: 50,       // posted a signal
  boost: 20,      // received a boost
  reply: 10,      // received a reply
  pioneerMult: 2, // joined before PIONEER_CUTOFF
  maxAlloc: 50_000, // cap per wallet (AETH, not wei)
}

// ─── FETCH DATA ─────────────────────────────────────────
async function fetchAllPosts() {
  try {
    const res = await fetch(`${API_URL}/api/relay/feed`)
    if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? data : data.posts || []
  } catch (e) {
    console.warn('[WARN] Could not fetch feed:', e.message, '\u2014 using empty dataset')
    return []
  }
}

async function fetchPeers() {
  try {
    const res = await fetch(`${API_URL}/api/peers`)
    if (!res.ok) throw new Error(`Peers fetch failed: ${res.status}`)
    return res.json()
  } catch (e) {
    console.warn('[WARN] Could not fetch peers:', e.message, '\u2014 using empty dataset')
    return []
  }
}

// ─── SCORE USERS ─────────────────────────────────────────
function scoreUsers(posts, peers) {
  const scores = {} // wallet_address -> { raw, isPioneer, posts, boosts, replies }

  // Index peer join dates by pubkey
  const peerJoinDate = {}
  for (const peer of peers) {
    if (peer.pubkey && peer.created_at) {
      peerJoinDate[peer.pubkey] = new Date(peer.created_at)
    }
  }

  for (const post of posts) {
    const wallet = post.wallet_address || post.author_wallet
    const pubkey = post.pubkey || post.author_pubkey
    if (!wallet || !/^0x[0-9a-fA-F]{40}$/.test(wallet)) continue

    if (!scores[wallet]) {
      scores[wallet] = { raw: 0, isPioneer: false, posts: 0, boosts: 0, replies: 0, pubkey }
    }

    // Posts
    scores[wallet].posts += 1
    scores[wallet].raw += SCORE.post

    // Boosts received
    const boosts = post.boost_count || post.signals || 0
    scores[wallet].boosts += boosts
    scores[wallet].raw += boosts * SCORE.boost

    // Replies received
    const replies = post.reply_count || post.replies || 0
    scores[wallet].replies += replies
    scores[wallet].raw += replies * SCORE.reply

    // Pioneer check
    const joinDate = peerJoinDate[pubkey]
    if (joinDate && joinDate < PIONEER_CUTOFF) {
      scores[wallet].isPioneer = true
    }
  }

  return scores
}

// ─── BUILD ALLOCATIONS ───────────────────────────────────
function buildAllocations(scores) {
  const allocs = []
  for (const [wallet, data] of Object.entries(scores)) {
    let amount = data.raw
    if (data.isPioneer) amount *= SCORE.pioneerMult
    amount = Math.min(amount, SCORE.maxAlloc)
    if (amount < 1) continue // skip zero-score wallets
    allocs.push({
      wallet: wallet.toLowerCase(),
      amountAeth: amount,
      amountWei: parseUnits(amount.toString(), 18).toString(),
      isPioneer: data.isPioneer,
      posts: data.posts,
      boosts: data.boosts,
      replies: data.replies,
    })
  }
  // Sort descending by allocation
  return allocs.sort((a, b) => b.amountAeth - a.amountAeth)
}

// ─── BUILD MERKLE TREE ───────────────────────────────────
function buildMerkleTree(allocations) {
  // Leaf = keccak256(abi.encodePacked(address, uint256))
  // Must match MerkleAirdrop.sol exactly
  const leaves = allocations.map(({ wallet, amountWei }) =>
    Buffer.from(
      keccak256(encodePacked(['address', 'uint256'], [wallet, BigInt(amountWei)])).slice(2),
      'hex'
    )
  )

  const tree = new MerkleTree(leaves, (buf) => {
    const hex = '0x' + buf.toString('hex')
    return Buffer.from(keccak256(hex).slice(2), 'hex')
  }, { sortPairs: true })

  return { tree, leaves }
}

// ─── GENERATE PROOFS ────────────────────────────────────
function generateProofs(tree, leaves, allocations) {
  const proofs = {}
  allocations.forEach(({ wallet, amountAeth, amountWei, isPioneer }, i) => {
    proofs[wallet] = {
      amountAeth,
      amountWei,
      isPioneer,
      proof: tree.getHexProof(leaves[i]),
    }
  })
  return proofs
}

// ─── MAIN ──────────────────────────────────────────────
async function main() {
  console.log('🔍 Fetching Conduit activity data...')
  const [posts, peers] = await Promise.all([fetchAllPosts(), fetchPeers()])
  console.log(`   ${posts.length} posts | ${peers.length} peers`)

  if (posts.length === 0) {
    console.log('⚠️  No posts found. Generating sample data for testing...')
    // Inject sample wallets so you can test the pipeline end-to-end
    posts.push(
      { wallet_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', boost_count: 5, reply_count: 3, pubkey: 'test1' },
      { wallet_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', boost_count: 2, reply_count: 8, pubkey: 'test2' },
      { wallet_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', boost_count: 0, reply_count: 1, pubkey: 'test3' },
    )
    peers.push(
      { pubkey: 'test1', created_at: '2026-01-01T00:00:00Z' }, // pioneer
      { pubkey: 'test2', created_at: '2026-05-01T00:00:00Z' }, // pioneer
      { pubkey: 'test3', created_at: '2026-07-01T00:00:00Z' }, // not pioneer
    )
  }

  console.log('📊 Scoring users...')
  const scores = scoreUsers(posts, peers)
  const allocations = buildAllocations(scores)
  console.log(`   ${allocations.length} eligible wallets`)

  if (allocations.length === 0) {
    console.error('❌ No eligible wallets found. Check that posts have wallet_address fields.')
    process.exit(1)
  }

  console.log('🌳 Building Merkle tree...')
  const { tree, leaves } = buildMerkleTree(allocations)
  const merkleRoot = tree.getHexRoot()
  console.log(`   Merkle root: ${merkleRoot}`)

  console.log('🔑 Generating proofs...')
  const proofs = generateProofs(tree, leaves, allocations)

  // ── Write outputs ──
  fs.writeFileSync(path.join(OUT_DIR, 'merkleRoot.txt'), merkleRoot)
  fs.writeFileSync(path.join(OUT_DIR, 'proofs.json'), JSON.stringify(proofs, null, 2))
  fs.writeFileSync(path.join(OUT_DIR, 'allocations.json'), JSON.stringify(allocations, null, 2))

  console.log('')
  console.log('✅ Done! Files written to scripts/output/')
  console.log('   merkleRoot.txt   ← paste into MerkleAirdrop constructor')
  console.log('   proofs.json      ← serve this so wallets can fetch their proof')
  console.log('   allocations.json ← human-readable allocation list')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Deploy AethToken.sol → copy address')
  console.log('  2. Deploy MerkleAirdrop.sol(aethAddr, merkleRoot)')
  console.log('  3. Paste contract address into src/contracts/airdropABI.js')
  console.log('  4. Serve proofs.json at /api/airdrop/proof/:wallet')
  console.log('')

  // Print top 5 allocations
  console.log('Top allocations:')
  allocations.slice(0, 5).forEach(a =>
    console.log(`  ${a.wallet} → ${a.amountAeth.toLocaleString()} AETH${a.isPioneer ? ' (⚡ Pioneer)' : ''}`)
  )
}

main().catch(console.error)
