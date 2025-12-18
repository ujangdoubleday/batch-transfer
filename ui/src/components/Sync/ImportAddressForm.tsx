import { useState } from 'react'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useChainMetadata } from '../../hooks/useChainMetadata'
import { useDeployments } from '../../hooks/useDeployments'

export function ImportAddressForm() {
  const { chainId, chain } = useAccount()
  const { metadata } = useChainMetadata(chainId)
  const { addDeployment } = useDeployments()
  
  const [addressInput, setAddressInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const handleImport = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!addressInput) return
    
    if (!isAddress(addressInput)) {
        setError('Invalid address format')
        return
    }

    const networkName = chain?.name || metadata?.name || 'Unknown'
    
    const success = addDeployment({
        address: addressInput,
        timestamp: Date.now(),
        networkName
    })

    if (success) {
        setAddressInput('')
    } else {
        setError('Address already exists or failed to save')
    }
  }

  return (
      <form onSubmit={handleImport} className="flex flex-col gap-4">
        <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
                Contract Address
            </label>
            <input 
                type="text" 
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-black/40 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all font-mono text-sm"
            />
        </div>
        
        {error && (
            <p className="text-red-400 text-sm">{error}</p>
        )}

        <button 
            type="submit"
            disabled={!addressInput}
            className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            Import
        </button>
      </form>
  )
}
