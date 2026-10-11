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
  const cfConfig = `# cloudflare pages build config
Build command: npm run build
Build output directory: dist`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl bg-[#111827] border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Static File Hosting Guide
              </h2>
              <p className="text-xs text-slate-400">
                Deploying invariantproject.com authentication to any static CDN
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5 text-xs text-slate-300">
          <div>
            <h3 className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>100% Static HTML/CSS/JS Architecture</span>
            </h3>
            <p className="leading-relaxed text-slate-400">
              This application compiles into standalone client-side static assets in the <code className="text-slate-200">dist/</code> directory. There are zero Node.js server, Python, or database runtime dependencies required to host this on <span className="text-white font-mono">invariantproject.com</span>. All OAuth 2.0 / OIDC parameters are parsed directly from <code className="text-slate-200">window.location.search</code>.
            </p>
          </div>

          {/* Build Command */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200">1. Build Static Output</span>
              <button
                type="button"
                onClick={() => copyText(buildCmd, 'build')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copiedSection === 'build' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSection === 'build' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-2 bg-[#0B0F17] rounded border border-slate-800 font-mono text-[11px] text-cyan-300">
              {buildCmd}
            </pre>
            <p className="mt-2 text-[11px] text-slate-400">
              Creates <code className="text-slate-300">dist/index.html</code>, <code className="text-slate-300">dist/assets/*.js</code>, and <code className="text-slate-300">dist/assets/*.css</code>.
            </p>
          </div>

          {/* Hosting Options */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white">2. Deployment Targets</h4>

            {/* Cloudflare Pages */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-slate-200">
                <Cloud className="h-4 w-4 text-indigo-400" />
                <span>Cloudflare Pages (Recommended)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect your repository to Cloudflare Pages. Set custom domain <code className="text-slate-300">invariantproject.com</code> or subdomain <code className="text-slate-300">auth.invariantproject.com</code>.
              </p>
            </div>

            {/* AWS S3 + CloudFront */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-slate-200">
                <Server className="h-4 w-4 text-cyan-400" />
                <span>AWS S3 + CloudFront CDN</span>
              </div>
              <pre className="p-2 bg-[#0B0F17] rounded border border-slate-800 font-mono text-[11px] text-cyan-300">
                {s3Cmd}
              </pre>
            </div>

            {/* GitHub Pages */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-slate-200">
                <FolderGit2 className="h-4 w-4 text-emerald-400" />
                <span>GitHub Pages (Actions Workflow)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Set repository Pages source to <strong className="text-slate-300">GitHub Actions</strong>. See <code className="text-cyan-300">README.md</code> for the complete <code className="text-slate-300">.github/workflows/deploy.yml</code> template and custom domain DNS configuration.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
