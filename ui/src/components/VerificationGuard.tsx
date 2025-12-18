import { type ReactNode, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useVerifyBytecode } from '../hooks/useVerifyBytecode'
import BatchTransferContract from '../abi/BatchTransferContract.json'
import { useDeployments } from '../hooks/useDeployments'

interface VerificationGuardProps {
  children: ReactNode
}

export function VerificationGuard({ children }: VerificationGuardProps) {
  const { address } = useParams<{ address: string }>()
  const deployedBytecode = BatchTransferContract.deployedBytecode.object
  
  const { isValid, isLoading } = useVerifyBytecode(address, deployedBytecode)
  const { removeDeployment } = useDeployments()

  // Auto-remove if verification fails
  useEffect(() => {
    if (!isLoading && isValid === false && address) {
        console.warn(`Contract at ${address} verification failed. Removing from local storage.`)
        removeDeployment(address)
    }
  }, [isLoading, isValid, address, removeDeployment])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
         <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 border-4 border-blue-400/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-400 rounded-full border-t-transparent animate-spin"></div>
         </div>
         <p className="text-zinc-400">Verifying Contract...</p>
      </div>
    )
  }

  if (isValid === false) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-zinc-400 max-w-md">
                The address <span className="font-mono text-zinc-300">{address}</span> is not a valid BatchTransfer contract.
            </p>
            <button 
                onClick={() => window.history.back()}
                className="mt-8 px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
            >
                Go Back
            </button>
        </div>
    )
  }

  return <>{children}</>
}
