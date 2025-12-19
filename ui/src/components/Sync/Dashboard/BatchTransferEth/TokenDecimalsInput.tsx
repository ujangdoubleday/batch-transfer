interface TokenDecimalsInputProps {
  decimals: string;
  setDecimals: (value: string) => void;
}

export function TokenDecimalsInput({ decimals, setDecimals }: TokenDecimalsInputProps) {
  return (
    <div className="space-y-4">
      <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold">Token Decimals</label>
      <div className="relative group">
        <input
          type="number"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
          placeholder="18"
          className="w-full bg-transparent border-b border-zinc-700 py-2 text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-mono text-lg"
          required
        />
        <span className="absolute right-0 top-3 text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">default: 18</span>
      </div>
    </div>
  );
}
