import { useState } from 'react';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';
import { type Address, parseEther, parseUnits } from 'viem';

interface Props {
  contractAddress: Address;
}

export function BatchTransferCombinedForm({ contractAddress }: Props) {
  const { write, isPending, isConfirming } = useBatchTransfer(contractAddress);
  
  const [tokenAddresses, setTokenAddresses] = useState('');
  const [tokenRecipients, setTokenRecipients] = useState('');
  const [tokenAmounts, setTokenAmounts] = useState('');
  
  const [ethRecipients, setEthRecipients] = useState('');
  const [ethAmounts, setEthAmounts] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tokensList = tokenAddresses ? tokenAddresses.split(',').map(t => t.trim()) : [];
      const tokenRecpList = tokenRecipients ? tokenRecipients.split(',').map(r => r.trim()) : [];
      const tokenAmtList = tokenAmounts ? tokenAmounts.split(',').map(a => parseUnits(a.trim(), 18)) : [];
      
      const ethRecpList = ethRecipients ? ethRecipients.split(',').map(r => r.trim()) : [];
      const ethAmtList = ethAmounts ? ethAmounts.split(',').map(a => parseEther(a.trim())) : [];
      
      const totalEth = ethAmtList.reduce((acc, curr) => acc + curr, 0n);

      write(
        'batchTransferCombinedMultiTokens', 
        [tokensList, tokenRecpList, tokenAmtList, ethRecpList, ethAmtList], 
        totalEth
      );
    } catch (err) {
      console.error('Error preparing transaction:', err);
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-blue-200 text-xs">
         <strong>Combined Transfer:</strong> execute both ETH and Token transfers in a single transaction.
      </div>
      
      <div className="space-y-4 border-l-2 border-purple-500/30 pl-4">
        <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Token Transfer Part</h4>
         <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Tokens</label>
            <input type="text" value={tokenAddresses} onChange={e => setTokenAddresses(e.target.value)} className="input-premium" placeholder="0xToken..." />
         </div>
         <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Recipients</label>
                <input type="text" value={tokenRecipients} onChange={e => setTokenRecipients(e.target.value)} className="input-premium" placeholder="0xUser..." />
            </div>
            <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Amounts (18 dec)</label>
                <input type="text" value={tokenAmounts} onChange={e => setTokenAmounts(e.target.value)} className="input-premium" placeholder="10, 20..." />
            </div>
         </div>
      </div>

      <div className="space-y-4 border-l-2 border-blue-500/30 pl-4">
        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">ETH Transfer Part</h4>
         <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Recipients</label>
                <input type="text" value={ethRecipients} onChange={e => setEthRecipients(e.target.value)} className="input-premium" placeholder="0xUser..." />
            </div>
            <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Amounts (ETH)</label>
                <input type="text" value={ethAmounts} onChange={e => setEthAmounts(e.target.value)} className="input-premium" placeholder="0.1, 0.5..." />
            </div>
         </div>
      </div>

      <style>{`
        .input-premium {
            width: 100%;
            background: rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 0.5rem;
            padding: 0.5rem;
            color: white;
            font-family: monospace;
            font-size: 0.875rem;
            transition: all 0.2s;
        }
        .input-premium:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(0,0,0,0.4);
        }
      `}</style>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Execute Combined Transfer'}
      </button>
    </form>
  );
}
