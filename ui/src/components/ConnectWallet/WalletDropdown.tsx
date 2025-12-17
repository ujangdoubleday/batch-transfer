import { useState, useEffect } from 'react'
import './WalletDropdown.css'

import type { WalletDropdownProps } from '../../types'
import { truncateAddress, classNames } from '../../lib/utils'

export function WalletDropdown({ address, chainName, walletIcon, onDisconnect, onClose }: WalletDropdownProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(address)
    setCopied(true)
  }

  // Handle click outside is handled by the parent or an overlay, 
  // but for a simple dropdown, stopping propagation on the card is good practice.
  return (
    <div className="wallet-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="dropdown-header">
        <div className="dropdown-title-group">
          {walletIcon && <img src={walletIcon} alt="Wallet" className="dropdown-wallet-icon" />}
          <span className="dropdown-title">Wallet Connected</span>
        </div>
        <button className="dropdown-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="dropdown-section">
        <div className="dropdown-row">
          <span className="dropdown-label">Address</span>
          <div className="address-row">
            <span className="dropdown-value address-text">{truncateAddress(address)}</span>
            <button 
              className={classNames('copy-btn', copied && 'success')}
              onClick={handleCopy}
              title="Copy Address"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="dropdown-row">
          <span className="dropdown-label">Network</span>
          <span className="dropdown-value">{chainName || 'Unknown'}</span>
        </div>
      </div>

      <button className="disconnect-btn" onClick={onDisconnect}>
        Disconnect Wallet
      </button>
    </div>
  )
}
