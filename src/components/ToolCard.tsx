import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ToolDefinition } from '../types';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (toolId: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(tool.id)}
      className="card-dev27 p-5 hover:border-[#8A244B] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group bg-white"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider">
            {tool.category}
          </span>
          <span className="text-slate-400 group-hover:text-[#8A244B] transition-colors">
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#111F35] group-hover:text-[#8A244B] transition-colors mb-2">
          {tool.name}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {tool.shortDesc}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-mono">
        <span className="text-[#8A244B] font-semibold">Open Tool</span>
        <span>·</span>
        <span>Client-side</span>
      </div>
    </div>
  );
};
