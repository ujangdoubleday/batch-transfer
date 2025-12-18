import { WalletConnectGuard } from '../components/WalletConnectGuard'
import { DeploymentList } from '../components/Sync/DeploymentList'
import { ImportAddressForm } from '../components/Sync/ImportAddressForm'
import { useDeployments } from '../hooks/useDeployments'
import { cn } from '../lib/utils'

export function Sync() {
  const { deployments } = useDeployments()

  return (
    <WalletConnectGuard>
      <div className="flex flex-col items-center justify-start min-h-[calc(100vh-100px)] px-8 pb-8 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_70%)]">
        <div className={cn(
            "w-full max-w-[600px] mt-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5",
            "max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
        )}>
          <div className="text-center mb-4 col-span-full">
            <h2 className="text-4xl font-bold mb-1 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
              Batch Sync
            </h2>
            <p className="text-zinc-400 text-lg">
              Manage your deployments or import existing contracts.
            </p>
          </div>
          
          <div className="w-full">
             <DeploymentList deployments={deployments} title="Use This Address from Deployments" />
             {deployments.length === 0 && (
                 <div className="text-center p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                     <p className="text-zinc-400">No deployments found. Import one on the right to get started.</p>
                 </div>
             )}
          </div>

          <div className="w-full">
             <h3 className="text-lg font-semibold mb-4 text-zinc-400">Import Contract</h3>
             <div className="w-full bg-transparent border border-zinc-700/50 rounded-xl p-6">
                <ImportAddressForm />
             </div>
          </div>
        </div>
      </div>
    </WalletConnectGuard>
  )
}
