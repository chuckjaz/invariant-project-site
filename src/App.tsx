import React, { useCallback } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { Terminal, Lock, Cpu } from 'lucide-react';

export function App() {
  const logoUrl = '/logo.jpg';

  const handleNavigateHome = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#03091E] text-slate-100 selection:bg-sky-500/30 selection:text-sky-200 relative overflow-x-hidden">
      {/* Subtle Background Grid & Radial Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-25"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.22), transparent 60%), linear-gradient(to right, rgba(22, 43, 84, 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(22, 43, 84, 0.45) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
        }}
      />

      <Header
        logoUrl={logoUrl}
        onNavigateHome={handleNavigateHome}
      />

      <main className="flex-1 relative z-10">
        <HomePage logoUrl={logoUrl} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#162B54]/80 bg-[#03091E]/90 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-slate-300">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              SHA-256 / Ed25519 Content-Addressed Storage
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:flex items-center gap-1.5 font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Pure Static Build (dist/)
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateHome();
              }}
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              Home
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://github.com/chuckjaz/invariant-go"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-300 transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>github.com/chuckjaz/invariant-go</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
