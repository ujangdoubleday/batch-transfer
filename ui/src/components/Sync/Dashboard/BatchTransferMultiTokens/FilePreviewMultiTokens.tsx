
import { type Dispatch, type SetStateAction, useState } from 'react';
import { type MultiTokenTransferData } from '../../../../lib/fileParsing';

interface Props {
  fileName: string;
  data: MultiTokenTransferData[];
  onClear: () => void;
  decimals: string;
  onDecimalsChange: Dispatch<SetStateAction<string>>;
}

export function FilePreviewMultiTokens({ 
    fileName, 
    data, 
    onClear,
    decimals,
    onDecimalsChange
}: Props) {
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const totalPages = Math.ceil(data.length / pageSize);
  
  const currentData = data.slice(page * pageSize, (page + 1) * pageSize);

  const shorten = (str: string) => {
      if (!str) return '';
      if (str.length < 10) return str;
      return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <h4 className="text-sm font-medium text-white">{fileName}</h4>
                <p className="text-xs text-zinc-400">{data.length} total transfers</p>
            </div>
        </div>
        <button 
            onClick={onClear}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
            <div className="flex-1">
                <label className="text-xs text-zinc-500 block mb-1">Global Decimals (for file amounts)</label>
                <input 
                    type="number"
                    value={decimals}
                    onChange={(e) => onDecimalsChange(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white/50"
                />
            </div>
            <div className="flex-[2] text-xs text-zinc-500 italic">
                Note: This assumes the 'amount' field in your file is a decimal number (like 1.0) and uses this to convert to Wei. 
                If your file already contains raw Wei values, set Decimals to 0.
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-zinc-400">
                    <tr>
                        <th className="p-2 rounded-tl-lg">Token</th>
                        <th className="p-2">Recipient</th>
                        <th className="p-2 rounded-tr-lg text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                    {currentData.map((item, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-2 font-mono" title={item.token}>{shorten(item.token)}</td>
                            <td className="p-2 font-mono" title={item.recipient}>{shorten(item.recipient)}</td>
                            <td className="p-2 text-right font-mono text-white">{item.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button 
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-30"
                >
                    Previous
                </button>
                <span className="text-xs text-zinc-500">
                    Page {page + 1} of {totalPages}
                </span>
                <button 
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-30"
                >
                    Next
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
