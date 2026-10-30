import React from 'react';
import { Monitor } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200 bg-white text-xs text-slate-500 text-center">
      <div className="app-container flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[4px] bg-[#8A244B] text-white flex items-center justify-center">
            <Monitor className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-800">Dev27</span>
          <span>— Precision Online Tools Suite</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          100% Client-side · Zero Server Telemetry · High Performance
        </div>
      </div>
    </footer>
  );
};
