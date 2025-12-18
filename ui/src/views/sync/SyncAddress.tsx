import { useParams } from 'react-router-dom'
import { WalletConnectGuard } from '../../components/WalletConnectGuard'
import BatchTransferContract from '../../abi/BatchTransferContract.json'
import { useVerifyBytecode } from '../../hooks/useVerifyBytecode'

export function SyncAddress() {
  const { address } = useParams()
  // Ensure we have a string for the verified bytecode hook, fallback to empty string if undefined.
  const deployedBytecode = BatchTransferContract.deployedBytecode.object
  
  const { isValid } = useVerifyBytecode(address, deployedBytecode)

  return (
    <WalletConnectGuard>
      <div className="flex flex-col items-center justify-start min-h-[calc(100vh-100px)] px-4 md:px-8 pb-8 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_70%)]">
        <div className="w-full max-w-[1200px] mt-4 md:mt-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent tracking-tight break-all">
                Sync: <span className="text-lg md:text-4xl font-mono text-zinc-300 block md:inline md:ml-2 mt-1 md:mt-0 break-all">{address}</span>
                </h2>
                <p className="text-zinc-400 text-base md:text-lg">
                Manage synchronization for this specific contract.
                </p>
            </div>
            
            {isValid && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium self-start md:self-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Verified Contract</span>
                </div>
            )}
          </div>
          
          <div className="w-full p-4 md:p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
             <div className="transition-all">
               <p className="text-zinc-400">Content for {address} will go here.</p>
             </div>
          </div>
        </div>
      </div>
    </WalletConnectGuard>
  )
}
