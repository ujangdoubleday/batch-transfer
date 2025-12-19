import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { WalletConnectGuard } from '../../WalletConnectGuard';

interface FunctionPageProps {
  title: string;
  children: ReactNode;
}

export function FunctionPage({ title, children }: FunctionPageProps) {
  const { address } = useParams<{ address: string }>();

  const header = (
    <div>
        <Link to={`/sync/${address}`} className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors mb-4 group">
            <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
        </Link>
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                {address}
            </span>
        </div>
    </div>
  );

  return (
    <WalletConnectGuard>
         <DashboardLayout header={header}>
            <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
                {children}
            </div>
        </DashboardLayout>
    </WalletConnectGuard>
  );
}
