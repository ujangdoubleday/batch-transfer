import { useState, useEffect, useRef } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useChainMetadata } from '../../hooks/useChainMetadata'
import { WalletDropdown } from './WalletDropdown'
import './ConnectWallet.css'

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectWallet() {
  const { address, isConnected, chain, chainId, connector } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showModal, setShowModal] = useState(false) // For connector selection
  const [showDropdown, setShowDropdown] = useState(false) // For wallet details
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { metadata } = useChainMetadata(chainId)

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close modals if user connects/disconnects
  useEffect(() => {
    if (isConnected) {
      setShowModal(false)
    } else {
      setShowDropdown(false)
    }
  }, [isConnected])

  const handleConnect = () => {
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
    setShowDropdown(false)
  }

  if (isConnected && address) {
    return (
      <div className="wallet-container" ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          className={`wallet-button connected ${showDropdown ? 'active' : ''}`}
          onClick={() => setShowDropdown(!showDropdown)}
          title="Click to view details"
        >
          {connector?.icon ? (
            <img src={connector.icon} alt={connector.name} className="wallet-icon-img" />
          ) : (
            <svg className="wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            </svg>
          )}
          <span className="wallet-address">{truncateAddress(address)}</span>
        </button>

        {showDropdown && (
          <WalletDropdown
            address={address}
            chainName={chain?.name || metadata?.name}
            walletIcon={connector?.icon}
            onDisconnect={handleDisconnect}
            onClose={() => setShowDropdown(false)}
          />
        )}
      </div>
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
                    {connector.icon ? (
                       <img src={connector.icon} alt={connector.name} style={{ width: '100%', height: '100%', borderRadius: '6px' }} />
                    ) : (
                  <svg className="wallet-icon" viewBox="0 0 24 24" fill="black" stroke="white" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  </svg>
                    )}
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
