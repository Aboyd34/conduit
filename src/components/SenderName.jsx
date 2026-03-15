/**
 * SenderName — resolves Basename for a post sender
 * If the sender pubkey matches the connected wallet's linked pubkey, show Basename.
 * Otherwise show truncated pubkey as before.
 */

import React from 'react';
import { Name, Address } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';
import { useAccount } from 'wagmi';

// localStorage key where we store the wallet<>pubkey link
const WALLET_LINK_KEY = 'conduit_wallet_link';

export function SenderName({ senderPubkey }) {
  const { address, isConnected } = useAccount();

  // Check if this post's sender pubkey is linked to a wallet address
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

  // Fallback: truncated pubkey
  return (
    <span className="post-sender-name">
      🔑 {senderPubkey?.slice(0, 20)}...
    </span>
  );
}

export default SenderName;
