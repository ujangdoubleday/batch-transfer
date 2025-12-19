import type { ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useParams } from 'react-router-dom';
import { useBatchTransfer } from '../hooks/useBatchTransfer';
import type { Address } from 'viem';

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  const { address: userAddress } = useAccount();
  const { address } = useParams<{ address: string }>();
  const contractAddress = address as Address; 
  
  const { useContractRead } = useBatchTransfer(contractAddress);
  const { data: owner, isLoading } = useContractRead('owner');

  if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[200px] text-zinc-500">
            <span className="animate-pulse">Verifying Access...</span>
        </div>
      );
  }

  // Check if user is connected and is the owner
  const isOwner = userAddress && owner && userAddress.toLowerCase() === (owner as string).toLowerCase();

  if (!isOwner) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
