import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface FunctionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  to: string; // required for navigation
  className?: string;
}

export function FunctionCard({ title, description, icon, to, className = '' }: FunctionCardProps) {
  return (
    <Link to={to} className={`block group relative overflow-hidden rounded-2xl 
      bg-zinc-900 border border-zinc-800
      transition-all duration-300
      hover:bg-zinc-800 hover:border-zinc-700
      ${className}
    `}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white group-hover:text-zinc-200 transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-zinc-500 mt-1 max-w-[90%] group-hover:text-zinc-400 transition-colors">
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div className="text-zinc-500 group-hover:text-white transition-colors duration-300">
              {icon}
            </div>
          )}
        </div>
        
        {/* Arrow indicator */}
        <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
        </div>
      </div>
    </Link>
  );
}
