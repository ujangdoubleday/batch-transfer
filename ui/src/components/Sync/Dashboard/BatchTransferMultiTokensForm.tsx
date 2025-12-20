
import { useState, useRef, useEffect } from 'react';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';
import { useChainMetadata } from '../../../hooks/useChainMetadata';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { type Address, parseUnits, isAddress } from 'viem';
import { TabSelector } from '../Common/TabSelector';
import { FormatHelp } from '../Common/FormatHelp';
import { FileUpload } from '../Common/FileUpload';
import { BatchProgress } from '../Common/BatchProgress';
import { BatchSummary } from '../Common/BatchSummary';
import { FeedbackAlert } from '../Common/FeedbackAlert';
import { parseMultiTokenJSON, parseMultiTokenCSV, type MultiTokenTransferData } from '../../../lib/fileParsing';

// Components
import { ManualInputMultiTokens } from './BatchTransferMultiTokens/ManualInputMultiTokens';
import { FilePreviewMultiTokens } from './BatchTransferMultiTokens/FilePreviewMultiTokens';
import { FormActionsMultiTokens } from './BatchTransferMultiTokens/FormActionsMultiTokens';

// Reuse MultiTokenApproval from Combined (or move to Common later)
import { MultiTokenApproval, type TokenApprovalInfo } from './BatchTransferCombined/MultiTokenApproval';

interface Props {
  contractAddress: Address;
}

type TabType = 'manual' | 'upload';

interface FeedbackState {
  type: 'success' | 'error' | 'info';
  message: string;
  hash?: string;
}

export function BatchTransferMultiTokensForm({ contractAddress }: Props) {
  const { chainId } = useAccount();
  const { metadata } = useChainMetadata(chainId);
  const { writeAsync, isPending: isWritePending, writeError, useContractRead } = useBatchTransfer(contractAddress);
  
  const { data: maxRecipientsData } = useContractRead('maxRecipients');
  const maxRecipients = maxRecipientsData ? Number(maxRecipientsData) : 100;

  // Form State
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  
  // Manual Input State
  const [tokens, setTokens] = useState('');
  const [recipients, setRecipients] = useState('');
  const [amounts, setAmounts] = useState('');
  const [decimals, setDecimals] = useState('18');
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<MultiTokenTransferData[] | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Batch Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>(undefined);
  const [batches, setBatches] = useState<{
      tokens: string[], recipients: string[], amounts: bigint[]
  }[]>([]);
  const [executionHistory, setExecutionHistory] = useState<{batchNumber: number, txHash: string}[]>([]);

  // Feedback & Approval
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [tokensToApprove, setTokensToApprove] = useState<TokenApprovalInfo[]>([]);
  const [isAllApproved, setIsAllApproved] = useState(false);

  const explorerUrl = metadata?.explorers?.[0]?.url;

  const { isLoading: isWaitingReceipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
    hash: currentTxHash as `0x${string}` | undefined,
  });

  // Calculate Approvals
  useEffect(() => {
     const uniqueTokensMap = new Map<string, bigint>();

     const processItem = (token: string, amountStr: string) => {
         if (!isAddress(token)) return;
         try {
             const amt = parseUnits(amountStr, Number(decimals));
             const current = uniqueTokensMap.get(token) || 0n;
             uniqueTokensMap.set(token, current + amt);
         } catch { /* ignore invalid parse for approval check */ }
     };

     if (activeTab === 'manual') {
         const tList = tokens.split(',').map(s => s.trim());
         const aList = amounts.split(',').map(s => s.trim());
         tList.forEach((t, i) => {
             if (i < aList.length) processItem(t, aList[i]);
         });
     } else if (parsedData) {
         parsedData.forEach(item => {
             processItem(item.token, item.amount);
         });
     }

     const tokensInfo: TokenApprovalInfo[] = [];
     uniqueTokensMap.forEach((amount, address) => {
         if (amount > 0n) tokensInfo.push({ address: address as Address, amount });
     });

     setTokensToApprove(tokensInfo);
     if (tokensInfo.length === 0) setIsAllApproved(true);
     else setIsAllApproved(false);

  }, [tokens, amounts, decimals, activeTab, parsedData]);

  // Batch Loop
  useEffect(() => {
    if (isReceiptSuccess && isProcessing && currentTxHash) {
      const currentHistory = [...executionHistory, { batchNumber: currentBatchIndex + 1, txHash: currentTxHash }];
      setExecutionHistory(currentHistory);

      if (currentBatchIndex < totalBatches - 1) {
        const nextIndex = currentBatchIndex + 1;
        setCurrentBatchIndex(nextIndex);
        
        const processNextBatch = async () => {
          try {
            setCurrentTxHash(undefined);
            const batch = batches[nextIndex];
            const hash = await writeAsync('batchTransferMultiTokens', [
                batch.tokens, batch.recipients, batch.amounts
            ]);
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
        setIsProcessing(false);
        setFeedback({
            type: 'success',
            message: `All ${totalBatches} batches executed successfully!`,
            hash: currentTxHash 
        });
      }
    }
  }, [isReceiptSuccess, isProcessing, currentBatchIndex, totalBatches, batches, writeAsync, currentTxHash, executionHistory]);

  useEffect(() => {
    if (writeError) {
      setFeedback({ type: 'error', message: writeError.message || 'Transaction failed' });
      setIsProcessing(false);
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [writeError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllApproved && tokensToApprove.length > 0) return;

    try {
      let tList: string[] = [];
      let rList: string[] = [];
      let aList: bigint[] = [];

      if (activeTab === 'manual') {
          tList = tokens.split(',').map(s => s.trim()).filter(Boolean);
          rList = recipients.split(',').map(s => s.trim()).filter(Boolean);
          aList = amounts.split(',').map(s => parseUnits(s.trim(), Number(decimals)));
          
          if (tList.length !== rList.length || rList.length !== aList.length) {
              throw new Error("Mismatch in input arrays length");
          }
      } else {
          if (!parsedData) throw new Error("No file data");
          parsedData.forEach(item => {
              tList.push(item.token);
              rList.push(item.recipient);
              try {
                  aList.push(parseUnits(item.amount, Number(decimals)));
              } catch {
                  throw new Error(`Invalid amount: ${item.amount}`);
              }
          });
      }
      
      if (tList.length === 0) throw new Error("No valid data to process");

      // Batching
      const newBatches = [];
      for (let i = 0; i < tList.length; i += maxRecipients) {
          const sliceC = i + maxRecipients;
          newBatches.push({
              tokens: tList.slice(i, sliceC),
              recipients: rList.slice(i, sliceC),
              amounts: aList.slice(i, sliceC)
          });
      }

      setBatches(newBatches);
      setTotalBatches(newBatches.length);
      setExecutionHistory([]);
      setCurrentBatchIndex(0);
      setIsProcessing(true);

      const firstBatch = newBatches[0];
      const hash = await writeAsync('batchTransferMultiTokens', [
          firstBatch.tokens, firstBatch.recipients, firstBatch.amounts
      ]);
      setCurrentTxHash(hash);

    } catch (err: unknown) {
        setFeedback({ type: 'error', message: err instanceof Error ? err.message : "Failed to prepare transaction" });
        setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      setParseError(null);
      setParsedData(null);

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const content = event.target?.result as string;
              let data: MultiTokenTransferData[];
              if (file.name.endsWith('.json')) {
                  data = parseMultiTokenJSON(content);
              } else if (file.name.endsWith('.csv')) {
                  data = parseMultiTokenCSV(content);
              } else {
                  throw new Error("Unsupported format");
              }
              setParsedData(data);
          } catch (err: unknown) {
              setParseError(err instanceof Error ? err.message : String(err));
          }
      };
      reader.readAsText(file);
  };

  const handleReset = () => {
    setTokens(''); setRecipients(''); setAmounts(''); setDecimals('18');
    setFileName(null); setParseError(null); setParsedData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setBatches([]); setExecutionHistory([]); setCurrentBatchIndex(0); setTotalBatches(0);
    setCurrentTxHash(undefined); setIsProcessing(false);
    setFeedback(null);
    setTokensToApprove([]); setIsAllApproved(false);
  };

  const showSummary = executionHistory.length > 0 && executionHistory.length === totalBatches && !isProcessing;
  const isLoading = isProcessing || isWritePending || isWaitingReceipt;
  
  const hasData = activeTab === 'manual' ? (tokens && recipients) : (parsedData && parsedData.length > 0);
  const isButtonDisabled = isLoading || !hasData || (!isAllApproved && tokensToApprove.length > 0);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
         {showSummary ? (
            <BatchSummary 
                results={executionHistory} 
                explorerUrl={explorerUrl}
                onReset={handleReset}
            />
         ) : (
            <>
                <TabSelector activeTab={activeTab} onTabChange={(t) => {
                    setActiveTab(t);
                    setFileName(null);
                    setParseError(null);
                    setParsedData(null);
                    setShowHelp(false);
                }} />
                
                {feedback && (
                    <FeedbackAlert 
                        feedback={feedback}
                        explorerUrl={explorerUrl}
                        onDismiss={() => setFeedback(null)}
                    />
                )}

                <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-10">
                    <div className="min-h-[300px]">
                        {activeTab === 'manual' ? (
                            <ManualInputMultiTokens
                                tokens={tokens} setTokens={setTokens}
                                recipients={recipients} setRecipients={setRecipients}
                                amounts={amounts} setAmounts={setAmounts}
                                decimals={decimals} setDecimals={setDecimals}
                            />
                        ) : (
                            <div className="space-y-4">
                                <FormatHelp activeTab={activeTab} showHelp={showHelp} onToggleHelp={() => setShowHelp(!showHelp)} isMultiToken={true} />
                                {fileName && !parseError && parsedData ? (
                                    <FilePreviewMultiTokens
                                        fileName={fileName}
                                        data={parsedData}
                                        onClear={() => {
                                            setFileName(null);
                                            setParsedData(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        decimals={decimals}
                                        onDecimalsChange={setDecimals}
                                    />
                                ) : (
                                    <FileUpload
                                        fileName={fileName}
                                        parseError={parseError}
                                        recipients={parsedData ? `${parsedData.length} transfers` : ''}
                                        fileInputRef={fileInputRef}
                                        onFileUpload={handleFileUpload}
                                        onTriggerUpload={() => fileInputRef.current?.click()}
                                        onChangeFile={() => fileInputRef.current?.click()}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    
                    {tokensToApprove.length > 0 && (
                        <MultiTokenApproval 
                            tokens={tokensToApprove}
                            spenderAddress={contractAddress}
                            onAllApproved={() => setIsAllApproved(true)}
                        />
                    )}

                    {!isProcessing ? (
                         <FormActionsMultiTokens
                            isWaitingReceipt={isWaitingReceipt}
                            isDisabled={isButtonDisabled}
                            count={activeTab === 'manual' ? (recipients ? recipients.split(',').length : 0) : (parsedData?.length || 0)}
                         />
                    ) : (
                        <BatchProgress 
                            currentBatch={currentBatchIndex + 1}
                            totalBatches={totalBatches}
                            isConfirming={isWaitingReceipt}
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
