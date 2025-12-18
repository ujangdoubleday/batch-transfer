import { WalletConnectGuard } from '../components/WalletConnectGuard'

export function Transfer() {
  return (
    <WalletConnectGuard>
      <div className="transfer-page">
        <h1>Batch Transfer</h1>
        <p>This feature is coming soon.</p>
      </div>
    </WalletConnectGuard>
  )
}
