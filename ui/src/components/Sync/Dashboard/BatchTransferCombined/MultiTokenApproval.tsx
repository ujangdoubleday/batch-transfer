
import { useState, useEffect } from 'react';
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { type Address, erc20Abi } from 'viem';

export interface TokenApprovalInfo {
  address: Address;
  amount: bigint;
  symbol?: string;
}

interface MultiTokenApprovalProps {
  tokens: TokenApprovalInfo[];
  spenderAddress: Address;
  onAllApproved: () => void;
}

export function MultiTokenApproval({ tokens, spenderAddress, onAllApproved }: MultiTokenApprovalProps) {
  const { address: userAddress } = useAccount();
  const [approvingToken, setApprovingToken] = useState<Address | null>(null);
  const [currentHash, setCurrentHash] = useState<string | undefined>(undefined);

  // Read allowances for all tokens
  const { data: allowances, refetch } = useReadContracts({
    contracts: tokens.map(t => ({
      address: t.address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [userAddress as Address, spenderAddress],
    })),
    query: {
        enabled: !!userAddress && tokens.length > 0,
        refetchInterval: 2000
    }
  });

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: currentHash as `0x${string}` | undefined,
  });

  useEffect(() => {
    if (isConfirmed) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setApprovingToken(prev => prev ? null : prev);

        setCurrentHash(prev => prev ? undefined : prev);
        refetch();
    }
  }, [isConfirmed, refetch]);

  // Determine unapproved tokens
  const unapprovedTokens = tokens.filter((token, index) => {
      const allowance = allowances?.[index]?.result as bigint | undefined;
      return !allowance || allowance < token.amount;
  });

  useEffect(() => {
     if (unapprovedTokens.length === 0 && allowances && tokens.length > 0) {
         onAllApproved();
     }
  }, [unapprovedTokens.length, onAllApproved, allowances, tokens.length]);

  const handleApprove = async (token: TokenApprovalInfo) => {
      try {
          setApprovingToken(token.address);
          const hash = await writeContractAsync({
              address: token.address,
              abi: erc20Abi,
              functionName: 'approve',
              args: [spenderAddress, token.amount],
          });
          setCurrentHash(hash);
      } catch (err) {
          console.error("Approval failed", err);
          setApprovingToken(null);
      }
  };

  if (unapprovedTokens.length === 0) {
      if (!allowances) return <div className="text-zinc-500 text-sm">Checking allowances...</div>;
      return <div className="text-white text-sm font-medium">All tokens approved!</div>;
  }

  return (
    <div className="space-y-4 border-t border-white/10 pt-6">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Approvals Required ({unapprovedTokens.length})
        </h4>
        <div className="space-y-2">
            {unapprovedTokens.map((token, i) => (
                <div key={`${token.address}-${i}`} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-zinc-300 font-mono">{token.address.slice(0, 8)}...{token.address.slice(-6)}</div>
                        <div className="text-xs text-zinc-500">Need approval</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleApprove(token)}
                        disabled={!!approvingToken}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    >
                        {approvingToken === token.address ? (
                            isConfirming ? 'Confirming...' : 'Approving...'
                        ) : 'Approve'}
                    </button>
                </div>
            ))}
        </div>
        {approvingToken && isConfirming && (
             <div className="text-xs text-zinc-400 text-center animate-pulse">
                Transaction sent. Waiting for confirmation...
             </div>
        )}
    </div>
  );
}
