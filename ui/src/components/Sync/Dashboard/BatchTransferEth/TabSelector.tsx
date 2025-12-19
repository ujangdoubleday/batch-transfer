import { cn } from '../../../../lib/utils';

type TabType = 'manual' | 'upload';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  const tabs: TabType[] = ['manual', 'upload'];

  return (
    <div className="border-b border-white/10 flex">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "flex-1 py-6 text-sm font-medium tracking-widest uppercase transition-all duration-300",
            activeTab === tab
              ? "bg-white text-black"
              : "bg-black text-zinc-500 hover:text-white hover:bg-white/5"
          )}
        >
          {tab === 'manual' ? 'Manual Input' : 'Upload File'}
        </button>
      ))}
    </div>
  );
}
