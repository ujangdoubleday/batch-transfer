import { TokenDecimalsInput } from './TokenDecimalsInput';

interface FormActionsProps {
  isWaitingReceipt: boolean;
  isDisabled: boolean;
  recipientsCount: number;
  decimals: string;
  setDecimals: (value: string) => void;
}

export function FormActions({ 
  isWaitingReceipt, 
  isDisabled, 
  recipientsCount, 
  decimals, 
  setDecimals 
}: FormActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5 items-end">
        <TokenDecimalsInput decimals={decimals} setDecimals={setDecimals} />

        <div className="md:col-span-2">
        <button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-white hover:bg-zinc-200 text-black font-bold text-lg py-5 px-8 rounded-xl transition-all transform active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
            {isWaitingReceipt ? (
                <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                    Waiting for Receipt...
                </span>
            ) : (
                `Execute Batch Transfer ${recipientsCount > 0 ? `(${recipientsCount})` : ''}`
            )}
        </button>
        </div>
    </div>
  );
}
