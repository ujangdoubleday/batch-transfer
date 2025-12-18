import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { WalletDropdownProps } from '../../types'
import { truncateAddress, classNames } from '../../lib/utils'

export function WalletMobileSheet({ address, chainName, walletIcon, onDisconnect, onClose }: WalletDropdownProps) {
  const [copied, setCopied] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

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

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 300) // Match animation duration
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className={classNames(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div 
        id="wallet-mobile-sheet"
        className={classNames(
          "relative w-full bg-[#0A0A0A] border-t border-white/10 p-6 pb-12 rounded-t-3xl shadow-2xl pointer-events-auto transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)",
          isClosing ? "translate-y-full" : "translate-y-0"
        )}
      >
        {/* Handle bar for visual cue */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-zinc-800 rounded-full" />

        <div className="flex justify-between items-center mb-8 mt-2">
            <div className="flex items-center gap-3">
            {walletIcon && <img src={walletIcon} alt="Wallet" className="w-6 h-6 rounded-md object-cover" />}
            <span className="text-lg font-bold text-white tracking-tight">Connected Wallet</span>
            </div>
            <button 
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 w-8 h-8 rounded-full flex items-center justify-center transition-colors active:bg-zinc-800"
            onClick={handleClose}
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            </button>
        </div>

        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-500 ml-1">Address</span>
                <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                    <span className="text-base font-medium text-white font-mono">{truncateAddress(address)}</span>
                    <button 
                        className={classNames(
                        'p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-all active:scale-95',
                        copied ? 'text-green-500 border-green-500/30 bg-green-500/10' : 'text-zinc-400'
                        )}
                        onClick={handleCopy}
                    >
                    {copied ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    )}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-500 ml-1">Network</span>
                <div className="flex items-center p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                        <span className="text-base font-medium text-white">{chainName || 'Unknown'}</span>
                    </div>
                </div>
            </div>
        </div>

        <button 
            className="w-full mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-base font-semibold active:scale-[0.98] transition-transform"
            onClick={(e) => {
                e.stopPropagation();
                onDisconnect();
            }}
        >
            Disconnect Wallet
        </button>
      </div>
    </div>,
    document.body
  )
}
