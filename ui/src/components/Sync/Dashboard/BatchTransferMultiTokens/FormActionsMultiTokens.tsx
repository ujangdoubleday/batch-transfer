
interface Props {
  isWaitingReceipt: boolean;
  isDisabled: boolean;
  count: number;
}

export function FormActionsMultiTokens({ 
    isWaitingReceipt, 
    isDisabled, 
    count
}: Props) {
  return (
    <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
      <div className="flex items-center justify-between text-xs text-zinc-500">
         <span>Total Transfers:</span>
         <span className="font-mono text-white">{count}</span>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-wide text-sm rounded-xl transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
      >
        {isWaitingReceipt ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </>
        ) : (
            <>
                <span>Execute Batch Transfer</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </>
        )}
      </button>
      
      {isDisabled && !isWaitingReceipt && count === 0 && (
          <p className="text-center text-xs text-zinc-600">
              Please enter valid transfer details to proceed.
          </p>
      )}
    </div>
  );
}
