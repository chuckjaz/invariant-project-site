import React, { useState } from 'react';
import { ShieldCheck, Terminal, ExternalLink } from 'lucide-react';

interface HeaderProps {
  logoUrl: string;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl,
  onNavigateHome,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <header className="border-b border-[#162B54]/80 bg-[#03091E]/85 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="flex items-center gap-3.5 text-left group focus:outline-none"
          >
            <div className="relative flex items-center justify-center">
              {!imageError && logoUrl ? (
                <div className="w-10 h-10 rounded-lg bg-[#07112B] border border-sky-400/40 p-0.5 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(56,189,248,0.25)] group-hover:border-sky-400/70 transition-colors">
                  <img
                    src={logoUrl}
                    alt="Invariant Logo"
                    className="w-full h-full object-contain rounded-[6px]"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-2 ring-[#03091E]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-tight text-white text-base group-hover:text-sky-300 transition-colors">
                  INVARIANT
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-400/30 font-semibold">
                  invariant-go
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Cryptographically Verifiable Distributed File System
              </p>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[#162B54]">
            <a
              href="/#overview"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#07112B]/80 transition-colors"
            >
              Overview
            </a>
            <a
              href="/#architecture"
              onClick={() => {
                if (window.location.pathname.startsWith('/auth')) {
                  onNavigateHome();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#07112B]/80 transition-colors"
            >
              Architecture
            </a>
            <a
              href="/#repository"
              onClick={() => {
                if (window.location.pathname.startsWith('/auth')) {
                  onNavigateHome();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#07112B]/80 transition-colors"
            >
              Repositories
            </a>
            <a
              href="/#services"
              onClick={() => {
                if (window.location.pathname.startsWith('/auth')) {
                  onNavigateHome();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#07112B]/80 transition-colors"
            >
              Microservices
            </a>
            <a
              href="/#cli"
              onClick={() => {
                if (window.location.pathname.startsWith('/auth')) {
                  onNavigateHome();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#07112B]/80 transition-colors"
            >
              CLI &amp; Config
            </a>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-[#07112B]/90 border border-[#162B54] px-2.5 py-1.5 rounded-md">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>SHA-256 / Ed25519</span>
          </div>

          <a
            href="https://github.com/chuckjaz/invariant-go"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-sky-200 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 px-3 py-1.5 rounded-md transition-colors"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
