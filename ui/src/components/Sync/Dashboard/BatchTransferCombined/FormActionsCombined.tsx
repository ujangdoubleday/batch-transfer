
interface FormActionsProps {
  isWaitingReceipt: boolean;
  isDisabled: boolean;
  tokenCount: number;
  ethCount: number;
}

export function FormActionsCombined({ 
  isWaitingReceipt, 
  isDisabled, 
  tokenCount, 
  ethCount 
}: FormActionsProps) {
  const totalCount = tokenCount + ethCount;
  
  return (
    <div className="pt-8 border-t border-white/5">
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
                <div className="flex flex-col items-center">
                    <span>Execute Combined Transfer</span>
                    {totalCount > 0 && (
                        <span className="text-xs font-normal opacity-60 mt-1">
                            {tokenCount} Token Ops + {ethCount} ETH Ops
                        </span>
                    )}
                </div>
            )}
        </button>
    </div>
  );
}
