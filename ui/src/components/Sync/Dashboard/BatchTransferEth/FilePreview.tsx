import { formatUnits } from 'viem';
import { cn } from '../../../../lib/utils';

interface Props {
  recipients: string;
  amounts: string;
  decimals: string;
  maxRecipients: number;
  fileName: string;
  onClear: () => void;
}

export function FilePreview({ recipients, amounts, decimals, maxRecipients, fileName, onClear }: Props) {
  const recipientList = recipients.split(',').filter(Boolean);
  const amountList = amounts.split(',').filter(Boolean);
  
  const totalRecipients = recipientList.length;
  
  // Calculate total amount
  let totalAmount = 0n;
  try {
    amountList.map(a => BigInt(Math.floor(Number(a.trim()) * (10 ** Number(decimals)))));
    totalAmount = amountList.reduce((acc, curr) => {
        return acc + BigInt(Math.floor(parseFloat(curr) * (10 ** Number(decimals))));
    }, 0n);
  } catch (e) {
    // Fallback or ignore if parsing fails for preview
  }

  // Calculate batches
  const estimatedBatches = Math.ceil(totalRecipients / maxRecipients);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div>
                <h3 className="font-semibold text-white">{fileName}</h3>
                <p className="text-xs text-zinc-400">File successfully parsed</p>
            </div>
        </div>
        <button 
            onClick={onClear}
            className="text-sm text-red-400 hover:text-red-300 hover:underline transition-colors"
        >
            Remove File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
        <div className="p-4 bg-black/20 rounded-lg">
            <p className="text-sm text-zinc-500 mb-1">Total Recipients</p>
            <p className="text-2xl font-bold text-white">{totalRecipients}</p>
        </div>
        <div className="p-4 bg-black/20 rounded-lg">
            <p className="text-sm text-zinc-500 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-white truncate" title={formatUnits(totalAmount, Number(decimals))}>
                {formatUnits(totalAmount, Number(decimals))}
                <span className="text-sm font-normal text-zinc-500 ml-1">ETH</span>
            </p>
        </div>
        <div className={cn(
            "p-4 rounded-lg border",
            estimatedBatches > 1 ? "bg-amber-900/10 border-amber-900/30" : "bg-black/20 border-transparent"
        )}>
            <p className="text-sm text-zinc-500 mb-1">Required Batches</p>
            <div className="flex items-end gap-2">
                <p className={cn("text-2xl font-bold", estimatedBatches > 1 ? "text-amber-400" : "text-white")}>
                    {estimatedBatches}
                </p>
                <p className="text-xs text-zinc-500 mb-1">
                    (Limit: {maxRecipients}/batch)
                </p>
            </div>
        </div>
      </div>
      
      {estimatedBatches > 1 && (
        <div className="flex items-start gap-3 p-3 bg-amber-900/10 border border-amber-900/30 rounded-lg text-amber-200/80 text-sm">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
                This transfer exceeds the contract limit of {maxRecipients} recipients per transaction. 
                It will be automatically split into <strong>{estimatedBatches} separate transactions</strong>. 
                You will need to confirm each one.
            </p>
        </div>
      )}
    </div>
  );
}
