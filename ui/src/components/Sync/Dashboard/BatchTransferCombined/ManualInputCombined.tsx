
import { type Dispatch, type SetStateAction } from 'react';

interface Props {
  // Token inputs
  tokenAddresses: string;
  setTokenAddresses: Dispatch<SetStateAction<string>>;
  tokenRecipients: string;
  setTokenRecipients: Dispatch<SetStateAction<string>>;
  tokenAmounts: string;
  setTokenAmounts: Dispatch<SetStateAction<string>>;
  tokenDecimals: string;
  setTokenDecimals: Dispatch<SetStateAction<string>>;
  
  // ETH inputs
  ethRecipients: string;
  setEthRecipients: Dispatch<SetStateAction<string>>;
  ethAmounts: string;
  setEthAmounts: Dispatch<SetStateAction<string>>;
}

export function ManualInputCombined({
  tokenAddresses, setTokenAddresses,
  tokenRecipients, setTokenRecipients,
  tokenAmounts, setTokenAmounts,
  tokenDecimals, setTokenDecimals,
  ethRecipients, setEthRecipients,
  ethAmounts, setEthAmounts
}: Props) {
  return (
    <div className="space-y-8">
      {/* Token Transfers Section */}
      <div className="space-y-4 border rounded-xl border-zinc-800 bg-zinc-900/30 p-6">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Token Transfers
        </h4>
        
        <div>
           <label className="block text-xs font-medium text-zinc-400 mb-1">Token Addresses (comma separated)</label>
           <textarea 
             value={tokenAddresses} 
             onChange={e => setTokenAddresses(e.target.value)} 
             className="input-area h-20" 
             placeholder="0xTokenA, 0xTokenB..." 
           />
        </div>
        <div className="grid grid-cols-3 gap-4">
           <div className="col-span-1">
               <label className="block text-xs font-medium text-zinc-400 mb-1">Recipients</label>
               <textarea 
                 value={tokenRecipients} 
                 onChange={e => setTokenRecipients(e.target.value)} 
                 className="input-area h-32" 
                 placeholder="0xUser..." 
               />
           </div>
           <div className="col-span-1">
               <label className="block text-xs font-medium text-zinc-400 mb-1">Amounts</label>
               <textarea 
                 value={tokenAmounts} 
                 onChange={e => setTokenAmounts(e.target.value)} 
                 className="input-area h-32" 
                 placeholder="10, 50..." 
               />
           </div>
           <div className="col-span-1">
               <label className="block text-xs font-medium text-zinc-400 mb-1">Decimals</label>
               <input 
                 type="number"
                 value={tokenDecimals} 
                 onChange={e => setTokenDecimals(e.target.value)} 
                 className="input-area h-10 w-full mb-2" 
                 placeholder="18" 
               />
               <div className="text-[10px] text-zinc-500 leading-tight">
                   Applied to all manual amounts if they are not raw.
               </div>
           </div>
        </div>
      </div>

      {/* ETH Transfers Section */}
      <div className="space-y-4 border rounded-xl border-zinc-800 bg-zinc-900/30 p-6">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Transfer ETH
        </h4>

        <div className="grid grid-cols-2 gap-4">
           <div>
               <label className="block text-xs font-medium text-zinc-400 mb-1">Recipients</label>
               <textarea 
                 value={ethRecipients} 
                 onChange={e => setEthRecipients(e.target.value)} 
                 className="input-area h-32" 
                 placeholder="0xUser1, 0xUser2..." 
               />
           </div>
           <div>
               <label className="block text-xs font-medium text-zinc-400 mb-1">Amounts (ETH)</label>
               <textarea 
                 value={ethAmounts} 
                 onChange={e => setEthAmounts(e.target.value)} 
                 className="input-area h-32" 
                 placeholder="0.1, 0.5..." 
               />
           </div>
        </div>
        <div className="text-xs text-zinc-500 italic p-2">
            * Note: ETH amounts will be automatically parsed as Ether (10^18). Token amounts must be raw units (check decimals).
        </div>
      </div>

      <style>{`
        .input-area {
            width: 100%;
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 0.5rem;
            padding: 0.75rem;
            color: white;
            font-family: monospace;
            font-size: 0.75rem;
            resize: none;
            transition: all 0.2s;
        }
        .input-area:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.3);
            background: rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
