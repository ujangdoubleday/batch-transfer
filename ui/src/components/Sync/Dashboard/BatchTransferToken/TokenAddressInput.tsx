import { useState, useEffect } from 'react';
import { type Address, isAddress } from 'viem';
import { useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSymbolChange?: (symbol: string) => void;
  onDecimalsChange?: (decimals: number) => void;
}

export function TokenAddressInput({ value, onChange, onSymbolChange, onDecimalsChange }: Props) {
  const [isValidAddress, setIsValidAddress] = useState(false);
  
  useEffect(() => {
    setIsValidAddress(isAddress(value));
  }, [value]);

  const { data: symbol } = useReadContract({
    address: isValidAddress ? (value as Address) : undefined,
    abi: erc20Abi,
    functionName: 'symbol',
    query: {
        enabled: isValidAddress
    }
  });

  const { data: decimals } = useReadContract({
    address: isValidAddress ? (value as Address) : undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
        enabled: isValidAddress
    }
  });

  useEffect(() => {
    if (symbol && onSymbolChange) onSymbolChange(symbol as string);
    if (decimals && onDecimalsChange) onDecimalsChange(Number(decimals));
  }, [symbol, decimals, onSymbolChange, onDecimalsChange]);

  return (
    <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Token Address</label>
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0x..."
                className={`w-full bg-black/20 border rounded-lg p-3 text-white focus:outline-none transition-colors font-mono text-sm ${
                    value && !isValidAddress ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white'
                }`}
                required
            />
        </div>
        {isValidAddress && (symbol || decimals) && (
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 animate-in fade-in slide-in-from-top-1">
                {symbol && (
                    <div className="flex items-center gap-1">
                        <span className="text-zinc-500">Symbol:</span>
                        <span className="text-white font-mono">{String(symbol)}</span>
                    </div>
                )}
                {decimals && (
                    <div className="flex items-center gap-1">
                        <span className="text-zinc-500">Decimals:</span>
                        <span className="text-white font-mono">{Number(decimals)}</span>
                    </div>
                )}
            </div>
        )}
        {value && !isValidAddress && (
            <p className="text-xs text-red-500 mt-1">Invalid address format</p>
        )}
    </div>
  );
}
