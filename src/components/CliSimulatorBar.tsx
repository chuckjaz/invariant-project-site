import React, { useState } from 'react';
import {
  Terminal,
} from 'lucide-react';
import { IdentityAssertion, OAuthParams } from '../types/auth';

interface CliSimulatorBarProps {
  oauthParams: OAuthParams;
  onUpdateParams: (newParams: Partial<OAuthParams>) => void;
  onResetParams: () => void;
  lastAssertion: IdentityAssertion | null;
}

export const CliSimulatorBar: React.FC<CliSimulatorBarProps> = ({
  oauthParams,
  onUpdateParams,
  lastAssertion,
}) => {
  const [activePreset, setActivePreset] = useState<'loopback' | 'invite' | 'headless' | 'pkce'>('loopback');
  const [port] = useState('8085');

  const sampleInvite =
    'inv_invite_456789abcdef0123456789abcdef0123@itp://tc189abcdef0123456789abcdef01234567:3003';

  const applyPreset = (preset: 'loopback' | 'invite' | 'headless' | 'pkce') => {
    setActivePreset(preset);
    if (preset === 'loopback') {
      onUpdateParams({
        clientId: 'invariant-cli',
        redirectUri: `http://127.0.0.1:${port}/callback`,
        state: `st_${Math.random().toString(36).substring(2, 8)}`,
        nonce: `nc_${Math.random().toString(36).substring(2, 8)}`,
        invite: undefined,
        expectedEmail: undefined,
        isHeadlessMode: false,
      });
    } else if (preset === 'invite') {
      onUpdateParams({
        clientId: 'invariant-cli',
        redirectUri: `http://127.0.0.1:${port}/callback`,
        state: `st_inv_${Math.random().toString(36).substring(2, 8)}`,
        nonce: `nc_${Math.random().toString(36).substring(2, 8)}`,
        invite: sampleInvite,
        expectedEmail: 'engineer.dev@gmail.com',
        isHeadlessMode: false,
      });
    } else if (preset === 'headless') {
      onUpdateParams({
        clientId: 'invariant-cli',
        redirectUri: '',
        state: `st_remote_${Math.random().toString(36).substring(2, 8)}`,
        nonce: undefined,
        invite: sampleInvite,
        expectedEmail: 'engineer.dev@gmail.com',
        isHeadlessMode: true,
      });
    } else if (preset === 'pkce') {
      onUpdateParams({
        clientId: 'invariant-cli',
        redirectUri: `http://127.0.0.1:9000/callback`,
        state: `st_pkce_${Math.random().toString(36).substring(2, 8)}`,
        nonce: `nc_${Math.random().toString(36).substring(2, 8)}`,
        codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        codeChallengeMethod: 'S256',
        invite: undefined,
        expectedEmail: undefined,
        isHeadlessMode: false,
      });
    }
  };

  return (
    <div className="border-b border-[#162B54] bg-[#020614] text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 space-y-4">
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>CLI Test Harness</span>
            </span>
            <span className="text-[#162B54]">·</span>
            <span className="text-sky-200/70 text-[11px]">
              Simulate `invariant login` &amp; `invariant invite redeem` invocations
            </span>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 bg-[#07112B] border border-[#162B54] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => applyPreset('loopback')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all whitespace-nowrap ${
                activePreset === 'loopback'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold shadow-xs'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              Localhost Loopback
            </button>
            <button
              type="button"
              onClick={() => applyPreset('invite')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all whitespace-nowrap ${
                activePreset === 'invite'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold shadow-xs'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              Invitation Redeem
            </button>
            <button
              type="button"
              onClick={() => applyPreset('headless')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all whitespace-nowrap ${
                activePreset === 'headless'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold shadow-xs'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              Headless / Remote SSH
            </button>
            <button
              type="button"
              onClick={() => applyPreset('pkce')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all whitespace-nowrap ${
                activePreset === 'pkce'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold shadow-xs'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              PKCE Flow (Port 9000)
            </button>
          </div>
        </div>

        {/* Input Parameters Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-mono text-sky-200/70 mb-1">
              client_id
            </label>
            <input
              type="text"
              value={oauthParams.clientId}
              onChange={(e) => onUpdateParams({ clientId: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-[#07112B] border border-[#162B54] rounded font-mono text-white text-xs focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-sky-200/70 mb-1">
              redirect_uri (loopback listener)
            </label>
            <input
              type="text"
              value={oauthParams.redirectUri}
              placeholder="e.g. http://127.0.0.1:8085/callback"
              onChange={(e) =>
                onUpdateParams({
                  redirectUri: e.target.value,
                  isHeadlessMode: !e.target.value,
                })
              }
              className="w-full px-2.5 py-1.5 bg-[#07112B] border border-[#162B54] rounded font-mono text-white text-xs focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-sky-200/70 mb-1">
              state
            </label>
            <input
              type="text"
              value={oauthParams.state}
              onChange={(e) => onUpdateParams({ state: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-[#07112B] border border-[#162B54] rounded font-mono text-white text-xs focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-sky-200/70 mb-1">
              invite (code@itp://...)
            </label>
            <input
              type="text"
              value={oauthParams.invite || ''}
              placeholder="inv_invite_...@itp://tc1...:3003"
              onChange={(e) => onUpdateParams({ invite: e.target.value || undefined })}
              className="w-full px-2.5 py-1.5 bg-[#07112B] border border-[#162B54] rounded font-mono text-white text-xs focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-sky-200/70 mb-1">
              invitation email
            </label>
            <input
              type="text"
              value={oauthParams.expectedEmail || ''}
              placeholder="engineer.dev@gmail.com"
              onChange={(e) => onUpdateParams({ expectedEmail: e.target.value || undefined })}
              className="w-full px-2.5 py-1.5 bg-[#07112B] border border-[#162B54] rounded font-mono text-white text-xs focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Simulated Local Terminal Feed */}
        <div className="rounded-lg bg-[#03091E] border border-[#162B54] p-3 font-mono text-[11px]">
          <div className="flex items-center justify-between pb-2 border-b border-[#162B54]/80 text-sky-200/70 mb-2">
            <span className="text-sky-100 font-medium">
              Simulated CLI Terminal Window
            </span>
            <span className="text-[10px] text-emerald-400">
              {oauthParams.redirectUri ? `LISTENING ON ${oauthParams.redirectUri}` : 'HEADLESS MODE'}
            </span>
          </div>

          <div className="space-y-1 text-sky-100">
            <div className="text-sky-300/70">
              {oauthParams.invite
                ? `$ invariant invite redeem "${oauthParams.invite}"`
                : '$ invariant login'}
            </div>
            {oauthParams.redirectUri ? (
              <div className="text-sky-200/80">
                [CLI] Starting local HTTP listener on <span className="text-cyan-300">{oauthParams.redirectUri}</span>
              </div>
            ) : (
              <div className="text-cyan-300">
                [CLI] Headless terminal detected. Please authenticate in your browser and paste the verification token.
              </div>
            )}
            <div className="text-sky-300/50">
              [CLI] Opening browser to https://invariantproject.com/auth?client_id={oauthParams.clientId}...
            </div>

            {lastAssertion ? (
              <div className="pt-2 text-emerald-400 space-y-1">
                <div>[CLI] Received verified OAuth2 token: {lastAssertion.code}</div>
                <div>[CLI] State parameter confirmed: {lastAssertion.state}</div>
                <div>
                  [CLI] User identity verified: <span className="text-white font-semibold">{lastAssertion.identity.name}</span> ({lastAssertion.identity.email})
                </div>
                {lastAssertion.invite ? (
                  <div className="text-cyan-300">
                    [CLI] Redeeming single-use invitation with {lastAssertion.controlPlaneUrl || 'inv-discovery'} and pinning WireGuard node key...
                  </div>
                ) : (
                  <div className="text-cyan-300">
                    [CLI] Saved OAuth2 credentials to ~/.invariant/oauth_token.json
                  </div>
                )}
                <div className="text-emerald-300 font-semibold">
                  [CLI] Ready. You are now logged into Invariant.
                </div>
              </div>
            ) : (
              <div className="text-sky-300/40 italic pt-1">
                [CLI] Awaiting user authentication in browser...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
