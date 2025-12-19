import { useState } from 'react';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';
import type { Address } from 'viem';

interface Props {
  contractAddress: Address;
  paused: boolean;
  owner: string;
  maxRecipients: bigint;
  refetch: () => void;
}

export function AdminControls({ contractAddress, paused, owner, maxRecipients }: Props) {
  const { write, isPending, isConfirming } = useBatchTransfer(contractAddress);
  const [newOwner, setNewOwner] = useState('');
  const [newMax, setNewMax] = useState('');
  
  // Emergency Withdraw State
  const [withdrawToken, setWithdrawToken] = useState('');
  const [withdrawTo, setWithdrawTo] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isEthWithdraw, setIsEthWithdraw] = useState(true);

  const handlePauseToggle = () => {
    write(paused ? 'unpause' : 'pause', []);
  };

  const handleTransferOwnership = () => {
    if(!newOwner) return;
    write('transferOwnership', [newOwner]);
  };

  const handleSetMax = () => {
    if(!newMax) return;
    write('setMaxRecipients', [BigInt(newMax)]);
  };

  const handleEmergencyWithdraw = () => {
    if (isEthWithdraw) {
         write('emergencyWithdrawEth', [withdrawTo, BigInt(withdrawAmount)]);
    } else {
         write('emergencyWithdrawToken', [withdrawToken, withdrawTo, BigInt(withdrawAmount)]);
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <div className="space-y-8">
       {/* Status Section */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
             <div className="text-xs text-zinc-500 uppercase">Contract Status</div>
             <div className={`text-lg font-bold ${paused ? 'text-red-400' : 'text-green-400'}`}>
                {paused ? 'PAUSED' : 'ACTIVE'}
             </div>
             <button 
                onClick={handlePauseToggle} disabled={isLoading}
                className="mt-2 text-xs px-2 py-1 bg-white hover:bg-zinc-200 text-black rounded transition-colors"
             >
                {paused ? 'Resume Contract' : 'Pause Contract'}
             </button>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 col-span-2">
             <div className="text-xs text-zinc-500 uppercase">Owner</div>
             <div className="text-sm font-mono truncate text-zinc-300" title={owner}>{owner}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
             <div className="text-xs text-zinc-500 uppercase">Max Recipients</div>
             <div className="text-lg font-bold text-zinc-300">{maxRecipients?.toString()}</div>
          </div>
       </div>

       {/* Ownership & Config */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <h4 className="text-sm font-medium text-zinc-400">Transfer Ownership</h4>
             <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newOwner} 
                    onChange={e => setNewOwner(e.target.value)} 
                    placeholder="New Owner Address"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
                <button onClick={handleTransferOwnership} disabled={isLoading} className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded text-sm transition-colors">Set</button>
             </div>
          </div>
          <div className="space-y-2">
             <h4 className="text-sm font-medium text-zinc-400">Update Max Recipients</h4>
             <div className="flex gap-2">
                <input 
                    type="number" 
                    value={newMax} 
                    onChange={e => setNewMax(e.target.value)} 
                    placeholder="e.g. 200"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
                <button onClick={handleSetMax} disabled={isLoading} className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded text-sm transition-colors">Set</button>
             </div>
          </div>
       </div>

       {/* Emergency Withdraw */}
       <div className="border-t border-white/10 pt-6">
          <h4 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            Emergency Withdraw
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" checked={isEthWithdraw} onChange={() => setIsEthWithdraw(true)} name="withdrawType" />
                <span className="text-sm text-zinc-300">ETH</span>
             </label>
             <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" checked={!isEthWithdraw} onChange={() => setIsEthWithdraw(false)} name="withdrawType" />
                <span className="text-sm text-zinc-300">ERC20 Token</span>
             </label>
          </div>
          <div className="space-y-3">
             {!isEthWithdraw && (
                <input 
                    type="text" 
                    value={withdrawToken} 
                    onChange={e => setWithdrawToken(e.target.value)}
                    placeholder="Token Address"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                />
             )}
             <input 
                type="text" 
                value={withdrawTo} 
                onChange={e => setWithdrawTo(e.target.value)}
                placeholder="Recipient Address"
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
             />
             <div className="flex gap-2">
                <input 
                    type="text" 
                    value={withdrawAmount} 
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="Amount (raw units)"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                />
                <button onClick={handleEmergencyWithdraw} disabled={isLoading} className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 px-6 py-2 rounded text-sm transition-colors">
                    Withdraw
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}
