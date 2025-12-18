import { useState, useEffect } from 'react'
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

  // Local Storage Logic
  const STORAGE_KEY = 'batch_transfer_deployments_v2'

  const [deployments, setDeployments] = useState<Deployment[]>([])

  // Load deployments from local storage
  useEffect(() => {
    if (!chainId || !address) {
      setDeployments([])
      return
    }

    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        const allDeployments = JSON.parse(storedData)
        const chainDeployments = allDeployments[chainId]
        if (chainDeployments && chainDeployments[address]) {
            // Ensure it's an array for v2
            if (Array.isArray(chainDeployments[address])) {
                setDeployments(chainDeployments[address])
            } else {
                setDeployments([])
            }
            return
        }
      }
    } catch (e) {
      console.error('Failed to load deployments from local storage:', e)
    }
    setDeployments([])
  }, [chainId, address])

  // Save deployment to local storage when confirmed
  useEffect(() => {
    if (isConfirmed && receipt?.contractAddress && chainId && address) {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY)
            const allDeployments = storedData ? JSON.parse(storedData) : {}
            
            if (!allDeployments[chainId]) {
                allDeployments[chainId] = {}
            }

            if (!allDeployments[chainId][address]) {
                allDeployments[chainId][address] = []
            }

            const newDeployment: Deployment = {
                address: receipt.contractAddress,
                timestamp: Date.now(),
                networkName: chain?.name || metadata?.name || 'Unknown',
            }

            // Prepend new deployment
            allDeployments[chainId][address] = [newDeployment, ...allDeployments[chainId][address]]

            localStorage.setItem(STORAGE_KEY, JSON.stringify(allDeployments))
            setDeployments(prev => [newDeployment, ...prev])
        } catch (e) {
            console.error('Failed to save deployment to local storage:', e)
        }
    }
  }, [isConfirmed, receipt, chainId, address, chain, metadata])

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
