import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import BatchTransferABI from '../abi/BatchTransferContract.json';
import type { Address } from 'viem';

// Helper type for function names from the ABI
type ContractFunctionName = 
  | 'owner'
  | 'maxRecipients'
  | 'paused'
  | 'batchTransferEth'
  | 'batchTransferToken'
  | 'simpleBatchTransferToken'
  | 'batchTransferMultiTokens'
  | 'batchTransferCombinedMultiTokens'
  | 'pause'
  | 'unpause'
  | 'transferOwnership'
  | 'renounceOwnership'
  | 'setMaxRecipients'
  | 'emergencyWithdrawEth'
  | 'emergencyWithdrawToken';

export function useBatchTransfer(address: Address) {
  const { data: hash, writeContract, writeContractAsync, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const useContractRead = (functionName: ContractFunctionName, args: unknown[] = []) => {
    return useReadContract({
      address,
      abi: BatchTransferABI.abi,
      functionName,
      args,
    });
  };

  const write = (functionName: ContractFunctionName, args: unknown[], value?: bigint) => {
    writeContract({
      address,
      abi: BatchTransferABI.abi,
      functionName,
      args,
      value,
    });
  };

  const writeAsync = async (functionName: ContractFunctionName, args: unknown[], value?: bigint) => {
    return await writeContractAsync({
      address,
      abi: BatchTransferABI.abi,
      functionName,
      args,
      value,
    });
  };

  return {
    write,
    writeAsync,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    writeError,
    useContractRead,
  };
}
