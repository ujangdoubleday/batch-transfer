import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export function DashboardLayout({ children, header }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:px-8 max-w-7xl mx-auto">
        {header && <div className="mb-6 animate-fade-in-down">{header}</div>}
        <div className="animate-fade-in-up delay-100">
          {children}
        </div>
      </div>
    </div>
  );
}
