import { useAccount, useBalance, useEstimateGas, useDeployContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainMetadata } from './useChainMetadata'
import BatchTransferContract from '../abi/BatchTransferContract.json'

export function useDeploy() {
  const { isConnected, address, chain, chainId } = useAccount()
  const { metadata } = useChainMetadata(chainId)
  const { data: balance, isLoading: isBalanceLoading } = useBalance({ address })
  
  const { data: estimatedGas } = useEstimateGas({
    account: address,
    data: BatchTransferContract.bytecode.object as `0x${string}`,
  })

  const { deployContract, data: hash, isPending: isDeploying, error: deployError, reset: _resetDeploy } = useDeployContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

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
        balance,
        isBalanceLoading,
        handleDeploy,
        isDeploying,
        isConfirming,
        isConfirmed,
        deployError,
        hash
    }
}
