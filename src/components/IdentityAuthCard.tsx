import React, { useState } from 'react';
import {
  Terminal,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { OAuthParams, UserIdentity } from '../types/auth';

interface IdentityAuthCardProps {
  logoUrl: string;
  oauthParams: OAuthParams;
  onSuccess: (identity: UserIdentity) => void;
}

export const IdentityAuthCard: React.FC<IdentityAuthCardProps> = ({
  logoUrl,
  oauthParams,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const handleProviderLogin = (provider: 'google' | 'github') => {
    setErrorMessage(null);
    setIsLoading(provider);

    setTimeout(() => {
      setIsLoading(null);
      const identity: UserIdentity =
        provider === 'google'
          ? {
              id: 'usr_goog_849201a9',
              email: 'engineer.dev@gmail.com',
              name: 'Alex Rivera',
              username: 'arivera',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
              provider: 'google',
              emailVerified: true,
              authTime: Date.now(),
            }
          : {
              id: 'usr_gh_912384c2',
              email: 'alex-engineer@github.com',
              name: 'Alex Rivera',
              username: 'alex-rivera-sys',
              avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexSys',
              provider: 'github',
              emailVerified: true,
              authTime: Date.now(),
            };
      onSuccess(identity);
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Container Card matching the midnight navy & cyan/emerald gradient of logo.jpg */}
      <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Gradient Accent Hairline matching the left-blue to center-cyan to right-emerald logo spectrum */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />

        {/* Prominent Centered Invariant Project Logo Showcase */}
        <div className="mb-6 pb-6 border-b border-[#162B54]/80 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            {!logoError ? (
              <div className="rounded-2xl bg-[#03091E] p-2.5 border border-cyan-400/25 shadow-lg shadow-cyan-950/50">
                <img
                  src={logoUrl}
                  alt="Invariant Project Logo"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="h-36 w-36 sm:h-40 sm:w-40 rounded-xl object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-[#03091E] border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono text-xl font-bold">
                iP
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-sky-100 to-cyan-200 bg-clip-text text-transparent mb-2">
            Verify CLI Identity
          </h1>

          <div className="flex items-center justify-between text-xs text-sky-200/70 mb-3 px-3 py-2 rounded-lg bg-[#03091E] border border-[#162B54]">
            <span className="flex items-center gap-1.5 font-mono text-cyan-300">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>client_id: {oauthParams.clientId}</span>
            </span>
            <span className="text-sky-300/60 font-mono text-[11px]">OAuth 2.0 / OIDC</span>
          </div>

          <p className="text-xs text-sky-200/70 leading-relaxed text-left">
            Select an authorized OAuth identity provider to authenticate the{' '}
            <code className="text-cyan-300 font-mono">invariant</code> CLI on this workstation.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Exclusive OAuth SSO Buttons */}
        <div className="space-y-3.5">
          {/* Google SSO */}
          <button
            type="button"
            onClick={() => handleProviderLogin('google')}
            disabled={isLoading !== null}
            className="w-full group flex items-center justify-between p-3.5 bg-[#03091E] hover:bg-[#0B1838] border border-[#162B54] hover:border-cyan-400/60 rounded-xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-60"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-[#07112B] border border-[#162B54] group-hover:border-cyan-400/40 flex items-center justify-center shrink-0 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  Continue with Google
                </div>
                <div className="text-[11px] text-sky-200/60">
                  Authenticate via Google OAuth
                </div>
              </div>
            </div>
            <div className="shrink-0 text-sky-300/50 group-hover:text-cyan-300 transition-colors">
              {isLoading === 'google' ? (
                <span className="text-[11px] font-mono text-cyan-300">Verifying...</span>
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </div>
          </button>

          {/* GitHub SSO */}
          <button
            type="button"
            onClick={() => handleProviderLogin('github')}
            disabled={isLoading !== null}
            className="w-full group flex items-center justify-between p-3.5 bg-[#03091E] hover:bg-[#0B1838] border border-[#162B54] hover:border-emerald-400/60 rounded-xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-60"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-[#07112B] border border-[#162B54] group-hover:border-emerald-400/40 flex items-center justify-center shrink-0 transition-colors">
                <svg className="h-5 w-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Continue with GitHub
                </div>
                <div className="text-[11px] text-sky-200/60">
                  Authenticate via GitHub OAuth
                </div>
              </div>
            </div>
            <div className="shrink-0 text-sky-300/50 group-hover:text-emerald-300 transition-colors">
              {isLoading === 'github' ? (
                <span className="text-[11px] font-mono text-emerald-300">Verifying...</span>
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </div>
          </button>
        </div>

        {/* Security & Scope Delegation Notice */}
        <div className="mt-6 pt-5 border-t border-[#162B54]/80 flex items-start gap-2.5 text-sky-200/70">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-sky-100">User Identification Only:</strong> The OAuth flow verifies who you are. All permissions and access tokens for Invariant services are governed internally by Invariant upon receipt of this identity assertion.
          </p>
        </div>
      </div>

      {/* Trust & Boundary Notice */}
      <div className="mt-4 px-2 text-center text-[11px] text-sky-300/50 leading-normal">
        <span>Identity verification only · Invariant domain: </span>
        <span className="font-mono text-cyan-300">invariantproject.com</span>
      </div>
    </div>
  );
};
