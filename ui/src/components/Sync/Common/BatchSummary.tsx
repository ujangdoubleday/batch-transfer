interface BatchResult {
  batchNumber: number;
  txHash: string;
}

interface Props {
  results: BatchResult[];
  explorerUrl?: string;
  onReset: () => void;
}

export function BatchSummary({ results, explorerUrl, onReset }: Props) {
  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-900/30">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h3 className="text-2xl font-bold text-white">Execution Complete!</h3>
        <p className="text-zinc-400">Successfully executed {results.length} batch transactions.</p>
      </div>

      <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/5">
        {results.map((result) => (
            <div key={result.txHash} className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/40 transition-colors">
                <span className="text-sm font-medium text-white">Batch #{result.batchNumber}</span>
                {explorerUrl ? (
                    <a 
                        href={`${explorerUrl}/tx/${result.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                    >
                        <span className="truncate max-w-[150px] md:max-w-[300px] font-mono">{result.txHash}</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                ) : (
                    <span className="text-sm text-zinc-500 font-mono truncate max-w-[200px]">{result.txHash}</span>
                )}
            </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="w-full bg-white hover:bg-zinc-200 text-black font-bold text-lg py-4 px-8 rounded-xl transition-all transform active:scale-[0.99]"
      >
        Start New Transfer
      </button>
    </div>
  );
}
