import React from 'react';
import { Monitor } from 'lucide-react';
import { CATEGORIES } from '../data/toolsList';
import { ToolCategory } from '../types';

interface HeaderProps {
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentCategory, onSelectCategory, onGoHome }) => {
  return (
    <header className="w-full">
      {/* Center-aligned Logo */}
      <div className="py-4 text-center bg-white border-b border-slate-200">
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-[4px] bg-[#8A244B] text-white flex items-center justify-center shadow-sm">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-[#111F35] group-hover:text-[#8A244B] transition-colors">
            Dev<span className="text-[#8A244B]">27</span>
          </span>
        </button>
      </div>

      {/* Simple Navigation Bar Below Logo */}
      <nav className="bg-[#111F35] text-white shadow-sm">
        <div className="app-container">
          <div className="flex items-center justify-center overflow-x-auto py-3 gap-2 sm:gap-3 text-sm sm:text-base font-semibold scrollbar-none">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-4 py-2 rounded-[4px] transition-colors whitespace-nowrap cursor-pointer text-sm sm:text-base font-bold ${
                currentCategory === 'all'
                  ? 'bg-[#8A244B] text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              All Tools (69)
            </button>
            {CATEGORIES.filter((cat) => cat.id !== 'construction').map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-[4px] transition-colors whitespace-nowrap cursor-pointer text-sm sm:text-base font-bold ${
                  currentCategory === cat.id
                    ? 'bg-[#8A244B] text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};
