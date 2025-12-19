
import { type CombinedTransferData } from '../../../../lib/fileParsing';

interface Props {
  fileName: string;
  data: CombinedTransferData;
  onClear: () => void;
  tokenDecimals: string;
  onDecimalsChange: (value: string) => void;
}

export function FilePreviewCombined({ fileName, data, onClear, tokenDecimals, onDecimalsChange }: Props) {
  const tokenCount = data.tokens.length;
  const ethCount = data.eth.length;
  
  return (
    <div className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
             <span className="text-white text-xl">✓</span>
          </div>
          <div>
            <h3 className="text-white font-medium">{fileName}</h3>
            <p className="text-zinc-500 text-xs">Successfully parsed</p>
          </div>
        </div>
        <button 
          onClick={onClear}
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          Remove File
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 relative">
              <h4 className="text-white text-sm font-semibold mb-2">Token Transfers</h4>
              <p className="text-2xl font-bold text-white mb-2">{tokenCount}</p>
              
              <div className="mb-3">
                   <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Apply Decimals</label>
                   <input
                        type="number"
                        value={tokenDecimals}
                        onChange={(e) => onDecimalsChange(e.target.value)}
                        className="w-20 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white"
                   />
                   <p className="text-[10px] text-zinc-600 mt-1 leading-tight">Apply to amounts if not raw.</p>
              </div>

              {tokenCount > 0 && (
                <div className="mt-2 text-xs text-zinc-400 border-t border-dashed border-zinc-800 pt-2">
                    Example: {data.tokens[0].token.slice(0,6)}... to {data.tokens[0].recipient.slice(0,6)}... ({data.tokens[0].amount})
                </div>
              )}
          </div>

          <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
              <h4 className="text-white text-sm font-semibold mb-2">ETH Transfers</h4>
              <p className="text-2xl font-bold text-white">{ethCount}</p>
              <p className="text-zinc-500 text-xs">transactions found</p>

              {ethCount > 0 && (
                <div className="mt-3 text-xs text-zinc-400 border-t border-dashed border-zinc-800 pt-2">
                    Example: {data.eth[0].recipient.slice(0,6)}... ({data.eth[0].amount} ETH)
                </div>
              )}
          </div>
      </div>
    </div>
  );
}
