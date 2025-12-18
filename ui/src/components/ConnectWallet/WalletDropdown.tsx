import { useState, useEffect } from 'react'
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
    <div 
      className="absolute top-[calc(100%+8px)] right-0 w-[300px] bg-[#000000] border border-[#1F1F1F] rounded-xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5),0_2px_4px_-1px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)] z-[1000] animate-[dropdownFadeIn_0.2s_cubic-bezier(0.16,1,0.3,1)] origin-top-right"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {walletIcon && <img src={walletIcon} alt="Wallet" className="w-4 h-4 rounded object-cover" />}
          <span className="text-sm font-semibold text-[#888888] uppercase tracking-wider">Wallet Connected</span>
        </div>
        <button 
          className="bg-transparent border-none text-[#888888] cursor-pointer p-1 rounded flex items-center justify-center transition-all duration-200 hover:text-white hover:bg-[#0A0A0A]"
          onClick={onClose}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center p-3 bg-[#050505] border border-[#1F1F1F] rounded-md">
          <span className="text-xs text-[#888888]">Address</span>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-white font-mono">{truncateAddress(address)}</span>
            <button 
              className={classNames(
                'bg-transparent border-none text-[#888888] cursor-pointer p-1 rounded flex items-center justify-center transition-all duration-200',
                'hover:text-white hover:bg-[rgba(255,255,255,0.1)]',
                copied && 'text-[#4ade80]'
              )}
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

        <div className="flex justify-between items-center p-3 bg-[#050505] border border-[#1F1F1F] rounded-md">
          <span className="text-xs text-[#888888]">Network</span>
          <span className="text-[13px] font-medium text-white">{chainName || 'Unknown'}</span>
        </div>
      </div>

      <button 
        className="w-full mt-4 p-2.5 bg-[rgba(255,59,48,0.1)] border border-[rgba(255,59,48,0.2)] rounded-md text-[#ff453a] text-[13px] font-semibold cursor-pointer transition-all duration-200 ease-out hover:bg-[rgba(255,59,48,0.15)] hover:border-[rgba(255,59,48,0.3)]"
        onClick={onDisconnect}
      >
        Disconnect Wallet
      </button>
    </div>
  )
}
