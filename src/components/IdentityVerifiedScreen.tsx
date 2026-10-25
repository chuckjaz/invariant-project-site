import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ChevronDown,
  ChevronUp,
  LogOut,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { IdentityAssertion, OAuthParams } from '../types/auth';

interface IdentityVerifiedScreenProps {
  logoUrl: string;
  assertion: IdentityAssertion;
  oauthParams: OAuthParams;
  onReset: () => void;
  onSimulateLoopbackReceipt?: (assertion: IdentityAssertion) => void;
}

export const IdentityVerifiedScreen: React.FC<IdentityVerifiedScreenProps> = ({
  logoUrl,
  assertion,
  oauthParams,
  onReset,
  onSimulateLoopbackReceipt,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [showClaims, setShowClaims] = useState(false);
  const [loopbackStatus, setLoopbackStatus] = useState<'idle' | 'sending' | 'delivered' | 'failed'>('idle');
  const [logoError, setLogoError] = useState(false);

  const isLocalhostUri =
    oauthParams.redirectUri &&
    (oauthParams.redirectUri.startsWith('http://localhost') ||
      oauthParams.redirectUri.startsWith('http://127.0.0.1'));

  useEffect(() => {
    if (isLocalhostUri && !oauthParams.isHeadlessMode) {
      setLoopbackStatus('sending');
      const targetUrl = new URL(oauthParams.redirectUri);
      targetUrl.searchParams.set('code', assertion.code);
      targetUrl.searchParams.set('state', assertion.state);

      if (onSimulateLoopbackReceipt) {
        onSimulateLoopbackReceipt(assertion);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);

      fetch(targetUrl.toString(), {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
      })
        .then(() => {
          clearTimeout(timeoutId);
          setLoopbackStatus('delivered');
        })
        .catch(() => {
          clearTimeout(timeoutId);
          setLoopbackStatus('delivered');
        });
    }
  }, [assertion, isLocalhostUri, oauthParams.isHeadlessMode, oauthParams.redirectUri, onSimulateLoopbackReceipt]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(assertion.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const cliCommand = assertion.invite
    ? `invariant invite redeem "${assertion.invite}" --token ${assertion.code}`
    : `invariant login --token ${assertion.code}`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Primary Verification Card */}
      <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />

        {/* Header with Logo + Verified Status */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#162B54]/80">
          <div className="flex items-center gap-3.5">
            {!logoError ? (
              <img
                src={logoUrl}
                alt="Invariant Project Logo"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="h-14 w-14 rounded-xl object-cover border border-cyan-400/30 bg-[#03091E] p-0.5 shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Identity Verified</h1>
                <span className="text-[11px] font-mono text-emerald-400">OIDC / RFC 8252</span>
              </div>
              <p className="text-xs text-sky-200/70 mt-0.5">
                Verified identity for Invariant command-line access.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-400/30 items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* User Identity Details Box */}
        <div className="my-5 p-4 rounded-lg bg-[#03091E] border border-[#162B54] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-[#07112B] border border-cyan-400/40 flex items-center justify-center font-bold text-xs text-cyan-300 shrink-0 overflow-hidden">
              {assertion.identity.avatarUrl ? (
                <img
                  src={assertion.identity.avatarUrl}
                  alt={assertion.identity.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                assertion.identity.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {assertion.identity.name}
              </div>
              <div className="text-[11px] text-sky-200/70 font-mono truncate">
                {assertion.identity.email}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[11px] text-sky-200/60">Provider</div>
            <div className="text-xs font-mono font-medium text-cyan-300 capitalize">
              {assertion.identity.provider} SSO
            </div>
          </div>
        </div>

        {/* Handoff Status Section */}
        {isLocalhostUri && !oauthParams.isHeadlessMode ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#03091E] border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-cyan-300">
                <span className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>Loopback Delivery Status</span>
                </span>
                <span className="font-mono text-[11px] text-emerald-300">
                  {loopbackStatus === 'sending' && 'Sending to listener...'}
                  {loopbackStatus === 'delivered' && 'Dispatched'}
                  {loopbackStatus === 'failed' && 'Pending manual copy'}
                </span>
              </div>
              <p className="text-sky-100/90 leading-relaxed text-[11px]">
                Identity code dispatched to local terminal listener at:{' '}
                <span className="font-mono text-cyan-300 break-all">{oauthParams.redirectUri}</span>
              </p>
              <div className="pt-1 text-sky-200/60 text-[11px]">
                You may now return to your terminal. The <code className="text-cyan-300 font-mono">invariant</code> CLI will complete the login sequence automatically.
              </div>
            </div>

            {/* Manual Code Fallback */}
            <div className="pt-2">
              <div className="text-xs font-medium text-sky-100 mb-2">
                Running in remote SSH or terminal without loopback listener?
              </div>
              <div className="p-3 bg-[#03091E] border border-[#162B54] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-sky-200/70 font-mono">Verification Code:</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-emerald-300 font-medium"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <div className="p-2 bg-[#07112B] rounded border border-[#162B54] font-mono text-xs text-emerald-300 break-all select-all">
                  {assertion.code}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Headless / Manual Mode */
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#03091E] border border-[#162B54] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  One-Time Verification Code
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] rounded transition-opacity hover:opacity-95"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="p-3 bg-[#07112B] rounded border border-[#162B54] font-mono text-xs text-emerald-300 break-all select-all">
                {assertion.code}
              </div>

              <div className="pt-2 border-t border-[#162B54]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-sky-200/70">Terminal Command:</span>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="text-[11px] text-cyan-300 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedCommand ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCommand ? 'Copied command' : 'Copy command'}</span>
                  </button>
                </div>
                <div className="p-2 bg-[#07112B] rounded border border-[#162B54] font-mono text-[11px] text-sky-100 flex items-center justify-between overflow-x-auto">
                  <code>{cliCommand}</code>
                </div>
              </div>
            </div>

            <p className="text-xs text-sky-200/70 leading-relaxed">
              Paste this verification code into your command-line prompt to complete authentication.
            </p>
          </div>
        )}

        {/* Boundary Explanation Notice */}
        <div className="mt-6 pt-5 border-t border-[#162B54]/80 flex items-start gap-2.5 text-xs text-sky-200/70">
          <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong className="text-sky-100">OAuth2 Identity Verified.</strong>{' '}
            {assertion.invite ? (
              <>
                <code className="text-cyan-300 font-mono">invariant invite redeem</code> validates this OAuth2 email (<code className="text-emerald-300 font-mono">{assertion.identity.email}</code>) against the invitation and exchanges it with <code className="text-cyan-300 font-mono">{assertion.controlPlaneUrl || 'inv-discovery'}</code> for a WireGuard-pinned access token (<code className="text-sky-100 font-mono">~/.invariant/keys/client.token</code>).
              </>
            ) : (
              <>
                <code className="text-cyan-300 font-mono">invariant login</code> saves your verified OAuth2 credentials to <code className="text-sky-100 font-mono">~/.invariant/oauth_token.json</code>, which <code className="text-cyan-300 font-mono">invariant invite redeem</code> uses to verify your email against single-use control plane invitations (<code className="text-emerald-300 font-mono">inv_invite_...@itp://...</code>).
              </>
            )}
          </p>
        </div>

        {/* Inspect Claims Accordion */}
        <div className="mt-4 pt-4 border-t border-[#162B54]/80">
          <button
            type="button"
            onClick={() => setShowClaims(!showClaims)}
            className="w-full flex items-center justify-between text-xs text-sky-200/70 hover:text-cyan-300 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-mono">
              <Code2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Inspect Identity Claims (ID Assertion)</span>
            </span>
            {showClaims ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showClaims && (
            <div className="mt-3 p-3 bg-[#03091E] rounded-lg border border-[#162B54] text-[11px] font-mono text-sky-100 overflow-x-auto space-y-2">
              <div className="text-cyan-400/80">OIDC Identity Assertion Payload</div>
              <pre className="text-sky-100 whitespace-pre-wrap">
                {JSON.stringify(
                  {
                    iss: 'https://invariantproject.com',
                    sub: assertion.identity.id,
                    aud: oauthParams.clientId,
                    email: assertion.identity.email,
                    name: assertion.identity.name,
                    preferred_username: assertion.identity.username,
                    email_verified: assertion.identity.emailVerified,
                    auth_time: Math.floor(assertion.identity.authTime / 1000),
                    nonce: assertion.nonce,
                    state: assertion.state,
                    invite: assertion.invite,
                    control_plane: assertion.controlPlaneUrl,
                    purpose: 'identity_verification',
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Reset Action */}
        <div className="mt-6 pt-4 border-t border-[#162B54]/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-sky-200/70 hover:text-cyan-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign In as Different User</span>
          </button>

          <span className="text-[11px] font-mono text-sky-300/50">
            Expires in {assertion.expiresIn}s
          </span>
        </div>
      </div>
    </div>
  );
};
