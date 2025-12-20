import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAddress } from 'viem'
import { useAccount, usePublicClient } from 'wagmi'
import { useChainMetadata } from '../../hooks/useChainMetadata'
import { useDeployments } from '../../hooks/useDeployments'
import BatchTransferContract from '../../abi/BatchTransferContract.json'

export function ImportAddressForm() {
  const navigate = useNavigate()
  const { chainId, chain } = useAccount()
  const { metadata } = useChainMetadata(chainId)
  const { addDeployment } = useDeployments()
  // Force public client to match current chainId
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publicClient = usePublicClient({ chainId: chainId as any })
  
  const [addressInput, setAddressInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const [isVerifying, setIsVerifying] = useState(false)
  
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!addressInput) return
    
    if (!isAddress(addressInput)) {
        setError('Invalid address format')
        return
    }

    if (!publicClient) {
        setError('Wallet not connected or client unavailable')
        return
    }
    
    if (!chainId) {
         setError('Please connect your wallet first')
         return
    }

    // Double check that we are querying the right chain
    if (publicClient.chain?.id !== chainId) {
        setError(`Network mismatch. Client chain: ${publicClient.chain?.id}, Wallet chain: ${chainId}`)
        return
    }

    try {
        setIsVerifying(true)
        
        const expectedBytecode = BatchTransferContract.deployedBytecode?.object
        
        if (!expectedBytecode) {
           throw new Error('Could not find expected bytecode in artifact')
        }

        // Verify bytecode
        const code = await publicClient.getBytecode({ address: addressInput })
        
        // strict check for empty code which means no contract exists
        if (!code || code === '0x') {
             setError(`No contract found at this address on ${chain?.name || 'current network'}.`)
             setIsVerifying(false)
             return
        }

        // Normalize and compare
        // We strip the last 100 chars (approx 50 bytes) to ignore metadata hash differences which can vary by build path
        // This is a heuristic but safer than strict equality
        const cleanCode = code.toLowerCase()
        const cleanExpected = expectedBytecode.toLowerCase()
        
        // Check if code matches the main body of expected bytecode
        const compareLength = Math.min(cleanExpected.length - 100, cleanCode.length)
        
        if (cleanCode.substring(0, compareLength) !== cleanExpected.substring(0, compareLength)) {
            setError('Invalid contract: Bytecode does not match the expected BatchTransfer contract.')
            setIsVerifying(false)
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
            navigate(`/sync/${addressInput}`)
        } else {
            setError('Address already exists or failed to save')
        }
    } catch (err) {
        console.error('Error verifying contract:', err)
        setError('Failed to verify contract. Check console for details.')
    } finally {
        setIsVerifying(false)
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
            disabled={!addressInput || isVerifying}
            className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {isVerifying ? 'Verifying...' : 'Import'}
        </button>
      </form>
  )
}
