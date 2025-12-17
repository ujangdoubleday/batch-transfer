import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useChainMetadata } from '../../hooks/useChainMetadata'
import './ConnectWallet.css'

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectWallet() {
  const { address, isConnected, chain, chainId } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  const [copied, setCopied] = useState(false)
  
  const { metadata } = useChainMetadata(chainId)

  // Close modals if user connects/disconnects
  useEffect(() => {
    if (isConnected) {
      setShowModal(false)
    } else {
      setShowDetailsModal(false)
    }
  }, [isConnected])

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  const handleConnect = () => {
    // If only one connector, connect directly
    if (connectors.length === 1) {
      connect({ connector: connectors[0] })
    } else {
      setShowModal(true)
    }
  }

  const handleConnectorSelect = (connector: typeof connectors[0]) => {
    connect({ connector })
    setShowModal(false)
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDetailsModal(false)
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
    }
  }

  if (isConnected && address) {
    return (
      <>
        <button
          className="wallet-button connected"
          onClick={() => setShowDetailsModal(true)}
          title="Click to view details"
        >
          <svg className="wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
          </svg>
          <span className="wallet-address">{truncateAddress(address)}</span>
        </button>

        {showDetailsModal && (
          <div className="connector-modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="connector-modal details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="connector-modal-header">
                <h3 className="connector-modal-title">Account</h3>
                <button className="connector-modal-close" onClick={() => setShowDetailsModal(false)}>
                  ×
                </button>
              </div>
              <div className="wallet-details">
                <div className="detail-group">
                  <span className="detail-label">Address</span>
                  <div className="address-container">
                    <span className="full-address">{truncateAddress(address)}</span>
                    <button 
                      className="copy-button" 
                      onClick={handleCopyAddress}
                      title="Copy Address"
                    >
                      {copied ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="copy-icon success">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="copy-icon">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Network</span>
                  <span className="detail-value">{chain?.name || metadata?.name || 'Unknown'}</span>
                </div>
                <button className="disconnect-button" onClick={handleDisconnect}>
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <button
        className="wallet-button"
        onClick={handleConnect}
        disabled={isPending}
      >
        {isPending ? (
          <span className="loading-spinner" />
        ) : (
          <svg className="wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M22 10H18a2 2 0 000 4h4" />
            <circle cx="18" cy="12" r="1" fill="currentColor" />
          </svg>
        )}
        <span>{isPending ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>

      {/* Only show modal if we have multiple connectors (unlikely with just injected, unless EIP-6963) */}
      {showModal && connectors.length > 1 && (
        <div className="connector-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="connector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="connector-modal-header">
              <h3 className="connector-modal-title">Select Wallet</h3>
              <button className="connector-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="connector-list">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  className="connector-option"
                  onClick={() => handleConnectorSelect(connector)}
                  disabled={isPending}
                >
                  <span className="connector-icon">
                   {/* Generic icon since we don't know the exact wallet type easily here without more logic, 
                       but injected usually means browser wallet */}
                   👝
                  </span>
                  <span>{connector.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
