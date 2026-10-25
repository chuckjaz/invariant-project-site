import React, { useState } from 'react';
import {
  Terminal,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  MailCheck,
} from 'lucide-react';
import { OAuthParams, UserIdentity } from '../types/auth';
import { parseInvitationCode } from '../utils/crypto';

interface IdentityAuthCardProps {
  oauthParams: OAuthParams;
  onSuccess: (identity: UserIdentity) => void;
}

export const IdentityAuthCard: React.FC<IdentityAuthCardProps> = ({
  oauthParams,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedInvite = parseInvitationCode(oauthParams.invite);
  const expectedEmail = oauthParams.expectedEmail?.trim();

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

      if (
        expectedEmail &&
        identity.email.toLowerCase() !== expectedEmail.toLowerCase()
      ) {
        setErrorMessage(
          `OAuth email mismatch: authenticated as "${identity.email}", but invitation requires "${expectedEmail}". Single-use invitation was not consumed.`
        );
        return;
      }

      onSuccess(identity);
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Container Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl relative">
        {/* CLI Context Information Header */}
        <div className="mb-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-mono">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span>client_id: {oauthParams.clientId}</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">OAuth 2.0 / OIDC</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white mb-1.5">
            Verify Invariant Identity
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Authenticate via OAuth 2.0 to validate your email identity for <code className="text-slate-300">invariant login</code>.
          </p>

          {parsedInvite && (
            <div className="mt-4 p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                <KeyRound className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Redeeming Control Plane Invitation</span>
              </div>
              {parsedInvite.controlPlaneUrl && (
                <div className="font-mono text-slate-300 truncate">
                  Control Plane: <span className="text-cyan-300">{parsedInvite.controlPlaneUrl}</span>
                </div>
              )}
              {expectedEmail && (
                <div className="flex items-center gap-1.5 font-mono text-slate-300">
                  <MailCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Required Email: <span className="text-emerald-300">{expectedEmail}</span></span>
                </div>
              )}
            </div>
          )}
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
            className="w-full group flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-xl text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
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
                <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  Continue with Google
                </div>
                <div className="text-[11px] text-slate-400">
                  Authenticate via Google OAuth
                </div>
              </div>
            </div>
            <div className="shrink-0 text-slate-500 group-hover:text-slate-300">
              {isLoading === 'google' ? (
                <span className="text-[11px] font-mono text-indigo-400 animate-pulse">Verifying...</span>
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
            className="w-full group flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-xl text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  Continue with GitHub
                </div>
                <div className="text-[11px] text-slate-400">
                  Authenticate via GitHub OAuth
                </div>
              </div>
            </div>
            <div className="shrink-0 text-slate-500 group-hover:text-slate-300">
              {isLoading === 'github' ? (
                <span className="text-[11px] font-mono text-indigo-400 animate-pulse">Verifying...</span>
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </div>
          </button>
        </div>

        {/* Security & Scope Delegation Notice */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-start gap-2.5 text-slate-400">
          <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-slate-300">OAuth2 + Invitation Binding:</strong> <code className="text-slate-300">invariant login</code> validates your OAuth2 credentials, and <code className="text-slate-300">invariant invite redeem</code> verifies that your authenticated email matches your single-use control plane invitation (<code className="text-slate-300">inv_invite_...@itp://...</code>) before issuing a WireGuard-pinned access token.
          </p>
        </div>
      </div>

      {/* Trust & Boundary Notice */}
      <div className="mt-4 px-2 text-center text-[11px] text-slate-500 leading-normal">
        <span>Identity verification only · Invariant domain: </span>
        <span className="font-mono text-slate-400">invariantproject.com</span>
      </div>
    </div>
  );
};
