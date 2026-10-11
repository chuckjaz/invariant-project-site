import React from 'react';
import { Terminal, Shield, BookOpen, ExternalLink, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  onOpenDeployGuide: () => void;
  onToggleSimulator: () => void;
  isSimulatorOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDeployGuide,
  onToggleSimulator,
  isSimulatorOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
        {/* Zone 1: Brand wordmark */}
        <a
          href="/"
          className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-slate-200 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Shield className="h-4 w-4" />
          </div>
          <span>invariantproject.com</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={onOpenDeployGuide}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="h-4 w-4 text-slate-500" />
            <span>Static Hosting Guide</span>
          </button>
          <a
            href="https://invariantproject.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <span>Documentation</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </a>
          <span className="text-slate-700 select-none">/</span>
          <span className="text-xs text-slate-500 font-mono whitespace-nowrap shrink-0">
            CLI Identity Auth
          </span>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSimulator}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              isSimulatorOpen
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{isSimulatorOpen ? 'Hide CLI Simulator' : 'Simulate CLI'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
