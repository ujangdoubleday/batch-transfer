import type { ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { ConnectWallet } from './ConnectWallet/ConnectWallet'

interface WalletConnectGuardProps {
  children: ReactNode
}

export function WalletConnectGuard({ children }: WalletConnectGuardProps) {
  const { isConnected } = useAccount()

  if (isConnected) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center min-h-[400px] text-[var(--text-secondary)]">
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-12 flex flex-col items-center gap-6 max-w-[400px] w-full">
        <div className="w-16 h-16 bg-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center mb-2">
            <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="1.5"
                className="w-8 h-8 opacity-70"
            >
                <path d="M21 12V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H12M21 12C21 11.4477 20.5523 11 20 11H17C16.4477 11 16 11.4477 16 12V14C16 14.5523 16.4477 15 17 15H20C20.5523 15 21 14.5523 21 14V12ZM21 12V14" />
            </svg>
        </div>
        
        <div>
            <h3 className="m-0 mb-2 text-[var(--text-primary)] text-xl font-semibold">
                Connect Wallet
            </h3>
            <p className="m-0 text-[0.95rem] leading-normal">
                Please connect your wallet to access this feature.
            </p>
        </div>

        <ConnectWallet />
      </div>
    </div>
  )
}
