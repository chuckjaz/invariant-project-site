import React, { useState } from 'react';
import { X, Copy, Check, Server, Cloud, Globe, FolderGit2, CheckCircle2 } from 'lucide-react';

interface StaticDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaticDeployModal: React.FC<StaticDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const buildCmd = `npm run build`;
  const s3Cmd = `aws s3 sync dist/ s3://invariantproject-static-auth/ --delete`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#07112B] border border-[#162B54] p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#162B54]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Static File Hosting Guide
              </h2>
              <p className="text-xs text-sky-200/70">
                Deploying invariantproject.com authentication to any static CDN
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-sky-200/60 hover:text-white rounded-lg hover:bg-[#0B1838] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5 text-xs text-sky-100">
          <div>
            <h3 className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>100% Static HTML/CSS/JS Architecture</span>
            </h3>
            <p className="leading-relaxed text-sky-200/70">
              This application compiles into standalone client-side static assets in the <code className="text-cyan-300">dist/</code> directory (including <code className="text-emerald-300">public/logo.jpg</code> and <code className="text-emerald-300">public/CNAME</code>). All OAuth 2.0 / OIDC parameters are parsed directly from <code className="text-sky-100">window.location.search</code>.
            </p>
          </div>

          {/* Build Command */}
          <div className="p-3 bg-[#03091E] border border-[#162B54] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">1. Build Static Output</span>
              <button
                type="button"
                onClick={() => copyText(buildCmd, 'build')}
                className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-emerald-300"
              >
                {copiedSection === 'build' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSection === 'build' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-2 bg-[#07112B] rounded border border-[#162B54] font-mono text-[11px] text-emerald-300">
              {buildCmd}
            </pre>
            <p className="mt-2 text-[11px] text-sky-200/70">
              Creates <code className="text-sky-100">dist/index.html</code>, <code className="text-sky-100">dist/logo.jpg</code>, <code className="text-sky-100">dist/assets/*.js</code>, and <code className="text-sky-100">dist/assets/*.css</code>.
            </p>
          </div>

          {/* Hosting Options */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white">2. Deployment Targets</h4>

            {/* GitHub Pages */}
            <div className="p-3 bg-[#03091E] border border-[#162B54] rounded-lg space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-white">
                <FolderGit2 className="h-4 w-4 text-emerald-400" />
                <span>GitHub Pages (Actions Workflow)</span>
              </div>
              <p className="text-[11px] text-sky-200/70 leading-relaxed">
                Set repository Pages source to <strong className="text-sky-100">GitHub Actions</strong>. See <code className="text-cyan-300">README.md</code> and <code className="text-emerald-300">.github/workflows/deploy.yml</code> for automated deployment and custom domain DNS configuration.
              </p>
            </div>

            {/* Cloudflare Pages */}
            <div className="p-3 bg-[#03091E] border border-[#162B54] rounded-lg space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-white">
                <Cloud className="h-4 w-4 text-cyan-400" />
                <span>Cloudflare Pages</span>
              </div>
              <p className="text-[11px] text-sky-200/70 leading-relaxed">
                Connect your repository to Cloudflare Pages. Set custom domain <code className="text-sky-100">invariantproject.com</code> or subdomain <code className="text-sky-100">auth.invariantproject.com</code>.
              </p>
            </div>

            {/* AWS S3 + CloudFront */}
            <div className="p-3 bg-[#03091E] border border-[#162B54] rounded-lg space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-white">
                <Server className="h-4 w-4 text-sky-400" />
                <span>AWS S3 + CloudFront CDN</span>
              </div>
              <pre className="p-2 bg-[#07112B] rounded border border-[#162B54] font-mono text-[11px] text-cyan-300">
                {s3Cmd}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#162B54] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] rounded-lg text-xs font-semibold transition-opacity hover:opacity-95"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
