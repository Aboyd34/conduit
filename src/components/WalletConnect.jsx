import React from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

const CDT_ADDRESS = '0x719d3f3E01E365F9aa73374674499539fdD0f82E';
const ERC20_BALANCE_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
];

const WalletIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12"/>
    <path d="M22 7H2v5h20V7z"/>
    <path d="M12 22V7"/>
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
  </svg>
);

export default function WalletConnect({ compact = false }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors }  = useConnect();
  const { disconnect }           = useDisconnect();

  const { data: rawBalance } = useReadContract({
    address: CDT_ADDRESS,
    abi: ERC20_BALANCE_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address },
  });

  const { data: decimals } = useReadContract({
    address: CDT_ADDRESS,
    abi: ERC20_BALANCE_ABI,
    functionName: 'decimals',
    query: { enabled: !!address },
  });

  const cdtBalance = rawBalance != null && decimals != null
    ? parseFloat(formatUnits(rawBalance, decimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : null;

  if (isConnected) {
    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{
          fontSize: 9,
          fontFamily: 'monospace',
          color: 'rgba(0,212,255,0.6)',
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom: 4,
        }}>Wallet</span>
        <button
          onClick={() => disconnect()}
          title={`Connected: ${address}\nClick to disconnect`}
          style={{
            width: 40, height: 40, borderRadius: 10,
            border: '1px solid rgba(0,212,255,0.35)',
            background: 'rgba(0,212,255,0.08)',
            color: '#00d4ff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 2, transition: 'all 0.15s', padding: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; }}
        >
          <WalletIcon />
          <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#00d4ff' }}>
            {address?.slice(0, 4)}…{address?.slice(-3)}
          </span>
        </button>
        {cdtBalance !== null && (
          <span style={{
            fontSize: 8,
            fontFamily: 'monospace',
            color: 'rgba(0,212,255,0.5)',
            marginTop: 3,
            letterSpacing: 0.5,
          }}>
            {cdtBalance} CDT
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{
        fontSize: 9,
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.25)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
      }}>Wallet</span>
      <button
        onClick={() => connect({ connector: connectors[0] })}
        title="Connect your wallet to unlock Airdrop, Aether gating & on-chain features"
        style={{
          width: 40, height: 40, borderRadius: 10,
          border: '1px solid rgba(122,92,255,0.35)',
          background: 'rgba(122,92,255,0.08)',
          color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(122,92,255,0.2)';
          e.currentTarget.style.color = '#7a5cff';
          e.currentTarget.style.borderColor = 'rgba(122,92,255,0.7)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(122,92,255,0.08)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
          e.currentTarget.style.borderColor = 'rgba(122,92,255,0.35)';
        }}
      >
        <WalletIcon />
      </button>
      <span style={{
        fontSize: 8,
        color: 'rgba(122,92,255,0.6)',
        fontFamily: 'monospace',
        marginTop: 3,
        letterSpacing: 0.5,
      }}>Connect</span>
    </div>
  );
}
