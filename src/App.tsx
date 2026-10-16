import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { IdentityAuthCard } from './components/IdentityAuthCard';
import { IdentityVerifiedScreen } from './components/IdentityVerifiedScreen';
import { CliSimulatorBar } from './components/CliSimulatorBar';
import { OAuthParams, UserIdentity, IdentityAssertion } from './types/auth';
import { createIdentityAssertion, generateRandomString } from './utils/crypto';

function resolveCurrentPage(): 'home' | 'auth' {
  if (typeof window === 'undefined') return 'home';
  const pathname = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash;
  if (
    pathname === '/auth' ||
    pathname.endsWith('/auth') ||
    pathname.endsWith('/auth/index.html') ||
    hash.startsWith('#/auth') ||
    hash === '#auth'
  ) {
    return 'auth';
  }
  return 'home';
}

export default function App() {
  const logoUrl = '/logo.jpg';

  const [currentPage, setCurrentPage] = useState<'home' | 'auth'>(resolveCurrentPage);

  // Parse initial OAuth 2.0 / OIDC parameters from URL search
  const initialParams = useMemo<OAuthParams>(() => {
    if (typeof window === 'undefined') {
      return {
        clientId: 'invariant-cli',
        redirectUri: 'http://localhost:8085/callback',
        state: 'st_' + generateRandomString(12),
        responseType: 'code',
        isHeadlessMode: false,
      };
    }

    const searchParams = new URLSearchParams(window.location.search);
    const clientId = searchParams.get('client_id') || 'invariant-cli';
    const redirectUri = searchParams.get('redirect_uri') || 'http://localhost:8085/callback';
    const state = searchParams.get('state') || 'st_' + generateRandomString(12);
    const nonce = searchParams.get('nonce') || undefined;
    const responseType = searchParams.get('response_type') || 'code';
    const codeChallenge = searchParams.get('code_challenge') || undefined;
    const codeChallengeMethod = searchParams.get('code_challenge_method') || undefined;
    const prompt = searchParams.get('prompt') || undefined;

    return {
      clientId,
      redirectUri,
      state,
      nonce,
      responseType,
      codeChallenge,
      codeChallengeMethod,
      prompt,
      isHeadlessMode: !redirectUri,
    };
  }, []);

  const [oauthParams, setOAuthParams] = useState<OAuthParams>(initialParams);
  const [, setUser] = useState<UserIdentity | null>(null);
  const [assertion, setAssertion] = useState<IdentityAssertion | null>(null);
  const [lastTerminalAssertion, setLastTerminalAssertion] = useState<IdentityAssertion | null>(null);
  const [isSimulatorOpen] = useState(false);

  // Sync browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(resolveCurrentPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL search query on /auth without triggering page reload
  const updateUrlParams = useCallback((params: OAuthParams) => {
    const url = new URL(window.location.href);
    url.pathname = '/auth';
    if (params.clientId) url.searchParams.set('client_id', params.clientId);
    if (params.redirectUri) url.searchParams.set('redirect_uri', params.redirectUri);
    else url.searchParams.delete('redirect_uri');
    if (params.state) url.searchParams.set('state', params.state);
    if (params.nonce) url.searchParams.set('nonce', params.nonce);
    else url.searchParams.delete('nonce');

    window.history.replaceState({}, '', url.toString());
  }, []);

  const handleNavigateHome = useCallback((sectionHash?: string) => {
    setCurrentPage('home');
    const targetUrl = sectionHash ? `/#${sectionHash}` : '/';
    window.history.pushState({}, '', targetUrl);
    if (sectionHash) {
      setTimeout(() => {
        const el = document.getElementById(sectionHash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleUpdateParams = (newParams: Partial<OAuthParams>) => {
    setOAuthParams((prev) => {
      const updated = { ...prev, ...newParams };
      updateUrlParams(updated);
      return updated;
    });
  };

  const handleResetParams = () => {
    const reset = {
      clientId: 'invariant-cli',
      redirectUri: 'http://localhost:8085/callback',
      state: 'st_' + generateRandomString(12),
      nonce: 'nc_' + generateRandomString(10),
      responseType: 'code',
      isHeadlessMode: false,
    };
    setOAuthParams(reset);
    updateUrlParams(reset);
  };

  const handleAuthSuccess = (identity: UserIdentity) => {
    setUser(identity);
    const newAssertion = createIdentityAssertion(
      identity,
      oauthParams.state,
      oauthParams.clientId,
      oauthParams.nonce
    );
    setAssertion(newAssertion);
    setLastTerminalAssertion(newAssertion);
  };

  const handleResetAuth = () => {
    setUser(null);
    setAssertion(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#03091E] text-[#F8FAFC] selection:bg-cyan-400 selection:text-[#03091E]">
      {/* Top Header */}
      <Header
        logoUrl={logoUrl}
        onNavigateHome={handleNavigateHome}
      />

      {/* Collapsible CLI Test Simulator Drawer (only when /auth is active) */}
      {currentPage === 'auth' && isSimulatorOpen && (
        <CliSimulatorBar
          oauthParams={oauthParams}
          onUpdateParams={handleUpdateParams}
          onResetParams={handleResetParams}
          lastAssertion={lastTerminalAssertion}
        />
      )}

      {/* Main Viewport Content */}
      {currentPage === 'home' ? (
        <main className="flex-1">
          <HomePage logoUrl={logoUrl} />
        </main>
      ) : (
        <main className="flex-1 flex flex-col justify-center px-4 py-8 sm:py-12">
          <div className="mx-auto w-full max-w-6xl">
            {assertion ? (
              <IdentityVerifiedScreen
                logoUrl={logoUrl}
                assertion={assertion}
                oauthParams={oauthParams}
                onReset={handleResetAuth}
                onSimulateLoopbackReceipt={(asst) => setLastTerminalAssertion(asst)}
              />
            ) : (
              <IdentityAuthCard
                logoUrl={logoUrl}
                oauthParams={oauthParams}
                onSuccess={handleAuthSuccess}
              />
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-[#162B54]/80 bg-[#03091E] py-6 text-xs text-sky-200/60">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img
              src={logoUrl}
              alt="Invariant Project Logo"
              referrerPolicy="no-referrer"
              className="h-6 w-6 rounded object-cover border border-cyan-400/30"
            />
            <span className="font-semibold text-sky-100">invariantproject.com</span>
            <span>·</span>
            <span>Content-Addressed Distributed Storage</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a
              href="/#overview"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateHome('overview');
              }}
              className="hover:text-cyan-300 transition-colors"
            >
              Overview
            </a>
            <a
              href="/#capabilities"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateHome('capabilities');
              }}
              className="hover:text-cyan-300 transition-colors"
            >
              Architecture
            </a>
            <a
              href="/#repository"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateHome('repository');
              }}
              className="hover:text-cyan-300 transition-colors"
            >
              Repositories
            </a>
            <a
              href="/#microservices"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateHome('microservices');
              }}
              className="hover:text-cyan-300 transition-colors"
            >
              Microservices
            </a>
            <a
              href="https://github.com/chuckjaz/invariant-go"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
