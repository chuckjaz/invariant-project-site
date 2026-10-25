import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { IdentityAuthCard } from './components/IdentityAuthCard';
import { IdentityVerifiedScreen } from './components/IdentityVerifiedScreen';
import { CliSimulatorBar } from './components/CliSimulatorBar';
import { OAuthParams, UserIdentity, IdentityAssertion } from './types/auth';
import { createIdentityAssertion, generateRandomString } from './utils/crypto';
import { Terminal, Lock, Cpu } from 'lucide-react';

type PageRoute = 'home' | 'auth';

function resolveCurrentPage(): PageRoute {
  const path = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash;
  if (path === '/auth' || path.endsWith('/auth') || hash.startsWith('#/auth') || hash === '#auth') {
    return 'auth';
  }
  return 'home';
}

function parseOAuthParamsFromUrl(): OAuthParams {
  const params = new URLSearchParams(window.location.search);

  const clientId = params.get('client_id') || 'invariant-cli';
  const redirectUri =
    params.get('redirect_uri') ||
    params.get('callback') ||
    'http://127.0.0.1:8085/callback';
  const state = params.get('state') || `st_${generateRandomString(8)}`;
  const nonce = params.get('nonce') || `nc_${generateRandomString(8)}`;
  const responseType = params.get('response_type') || 'code';
  const codeChallenge = params.get('code_challenge') || undefined;
  const codeChallengeMethod = params.get('code_challenge_method') || undefined;
  const prompt = params.get('prompt') || undefined;
  const invite = params.get('invite') || params.get('invite_code') || undefined;
  const expectedEmail = params.get('email') || params.get('expected_email') || undefined;
  const isHeadlessMode = params.get('headless') === 'true' || !redirectUri;

  return {
    clientId,
    redirectUri,
    state,
    nonce,
    responseType,
    codeChallenge,
    codeChallengeMethod,
    prompt,
    invite,
    expectedEmail,
    isHeadlessMode,
  };
}

export function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>(() => resolveCurrentPage());
  const [oauthParams, setOauthParams] = useState<OAuthParams>(() => parseOAuthParamsFromUrl());
  const [assertion, setAssertion] = useState<IdentityAssertion | null>(null);
  const [showCliSimulator, setShowCliSimulator] = useState(false);
  const logoUrl = '/logo.jpg';

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(resolveCurrentPage());
      setOauthParams(parseOAuthParamsFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleNavigateHome = useCallback(() => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      // Ignore history restriction in sandboxed environments
    }
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleUpdateParams = useCallback((newParams: Partial<OAuthParams>) => {
    setOauthParams((prev) => ({ ...prev, ...newParams }));
    setAssertion(null);
  }, []);

  const handleResetParams = useCallback(() => {
    setOauthParams(parseOAuthParamsFromUrl());
    setAssertion(null);
  }, []);

  const handleAuthSuccess = useCallback(
    (identity: UserIdentity) => {
      const created = createIdentityAssertion(
        identity,
        oauthParams.state,
        oauthParams.clientId,
        oauthParams.nonce,
        oauthParams.invite
      );
      setAssertion(created);
    },
    [oauthParams]
  );

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

      {currentPage === 'home' ? (
        <main className="flex-1 relative z-10">
          <HomePage logoUrl={logoUrl} />
        </main>
      ) : (
        <>
          <div className="relative z-10 border-b border-[#162B54]/80 bg-[#050C24]/90 px-4 sm:px-6 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-sky-200/80 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>CLI OAuth2 Identity Verification Endpoint (/auth)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCliSimulator((prev) => !prev)}
                className="px-2.5 py-1 rounded bg-[#07112B] hover:bg-[#0B1838] text-cyan-300 border border-[#162B54] font-mono text-[11px] transition-colors"
              >
                {showCliSimulator ? 'Hide CLI Simulator' : 'CLI Simulator'}
              </button>
            </div>
          </div>

          {showCliSimulator && (
            <div className="relative z-10">
              <CliSimulatorBar
                oauthParams={oauthParams}
                onUpdateParams={handleUpdateParams}
                onResetParams={handleResetParams}
                lastAssertion={assertion}
              />
            </div>
          )}

          <main className="flex-1 relative z-10 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
            {!assertion ? (
              <IdentityAuthCard
                logoUrl={logoUrl}
                oauthParams={oauthParams}
                onSuccess={handleAuthSuccess}
              />
            ) : (
              <IdentityVerifiedScreen
                logoUrl={logoUrl}
                assertion={assertion}
                oauthParams={oauthParams}
                onReset={() => setAssertion(null)}
              />
            )}
          </main>
        </>
      )}

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
              className={`hover:text-sky-300 transition-colors ${
                currentPage === 'home' ? 'text-sky-400' : 'text-slate-400'
              }`}
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
