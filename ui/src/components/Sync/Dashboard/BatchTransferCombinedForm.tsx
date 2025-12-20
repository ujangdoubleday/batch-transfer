
import { useState, useRef, useEffect } from 'react';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';
import { useChainMetadata } from '../../../hooks/useChainMetadata';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { type Address, parseEther, parseUnits, isAddress } from 'viem';
import { TabSelector } from '../Common/TabSelector';
import { FormatHelp } from '../Common/FormatHelp';
import { FileUpload } from '../Common/FileUpload';
import { BatchProgress } from '../Common/BatchProgress';
import { BatchSummary } from '../Common/BatchSummary';
import { FeedbackAlert } from '../Common/FeedbackAlert';
import { parseCombinedJSON, parseCombinedCSV, type CombinedTransferData } from '../../../lib/fileParsing';
import { ManualInputCombined } from './BatchTransferCombined/ManualInputCombined';
import { FilePreviewCombined } from './BatchTransferCombined/FilePreviewCombined';
import { FormActionsCombined } from './BatchTransferCombined/FormActionsCombined';
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

export function BatchTransferCombinedForm({ contractAddress }: Props) {
  const { chainId } = useAccount();
  const { metadata } = useChainMetadata(chainId);
  const { writeAsync, isPending: isWritePending, writeError, useContractRead } = useBatchTransfer(contractAddress);
  
  const { data: maxRecipientsData } = useContractRead('maxRecipients');
  const maxRecipients = maxRecipientsData ? Number(maxRecipientsData) : 100;

  // Form State
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  
  // Manual Input State
  const [tokenAddresses, setTokenAddresses] = useState('');
  const [tokenRecipients, setTokenRecipients] = useState('');
  const [tokenAmounts, setTokenAmounts] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState('18'); // Default 18
  
  const [ethRecipients, setEthRecipients] = useState('');
  const [ethAmounts, setEthAmounts] = useState('');

  // Batch Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>(undefined);
  const [batches, setBatches] = useState<{
      tokenAddrs: string[], tokenRecipients: string[], tokenAmounts: bigint[],
      ethRecipients: string[], ethAmounts: bigint[], totalEth: bigint
  }[]>([]);
  const [executionHistory, setExecutionHistory] = useState<{batchNumber: number, txHash: string}[]>([]);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<CombinedTransferData | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  
  // Approval State
  const [tokensToApprove, setTokensToApprove] = useState<TokenApprovalInfo[]>([]);
  const [isAllApproved, setIsAllApproved] = useState(false);

  const explorerUrl = metadata?.explorers?.[0]?.url;

  const { isLoading: isWaitingReceipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
    hash: currentTxHash as `0x${string}` | undefined,
  });

  // Calculate required approvals instantly when inputs change
  useEffect(() => {
     const uniqueTokensMap = new Map<string, bigint>();

     if (activeTab === 'manual') {
         const tAddrs = tokenAddresses.split(',').map(s => s.trim()).filter(Boolean);
         const tAmts = tokenAmounts.split(',').map(s => s.trim());
         
         // Only calculate if lengths match roughly, or at least we have addrs and amts
         // This is a "best effort" check for approval UI
         if (tAddrs.length > 0) {
             tAddrs.forEach((addr, i) => {
                 if (!isAddress(addr)) return;
                 const amtStr = tAmts[i] || '0';
                 let amt = 0n;
                 try {
                     amt = parseUnits(amtStr, Number(tokenDecimals));
                 } catch { amt = 0n; }
                 
                 const current = uniqueTokensMap.get(addr) || 0n;
                 uniqueTokensMap.set(addr, current + amt);
             });
         }
     } else if (parsedData) {
         parsedData.tokens.forEach(t => {
             if (!isAddress(t.token)) return;
             let amt = 0n;
             try { 
                 // Matches handleSubmit logic: Apply decimals to amount
                 amt = parseUnits(t.amount, Number(tokenDecimals));
             } catch { 
                 // If parsing fails for approval check, we might assume 0 or handle error. 
                 // But 0 will hide the approval requirement. 
                 // Better to try BigInt as fallback if parseUnits fails? 
                 // No, consistency is key. If handleSubmit fails, this should too (or result in 0 and fail later).
                 amt = 0n; 
             }
             
             const current = uniqueTokensMap.get(t.token) || 0n;
             uniqueTokensMap.set(t.token, current + amt);
         });
     }

     const tokens: TokenApprovalInfo[] = [];
     uniqueTokensMap.forEach((amount, address) => {
         if (amount > 0n) {
            tokens.push({ address: address as Address, amount });
         }
     });

     setTokensToApprove(tokens);
     // If no tokens needed, implicitly approved. If tokens needed, start as false until checked.
     if (tokens.length === 0) setIsAllApproved(true);
     else setIsAllApproved(false); 

  }, [tokenAddresses, tokenAmounts, tokenDecimals, activeTab, parsedData]);


  // Watch for confirmation of current batch
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
            const hash = await writeAsync('batchTransferCombinedMultiTokens', [
                batch.tokenAddrs, batch.tokenRecipients, batch.tokenAmounts,
                batch.ethRecipients, batch.ethAmounts
            ], batch.totalEth);
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
      let tAddrs: string[] = [];
      let tRecps: string[] = [];
      let tAmts: bigint[] = [];
      let eRecps: string[] = [];
      let eAmts: bigint[] = [];

      if (activeTab === 'manual') {
          tAddrs = tokenAddresses.split(',').map(s => s.trim()).filter(Boolean);
          tRecps = tokenRecipients.split(',').map(s => s.trim()).filter(Boolean);
          tAmts = tokenAmounts.split(',').map(s => {
               try { return parseUnits(s.trim(), Number(tokenDecimals)); }
               catch { throw new Error(`Invalid amount: ${s}`); }
          });
          
          eRecps = ethRecipients.split(',').map(s => s.trim()).filter(Boolean);
          eAmts = ethAmounts.split(',').map(s => {
              try { return parseEther(s.trim()); }
              catch { throw new Error(`Invalid ETH amount: ${s}`); }
          });

          if (tAddrs.length !== tRecps.length || tRecps.length !== tAmts.length) {
              if (tAddrs.length > 0) throw new Error("Token arrays length mismatch");
          }
          if (eRecps.length !== eAmts.length) {
              if (eRecps.length > 0) throw new Error("ETH arrays length mismatch");
          }
      } else {
          if (!parsedData) throw new Error("No file data parsed");
          
          parsedData.tokens.forEach(t => {
              tAddrs.push(t.token);
              tRecps.push(t.recipient);
              // Apply decimals for file inputs too
              try {
                 tAmts.push(parseUnits(t.amount, Number(tokenDecimals)));
              } catch {
                 // Fallback to raw if parsing fails (e.g. if already raw but user set 18?? No, if we parse "100" with 18, it works. If "100" is raw, user should set decimals 0.)
                 // But wait, if user inputs "100" and Means 100 Wei, they should set Decimals to 0.
                 // If they mean 100 tokens, they set 18.
                 // So we always honor the Input.
                 throw new Error(`Failed to parse amount: ${t.amount} with decimals ${tokenDecimals}`);
              }
          });

          parsedData.eth.forEach(e => {
              eRecps.push(e.recipient);
              eAmts.push(parseEther(e.amount));
          });
      }

      const newBatches = [];
      let tIndex = 0;
      let eIndex = 0;

      while (tIndex < tAddrs.length || eIndex < eRecps.length) {
           const tEnd = Math.min(tIndex + maxRecipients, tAddrs.length);
           const eEnd = Math.min(eIndex + maxRecipients, eRecps.length);

           const bTAddrs = tAddrs.slice(tIndex, tEnd);
           const bTRecps = tRecps.slice(tIndex, tEnd);
           const bTAmts = tAmts.slice(tIndex, tEnd);

           const bERecps = eRecps.slice(eIndex, eEnd);
           const bEAmts = eAmts.slice(eIndex, eEnd);
           const bTotalEth = bEAmts.reduce((acc, curr) => acc + curr, 0n);

           newBatches.push({
               tokenAddrs: bTAddrs,
               tokenRecipients: bTRecps,
               tokenAmounts: bTAmts,
               ethRecipients: bERecps,
               ethAmounts: bEAmts,
               totalEth: bTotalEth
           });

           tIndex = tEnd;
           eIndex = eEnd;
      }

      setBatches(newBatches);
      setTotalBatches(newBatches.length);
      setExecutionHistory([]);
      setCurrentBatchIndex(0);
      setIsProcessing(true);

      const firstBatch = newBatches[0];
      const hash = await writeAsync('batchTransferCombinedMultiTokens', [
           firstBatch.tokenAddrs, firstBatch.tokenRecipients, firstBatch.tokenAmounts,
           firstBatch.ethRecipients, firstBatch.ethAmounts
      ], firstBatch.totalEth);
      setCurrentTxHash(hash);

    } catch (err: unknown) {
        console.error("Preparation error:", err);
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
              let data: CombinedTransferData;
              if (file.name.endsWith('.json')) {
                  data = parseCombinedJSON(content);
              } else if (file.name.endsWith('.csv')) {
                  data = parseCombinedCSV(content);
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
    // Reset Manual Inputs
    setTokenAddresses(''); setTokenRecipients(''); setTokenAmounts('');
    setTokenDecimals('18');
    setEthRecipients(''); setEthAmounts('');
    
    // Reset File Inputs
    setFileName(null); setParseError(null); setParsedData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Reset Batch State
    setBatches([]); setExecutionHistory([]); 
    setCurrentBatchIndex(0); setTotalBatches(0);
    setCurrentTxHash(undefined);
    setIsProcessing(false);
    
    // Reset Feedback & Approvals
    setFeedback(null);
    setTokensToApprove([]); setIsAllApproved(false);
  };
   const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setFileName(null);
    setParseError(null);
    setParsedData(null);
    setShowHelp(false);
  };

  const showSummary = executionHistory.length > 0 && executionHistory.length === totalBatches && !isProcessing;
  const isLoading = isProcessing || isWritePending || isWaitingReceipt;
  
  // Disable button if: loading, or no data, OR (important) tokens not approved yet
  const isButtonDisabled = isLoading || 
    (activeTab === 'upload' && !parsedData) || 
    (activeTab === 'manual' && (!tokenAddresses && !ethRecipients)) ||
    (!isAllApproved && tokensToApprove.length > 0);

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
                <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
                
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
                            <ManualInputCombined
                                tokenAddresses={tokenAddresses} setTokenAddresses={setTokenAddresses}
                                tokenRecipients={tokenRecipients} setTokenRecipients={setTokenRecipients}
                                tokenAmounts={tokenAmounts} setTokenAmounts={setTokenAmounts}
                                tokenDecimals={tokenDecimals} setTokenDecimals={setTokenDecimals}
                                ethRecipients={ethRecipients} setEthRecipients={setEthRecipients}
                                ethAmounts={ethAmounts} setEthAmounts={setEthAmounts}
                            />
                        ) : (
                            <div className="space-y-4">
                                <FormatHelp activeTab={activeTab} showHelp={showHelp} onToggleHelp={() => setShowHelp(!showHelp)} isCombined={true} />
                                {fileName && !parseError && parsedData ? (
                                    <FilePreviewCombined 
                                        fileName={fileName}
                                        data={parsedData}
                                        onClear={() => {
                                            setFileName(null);
                                            setParsedData(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        tokenDecimals={tokenDecimals}
                                        onDecimalsChange={setTokenDecimals}
                                    />
                                ) : (
                                    <FileUpload
                                        fileName={fileName}
                                        parseError={parseError}
                                        recipients={parsedData ? `${parsedData.tokens.length + parsedData.eth.length} combined` : ''}
                                        fileInputRef={fileInputRef}
                                        onFileUpload={handleFileUpload}
                                        onTriggerUpload={triggerFileUpload}
                                        onChangeFile={triggerFileUpload}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Render MultiTokenApproval if there are tokens to approve */}
                    {tokensToApprove.length > 0 && (
                        <MultiTokenApproval 
                            tokens={tokensToApprove}
                            spenderAddress={contractAddress}
                            onAllApproved={() => setIsAllApproved(true)}
                        />
                    )}

                    {!isProcessing ? (
                         <FormActionsCombined 
                            isWaitingReceipt={isWaitingReceipt}
                            isDisabled={isButtonDisabled}
                            tokenCount={activeTab === 'manual' ? (tokenAddresses ? tokenAddresses.split(',').length : 0) : (parsedData?.tokens.length || 0)}
                            ethCount={activeTab === 'manual' ? (ethRecipients ? ethRecipients.split(',').length : 0) : (parsedData?.eth.length || 0)}
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
