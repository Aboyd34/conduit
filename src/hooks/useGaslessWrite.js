/**
 * useGaslessWrite.js
 * Sends transactions via Alchemy Gas Manager (user pays $0 gas)
 * Falls back to normal tx if no policy ID is set
 *
 * Usage:
 *   const { write, isPending, isSuccess, txHash } = useGaslessWrite()
 *   write({ to: CONTRACT_ADDRESS, data: encodedCallData })
 */
import { useState, useCallback } from 'react'
import { useWalletClient, useAccount } from 'wagmi'
import { GAS_POLICY_ID, ALCHEMY_KEY } from '../providers/WalletProvider'

export function useGaslessWrite() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [txHash, setTxHash] = useState(null)
  const [error, setError] = useState(null)

  const write = useCallback(async ({ to, data, value = 0n }) => {
    if (!walletClient || !address) {
      setError('Wallet not connected')
      return
    }
    try {
      setIsPending(true)
      setError(null)
      setIsSuccess(false)

      // If Gas Manager policy exists — use Alchemy's paymaster RPC
      if (GAS_POLICY_ID && ALCHEMY_KEY) {
        const body = {
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_sendUserOperation',
          params: [
            {
              sender: address,
              to,
              data,
              value: value.toString(),
              paymasterAndData: GAS_POLICY_ID,
            },
            `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
          ],
        }
        const res = await fetch(
          `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        )
        const json = await res.json()
        if (json.error) throw new Error(json.error.message)
        setTxHash(json.result)
      } else {
        // Fallback: normal wallet transaction
        const hash = await walletClient.sendTransaction({ to, data, value })
        setTxHash(hash)
      }

      setIsSuccess(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsPending(false)
    }
  }, [walletClient, address])

  return { write, isPending, isSuccess, txHash, error }
}
