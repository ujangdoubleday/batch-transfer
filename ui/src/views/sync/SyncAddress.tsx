import { useParams } from 'react-router-dom';
import { WalletConnectGuard } from '../../components/WalletConnectGuard';
import { DashboardLayout } from '../../components/Sync/Layout/DashboardLayout';
import { FunctionCard } from '../../components/Sync/Common/FunctionCard';
import { useBatchTransfer } from '../../hooks/useBatchTransfer';
import type { Address } from 'viem';

// Icons
const EthIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TokenIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MultiIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const CombinedIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const AdminIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function SyncAddress() {
  const { address } = useParams<{ address: string }>();
  // Cast safely, assuming validation happened in guard
  const contractAddress = address as Address;
  
  const { useContractRead } = useBatchTransfer(contractAddress);
  
  const { data: maxRecipients } = useContractRead('maxRecipients');
  const { data: paused } = useContractRead('paused');

  const header = (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h2 className="text-4xl text-white font-bold mb-2 tracking-tight">
            Batch Transfer
        </h2>
        <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                {contractAddress}
            </span>
            {/* Status Dot */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black border border-zinc-800">
                <div className={`w-2 h-2 rounded-full ${paused ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {paused ? 'Paused' : 'Active'}
                </span>
            </div>
        </div>
      </div>
      <div className="text-right hidden md:block">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Limit</div>
        <div className="text-2xl font-mono text-zinc-300">{maxRecipients ? maxRecipients.toString() : '...'} Recipients</div>
      </div>
    </div>
  );

  return (
    <WalletConnectGuard>
      <DashboardLayout header={header}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <FunctionCard 
                title="Transfer ETH" 
                description="Send ETH to multiple recipients in one transaction."
                icon={<EthIcon />}
                to={`/sync/${address}/transfer-eth`}
            />

            <FunctionCard 
                title="Transfer Token" 
                description="Send a single ERC20 token to multiple recipients."
                icon={<TokenIcon />}
                to={`/sync/${address}/transfer-token`}
            />

            <FunctionCard 
                title="Combined Transfer" 
                description="Send both ETH and Tokens simultaneously."
                icon={<CombinedIcon />}
                to={`/sync/${address}/combined-transfer`}
            />

            <FunctionCard 
                title="Multi-Token Transfer" 
                description="Send different tokens to different recipients."
                icon={<MultiIcon />}
                to={`/sync/${address}/multi-token-transfer`}
            />

            <FunctionCard 
                title="Admin Controls" 
                description="Manage contract settings and emergency functions."
                icon={<AdminIcon />}
                to={`/sync/${address}/admin`}
                className="border-red-900/20 hover:border-red-900/40"
            />
        </div>
      </DashboardLayout>
    </WalletConnectGuard>
  );
}
