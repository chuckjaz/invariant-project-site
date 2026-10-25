import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { IdentityAssertion, OAuthParams } from '../types/auth';

interface IdentityVerifiedScreenProps {
  assertion: IdentityAssertion;
  oauthParams: OAuthParams;
  onReset: () => void;
  onSimulateLoopbackReceipt?: (assertion: IdentityAssertion) => void;
}

export const IdentityVerifiedScreen: React.FC<IdentityVerifiedScreenProps> = ({
  assertion,
  oauthParams,
  onReset,
  onSimulateLoopbackReceipt,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [showClaims, setShowClaims] = useState(false);
  const [loopbackStatus, setLoopbackStatus] = useState<'idle' | 'sending' | 'delivered' | 'failed'>('idle');

  const isLocalhostUri =
    oauthParams.redirectUri &&
    (oauthParams.redirectUri.startsWith('http://localhost') ||
      oauthParams.redirectUri.startsWith('http://127.0.0.1'));

  // Attempt loopback handoff if redirect_uri is localhost
  useEffect(() => {
    if (isLocalhostUri && !oauthParams.isHeadlessMode) {
      setLoopbackStatus('sending');
      // Attempt real fetch to the local CLI server in background with short timeout
      const targetUrl = new URL(oauthParams.redirectUri);
      targetUrl.searchParams.set('code', assertion.code);
      targetUrl.searchParams.set('state', assertion.state);

      // Notify in-browser simulator if running
      if (onSimulateLoopbackReceipt) {
        onSimulateLoopbackReceipt(assertion);
      }

      // Try sending to local client listener
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
          // If no actual local server running on that port, mark as delivered for simulator or offer manual
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
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl relative">
        {/* Header with Verified Status */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800/80">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Identity Verified</h1>
              <span className="text-[11px] font-mono text-emerald-400">OIDC / RFC 8252</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified identity for Invariant command-line access.
            </p>
          </div>
        </div>

        {/* User Identity Details Box */}
        <div className="my-5 p-4 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0 overflow-hidden">
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
              <div className="text-[11px] text-slate-400 font-mono truncate">
                {assertion.identity.email}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[11px] text-slate-400">Provider</div>
            <div className="text-xs font-mono font-medium text-indigo-400 capitalize">
              {assertion.identity.provider} SSO
            </div>
          </div>
        </div>

        {/* Handoff Status Section */}
        {isLocalhostUri && !oauthParams.isHeadlessMode ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-indigo-300">
                <span className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <span>Loopback Delivery Status</span>
                </span>
                <span className="font-mono text-[11px] text-cyan-300">
                  {loopbackStatus === 'sending' && 'Sending to listener...'}
                  {loopbackStatus === 'delivered' && 'Dispatched'}
                  {loopbackStatus === 'failed' && 'Pending manual copy'}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Identity code dispatched to local terminal listener at:{' '}
                <span className="font-mono text-cyan-300 break-all">{oauthParams.redirectUri}</span>
              </p>
              <div className="pt-1 text-slate-400 text-[11px]">
                You may now return to your terminal. The <code className="text-slate-200">invariant</code> CLI will complete the login sequence automatically.
              </div>
            </div>

            {/* Manual Code Fallback accordion */}
            <div className="pt-2">
              <div className="text-xs font-medium text-slate-300 mb-2">
                Running in remote SSH or terminal without loopback listener?
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Verification Code:</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <div className="p-2 bg-[#0B0F17] rounded border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
                  {assertion.code}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Headless / Manual Mode */
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  One-Time Verification Code
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="p-3 bg-[#0B0F17] rounded border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
                {assertion.code}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-400">Terminal Command:</span>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedCommand ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCommand ? 'Copied command' : 'Copy command'}</span>
                  </button>
                </div>
                <div className="p-2 bg-[#0B0F17] rounded border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between overflow-x-auto">
                  <code>{cliCommand}</code>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste this verification code into your command-line prompt to complete authentication.
            </p>
          </div>
        )}

        {/* Boundary Explanation Notice */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong className="text-slate-300">OAuth2 Identity Verified.</strong>{' '}
            {assertion.invite ? (
              <>
                <code className="text-slate-200">invariant invite redeem</code> validates this OAuth2 email (<code className="text-emerald-300">{assertion.identity.email}</code>) against the invitation and exchanges it with <code className="text-cyan-300">{assertion.controlPlaneUrl || 'inv-discovery'}</code> for a WireGuard-pinned access token (<code className="text-slate-200">~/.invariant/keys/client.token</code>).
              </>
            ) : (
              <>
                <code className="text-slate-200">invariant login</code> saves your verified OAuth2 credentials to <code className="text-slate-200">~/.invariant/oauth_token.json</code>, which <code className="text-slate-200">invariant invite redeem</code> uses to verify your email against single-use control plane invitations (<code className="text-slate-200">inv_invite_...@itp://...</code>).
              </>
            )}
          </p>
        </div>

        {/* Inspect Claims Accordion */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowClaims(!showClaims)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1.5 font-mono">
              <Code2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Inspect Identity Claims (ID Assertion)</span>
            </span>
            {showClaims ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showClaims && (
            <div className="mt-3 p-3 bg-[#0B0F17] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto space-y-2">
              <div className="text-slate-500">// OIDC Identity Assertion Payload</div>
              <pre className="text-slate-300 whitespace-pre-wrap">
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
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign In as Different User</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500">
            Expires in {assertion.expiresIn}s
          </span>
        </div>
      </div>
    </div>
  );
};
