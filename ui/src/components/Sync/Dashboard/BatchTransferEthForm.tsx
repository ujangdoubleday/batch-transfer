import { useState, useRef, useEffect } from 'react';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';
import { useChainMetadata } from '../../../hooks/useChainMetadata';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { type Address, parseUnits } from 'viem';
import { cn } from '../../../lib/utils';
import { TabSelector } from './BatchTransferEth/TabSelector';
import { ManualInput } from './BatchTransferEth/ManualInput';
import { FormatHelp } from './BatchTransferEth/FormatHelp';
import { FileUpload } from './BatchTransferEth/FileUpload';
import { TokenDecimalsInput } from './BatchTransferEth/TokenDecimalsInput';
import { FilePreview } from './BatchTransferEth/FilePreview';
import { BatchProgress } from './BatchTransferEth/BatchProgress';
import { BatchSummary } from './BatchTransferEth/BatchSummary';

interface Props {
  contractAddress: Address;
}

type TabType = 'manual' | 'upload';

interface FeedbackState {
  type: 'success' | 'error' | 'info';
  message: string;
  hash?: string;
}

export function BatchTransferEthForm({ contractAddress }: Props) {
  const { chainId } = useAccount();
  const { metadata } = useChainMetadata(chainId);
  const { writeAsync, isPending: isWritePending, writeError, useContractRead } = useBatchTransfer(contractAddress);
  
  // Read maxRecipients from contract
  const { data: maxRecipientsData } = useContractRead('maxRecipients');
  const maxRecipients = maxRecipientsData ? Number(maxRecipientsData) : 100; // Fallback to 100 if read fails

  // Form State
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  const [recipients, setRecipients] = useState('');
  const [amounts, setAmounts] = useState('');
  const [decimals, setDecimals] = useState('18');
  
  // Batch Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>(undefined);
  const [batches, setBatches] = useState<{recipients: string[], amounts: bigint[], totalEth: bigint}[]>([]);
  const [executionHistory, setExecutionHistory] = useState<{batchNumber: number, txHash: string}[]>([]);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const explorerUrl = metadata?.explorers?.[0]?.url;

  // Monitor transaction receipt for the CURRENT batch
  const { isLoading: isWaitingReceipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
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
            // Reset hash to undefined to reset useWaitForTransactionReceipt
            // This prevents the effect from running again immediately with the OLD success state
            setCurrentTxHash(undefined);
            
            const batch = batches[nextIndex];
            
            const hash = await writeAsync('batchTransferEth', [batch.recipients, batch.amounts], batch.totalEth);
            setCurrentTxHash(hash);
          } catch (err: any) {
            console.error('Error processing batch:', err);
            setFeedback({
              type: 'error',
              message: err.message || `Failed to process batch ${nextIndex + 1}`
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
        
        // We do NOT clear the form here anymore. 
        // We let the UI render the BatchSummary based on (executionHistory.length === totalBatches)
      }
    }
  }, [isReceiptSuccess, isProcessing, currentBatchIndex, totalBatches, batches, writeAsync, currentTxHash, executionHistory]);



  useEffect(() => {
    if (writeError) {
      setFeedback({
        type: 'error',
        message: writeError.message || 'Transaction failed'
      });
      setIsProcessing(false);
      // Auto dismiss error message
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [writeError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const recipientList = recipients.split(',').map(r => r.trim()).filter(Boolean);
      const amountList = amounts.split(',').map(a => parseUnits(a.trim(), Number(decimals)));
      
      if (recipientList.length === 0 || amountList.length === 0) {
        throw new Error("No valid data to process");
      }

      if (recipientList.length !== amountList.length) {
        throw new Error(`Mismatch: ${recipientList.length} recipients vs ${amountList.length} amounts`);
      }

      // Create Batches using dynamic maxRecipients
      const batchSize = maxRecipients;
      const newBatches = [];
      for (let i = 0; i < recipientList.length; i += batchSize) {
        const batchRecipients = recipientList.slice(i, i + batchSize);
        const batchAmounts = amountList.slice(i, i + batchSize);
        const batchTotalEth = batchAmounts.reduce((acc, curr) => acc + curr, 0n);
        newBatches.push({
            recipients: batchRecipients,
            amounts: batchAmounts,
            totalEth: batchTotalEth
        });
      }

      setBatches(newBatches);
      setTotalBatches(newBatches.length);
      setExecutionHistory([]);
      setCurrentBatchIndex(0);
      setIsProcessing(true);

      // Trigger first batch
      const firstBatch = newBatches[0];

      const hash = await writeAsync('batchTransferEth', [firstBatch.recipients, firstBatch.amounts], firstBatch.totalEth);
      setCurrentTxHash(hash);

    } catch (err: any) {
      console.error('Error preparing transaction:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to prepare transaction'
      });
      setIsProcessing(false);
    }
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
        if (file.name.endsWith('.json')) {
          parseJSON(content);
        } else if (file.name.endsWith('.csv')) {
          parseCSV(content);
        } else {
            setParseError("Unsupported file type. Please upload a JSON or CSV file.");
        }
      } catch (err) {
        setParseError("Failed to parse file. Please check the format.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const parseJSON = (content: string) => {
    const data = JSON.parse(content);
    if (!Array.isArray(data)) throw new Error("JSON must be an array");
    
    const r: string[] = [];
    const a: string[] = [];

    data.forEach((item: any) => {
      if (item.recipient && item.amount) {
        r.push(item.recipient);
        a.push(item.amount.toString());
      }
    });

    setRecipients(r.join(', '));
    setAmounts(a.join(', '));
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n');
    const r: string[] = [];
    const a: string[] = [];

    lines.forEach(line => {
      const [recipient, amount] = line.split(',');
      if (recipient && amount) {
        r.push(recipient.trim());
        a.push(amount.trim());
      }
    });

    setRecipients(r.join(', '));
    setAmounts(a.join(', '));
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

  const isLoading = isProcessing || isWritePending || isWaitingReceipt;

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
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const showSummary = executionHistory.length > 0 && executionHistory.length === totalBatches && !isProcessing;

  return (
    <div className="w-full max-w-5xl mx-auto">
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
                    <div className={cn(
                        "mx-8 mt-8 p-4 rounded-xl border flex items-start gap-4 animate-in slide-in-from-top-2",
                        feedback.type === 'success' ? "bg-green-900/20 border-green-900/50 text-green-400" :
                        feedback.type === 'error' ? "bg-red-900/20 border-red-900/50 text-red-400" :
                        "bg-blue-900/20 border-blue-900/50 text-blue-400"
                    )}>
                        <div className="mt-1">
                            {feedback.type === 'success' && (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {feedback.type === 'error' && (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            {feedback.type === 'info' && (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium">{feedback.message}</p>
                            {feedback.hash && explorerUrl && (
                                <a 
                                    href={`${explorerUrl}/tx/${feedback.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs underline underline-offset-4 opacity-80 hover:opacity-100 mt-1 block truncate"
                                >
                                    View on Explorer: {feedback.hash}
                                </a>
                            )}
                        </div>
                        <button 
                            onClick={() => setFeedback(null)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-10">
                
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
                                decimals={decimals}
                                maxRecipients={maxRecipients}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5 items-end">
                        <TokenDecimalsInput decimals={decimals} setDecimals={setDecimals} />

                        <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={isLoading || (!recipients && !fileName)}
                            className="w-full bg-white hover:bg-zinc-200 text-black font-bold text-lg py-5 px-8 rounded-xl transition-all transform active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            {isWaitingReceipt ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                                    Waiting for Receipt...
                                </span>
                            ) : (
                                `Execute Batch Transfer ${recipients ? `(${recipients.split(',').length})` : ''}`
                            )}
                        </button>
                        </div>
                    </div>
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
