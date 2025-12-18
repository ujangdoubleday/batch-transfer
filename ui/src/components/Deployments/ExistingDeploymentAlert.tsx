import { useState } from 'react'
import { cn } from '../../lib/utils'
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
        className={cn(
            "flex items-center justify-between p-4",
            "bg-black border border-zinc-700 rounded-md",
            "transition-all duration-200",
            "cursor-pointer select-none",
            "hover:border-zinc-500 hover:bg-zinc-900/50 hover:translate-x-1",
            "active:translate-x-0.5"
        )}
        onClick={() => onSelect?.(address)}
        role="button"
        tabIndex={0}
    >
        <div className="flex flex-col gap-1 overflow-hidden flex-1">
            <div className="font-mono text-sm text-white break-all">{address}</div>
            <div className="text-xs text-zinc-500">{date} {time}</div>
        </div>
        
        <button 
            className={cn(
                "bg-transparent border-none text-zinc-400 p-2 rounded-md",
                "transition-all shrink-0 flex items-center justify-center ml-4",
                "hover:bg-white/10 hover:text-white"
            )}
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
