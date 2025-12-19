import { useState, useEffect } from 'react';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';
import { type Address, parseUnits, isAddress } from 'viem';
import { useChainId } from 'wagmi';
import { useChainMetadata } from '../../../hooks/useChainMetadata';

interface Props {
  contractAddress: Address;
  paused: boolean;
  owner: string;
  maxRecipients: bigint;
  refetch: () => void;
}

interface FeedbackState {
    type: 'success' | 'error' | 'info';
    message: string;
    hash?: string;
}

type ActiveAction = 'pause' | 'transfer' | 'setMax' | 'withdraw' | null;

function Spinner() {
    return (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );
}

export function AdminControls({ contractAddress, paused, owner, maxRecipients, refetch }: Props) {
  const chainId = useChainId();
  const { metadata } = useChainMetadata(chainId);
  const { write, isPending, isConfirming, isConfirmed, hash, writeError } = useBatchTransfer(contractAddress);
  const [newOwner, setNewOwner] = useState('');
  const [newMax, setNewMax] = useState('');
  
  // Feedback State
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  
  // Loading State
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  // Emergency Withdraw State
  const [withdrawToken, setWithdrawToken] = useState('');
  const [withdrawTo, setWithdrawTo] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDecimals, setWithdrawDecimals] = useState('18');
  const [isEthWithdraw, setIsEthWithdraw] = useState(true);

  const isLoading = isPending || isConfirming;
  const explorerUrl = metadata?.explorers?.[0]?.url;

  // Cleanup active action when loading finishes
  useEffect(() => {
    if (!isLoading) {
        // Create a small delay to allow the 'success' effect to trigger first if needed
        // or just let the success effect clear it. 
        // Actually, if we just rely on isLoading, that's enough for the spinner.
        // We set activeAction to null here to be safe.
        if (writeError) {
             setActiveAction(null);
        }
    }
  }, [isLoading, writeError]);

  // Handle Transaction Success
  useEffect(() => {
    if (isConfirmed && hash) {
        refetch();
        setFeedback({
            type: 'success',
            message: 'Transaction confirmed successfully',
            hash: hash
        });
        setActiveAction(null);

        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
            setFeedback(null);
        }, 5000);

        // Clear forms
        setNewMax('');
        setNewOwner('');
        setWithdrawAmount('');
        setWithdrawTo('');
        setWithdrawToken('');

        return () => clearTimeout(timer);
    }
  }, [isConfirmed, hash, refetch]);

  const handlePauseToggle = () => {
    setActiveAction('pause');
    write(paused ? 'unpause' : 'pause', []);
  };

  const handleTransferOwnership = () => {
    if(!newOwner || !isAddress(newOwner)) return;
    setActiveAction('transfer');
    write('transferOwnership', [newOwner]);
  };

  const handleSetMax = () => {
    if(!newMax) return;
    setActiveAction('setMax');
    write('setMaxRecipients', [BigInt(newMax)]);
  };

  const handleEmergencyWithdraw = () => {
    try {
        const decimals = isEthWithdraw ? 18 : parseInt(withdrawDecimals || '18');
        const amount = parseUnits(withdrawAmount, decimals);

        setActiveAction('withdraw');
        if (isEthWithdraw) {
            write('emergencyWithdrawEth', [withdrawTo, amount]);
        } else {
            write('emergencyWithdrawToken', [withdrawToken, withdrawTo, amount]);
        }
    } catch (e) {
        console.error("Error parsing amount:", e);
        setActiveAction(null);
    }
  };

  const isNewOwnerValid = !newOwner || isAddress(newOwner);
  const isWithdrawToValid = !withdrawTo || isAddress(withdrawTo);
  const isWithdrawTokenValid = isEthWithdraw || (!withdrawToken || isAddress(withdrawToken));

  return (
    <div className="space-y-8">
       {/* Inline Feedback */}
       {feedback && (
         <div className="w-full bg-zinc-900 border border-zinc-800 p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
             <div className="mt-1">
                {feedback.type === 'success' && (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )}
             </div>
             <div className="flex-1">
                 <p className="text-sm font-medium text-white">{feedback.message}</p>
                 {feedback.hash && explorerUrl && (
                     <a 
                         href={`${explorerUrl}/tx/${feedback.hash}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-xs text-zinc-400 underline underline-offset-4 hover:text-white mt-1 block font-mono"
                     >
                         View on Explorer: {feedback.hash}
                     </a>
                 )}
             </div>
         </div>
       )}

       {/* Status Section */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="p-6 border border-zinc-800 bg-black">
             <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Contract Status</div>
             <div className="text-2xl font-bold text-white mb-4">
                {paused ? 'PAUSED' : 'ACTIVE'}
             </div>
             <button 
                onClick={handlePauseToggle} 
                disabled={isLoading}
                className="w-full text-xs px-4 py-3 bg-white hover:bg-zinc-200 text-black font-medium transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
             >
                {isLoading && activeAction === 'pause' ? (
                     <>
                        <Spinner />
                        {paused ? 'Resuming...' : 'Pausing...'}
                     </>
                ) : (
                    paused ? 'Resume' : 'Pause'
                )}
             </button>
          </div>

          <div className="p-6 border border-zinc-800 bg-black col-span-1 sm:col-span-2 lg:col-span-3">
             <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Owner</div>
             <div className="text-xl md:text-2xl font-mono truncate text-white" title={owner}>{owner}</div>
          </div>

          <div className="p-6 border border-zinc-800 bg-black">
             <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Max Recipients</div>
             <div className="text-xl font-bold text-white">{maxRecipients?.toString()}</div>
          </div>
       </div>

       {/* Ownership & Config */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
             <h4 className="text-lg font-medium text-white border-b border-zinc-800 pb-2">Transfer Ownership</h4>
             <div className="flex flex-col sm:flex-row gap-0">
                <div className="flex-1 min-w-0">
                    <input 
                        type="text" 
                        value={newOwner} 
                        onChange={e => setNewOwner(e.target.value)} 
                        placeholder="New Owner Address"
                        className={`w-full bg-transparent border border-zinc-800 border-b-0 sm:border-b sm:border-r-0 px-4 py-3 text-sm text-white focus:outline-none focus:bg-zinc-900/50 placeholder:text-zinc-600 font-mono ${!isNewOwnerValid ? 'border-red-900/50 text-red-400' : ''}`}
                    />
                </div>
                <button 
                    onClick={handleTransferOwnership} 
                    disabled={isLoading || !newOwner || !isNewOwnerValid} 
                    className="bg-white hover:bg-zinc-200 text-black px-6 py-3 text-sm font-medium transition-colors uppercase tracking-wider w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center justify-center min-w-[100px]"
                >
                    {isLoading && activeAction === 'transfer' ? (
                        <>
                           <Spinner />
                           Setting...
                        </>
                   ) : 'Set'}
                </button>
             </div>
             {!isNewOwnerValid && <p className="text-xs text-red-500">Invalid address format</p>}
          </div>

          <div className="space-y-4">
             <h4 className="text-lg font-medium text-white border-b border-zinc-800 pb-2">Update Max Recipients</h4>
             <div className="flex flex-col sm:flex-row gap-0">
                <div className="flex-1 min-w-0">
                    <input 
                        type="number" 
                        value={newMax} 
                        onChange={e => setNewMax(e.target.value)} 
                        placeholder="e.g. 200"
                        className="w-full bg-transparent border border-zinc-800 border-b-0 sm:border-b sm:border-r-0 px-4 py-3 text-sm text-white focus:outline-none focus:bg-zinc-900/50 placeholder:text-zinc-600 font-mono"
                    />
                </div>
                <button 
                    onClick={handleSetMax} 
                    disabled={isLoading || !newMax} 
                    className="bg-white hover:bg-zinc-200 text-black px-6 py-3 text-sm font-medium transition-colors uppercase tracking-wider w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center justify-center min-w-[100px]"
                >
                     {isLoading && activeAction === 'setMax' ? (
                        <>
                           <Spinner />
                           Setting...
                        </>
                   ) : 'Set'}
                </button>
             </div>
          </div>
       </div>

       {/* Emergency Withdraw */}
       <div className="border border-zinc-800 p-8 space-y-6 bg-black">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4 gap-4 md:gap-0">
            <h4 className="text-lg font-medium text-white uppercase tracking-wider">
                Emergency Withdraw
            </h4>
            <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 border border-zinc-500 rounded-full flex items-center justify-center ${isEthWithdraw ? 'border-white' : ''}`}>
                        {isEthWithdraw && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <input type="radio" checked={isEthWithdraw} onChange={() => setIsEthWithdraw(true)} name="withdrawType" className="hidden" />
                    <span className={`text-sm ${isEthWithdraw ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>ETH</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 border border-zinc-500 rounded-full flex items-center justify-center ${!isEthWithdraw ? 'border-white' : ''}`}>
                        {!isEthWithdraw && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <input type="radio" checked={!isEthWithdraw} onChange={() => setIsEthWithdraw(false)} name="withdrawType" className="hidden" />
                    <span className={`text-sm ${!isEthWithdraw ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>ERC20 Token</span>
                </label>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
             {!isEthWithdraw && (
                <div>
                    <input 
                        type="text" 
                        value={withdrawToken} 
                        onChange={e => setWithdrawToken(e.target.value)}
                        placeholder="Token Address"
                        className={`w-full bg-transparent border border-zinc-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-white placeholder:text-zinc-600 font-mono ${!isWithdrawTokenValid ? 'border-red-900/50 text-red-400' : ''}`}
                    />
                    {!isWithdrawTokenValid && <p className="text-xs text-red-500 mt-1">Invalid token address</p>}
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                     <input 
                        type="text" 
                        value={withdrawTo} 
                        onChange={e => setWithdrawTo(e.target.value)}
                        placeholder="Recipient Address"
                        className={`w-full bg-transparent border border-zinc-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-white placeholder:text-zinc-600 font-mono ${!isWithdrawToValid ? 'border-red-900/50 text-red-400' : ''}`}
                     />
                     {!isWithdrawToValid && <p className="text-xs text-red-500 mt-1">Invalid recipient address</p>}
                </div>

                <div className="md:col-span-4">
                     <input 
                        type="text" 
                        value={withdrawAmount} 
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder={!isEthWithdraw ? "Amount (tokens)" : "Amount (ETH)"}
                        className="w-full bg-transparent border border-zinc-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-white placeholder:text-zinc-600 font-mono"
                    />
                </div>

                <div className="md:col-span-2">
                    <input 
                        type="number" 
                        value={withdrawDecimals} 
                        onChange={e => setWithdrawDecimals(e.target.value)}
                        placeholder="Decimals (18)"
                        className="w-full bg-transparent border border-zinc-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-white placeholder:text-zinc-600 font-mono"
                    />
                </div>
             </div>

             <div className="flex justify-end mt-4">
                <button 
                    onClick={handleEmergencyWithdraw} 
                    disabled={
                        isLoading || 
                        !withdrawTo || 
                        !withdrawAmount || 
                        !withdrawDecimals ||
                        !isWithdrawToValid ||
                        (!isEthWithdraw && (!withdrawToken || !isWithdrawTokenValid))
                    } 
                    className="bg-white hover:bg-zinc-200 text-black px-8 py-3 text-sm font-medium transition-colors uppercase tracking-wider w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center justify-center min-w-[120px]"
                >
                    {isLoading && activeAction === 'withdraw' ? (
                        <>
                           <Spinner />
                           Withdrawing...
                        </>
                   ) : 'Withdraw'}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}
