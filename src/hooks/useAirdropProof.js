/**
 * useAirdropProof.js
 * Fetches the merkle proof + allocation for the connected wallet
 * Serve proofs.json at /api/airdrop/proof/:wallet on your backend
 */
import { useState, useEffect } from 'react'

export function useAirdropProof(walletAddress) {
  const [proof, setProof] = useState(null)
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!walletAddress) return
    const addr = walletAddress.toLowerCase()
    setLoading(true)
    setError(null)

    fetch(`/api/airdrop/proof/${addr}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not eligible'))
      .then(data => {
        setProof(data.proof)
        setAllocation(data.amountAeth)
      })
      .catch(e => setError(typeof e === 'string' ? e : 'Proof fetch failed'))
      .finally(() => setLoading(false))
  }, [walletAddress])

  return { proof, allocation, loading, error }
}
