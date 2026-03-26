/**
 * useWallet.js
 * Unified wallet hook — works with MetaMask OR Coinbase Smart Wallet
 * Uses wagmi under the hood (Account Kit compatible)
 */
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

export function useWallet() {
  const { address, isConnected, chain } = useAccount()
  const { connect, isPending: connecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const isCorrectChain = chain?.id === sepolia.id
  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null

  function connectMetaMask() {
    connect({ connector: metaMask() })
  }

  function connectSmartWallet() {
    // Coinbase Smart Wallet — email/passkey login, no seed phrase
    connect({ connector: coinbaseWallet({ appName: 'Conduit', preference: 'smartWalletOnly' }) })
  }

  function switchToSepolia() {
    switchChain({ chainId: sepolia.id })
  }

  return {
    address,
    isConnected,
    connecting,
    chain,
    isCorrectChain,
    shortAddress,
    connectMetaMask,
    connectSmartWallet,
    switchToSepolia,
    disconnect,
  }
}
