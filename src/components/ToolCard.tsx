import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ToolDefinition } from '../types';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (toolId: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(tool.id)}
      className="card-dev27 p-5 rounded-[4px] border border-slate-200/90 bg-white shadow-[0_12px_28px_-6px_rgba(17,31,53,0.15),0_6px_12px_-4px_rgba(17,31,53,0.08)] hover:shadow-[0_22px_45px_-8px_rgba(17,31,53,0.24),0_12px_20px_-6px_rgba(17,31,53,0.14)] hover:border-[#8A244B] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#F2EFE7] text-[#8A244B] font-extrabold text-xs uppercase tracking-wider border border-[#E2E8F0]">
            {tool.category}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-[#111F35] group-hover:text-[#8A244B] transition-colors mb-2.5 leading-snug">
          {tool.name}
        </h3>

        <p className="text-base text-slate-600 line-clamp-2 leading-relaxed">
          {tool.shortDesc}
        </p>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(tool.id);
          }}
          className="w-full py-3 px-5 rounded-[4px] bg-[#8A244B] hover:bg-[#721C3D] text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(138,36,75,0.25)] group-hover:shadow-[0_6px_18px_rgba(138,36,75,0.38)] cursor-pointer"
        >
          <span>Open Tool</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
