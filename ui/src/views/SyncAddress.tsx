import { useParams } from 'react-router-dom'
import { WalletConnectGuard } from '../components/WalletConnectGuard'
import BatchTransferContract from '../abi/BatchTransferContract.json'
import { useVerifyBytecode } from '../hooks/useVerifyBytecode'

export function SyncAddress() {
  const { address } = useParams()
  // Ensure we have a string for the verified bytecode hook, fallback to empty string if undefined.
  // In a real app we might want to validate the address format first.
  const deployedBytecode = BatchTransferContract.deployedBytecode.object
  
  const { isValid, isLoading, error } = useVerifyBytecode(address, deployedBytecode)

  return (
    <WalletConnectGuard>
      <div className="flex flex-col items-center justify-start min-h-[calc(100vh-100px)] px-4 md:px-8 pb-8 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_70%)]">
        <div className="w-full max-w-[1200px] mt-4 md:mt-8">
          <div className="mb-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent tracking-tight break-all">
              Sync: <span className="text-lg md:text-4xl font-mono text-zinc-300 block md:inline md:ml-2 mt-1 md:mt-0 break-all">{address}</span>
            </h2>
            <p className="text-zinc-400 text-base md:text-lg">
              Manage synchronization for this specific contract.
            </p>
          </div>
          
          <div className="w-full p-4 md:p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
             {/* Verification Status Section */}
             <div className="mb-6 pb-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Contract Verification</h3>
                
                {isLoading && (
                  <div className="flex items-center space-x-3 text-blue-400">
                    <div className="relative w-5 h-5">
                       <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full"></div>
                       <div className="absolute inset-0 border-2 border-blue-400 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <span>Verifying contract bytecode...</span>
                  </div>
                )}

                {!isLoading && isValid === true && (
                  <div className="flex items-center space-x-3 text-green-400 bg-green-400/10 px-4 py-3 rounded-lg border border-green-400/20">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-semibold">Verified Valid</span>
                      <p className="text-sm text-green-400/80">Bytecode matches expected contract artifact.</p>
                    </div>
                  </div>
                )}

                {!isLoading && isValid === false && (
                  <div className="flex items-center space-x-3 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <span className="font-semibold">Verification Failed</span>
                      <p className="text-sm text-red-400/80">
                        {error ? error.message : "Bytecode at this address does not match the expected contract."}
                      </p>
                    </div>
                  </div>
                )}
             </div>

             {/* Only show main content if valid or if user persists (optional, for now hiding/blurring if invalid could be better, but user just said show status) */}
             <div className={isValid === false ? "opacity-50 pointer-events-none filter blur-sm transition-all" : "transition-all"}>
               <p className="text-zinc-400">Content for {address} will go here.</p>
             </div>
          </div>
        </div>
      </div>
    </WalletConnectGuard>
  )
}
