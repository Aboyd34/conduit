/**
 * Airdrop proof API — added to server.ts or run as a sidecar
 * Serves Merkle proofs to frontend for airdrop claiming
 *
 * Endpoint: GET /api/airdrop/proof?address=0x...
 * Returns: { amountWei, proof } or 404
 *
 * To integrate: import and mount these routes in server.ts
 */

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Allocation {
  address: string;
  amountWei: string;
  amountAETH: string | number;
  proof: string[];
}

interface Snapshot {
  merkleRoot: string;
  totalWallets: number;
  totalAETH: string | number;
  generatedAt: string;
  allocations: Allocation[];
}

export function airdropRouter() {
  const router = Router();

  let snapshot: Snapshot | null = null;
  const snapshotPath = path.join(__dirname, 'airdrop-snapshot.json');

  if (fs.existsSync(snapshotPath)) {
    try {
      snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8')) as Snapshot;
      console.log(`[Airdrop] Loaded snapshot: ${snapshot.totalWallets} wallets, root=${snapshot.merkleRoot}`);
    } catch (err) {
      // BUG FIX 9: snapshot parse errors were silent — now logged so bad JSON is surfaced
      console.error('[Airdrop] Failed to parse airdrop-snapshot.json:', err);
    }
  } else {
    console.warn('[Airdrop] No snapshot file found — /api/airdrop/proof will return 404');
  }

  router.get('/proof', (req: Request, res: Response) => {
    const address = (req.query.address as string)?.toLowerCase().trim();
    if (!address) return res.status(400).json({ error: 'address required' });
    // BUG FIX 9b: basic address format validation to prevent DB-style injection in lookup
    if (!/^0x[0-9a-f]{40}$/.test(address)) return res.status(400).json({ error: 'invalid address format' });
    if (!snapshot) return res.status(503).json({ error: 'Snapshot not loaded' });

    const entry = snapshot.allocations.find((a) => a.address.toLowerCase() === address);
    if (!entry) return res.status(404).json({ error: 'Address not in snapshot' });

    res.json({
      address:    entry.address,
      amountWei:  entry.amountWei,
      amountAETH: entry.amountAETH,
      proof:      entry.proof,
    });
  });

  router.get('/info', (_req: Request, res: Response) => {
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
