import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';
import { useChainMetadata } from '../../../hooks/useChainMetadata';
import { useAccount, useWaitForTransactionReceipt, useReadContract, useWriteContract } from 'wagmi';
import { type Address, parseUnits, erc20Abi } from 'viem';
import { TabSelector } from '../Common/TabSelector';
import { FormatHelp } from '../Common/FormatHelp';
import { FileUpload } from '../Common/FileUpload';
import { BatchProgress } from '../Common/BatchProgress';
import { BatchSummary } from '../Common/BatchSummary';
import { FeedbackAlert } from '../Common/FeedbackAlert';

// Token Specific Components
import { ManualInput } from './BatchTransferToken/ManualInput';
import { FilePreview } from './BatchTransferToken/FilePreview';
import { FormActions } from './BatchTransferToken/FormActions';
import { TokenAddressInput } from './BatchTransferToken/TokenAddressInput';

import { parseJSON, parseCSV } from '../../../lib/fileParsing';

interface Props {
  contractAddress: Address;
}

type TabType = 'manual' | 'upload';

interface FeedbackState {
  type: 'success' | 'error' | 'info';
  message: string;
  hash?: string;
}

export function BatchTransferTokenForm({ contractAddress }: Props) {
  const { chainId, address: userAddress } = useAccount();
  const { metadata } = useChainMetadata(chainId);
  const { writeAsync, isPending: isWritePending, writeError, useContractRead } = useBatchTransfer(contractAddress);
  
  // Read maxRecipients from contract
  const { data: maxRecipientsData } = useContractRead('maxRecipients');
  const maxRecipients = maxRecipientsData ? Number(maxRecipientsData) : 100;

  // Form State
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipients, setRecipients] = useState('');
  const [amounts, setAmounts] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [decimalsDisabled, setDecimalsDisabled] = useState(false);
  const [useSimpleMode, setUseSimpleMode] = useState(false);
  
  // Batch Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>(undefined);
  const [batches, setBatches] = useState<{recipients: string[], amounts: bigint[], totalAmount: bigint}[]>([]);
  const [executionHistory, setExecutionHistory] = useState<{batchNumber: number, txHash: string}[]>([]);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const explorerUrl = metadata?.explorers?.[0]?.url;

  // ERC20 Approval Logic
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [userAddress as Address, contractAddress],
      query: {
         enabled: !!tokenAddress && !!userAddress
      }
  });

  const { writeContractAsync: approveAsync, isPending: isApprovePending } = useWriteContract();
  
  const [isApproveWait, setIsApproveWait] = useState(false);

  // Prepare Data for Comparison
  // Prepare Data for Comparison
  const getRecipientList = useCallback(() => recipients.split(',').map(r => r.trim()).filter(Boolean), [recipients]);
  const getAmountList = useCallback(() => amounts.split(',').map(a => parseUnits(a.trim(), tokenDecimals)), [amounts, tokenDecimals]);
  const getTotalNeeded = useCallback(() => {
      try {
        const list = getAmountList();
        return list.reduce((acc, curr) => acc + curr, 0n);
      } catch {
          return 0n;
      }
  }, [getAmountList]);

  const totalNeeded = getTotalNeeded();
  const isApproved = !!allowance && allowance >= totalNeeded;

  // Monitor transaction receipt for the CURRENT batch
  const { isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
    hash: currentTxHash as `0x${string}` | undefined,
  });

  // Watch for confirmation of current batch to trigger next one
  useEffect(() => {
    if (isReceiptSuccess && isProcessing && currentTxHash) {
      // Record history
      const currentHistory = [...executionHistory, { batchNumber: currentBatchIndex + 1, txHash: currentTxHash }];
      setExecutionHistory(currentHistory);

      if (currentBatchIndex < totalBatches - 1) {
        // Prepare next batch
        const nextIndex = currentBatchIndex + 1;
        setCurrentBatchIndex(nextIndex);
        
        // Execute next batch
        const processNextBatch = async () => {
          try {
            setCurrentTxHash(undefined);
            
            const batch = batches[nextIndex];
            
            const functionName = useSimpleMode ? 'simpleBatchTransferToken' : 'batchTransferToken';
            const hash = await writeAsync(functionName, [tokenAddress, batch.recipients, batch.amounts]);
            setCurrentTxHash(hash);
          } catch (err: unknown) {
            console.error('Error processing batch:', err);
            setFeedback({
              type: 'error',
              message: err instanceof Error ? err.message : `Failed to process batch ${nextIndex + 1}`
            });
            setIsProcessing(false);
          }
        };

        processNextBatch();
      } else {
        // All batches completed
        setIsProcessing(false);
        setFeedback({
            type: 'success',
            message: `All ${totalBatches} batches executed successfully!`,
            hash: currentTxHash 
        });
        refetchAllowance(); // Refresh allowance after transfer
      }
    }
  }, [isReceiptSuccess, isProcessing, currentBatchIndex, totalBatches, batches, writeAsync, currentTxHash, executionHistory, tokenAddress, refetchAllowance, useSimpleMode]);

  useEffect(() => {
    if (writeError) {
      setFeedback({
        type: 'error',
        message: writeError.message || 'Transaction failed'
      });
      setIsProcessing(false);
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [writeError]);

  const executeTransfer = useCallback(async () => {
    try {
      const recipientList = getRecipientList();
      const amountList = getAmountList();
      
      if (recipientList.length === 0 || amountList.length === 0) {
        throw new Error("No valid data to process");
      }

      if (recipientList.length !== amountList.length) {
        throw new Error(`Mismatch: ${recipientList.length} recipients vs ${amountList.length} amounts`);
      }

      // Create Batches
      const batchSize = maxRecipients;
      const newBatches = [];
      for (let i = 0; i < recipientList.length; i += batchSize) {
        const batchRecipients = recipientList.slice(i, i + batchSize);
        const batchAmounts = amountList.slice(i, i + batchSize);
        const batchTotalAmount = batchAmounts.reduce((acc, curr) => acc + curr, 0n);
        newBatches.push({
            recipients: batchRecipients,
            amounts: batchAmounts,
            totalAmount: batchTotalAmount
        });
      }

      setBatches(newBatches);
      setTotalBatches(newBatches.length);
      setExecutionHistory([]);
      setCurrentBatchIndex(0);
      setIsProcessing(true);

      // Trigger first batch
      const firstBatch = newBatches[0];
      const functionName = useSimpleMode ? 'simpleBatchTransferToken' : 'batchTransferToken';
      const hash = await writeAsync(functionName, [tokenAddress, firstBatch.recipients, firstBatch.amounts]);
      setCurrentTxHash(hash);

    } catch (err: unknown) {
      console.error('Error preparing transaction:', err);
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to prepare transaction'
      });
      setIsProcessing(false);
    }

  }, [getRecipientList, getAmountList, maxRecipients, useSimpleMode, writeAsync, tokenAddress]);

  const handleApprove = async () => {
      if (!tokenAddress) return;
      try {
          setIsApproveWait(true);
          const hash = await approveAsync({
              address: tokenAddress as Address,
              abi: erc20Abi,
              functionName: 'approve',
              args: [contractAddress, totalNeeded],
          });
          
          setFeedback({
              type: 'info',
              message: 'Approving token... Please wait for confirmation.',
              hash: hash
          });
          
      } catch (err: unknown) {
          console.error("Approval failed", err);
           setFeedback({
              type: 'error',
              message: err instanceof Error ? err.message : 'Approval failed'
          });
          setIsApproveWait(false);
      }
  };
  
  // Watch for approval success
  useEffect(() => {
     let interval: ReturnType<typeof setInterval>;
     if (isApproveWait) {
         interval = setInterval(() => {
             refetchAllowance();
         }, 1000); // Check every second
     }
     return () => clearInterval(interval);
  }, [isApproveWait, refetchAllowance]);

  // Trigger execution once approved
  useEffect(() => {
      if (isApproveWait && isApproved) {
          setIsApproveWait(false);
          setFeedback({
              type: 'info',
              message: 'Token approved! Initializing transfer...'
          });
          executeTransfer();
      }
  }, [isApproved, isApproveWait, executeTransfer]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) {
        await handleApprove();
        return;
    }
    await executeTransfer();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsedData: { recipients: string[], amounts: string[] } = { recipients: [], amounts: [] };

        if (file.name.endsWith('.json')) {
            parsedData = parseJSON(content);
        } else if (file.name.endsWith('.csv')) {
            parsedData = parseCSV(content);
        } else {
            throw new Error("Unsupported file type. Please upload a JSON or CSV file.");
        }

        setRecipients(parsedData.recipients.join(', '));
        setAmounts(parsedData.amounts.join(', '));

      } catch (err: unknown) {
        setParseError(err instanceof Error ? err.message : "Failed to parse file. Please check the format.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setFileName(null);
    setParseError(null);
    setShowHelp(false);
  };

  const isLoading = isProcessing || isWritePending || (!!currentTxHash && !isReceiptSuccess);

  const handleReset = () => {
      setRecipients('');
      setAmounts('');
      setFileName(null);
      setParseError(null);
      setBatches([]);
      setExecutionHistory([]);
      setCurrentBatchIndex(0);
      setTotalBatches(0);
      setFeedback(null);
      
      // Clear Token Specific State
      setTokenAddress('');
      setTokenSymbol('');
      setTokenDecimals(18);
      setDecimalsDisabled(false);
      setUseSimpleMode(false);
      setActiveTab('manual');
      setShowHelp(false);

      refetchAllowance();
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const showSummary = executionHistory.length > 0 && executionHistory.length === totalBatches && !isProcessing;

  return (
    <div className="w-full mx-auto">
      <div className="bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        
        {showSummary ? (
            <BatchSummary 
                results={executionHistory} 
                explorerUrl={explorerUrl}
                onReset={handleReset}
            />
        ) : (
            <>
                <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

                {feedback && (
                    <FeedbackAlert 
                        feedback={feedback}
                        explorerUrl={explorerUrl}
                        onDismiss={() => setFeedback(null)}
                    />
                )}

                <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-10">
                
                <TokenAddressInput 
                    value={tokenAddress}
                    onChange={(v) => {
                        setTokenAddress(v);
                        setDecimalsDisabled(false);
                    }}
                    onSymbolChange={setTokenSymbol}
                    onDecimalsChange={(d) => {
                        setTokenDecimals(d);
                        setDecimalsDisabled(true);
                    }}
                />

                <div className="min-h-[300px]">
                    {activeTab === 'manual' ? (
                    <ManualInput 
                        recipients={recipients} 
                        setRecipients={setRecipients}
                        amounts={amounts}
                        setAmounts={setAmounts}
                    />
                    ) : (
                    <div className="space-y-4">
                        <FormatHelp 
                        activeTab={activeTab} 
                        showHelp={showHelp} 
                        onToggleHelp={() => setShowHelp(!showHelp)} 
                        />
                        
                        {fileName && !parseError ? (
                            <FilePreview 
                                fileName={fileName}
                                recipients={recipients}
                                amounts={amounts}
                                decimals={tokenDecimals.toString()}
                                maxRecipients={maxRecipients}
                                tokenSymbol={tokenSymbol}
                                onClear={() => {
                                    setFileName(null);
                                    setRecipients('');
                                    setAmounts('');
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            />
                        ) : (
                            <FileUpload
                                fileName={fileName}
                                parseError={parseError}
                                recipients={recipients}
                                fileInputRef={fileInputRef}
                                onFileUpload={handleFileUpload}
                                onTriggerUpload={triggerFileUpload}
                                onChangeFile={triggerFileUpload}
                            />
                        )}
                    </div>
                    )}
                </div>

                {!isProcessing ? (
                    <FormActions 
                        isWaitingReceipt={isLoading}
                        isDisabled={isLoading || (!recipients && !fileName) || !tokenAddress}
                        recipientsCount={recipients ? recipients.split(',').length : 0}
                        isApproveRequired={!isApproved}
                        isApproved={!!isApproved}
                        onApprove={handleApprove}
                        isApproving={isApprovePending || isApproveWait}
                        decimals={tokenDecimals}
                        setDecimals={setTokenDecimals}
                        decimalsDisabled={decimalsDisabled}
                        useSimpleMode={useSimpleMode}
                        setUseSimpleMode={setUseSimpleMode}
                    />
                ) : (
                    <BatchProgress 
                        currentBatch={currentBatchIndex + 1}
                        totalBatches={totalBatches}
                        isConfirming={!!currentTxHash}
                        txHash={currentTxHash}
                        explorerUrl={explorerUrl}
                    />
                )}


                </form>
            </>
        )}
      </div>
    </div>
  );
}
