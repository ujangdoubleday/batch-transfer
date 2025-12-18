import { cn } from '../../lib/utils'
import type { DeployContractCardProps } from '../../types'

export function DeployContractCard({
    networkName,
    chainId,
    isDeploying,
    isConfirming,
    isConfirmed,
    deployError,
    hash,
    handleDeploy
}: DeployContractCardProps) {
    return (
        <div className="bg-transparent border border-zinc-700 rounded-xl p-8 shadow-xl relative overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-md mb-6 border border-white/5">
                <span className="text-zinc-400 text-sm">Target Network</span>
                <div className="text-white font-medium flex items-center gap-2">
                {networkName} 
                <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-zinc-400">ID: {chainId}</span>
                </div>
            </div>
            
            <div className="mt-8">
                <button 
                    className={cn(
                        "w-full h-12 flex items-center justify-center gap-2",
                        "bg-white text-black",
                        "font-semibold rounded-lg",
                        "transition-all duration-200 relative overflow-hidden",
                        "hover:-translate-y-px hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]",
                        "active:scale-[0.99]",
                        "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                    )}
                    onClick={handleDeploy} 
                    disabled={isDeploying || isConfirming}
                >
                    {(isDeploying || isConfirming) && (
                        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    )}
                    {isDeploying ? 'Deploying...' : isConfirming ? 'Confirming...' : 'Deploy Contract'}
                </button>
            </div>

            {deployError && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm animate-in fade-in slide-in-from-bottom-2">
                    <p className="font-semibold mb-1">Deployment Failed</p>
                    <p>{deployError.message}</p>
                </div>
            )}

            {hash && (
                <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Transaction Hash</p>
                    <p className="font-mono text-sm text-zinc-400 p-2 bg-white/5 rounded-sm break-all">{hash}</p>
                </div>
            )}

            {isConfirmed && (
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-500 text-center animate-in fade-in slide-in-from-bottom-2">
                    <p>Contract deployed successfully!</p>
                </div>
            )}
        </div>
    )
}
