import React from 'react';
import { Monitor } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-14 py-8 border-t border-slate-200 bg-white text-sm text-slate-600 text-center">
      <div className="app-container flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[4px] bg-[#8A244B] text-white flex items-center justify-center">
            <Monitor className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base text-slate-900">Dev27</span>
          <span className="text-sm text-slate-500">— Precision Online Tools Suite</span>
        </div>
        <div className="text-slate-500 text-xs sm:text-sm font-medium">
          High Performance · Zero Telemetry · Offline Capable
        </div>
      </div>
    </footer>
  );
};
