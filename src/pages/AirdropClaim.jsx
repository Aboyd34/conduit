import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xff235BAc8CEf03Af547BAda2Ffe56889305f7B17'
const CHAIN_ID = 11155111 // Sepolia

const ABI = [
  'function claim(uint256 amount, bytes32[] calldata proof) external',
  'function hasClaimed(address) view returns (bool)',
  'function airdropOpen() view returns (bool)',
]

export default function AirdropClaim() {
  const [status, setStatus]   = useState('idle') // idle | loading | success | error | claimed | closed
  const [txHash, setTxHash]   = useState('')
  const [error, setError]     = useState('')
  const [wallet, setWallet]   = useState('')

  async function getProofData(address) {
    const res = await fetch('/airdrop-snapshot.json')
    const snapshot = await res.json()
    const entry = snapshot.recipients.find(
      r => r.address.toLowerCase() === address.toLowerCase()
    )
    return entry || null
  }

  async function handleClaim() {
    setError('')
    setStatus('loading')
    try {
      if (!window.ethereum) throw new Error('No wallet detected. Install MetaMask.')

      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== CHAIN_ID) {
        throw new Error('Switch to Sepolia testnet in your wallet.')
      }

      const signer  = await provider.getSigner()
      const address = await signer.getAddress()
      setWallet(address)

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

      const isOpen = await contract.airdropOpen()
      if (!isOpen) { setStatus('closed'); return }

      const already = await contract.hasClaimed(address)
      if (already) { setStatus('claimed'); return }

      const data = await getProofData(address)
      if (!data) throw new Error('Your wallet is not in the airdrop snapshot.')

      const tx = await contract.claim(data.amount, data.proof)
      await tx.wait()
      setTxHash(tx.hash)
      setStatus('success')
    } catch (e) {
      setError(e.reason || e.message || 'Unknown error')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 shadow-xl border border-zinc-700">
        <h1 className="text-3xl font-bold mb-2 text-center">🪂 AETH Airdrop</h1>
        <p className="text-zinc-400 text-center mb-8 text-sm">
          Claim your Aether tokens earned from Conduit activity.
        </p>

        {status === 'idle' && (
          <button
            onClick={handleClaim}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition"
          >
            Connect &amp; Claim AETH
          </button>
        )}

        {status === 'loading' && (
          <div className="text-center text-zinc-400 animate-pulse">Processing...</div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <p className="text-green-400 font-bold text-xl mb-2">✅ Claimed!</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 text-sm underline break-all"
            >
              View on Etherscan
            </a>
          </div>
        )}

        {status === 'claimed' && (
          <p className="text-yellow-400 text-center font-semibold">⚠️ Already claimed.</p>
        )}

        {status === 'closed' && (
          <p className="text-red-400 text-center font-semibold">🔒 Airdrop is currently closed.</p>
        )}

        {status === 'error' && (
          <div className="text-center">
            <p className="text-red-400 font-semibold mb-2">❌ Error</p>
            <p className="text-zinc-400 text-sm">{error}</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-blue-400 underline text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {wallet && (
          <p className="text-zinc-600 text-xs text-center mt-6 break-all">{wallet}</p>
        )}
      </div>
    </div>
  )
}
