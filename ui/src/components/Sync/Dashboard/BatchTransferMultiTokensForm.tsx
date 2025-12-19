import { useState } from 'react';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';
import { type Address, parseUnits } from 'viem';

interface Props {
  contractAddress: Address;
}

export function BatchTransferMultiTokensForm({ contractAddress }: Props) {
  const { write, isPending, isConfirming } = useBatchTransfer(contractAddress);
  const [tokenAddresses, setTokenAddresses] = useState('');
  const [recipients, setRecipients] = useState('');
  const [amounts, setAmounts] = useState('');
  // For simplicity in this demo, we might assume 18 decimals or ask user to provide raw units, 
  // or simple input assuming all tokens are 18 decimals. 
  // To be robust, we'll ask for raw amounts or assume 18 for now to keep UI premium but simple.
  // A better approach for "premium" would be to fetch decimals for each token, but that requires more complex state.
  // We will add a note about 18 decimals default.
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tokensList = tokenAddresses.split(',').map(t => t.trim());
      const recipientList = recipients.split(',').map(r => r.trim());
      const amountList = amounts.split(',').map(a => parseUnits(a.trim(), 18)); 

      write('batchTransferMultiTokens', [tokensList, recipientList, amountList]);
    } catch (err) {
      console.error('Error preparing transaction:', err);
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-200 text-xs">
         Note: This form allows transferring different tokens to different recipients. 
         Index 0 of Tokens goes to Index 0 of Recipients with Index 0 of Amounts.
         Assumes 18 decimals for all tokens.
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Token Addresses (comma separated)</label>
        <textarea
          value={tokenAddresses}
          onChange={(e) => setTokenAddresses(e.target.value)}
          placeholder="0xTokenA..., 0xTokenB..."
          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors h-24 font-mono text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Recipients (comma separated)</label>
        <textarea
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="0xUserA..., 0xUserB..."
          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors h-24 font-mono text-sm"
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
        {isLoading ? 'Processing...' : 'Batch Transfer Multi Tokens'}
      </button>
    </form>
  );
}
