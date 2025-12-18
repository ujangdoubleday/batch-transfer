import { useEffect } from 'react'
import { useDeployments } from './useDeployments'
import { useAccount, useEstimateGas, useDeployContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainMetadata } from './useChainMetadata'
import BatchTransferContract from '../abi/BatchTransferContract.json'
import type { Deployment } from '../types'

export function useDeploy() {
  const { isConnected, address, chain, chainId } = useAccount()
  const { metadata } = useChainMetadata(chainId)
  
  const { data: estimatedGas } = useEstimateGas({
    account: address,
    data: BatchTransferContract.bytecode.object as `0x${string}`,
  })

  const { deployContract, data: hash, isPending: isDeploying, error: deployError, reset: _resetDeploy } = useDeployContract()

  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Use shared deployments hook
  const { deployments, addDeployment } = useDeployments()

  // Save deployment to local storage when confirmed
  useEffect(() => {
    if (isConfirmed && receipt?.contractAddress && chainId && address) {
        const newDeployment: Deployment = {
            address: receipt.contractAddress,
            timestamp: Date.now(),
            networkName: chain?.name || metadata?.name || 'Unknown',
        }
        addDeployment(newDeployment)
    }
  }, [isConfirmed, receipt, chainId, address, chain, metadata, addDeployment])

  const handleDeploy = async () => {
    try {
      // Use estimated gas if available, otherwise fallback to 2.5M
      // We add a small 10% buffer to the estimate to be safe but not wasteful
      const gasLimit = estimatedGas 
        ? (estimatedGas * 110n) / 100n 
        : 2500000n

      deployContract({
        abi: BatchTransferContract.abi,
        bytecode: BatchTransferContract.bytecode.object as `0x${string}`,
        gas: gasLimit, 
      })
    } catch (error) {
      console.error('Deployment execution failed:', error)
    }
  }

    const networkName = chain?.name || metadata?.name || 'Unknown Network'

    return {
        isConnected,
        address,
        chainId,
        networkName,
        handleDeploy,
        isDeploying,
        isConfirming,
        isConfirmed,
        deployError,
        hash,
        deployments,
        reset: _resetDeploy
    }
}
