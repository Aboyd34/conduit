/**
 * WalletConnect — optional Base wallet overlay
 * Anonymous users: ignore this entirely, local keys still work
 * Power users: connect Base wallet for Basename + future tipping
 */

import React from 'react';
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
import '@coinbase/onchainkit/styles.css';

export function WalletConnect() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem 0.5rem' }}>
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
