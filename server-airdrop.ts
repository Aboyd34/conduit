/**
 * Airdrop proof API — added to server.ts or run as a sidecar
 * Serves Merkle proofs to frontend for airdrop claiming
 *
 * Endpoint: GET /api/airdrop/proof?address=0x...
 * Returns: { amountWei, proof } or 404
 *
 * To integrate: import and mount these routes in server.ts
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function airdropRouter() {
  const router = Router();

  // Load snapshot once at startup
  let snapshot: any = null;
  const snapshotPath = path.join(__dirname, 'airdrop-snapshot.json');

  if (fs.existsSync(snapshotPath)) {
    snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    console.log(`[Airdrop] Loaded snapshot: ${snapshot.totalWallets} wallets, root=${snapshot.merkleRoot}`);
  } else {
    console.warn('[Airdrop] No snapshot file found — /api/airdrop/proof will return 404');
  }

  router.get('/proof', (req, res) => {
    const address = (req.query.address as string)?.toLowerCase();
    if (!address) return res.status(400).json({ error: 'address required' });
    if (!snapshot) return res.status(503).json({ error: 'Snapshot not loaded' });

    const entry = snapshot.allocations.find((a: any) => a.address === address);
    if (!entry) return res.status(404).json({ error: 'Address not in snapshot' });

    res.json({
      address: entry.address,
      amountWei: entry.amountWei,
      amountAETH: entry.amountAETH,
      proof: entry.proof,
    });
  });

  router.get('/info', (req, res) => {
    if (!snapshot) return res.status(503).json({ error: 'Snapshot not loaded' });
    res.json({
      merkleRoot:   snapshot.merkleRoot,
      totalWallets: snapshot.totalWallets,
      totalAETH:    snapshot.totalAETH,
      generatedAt:  snapshot.generatedAt,
    });
  });

  return router;
}
