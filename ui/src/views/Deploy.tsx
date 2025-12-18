import { useEffect } from 'react'
import { useDeploy } from '../hooks/useDeploy'
import { WalletConnectGuard } from '../components/WalletConnectGuard'
import { DeployContractCard } from '../components/Deployments/DeployContractCard'
import { DeploymentList } from '../components/Deployments/DeploymentList'

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
    deployments,
    reset
  } = useDeploy()

  useEffect(() => {
    if (isConfirmed) {
        const timer = setTimeout(() => {
            reset()
        }, 5000) // Auto-hide after 5 seconds
        return () => clearTimeout(timer)
    }
  }, [isConfirmed, reset])

  return (
    <WalletConnectGuard>
      <div className="deploy-page">
        <div className={`deploy-content-wrapper ${deployments.length > 0 ? 'split-layout' : ''}`}>
          <div className="deploy-header">
            <h2 className="deploy-title">
              Deploy Contract
            </h2>
            <p className="deploy-subtitle">
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

          <DeploymentList deployments={deployments} />
        </div>
      </div>
    </WalletConnectGuard>
  )
}
