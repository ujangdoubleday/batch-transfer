import { useState } from 'react';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';
import { type Address, parseEther } from 'viem';

interface Props {
  contractAddress: Address;
}

export function BatchTransferEthForm({ contractAddress }: Props) {
  const { write, isPending, isConfirming } = useBatchTransfer(contractAddress);
  const [recipients, setRecipients] = useState('');
  const [amounts, setAmounts] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const recipientList = recipients.split(',').map(r => r.trim());
      const amountList = amounts.split(',').map(a => parseEther(a.trim()));
      
      const totalEth = amountList.reduce((acc, curr) => acc + curr, 0n);

      write('batchTransferEth', [recipientList, amountList], totalEth);
    } catch (err) {
      console.error('Error preparing transaction:', err);
      // Ideally show a toast notification here
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Recipients (comma separated)</label>
        <textarea
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="0x123..., 0x456..."
          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors h-24 font-mono text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Amounts in ETH (comma separated)</label>
        <textarea
          value={amounts}
          onChange={(e) => setAmounts(e.target.value)}
          placeholder="0.1, 0.2..."
          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors h-24 font-mono text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Transfer ETH'}
      </button>
    </form>
  );
}
