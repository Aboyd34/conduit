/**
 * WalletConnect — optional Base wallet overlay
 * On connect, links wallet address to local signing pubkey in localStorage
 * This allows the feed to show Basenames next to posts
 */

import React, { useEffect } from 'react';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { getSigningPublicKey } from '../ConduitKeyManager.js';
import '@coinbase/onchainkit/styles.css';

const WALLET_LINK_KEY = 'conduit_wallet_link';

function WalletLinker() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected || !address) return;
    const pubkey = getSigningPublicKey();
    if (!pubkey) return;
    try {
      const raw = localStorage.getItem(WALLET_LINK_KEY);
      const links = raw ? JSON.parse(raw) : {};
      links[pubkey] = address;
      localStorage.setItem(WALLET_LINK_KEY, JSON.stringify(links));
    } catch {}
  }, [isConnected, address]);

  return null;
}

export function WalletConnect() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem 0.5rem' }}>
      <WalletLinker />
      <Wallet>
        <ConnectWallet>
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}

export default WalletConnect;
