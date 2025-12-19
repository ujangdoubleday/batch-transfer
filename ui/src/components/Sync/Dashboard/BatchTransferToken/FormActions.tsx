import { TokenDecimalsInput } from '../BatchTransferEth/TokenDecimalsInput';

interface FormActionsProps {
  isWaitingReceipt: boolean;
  isDisabled: boolean;
  recipientsCount: number;
  isApproveRequired: boolean;
  isApproved: boolean;
  onApprove: () => void;
  isApproving: boolean;
  
  // New props
  decimals: number;
  setDecimals: (d: number) => void;
  decimalsDisabled?: boolean;
  useSimpleMode: boolean;
  setUseSimpleMode: (v: boolean) => void;
}

export function FormActions({ 
  isWaitingReceipt, 
  isDisabled, 
  recipientsCount, 
  isApproveRequired,
  isApproved,
  onApprove,
  isApproving,
  decimals,
  setDecimals,
  decimalsDisabled,
  useSimpleMode,
  setUseSimpleMode
}: FormActionsProps) {
  
  return (
    <div className="pt-8 border-t border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
             <TokenDecimalsInput 
                decimals={decimals.toString()} 
                setDecimals={(v) => setDecimals(Number(v))} 
                disabled={decimalsDisabled}
             />
             
             <label className="flex items-center space-x-3 text-sm text-white cursor-pointer h-[52px]">
                <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        checked={useSimpleMode} 
                        onChange={(e) => setUseSimpleMode(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-black/20 checked:border-white checked:bg-white transition-all"
                    />
                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-black transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <span>Use Simple Mode</span>
            </label>
        </div>

        {isApproveRequired && !isApproved && (
             <div className="w-full">
                <button
                    type="button"
                    onClick={onApprove}
                    disabled={isApproving}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-bold text-lg py-5 px-8 rounded-xl transition-all transform active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                    {isApproving ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                            Approving...
                        </span>
                    ) : (
                        `Approve & Execute Batch`
                    )}
                </button>
                <p className="text-center text-zinc-500 text-sm mt-3">You must approve the contract to spend your tokens first.</p>
            </div>
        )}

        {(!isApproveRequired || isApproved) && (
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
                    `Execute ${useSimpleMode ? 'Simple ' : ''}Batch Transfer ${recipientsCount > 0 ? `(${recipientsCount})` : ''}`
                )}
            </button>
        )}
    </div>
  );
}
