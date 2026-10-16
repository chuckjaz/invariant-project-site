import React, { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { IdentityAuthCard } from './components/IdentityAuthCard';
import { IdentityVerifiedScreen } from './components/IdentityVerifiedScreen';
import { CliSimulatorBar } from './components/CliSimulatorBar';
import { StaticDeployModal } from './components/StaticDeployModal';
import { OAuthParams, UserIdentity, IdentityAssertion } from './types/auth';
import { createIdentityAssertion, generateRandomString } from './utils/crypto';

export default function App() {
  const logoUrl = '/logo.jpg';

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
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);

  // Update URL search query without triggering page reload
  const updateUrlParams = useCallback((params: OAuthParams) => {
    const url = new URL(window.location.href);
    if (params.clientId) url.searchParams.set('client_id', params.clientId);
    if (params.redirectUri) url.searchParams.set('redirect_uri', params.redirectUri);
    else url.searchParams.delete('redirect_uri');
    if (params.state) url.searchParams.set('state', params.state);
    if (params.nonce) url.searchParams.set('nonce', params.nonce);
    else url.searchParams.delete('nonce');

    window.history.replaceState({}, '', url.toString());
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
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onToggleSimulator={() => setIsSimulatorOpen((prev) => !prev)}
        isSimulatorOpen={isSimulatorOpen}
      />

      {/* Collapsible CLI Test Simulator Drawer */}
      {isSimulatorOpen && (
        <CliSimulatorBar
          oauthParams={oauthParams}
          onUpdateParams={handleUpdateParams}
          onResetParams={handleResetParams}
          lastAssertion={lastTerminalAssertion}
        />
      )}

      {/* Main Viewport Content */}
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
            <span>Static OAuth Identity Portal</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <button
              type="button"
              onClick={() => setIsDeployGuideOpen(true)}
              className="hover:text-cyan-300 transition-colors"
            >
              Static Deployment Specs
            </button>
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              className="hover:text-cyan-300 transition-colors"
            >
              CLI Test Suite
            </button>
            <span className="font-mono text-emerald-400/80">RFC 8252 / OIDC</span>
          </div>
        </div>
      </footer>

      {/* Static Deployment Guide Modal */}
      <StaticDeployModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
}
