/**
 * SenderName — resolves Basename for a post sender
 * Uses displayKey (short fingerprint) if no wallet link found
 */

import React from 'react';
import { Name } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';

const WALLET_LINK_KEY = 'conduit_wallet_link';

export function SenderName({ senderPubkey, displayKey }) {
  let linkedAddress = null;
  try {
    const raw = localStorage.getItem(WALLET_LINK_KEY);
    if (raw) {
      const links = JSON.parse(raw);
      linkedAddress = links[senderPubkey] || null;
    }
  } catch {}

  if (linkedAddress) {
    return (
      <span className="post-sender-name">
        <Name address={linkedAddress} chain={base} />
      </span>
    );
  }

  // Show short fingerprint — not the full JWK
  const display = displayKey || senderPubkey;
  const isJwk = typeof display === 'string' && display.startsWith('{');
  const label = isJwk ? display.slice(0, 20) + '...' : (display?.slice(0, 20) + '...');

  return (
    <span className="post-sender-name">
      🔑 {label}
    </span>
  );
}

export default SenderName;
