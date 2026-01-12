import { useConnect } from 'wagmi'

export function WalletOptions() {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <button key={connector.uid} onClick={() => connect({ connector })}>
      {connector.name} 
      {/* If Phantom is installed, one of these buttons will say "Phantom" */}
    </button>
  ))
}