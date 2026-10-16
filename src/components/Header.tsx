import React, { useState } from 'react';
import { BookOpen, ExternalLink, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  logoUrl: string;
  onOpenDeployGuide: () => void;
  onToggleSimulator: () => void;
  isSimulatorOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl,
  onOpenDeployGuide,
  onToggleSimulator,
  isSimulatorOpen,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#162B54]/80 bg-[#03091E]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
        {/* Zone 1: Brand wordmark with uploaded logo */}
        <a
          href="/"
          className="flex items-center gap-3 text-base font-semibold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0 hover:text-cyan-300 transition-colors"
        >
          {!imgError ? (
            <img
              src={logoUrl}
              alt="Invariant Project Logo"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-10 w-10 rounded-lg object-cover border border-cyan-400/30 bg-[#03091E] shrink-0 shadow-sm shadow-cyan-500/10"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold shrink-0">
              iP
            </div>
          )}
          <span className="bg-gradient-to-r from-white via-sky-100 to-cyan-200 bg-clip-text text-transparent">
            invariantproject.com
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-sky-200/70">
          <button
            type="button"
            onClick={onOpenDeployGuide}
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span>Static Hosting Guide</span>
          </button>
          <a
            href="https://invariantproject.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Documentation</span>
            <ExternalLink className="h-3.5 w-3.5 text-sky-400/60" />
          </a>
          <span className="text-[#162B54] select-none">/</span>
          <span className="text-xs text-emerald-400 font-mono whitespace-nowrap shrink-0">
            CLI Identity Auth
          </span>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSimulator}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 ${
              isSimulatorOpen
                ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] border-cyan-300 font-semibold shadow-sm shadow-cyan-500/20'
                : 'bg-[#07112B] text-sky-100 border-[#162B54] hover:border-cyan-400/50 hover:text-cyan-300'
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
