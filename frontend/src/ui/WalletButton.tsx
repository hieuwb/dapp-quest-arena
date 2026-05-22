import { useGameStore } from '../store/game'

export function WalletButton() {
  const userAddress = useGameStore((state) => state.userAddress)
  const connecting = useGameStore((state) => state.connecting)
  const connect = useGameStore((state) => state.connect)
  const disconnect = useGameStore((state) => state.disconnect)

  if (!userAddress) {
    return (
      <button className="primary-button" disabled={connecting} onClick={connect}>
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    )
  }

  return (
    <button className="ghost-button font-mono" onClick={disconnect}>
      {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
    </button>
  )
}

