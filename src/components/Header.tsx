import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface HeaderProps {
  logoUrl: string;
  onNavigateHome: (sectionHash?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl,
  onNavigateHome,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#162B54]/80 bg-[#03091E]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
        {/* Zone 1: Brand wordmark with uploaded logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
          }}
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

        {/* Zone 2: Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-sky-200/70">
          <a
            href="/#overview"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome('overview');
            }}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            Overview
          </a>
          <a
            href="/#capabilities"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome('capabilities');
            }}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            Architecture
          </a>
          <a
            href="/#repository"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome('repository');
            }}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            Repositories
          </a>
          <a
            href="/#microservices"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome('microservices');
            }}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            Microservices
          </a>
          <a
            href="/#cli"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome('cli');
            }}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            CLI &amp; Config
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://github.com/chuckjaz/invariant-go"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] shadow-sm shadow-cyan-500/20 hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
          >
            <span>View on GitHub</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
