interface Props {
  currentBatch: number;
  totalBatches: number;
  isConfirming: boolean;
  txHash?: string;
  explorerUrl?: string;
}

export function BatchProgress({ currentBatch, totalBatches, isConfirming, txHash, explorerUrl }: Props) {
  const visualProgress = Math.max(5, Math.round(((currentBatch - 0.5) / totalBatches) * 100));

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-xl p-6 mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-bold text-white mb-1">
                Processing Batch {currentBatch} of {totalBatches}
            </h3>
            <p className="text-zinc-400 text-sm flex items-center gap-2">
                {isConfirming ? (
                    <>
                        <span className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/>
                        Confirming on blockchain...
                    </>
                ) : (
                    "Please confirm the transaction in your wallet..."
                )}
            </p>
        </div>
        <div className="text-right">
            <span className="text-3xl font-bold text-white">{visualProgress}%</span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
        <div 
            className="h-full bg-white transition-all duration-1000 ease-in-out relative"
            style={{ width: `${visualProgress}%` }}
        >
            <div className="absolute inset-0 bg-white/20 animate-pulse"/>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="text-xs text-zinc-500">
            Running sequential transactions to respect safe gas limits.
        </div>
        {txHash && explorerUrl && (
             <a 
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
             >
                View Batch {currentBatch} on Explorer
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
             </a>
        )}
      </div>
    </div>
  );
}
