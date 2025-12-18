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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
      minHeight: '400px',
      color: 'var(--text-secondary)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem'
        }}>
            <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
                style={{ width: '32px', height: '32px', opacity: 0.7 }}
            >
                <path d="M21 12V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H12M21 12C21 11.4477 20.5523 11 20 11H17C16.4477 11 16 11.4477 16 12V14C16 14.5523 16.4477 15 17 15H20C20.5523 15 21 14.5523 21 14V12ZM21 12V14" />
            </svg>
        </div>
        
        <div>
            <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
                fontWeight: 600
            }}>
                Connect Wallet
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                Please connect your wallet to access this feature.
            </p>
        </div>

        <ConnectWallet />
      </div>
    </div>
  )
}
