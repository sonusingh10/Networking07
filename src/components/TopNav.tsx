import React from 'react';
import { Download } from 'lucide-react';

interface TopNavProps {
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenExport: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onSelectView,
  onOpenExport
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080B0C]/95 backdrop-blur-md border-b border-[#283231]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a 
          href="/" 
          className="text-lg font-bold tracking-tight text-[#EEF2EF] whitespace-nowrap shrink-0 flex items-center gap-2.5 font-sans"
        >
          <span className="w-2 h-2 rounded-full bg-[#D2F27C] shadow-[0_0_8px_rgba(210,242,124,0.6)]" />
          <span>7LayerX</span>
        </a>

        {/* Zone 2: 4–5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-[#98A5A2]">
          <button 
            onClick={() => onSelectView('layers')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EEF2EF] ${activeView === 'layers' ? 'text-[#D2F27C] font-semibold' : ''}`}
          >
            Plates
          </button>
          <button 
            onClick={() => onSelectView('topology')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EEF2EF] ${activeView === 'topology' ? 'text-[#D2F27C] font-semibold' : ''}`}
          >
            Topology
          </button>
          <button 
            onClick={() => onSelectView('tracelab')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EEF2EF] ${activeView === 'tracelab' ? 'text-[#D2F27C] font-semibold' : ''}`}
          >
            Trace Lab
          </button>
          <button 
            onClick={() => onSelectView('diagnostics')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EEF2EF] ${activeView === 'diagnostics' ? 'text-[#D2F27C] font-semibold' : ''}`}
          >
            Diagnostics
          </button>
          <button 
            onClick={() => onSelectView('terminal')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EEF2EF] ${activeView === 'terminal' ? 'text-[#D2F27C] font-semibold' : ''}`}
          >
            Terminal
          </button>
          <button 
            onClick={() => onSelectView('reasons')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EEF2EF] ${activeView === 'reasons' ? 'text-[#D2F27C] font-semibold' : ''}`}
          >
            Root Causes
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-medium text-[#080B0C] bg-[#D2F27C] hover:bg-[#A6C955] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Asset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
