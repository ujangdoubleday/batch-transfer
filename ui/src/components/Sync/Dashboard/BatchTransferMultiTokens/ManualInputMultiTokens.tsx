
import { type Dispatch, type SetStateAction } from 'react';

interface Props {
  tokens: string;
  setTokens: Dispatch<SetStateAction<string>>;
  recipients: string;
  setRecipients: Dispatch<SetStateAction<string>>;
  amounts: string;
  setAmounts: Dispatch<SetStateAction<string>>;
  decimals: string;
  setDecimals: Dispatch<SetStateAction<string>>;
}

export function ManualInputMultiTokens({
  tokens, setTokens,
  recipients, setRecipients,
  amounts, setAmounts,
  decimals, setDecimals
}: Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
           <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Token Addresses</label>
           <textarea 
             value={tokens} 
             onChange={e => setTokens(e.target.value)} 
             className="input-area h-24" 
             placeholder="0xToken1, 0xToken2..." 
           />
           <p className="text-xs text-zinc-600 mt-2">Comma separated addresses</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="col-span-1">
               <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Recipients</label>
               <textarea 
                 value={recipients} 
                 onChange={e => setRecipients(e.target.value)} 
                 className="input-area h-32" 
                 placeholder="0xUser1, 0xUser2..." 
               />
           </div>
           <div className="col-span-1">
               <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Amounts</label>
               <textarea 
                 value={amounts} 
                 onChange={e => setAmounts(e.target.value)} 
                 className="input-area h-32" 
                 placeholder="10, 50..." 
               />
           </div>
           <div className="col-span-1">
               <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Decimals (Default)</label>
               <input 
                 type="number"
                 value={decimals} 
                 onChange={e => setDecimals(e.target.value)} 
                 className="input-area h-12 w-full mb-2" 
                 placeholder="18" 
               />
               <div className="text-[10px] text-zinc-500 leading-tight">
                   Applied to all amounts. To mix decimals, calculate raw amounts yourself and use decimals=0, or use File Upload.
               </div>
           </div>
        </div>
        
      <style>{`
        .input-area {
            width: 100%;
            background: rgba(24, 24, 27, 0.5); /* zinc-900/50 */
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 0.75rem; /* rounded-xl */
            padding: 1rem;
            color: white;
            font-family: monospace;
            font-size: 0.875rem; /* text-sm */
            resize: none;
            transition: all 0.2s;
        }
        .input-area:focus {
            outline: none;
            border-color: white;
            background: rgba(24, 24, 27, 0.8);
            box-shadow: 0 0 0 1px white;
        }
      `}</style>
    </div>
  );
}
