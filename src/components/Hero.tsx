import React from 'react';
import { CategoryInfo } from '../types';
import { ArrowLeft } from 'lucide-react';

interface HeroProps {
  category?: CategoryInfo | null;
  toolCount?: number;
  onGoHome?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ category, toolCount, onGoHome }) => {
  if (category) {
    return (
      <section className="py-7 sm:py-9 text-center border-b border-slate-200 bg-white">
        <div className="app-container">
          {onGoHome && (
            <div className="mb-3 flex items-center justify-center">
              <button
                onClick={onGoHome}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#8A244B] transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>All Tools</span>
                <span className="text-slate-300">/</span>
                <span className="text-[#8A244B] font-bold">{category.name}</span>
              </button>
            </div>
          )}
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A244B] bg-[#F2EFE7] px-2.5 py-0.5 rounded-[4px]">
              {category.name}
            </span>
            {toolCount !== undefined && (
              <span className="text-xs font-mono font-bold text-slate-600">
                ({toolCount} tools)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111F35] tracking-tight">
            {category.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {category.description}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-7 sm:py-9 text-center border-b border-slate-200 bg-white">
      <div className="app-container">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111F35] tracking-tight">
          Free Online Developer & Productivity Tools Suite
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Reliable, browser-based online utilities covering developer tools, creator utilities, ecommerce calculators, productivity suites, construction estimators, and pet name generators. All processing runs privately in your browser without requiring a server.
        </p>
      </div>
    </section>
  );
};
