/**
 * useAether — React hook for interacting with the Aether (AETH) contract
 * Works with wagmi + viem already wired via OnchainKit
 */
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

const AETHER_ADDRESS = import.meta.env.VITE_AETHER_ADDRESS;

const ABI = [
  // Read
  { name: 'balanceOf',  type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
  { name: 'isGated',   type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }] },
  { name: 'hasClaimed', type: 'function', stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }] },
  { name: 'airdropOpen', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'bool' }] },
  // Write
  { name: 'recycle',     type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'postId', type: 'string' }], outputs: [] },
  { name: 'claimAirdrop', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'proof',  type: 'bytes32[]' },
    ], outputs: [] },
];

export function useAether() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: AETHER_ADDRESS,
    abi: ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address && !!AETHER_ADDRESS },
  });

  const { data: gated } = useReadContract({
    address: AETHER_ADDRESS,
    abi: ABI,
    functionName: 'isGated',
    args: [address],
    query: { enabled: !!address && !!AETHER_ADDRESS },
  });

  const { data: claimed } = useReadContract({
    address: AETHER_ADDRESS,
    abi: ABI,
    functionName: 'hasClaimed',
    args: [address],
    query: { enabled: !!address && !!AETHER_ADDRESS },
  });

  const { data: airdropOpen } = useReadContract({
    address: AETHER_ADDRESS,
    abi: ABI,
    functionName: 'airdropOpen',
    query: { enabled: !!AETHER_ADDRESS },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  async function recyclePost(postId) {
    if (!AETHER_ADDRESS) throw new Error('Contract not deployed yet');
    return writeContractAsync({
      address: AETHER_ADDRESS,
      abi: ABI,
      functionName: 'recycle',
      args: [postId],
    });
  }

  async function claimAirdrop(amountWei, proof) {
    if (!AETHER_ADDRESS) throw new Error('Contract not deployed yet');
    return writeContractAsync({
      address: AETHER_ADDRESS,
      abi: ABI,
      functionName: 'claimAirdrop',
      args: [BigInt(amountWei), proof],
    });
  }

  return {
    isConnected,
    address,
    balance:      balance ? formatUnits(balance, 18) : '0',
    balanceRaw:   balance || 0n,
    isGated:      gated ?? false,
    hasClaimed:   claimed ?? false,
    airdropOpen:  airdropOpen ?? false,
    contractReady: !!AETHER_ADDRESS,
    isPending,
    recyclePost,
    claimAirdrop,
  };
}
