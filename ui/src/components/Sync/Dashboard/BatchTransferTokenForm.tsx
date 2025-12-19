import { useState } from 'react';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';
import { type Address, parseUnits } from 'viem';

interface Props {
  contractAddress: Address;
}

export function BatchTransferTokenForm({ contractAddress }: Props) {
  const { write, isPending, isConfirming } = useBatchTransfer(contractAddress);
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipients, setRecipients] = useState('');
  const [amounts, setAmounts] = useState('');
  const [decimals, setDecimals] = useState(18); // Default to 18, could fetch from token contract
  const [useSimpleMode, setUseSimpleMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const recipientList = recipients.split(',').map(r => r.trim());
      const amountList = amounts.split(',').map(a => parseUnits(a.trim(), decimals));
      
      const functionName = useSimpleMode ? 'simpleBatchTransferToken' : 'batchTransferToken';

      write(functionName, [tokenAddress.trim(), recipientList, amountList]);
    } catch (err) {
      console.error('Error preparing transaction:', err);
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-end">
         <label className="flex items-center space-x-2 text-sm text-zinc-400 cursor-pointer">
            <input 
                type="checkbox" 
                checked={useSimpleMode} 
                onChange={(e) => setUseSimpleMode(e.target.checked)}
                className="rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <span>Use Simple Mode (Direct transferFrom)</span>
         </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Token Address</label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Decimals</label>
            <input
              type="number"
              value={decimals}
              onChange={(e) => setDecimals(parseInt(e.target.value))}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm"
              min="0"
              max="18"
              required
            />
          </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Recipients (comma separated)</label>
        <textarea
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="0x123..., 0x456..."
          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-24 font-mono text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Amounts (comma separated)</label>
        <textarea
          value={amounts}
          onChange={(e) => setAmounts(e.target.value)}
          placeholder="10, 20..."
          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-24 font-mono text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : useSimpleMode ? 'Simple Batch Transfer' : 'Batch Transfer Token'}
      </button>
    </form>
  );
}
