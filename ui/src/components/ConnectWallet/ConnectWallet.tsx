import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useChainMetadata } from '../../hooks/useChainMetadata'
import { WalletDropdown } from './WalletDropdown'
import { WalletMobileSheet } from './WalletMobileSheet'

import { truncateAddress, classNames } from '../../lib/utils'

interface ConnectWalletProps {
  isMobile?: boolean
}

export function ConnectWallet({ isMobile = false }: ConnectWalletProps) {
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
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('#wallet-mobile-sheet')
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close modals if user connects/disconnects
  useEffect(() => {
    if (isConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowModal(prev => prev ? false : prev)
    } else {
      setShowDropdown(prev => prev ? false : prev)
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
        <div className="relative" ref={dropdownRef}>
        <button
          className={classNames(
            'inline-flex items-center justify-center gap-2 px-5 py-2.5 min-w-[140px] max-w-[180px] h-11 bg-[#050505] border border-[#1F1F1F] rounded-md text-white text-sm font-semibold cursor-pointer transition-all duration-200 relative overflow-hidden whitespace-nowrap shrink-0',
            'hover:bg-[#0A0A0A] hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
            // connected state
            'bg-[#050505] border-[#333333]',
            showDropdown && 'bg-[#0A0A0A] border-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
          )}
          onClick={() => setShowDropdown(!showDropdown)}
          title="Click to view details"
        >
          {connector?.icon ? (
            <img src={connector.icon} alt={connector.name} className="w-[18px] h-[18px] rounded object-cover shrink-0" />
          ) : (
            <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            </svg>
          )}
          <span className="font-mono text-[13px] tracking-tight overflow-hidden text-ellipsis">{truncateAddress(address)}</span>
        </button>

        {showDropdown && (
          isMobile ? (
             <WalletMobileSheet
               address={address}
               chainName={chain?.name || metadata?.name}
               walletIcon={connector?.icon}
               onDisconnect={handleDisconnect}
               onClose={() => setShowDropdown(false)}
             />
          ) : (
            <WalletDropdown
              address={address}
              chainName={chain?.name || metadata?.name}
              walletIcon={connector?.icon}
              onDisconnect={handleDisconnect}
              onClose={() => setShowDropdown(false)}
            />
          )
        )}
      </div>
    )
  }

  const ModalContent = (
    <div 
        className="fixed inset-0 w-screen h-screen bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] animate-[fadeIn_0.15s_ease]"
        onClick={() => setShowModal(false)}
    >
      <div 
        className="bg-[#000000] border border-[#1F1F1F] rounded-xl p-6 min-w-[340px] max-w-[400px] shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)] animate-[scaleIn_0.2s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white m-0 tracking-tight">Select Wallet</h3>
          <button 
            className="bg-transparent border-none text text-[#888888] text-2xl cursor-pointer p-1 leading-none transition-colors duration-200 flex items-center justify-center hover:text-white"
            onClick={() => setShowModal(false)}
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              className="flex items-center gap-4 p-4 bg-[#050505] border border-[#1F1F1F] rounded-md text-white text-base font-medium cursor-pointer transition-all duration-200 hover:bg-[#0A0A0A] hover:border-[#444444] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleConnectorSelect(connector)}
              disabled={isPending}
            >
              <span className="w-9 h-9 rounded-lg bg-transparent text-black flex items-center justify-center text-lg font-bold">
                {connector.icon ? (
                   <img src={connector.icon} alt={connector.name} style={{ width: '100%', height: '100%', borderRadius: '6px' }} />
                ) : (
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="black" stroke="white" strokeWidth="2">
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
  )

  return (
    <>
      <button
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-w-[140px] max-w-[180px] h-11 bg-[#050505] border border-[#1F1F1F] rounded-md text-white text-sm font-semibold cursor-pointer transition-all duration-200 relative overflow-hidden whitespace-nowrap shrink-0 hover:bg-[#0A0A0A] hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleConnect}
        disabled={isPending}
      >
        <div className="absolute inset-0 rounded-md p-[1px] bg-white opacity-0 transition-opacity duration-300 pointer-events-none mask-image-linear-gradient" />
        {isPending ? (
          <span className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-[spin_0.8s_linear_infinite]" />
        ) : (
          <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M22 10H18a2 2 0 000 4h4" />
            <circle cx="18" cy="12" r="1" fill="currentColor" />
          </svg>
        )}
        <span>{isPending ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>

      {showModal && connectors.length > 1 && (
        createPortal(ModalContent, document.body)
      )}
    </>
  )
}
