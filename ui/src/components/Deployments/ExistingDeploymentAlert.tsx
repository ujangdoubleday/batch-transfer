import { useState } from 'react'
import type { ExistingDeploymentAlertProps } from '../../types'

export function ExistingDeploymentAlert({ address, timestamp, onSelect }: ExistingDeploymentAlertProps) {
  const [copied, setCopied] = useState(false)
  const date = new Date(timestamp).toLocaleDateString()
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div 
        className="deployment-list-item clickable" 
        onClick={() => onSelect?.(address)}
        role="button"
        tabIndex={0}
    >
        <div className="deployment-info">
            <div className="deployment-address">{address}</div>
            <div className="deployment-meta">{date} {time}</div>
        </div>
        
        <button 
            className="copy-btn" 
            onClick={handleCopy}
            title="Copy Address"
        >
            {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            )}
        </button>
    </div>
  )
}
