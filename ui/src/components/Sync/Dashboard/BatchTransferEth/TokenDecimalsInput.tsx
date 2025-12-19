interface TokenDecimalsInputProps {
  decimals: string;
  setDecimals: (value: string) => void;
  disabled?: boolean;
}

export function TokenDecimalsInput({ decimals, setDecimals, disabled }: TokenDecimalsInputProps) {
  return (
    <div className="space-y-4">
      <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold">Token Decimals</label>
      <div className="relative group">
        <input
          type="number"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
          placeholder="18"
          disabled={disabled}
          className={`w-full bg-transparent border-b py-2 text-white placeholder-zinc-700 focus:outline-none transition-colors font-mono text-lg ${
            disabled 
              ? 'border-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'border-zinc-700 focus:border-white'
          }`}
          required
        />
        <span className="absolute right-0 top-3 text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">default: 18</span>
      </div>
    </div>
  );
}
