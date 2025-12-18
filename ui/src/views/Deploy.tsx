import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeploy } from '../hooks/useDeploy'
import { WalletConnectGuard } from '../components/WalletConnectGuard'
import { DeployContractCard } from '../components/Deployments/DeployContractCard'

export function Deploy() {
  const { 
    chainId, 
    networkName,
    handleDeploy, 
    isDeploying, 
    isConfirming, 
    isConfirmed, 
    deployError, 
    hash,
    reset
  } = useDeploy()

  const navigate = useNavigate()

  useEffect(() => {
    if (isConfirmed || deployError) {
        const timer = setTimeout(() => {
            reset()
            if (isConfirmed) {
                navigate('/sync')
            }
        }, 5000) // Auto-hide after 5 seconds and redirect if successful
        return () => clearTimeout(timer)
    }
  }, [isConfirmed, deployError, reset, navigate])

  return (
    <WalletConnectGuard>
      <div className="flex flex-col items-center justify-start min-h-[calc(100vh-100px)] px-8 pb-8 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_70%)]">
        <div className="w-full max-w-[600px] mt-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="text-center mb-4 col-span-full">
            <h2 className="text-4xl font-bold mb-1 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
              Deploy Contract
            </h2>
            <p className="text-zinc-400 text-lg">
              Deploy your own Batch Transfer contract to start sending tokens.
            </p>
          </div>
          
          <DeployContractCard 
            networkName={networkName}
            chainId={chainId}
            isDeploying={isDeploying}
            isConfirming={isConfirming}
            isConfirmed={isConfirmed}
            deployError={deployError}
            hash={hash}
            handleDeploy={handleDeploy}
            />
        </div>
      </div>
    </WalletConnectGuard>
  )
}
