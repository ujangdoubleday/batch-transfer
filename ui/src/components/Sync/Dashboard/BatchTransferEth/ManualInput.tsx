interface ManualInputProps {
  recipients: string;
  setRecipients: (value: string) => void;
  amounts: string;
  setAmounts: (value: string) => void;
}

export function ManualInput({ recipients, setRecipients, amounts, setAmounts }: ManualInputProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold">Recipients</label>
        <textarea
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="0x123..., 0x456..."
          className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all h-64 font-mono text-sm resize-none"
          required
        />
        <p className="text-xs text-zinc-600">Comma separated addresses</p>
      </div>
      <div className="space-y-4">
        <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold">Amounts</label>
        <textarea
          value={amounts}
          onChange={(e) => setAmounts(e.target.value)}
          placeholder="1.5, 2.0..."
          className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all h-64 font-mono text-sm resize-none"
          required
        />
        <p className="text-xs text-zinc-600">Comma separated ETH values</p>
      </div>
    </div>
  );
}
