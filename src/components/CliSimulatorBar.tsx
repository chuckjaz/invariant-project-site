import React, { useState } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Copy,
  ChevronRight,
  Sparkles,
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
  onResetParams,
  lastAssertion,
}) => {
  const [activePreset, setActivePreset] = useState<'loopback' | 'headless' | 'pkce'>('loopback');
  const [port, setPort] = useState('8085');

  const applyPreset = (preset: 'loopback' | 'headless' | 'pkce') => {
    setActivePreset(preset);
    if (preset === 'loopback') {
      onUpdateParams({
        clientId: 'invariant-cli',
        redirectUri: `http://localhost:${port}/callback`,
        state: `st_${Math.random().toString(36).substring(2, 8)}`,
        nonce: `nc_${Math.random().toString(36).substring(2, 8)}`,
        isHeadlessMode: false,
      });
    } else if (preset === 'headless') {
      onUpdateParams({
        clientId: 'invariant-cli',
        redirectUri: '',
        state: `st_remote_${Math.random().toString(36).substring(2, 8)}`,
        nonce: undefined,
        isHeadlessMode: true,
      });
    } else if (preset === 'pkce') {
      onUpdateParams({
        clientId: 'invariant-cli-v2',
        redirectUri: `http://127.0.0.1:9000/callback`,
        state: `st_pkce_${Math.random().toString(36).substring(2, 8)}`,
        nonce: `nc_${Math.random().toString(36).substring(2, 8)}`,
        codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        codeChallengeMethod: 'S256',
        isHeadlessMode: false,
      });
    }
  };

  return (
    <div className="border-b border-slate-800 bg-slate-950/90 text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 space-y-4">
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>CLI Test Harness</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-[11px]">
              Simulate `invariant login` invocations
            </span>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => applyPreset('loopback')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activePreset === 'loopback'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Localhost Loopback
            </button>
            <button
              type="button"
              onClick={() => applyPreset('headless')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activePreset === 'headless'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Headless / Remote SSH
            </button>
            <button
              type="button"
              onClick={() => applyPreset('pkce')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activePreset === 'pkce'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PKCE Flow (Port 9000)
            </button>
          </div>
        </div>

        {/* Input Parameters Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              client_id
            </label>
            <input
              type="text"
              value={oauthParams.clientId}
              onChange={(e) => onUpdateParams({ clientId: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              redirect_uri (loopback listener)
            </label>
            <input
              type="text"
              value={oauthParams.redirectUri}
              placeholder="e.g. http://localhost:8085/callback"
              onChange={(e) =>
                onUpdateParams({
                  redirectUri: e.target.value,
                  isHeadlessMode: !e.target.value,
                })
              }
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              state
            </label>
            <input
              type="text"
              value={oauthParams.state}
              onChange={(e) => onUpdateParams({ state: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              nonce
            </label>
            <input
              type="text"
              value={oauthParams.nonce || ''}
              placeholder="Optional OIDC nonce"
              onChange={(e) => onUpdateParams({ nonce: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Simulated Local Terminal Feed */}
        <div className="rounded-lg bg-black/80 border border-slate-800 p-3 font-mono text-[11px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              <span>Simulated CLI Terminal Window</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {oauthParams.redirectUri ? `LISTENING ON ${oauthParams.redirectUri}` : 'HEADLESS MODE'}
            </span>
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="text-slate-400">$ invariant auth login</div>
            {oauthParams.redirectUri ? (
              <div className="text-slate-400">
                [CLI] Starting local HTTP listener on <span className="text-cyan-400">{oauthParams.redirectUri}</span>
              </div>
            ) : (
              <div className="text-amber-400/90">
                [CLI] Headless terminal detected. Please authenticate in your browser and paste the verification code.
              </div>
            )}
            <div className="text-slate-500">
              [CLI] Opening browser to https://invariantproject.com/login?client_id={oauthParams.clientId}...
            </div>

            {lastAssertion ? (
              <div className="pt-2 text-emerald-400 space-y-1">
                <div>[CLI] Received verified identity code: {lastAssertion.code}</div>
                <div>[CLI] State parameter confirmed: {lastAssertion.state}</div>
                <div>
                  [CLI] User identity verified: <span className="text-white font-semibold">{lastAssertion.identity.name}</span> ({lastAssertion.identity.email})
                </div>
                <div className="text-indigo-400">
                  [CLI] Transmitting identity assertion to Invariant Core Service for authorization token issuance...
                </div>
                <div className="text-emerald-300 font-semibold">
                  [CLI] Ready. You are now logged into Invariant.
                </div>
              </div>
            ) : (
              <div className="text-slate-500 italic pt-1">
                [CLI] Awaiting user authentication in browser...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
