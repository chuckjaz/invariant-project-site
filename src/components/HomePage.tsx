import React, { useState } from 'react';
import {
  HardDrive,
  Database,
  CloudUpload,
  Network,
  Lock,
  Copy,
  Check,
  ExternalLink,
  GitBranch,
  KeyRound,
  Download,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

interface HomePageProps {
  logoUrl: string;
}

interface MicroserviceSpec {
  name: string;
  command: string;
  privilege: 'Unprivileged' | 'Privileged';
  role: string;
  description: string;
}

const MICROSERVICES: MicroserviceSpec[] = [
  {
    name: 'Storage',
    command: 'inv-storage',
    privilege: 'Unprivileged',
    role: 'Content-Addressed Block Store',
    description:
      'Primary service used to store and retrieve arbitrary blobs of data by cryptographic content address. Supports in-memory storage, persistent nested local filesystem blocks, or AWS S3 backends.',
  },
  {
    name: 'Finder',
    command: 'inv-finder',
    privilege: 'Unprivileged',
    role: 'Kademlia DHT Routing',
    description:
      'Locates content blocks distributed across multiple physical or cloud storage devices using Kademlia routing logic over the Peer protocol.',
  },
  {
    name: 'Distribute',
    command: 'inv-distribute',
    privilege: 'Unprivileged',
    role: 'Replication & Backup Coordinator',
    description:
      'Coordinates block replication across storage nodes with configurable replication factor (-N), handles Notify protocol events, and manages rate-limited backup destinations (MB/hour).',
  },
  {
    name: 'Discovery',
    command: 'inv-discovery',
    privilege: 'Unprivileged',
    role: 'Service Registry & Delegation',
    description:
      'Provides service detection, registration, and upstream delegation across local and distributed cluster topologies.',
  },
  {
    name: 'Slots',
    command: 'inv-slots',
    privilege: 'Unprivileged',
    role: 'Mutable Root Pointers',
    description:
      'Allocates and manages updateable slots that maintain the current root address of a file system or key-value journal. Supports Ed25519 256-bit cryptographic protection.',
  },
  {
    name: 'Names',
    command: 'inv-names',
    privilege: 'Unprivileged',
    role: 'Logical Naming & Local DNS',
    description:
      'Binds human-readable logical names to 64-character hex IDs (such as mapping device IDs or mutable slot IDs to service names) with optional DNS and upstream delegation.',
  },
  {
    name: 'KeyValue',
    command: 'inv-kv',
    privilege: 'Privileged',
    role: 'Immutable Journal & B-Tree Store',
    description:
      'Provides structured key-value storage backed by an immutable journal, immutable B-Tree index, and in-memory cache. Initialized with the root content-link.',
  },
];

type RepoCategory = 'workflow' | 'review' | 'init' | 'branch' | 'workspace' | 'diagnostics' | 'git';

interface RepoCommandSpec {
  category: RepoCategory;
  cmd: string;
  flags?: string;
  summary: string;
}

const REPO_COMMANDS: RepoCommandSpec[] = [
  // Primary workflow
  {
    category: 'workflow',
    cmd: 'ir change <name>',
    flags: '-private · -upstream · -tag',
    summary: 'Create a writable change branch workspace branched from upstream.',
  },
  {
    category: 'workflow',
    cmd: 'ir status',
    summary: 'Show working tree file modifications, additions, and deletions relative to the current HEAD commit.',
  },
  {
    category: 'workflow',
    cmd: 'ir diff [<commit1>] [<commit2>]',
    flags: '--stat',
    summary: 'Produce unified diffs of workspace changes or between commits.',
  },
  {
    category: 'workflow',
    cmd: 'ir sync',
    flags: '--continue · --abort · -tag',
    summary: 'Synchronize and rebase the active change workspace onto the latest upstream HEAD via 3-way merge.',
  },
  {
    category: 'workflow',
    cmd: 'ir log [<path>]',
    flags: '-tree / -graph · -n <count>',
    summary: 'Display the commit history log with full DAG history visualization.',
  },
  {
    category: 'workflow',
    cmd: 'ir commit',
    flags: '-m <msg> (repeatable) · --amend · --squash <commit> · -tag',
    summary: 'Snapshot and commit workspace changes to the current branch slot.',
  },
  {
    category: 'workflow',
    cmd: 'ir submit [<directory>]',
    flags: '-target · -tag',
    summary: 'Fast-forward/push changes from the change workspace to the target upstream branch (default main) and retire the workspace.',
  },
  {
    category: 'workflow',
    cmd: 'ir show [<commit>[:<path>]]',
    summary: "Inspect commit metadata and diffs, or view a file's contents at a specific commit snapshot.",
  },

  // Code Review Subcommands (ir review ...)
  {
    category: 'review',
    cmd: 'ir review request [<directory>]',
    summary: 'Request a code review on the active change branch and emit a review token.',
  },
  {
    category: 'review',
    cmd: 'ir review open <sha|token|name>',
    flags: '-d <dir> · -writable',
    summary: 'Open a review workspace for inspection without changing its status.',
  },
  {
    category: 'review',
    cmd: 'ir review start [<sha|token|name>]',
    flags: '-d <dir> · -writable · -reviewer',
    summary: 'Transition a review to in_progress and open/mount its workspace.',
  },
  {
    category: 'review',
    cmd: 'ir review comment [<comment-file>]',
    flags: '-token · -m · -file · -line · -end-line · -author',
    summary: 'Add structured review comments via a JSON file or command-line flags.',
  },
  {
    category: 'review',
    cmd: 'ir review comments [<identifier>]',
    flags: '-json',
    summary: 'Display review comments formatted as markdown with code context or raw JSON.',
  },
  {
    category: 'review',
    cmd: 'ir review approve [<identifier>]',
    summary: 'Approve a code review and retire the review workspace.',
  },
  {
    category: 'review',
    cmd: 'ir review reject [<identifier>]',
    summary: 'Reject a code review and retire the review workspace.',
  },
  {
    category: 'review',
    cmd: 'ir review abandon [<identifier>]',
    summary: 'Abandon a code review and retire the review workspace.',
  },
  {
    category: 'review',
    cmd: 'ir review update [<identifier>]',
    summary: 'Update an existing review record with the latest committed changes on the branch.',
  },

  // Initialization and configuration
  {
    category: 'init',
    cmd: 'ir open <name> [<directory>]',
    flags: '-b / -branch · -d / -directory · -layers · -create-only · -foreground · -writable · -tag',
    summary: 'Open an existing repository from the Names Service into a layered FUSE workspace.',
  },
  {
    category: 'init',
    cmd: 'ir create <name> [<content>]',
    flags: '-content · -d · -tag · -create-only · -encrypt · -compress · -writable · -readonly',
    summary: 'Create a new repository, register it with the Names Service, and initialize the main branch.',
  },
  {
    category: 'init',
    cmd: 'ir config <get|set|unset|list>',
    flags: '--global',
    summary: 'Manage repository-scoped or global user configuration settings.',
  },

  // Branch management
  {
    category: 'branch',
    cmd: 'ir branch [list|delete <name>]',
    summary: 'List local workspaces, upstream branches, and discovered peer branches, or delete a branch.',
  },
  {
    category: 'branch',
    cmd: 'ir checkout <branch|peer-branch>',
    flags: '-writable',
    summary: 'Switch to or mount a local, upstream, or peer-published change branch.',
  },
  {
    category: 'branch',
    cmd: 'ir cherry-pick <branch|commit> [<end-commit>]',
    flags: '-tag',
    summary: 'Apply commits from another branch or commit range onto the current workspace.',
  },
  {
    category: 'branch',
    cmd: 'ir rebase [-i] [<upstream>]',
    summary: 'Interactively edit, reorder, squash, or drop commits in a change branch.',
  },
  {
    category: 'branch',
    cmd: 'ir tag [create <name> [<commit>]|list|delete <name>]',
    summary: 'Create, list, or delete immutable release tags.',
  },

  // Workspace management
  {
    category: 'workspace',
    cmd: 'ir clean',
    flags: '-f · -d · -x',
    summary: 'Purge untracked and temporary files from the workspace.',
  },
  {
    category: 'workspace',
    cmd: 'ir layer <add <repo_name> <mount_path> [--commit=<sha>]|list|remove <mount_path>>',
    summary: 'Manage pinned sub-repository dependency layers inside the workspace.',
  },
  {
    category: 'workspace',
    cmd: 'ir restore [<path>]',
    flags: '-source <commit> (defaults to HEAD)',
    summary: 'Discard uncommitted local edits and restore files from a commit snapshot.',
  },
  {
    category: 'workspace',
    cmd: 'ir revert <commit>',
    flags: '-tag',
    summary: 'Apply the inverse patch of a commit and record a new revert commit.',
  },
  {
    category: 'workspace',
    cmd: 'ir stash [push [-m <msg>]|pop|list|drop [<index>]]',
    summary: 'Shelve and restore uncommitted local changes to and from temporary CAS commits.',
  },
  {
    category: 'workspace',
    cmd: 'ir mount <name> [<directory>]',
    summary: 'Mount an existing repository workspace.',
  },
  {
    category: 'workspace',
    cmd: 'ir unmount [<directory>]',
    summary: 'Unmount a repository workspace and its nested workspaces.',
  },

  // Diagnostics
  {
    category: 'diagnostics',
    cmd: 'ir blame <file>',
    flags: '-commit <hash>',
    summary: 'Show line-by-line commit and author attribution for a file.',
  },
  {
    category: 'diagnostics',
    cmd: 'ir grep <pattern> [<path>]',
    flags: '-i · -n · -commit <hash>',
    summary: 'Search for patterns across commit trees stored in CAS.',
  },
  {
    category: 'diagnostics',
    cmd: 'ir bisect <start [<bad> [<good>]]|bad [<commit>]|good [<commit>]|reset|run <cmd> [args...]>',
    summary: 'Perform binary search across commit history to isolate regressions.',
  },

  // Git Import / Export
  {
    category: 'git',
    cmd: 'ir git import [<git-dir>]',
    flags: '-repository / -repo · -branch · -directory / -d · -depth · -writable · -tag',
    summary: 'Import commit history and file trees from a Git repository into Invariant CAS.',
  },
  {
    category: 'git',
    cmd: 'ir git export <target-git-dir>',
    flags: '-branch · -from <commit>',
    summary: 'Export Invariant commits and file trees to a Git repository.',
  },
];

const CLI_SUBCOMMANDS = [
  {
    cmd: 'invariant login',
    summary: 'Authenticate with the OAuth2 provider to obtain user credentials (~/.invariant/oauth_token.json).',
  },
  {
    cmd: 'invariant invite redeem <inv_invite_...@itp://...>',
    summary:
      'Redeem a single-use control-plane invitation token, verifying your OAuth2 email and pinning your local WireGuard node key (~/.invariant/keys/client.token & client.discovery).',
  },
  {
    cmd: 'invariant repository',
    summary:
      'Manage CAS-backed version control repositories, isolated FUSE branch workspaces, 3-way merges, code reviews, dependency layers, and bidirectional Git import/export. Recommended shell alias: alias ir="invariant repository".',
  },
  {
    cmd: 'invariant mount <dir> --compress --encrypt',
    summary:
      'Mount the Invariant file system locally via FUSE with dynamic .invariant-layer reloading, name resolution, read/write disk caching, and dirty directory merging.',
  },
  {
    cmd: 'invariant workspace create | mount | unmount | pull',
    summary:
      'Manage layered workspaces (.invariant-workspace / .invariant-layer) separating persistent core network files from transient local build directories with ~/.cache/invariant caching and offline overflow.',
  },
  {
    cmd: 'invariant upload <dir> --slot <name> --compress --encrypt',
    summary:
      'Upload a local directory as a content-addressed file tree preserving ctime/mtime and splitting zip archives. Supports --key-policy (Deterministic, RandomPerBlock, RandomAllKey, SuppliedAllKey), --prev, --dry-run, and --stats.',
  },
  {
    cmd: 'invariant lookup <logical_name>',
    summary: 'Resolve a registered logical name to its corresponding 64-character ID or network address.',
  },
  {
    cmd: 'invariant name <logical_name> <id>',
    summary: 'Register a human-readable logical name to a 64-character slot or device ID.',
  },
  {
    cmd: 'invariant slot --protected',
    summary:
      'Allocate a mutable slot from the slots service. With --protected, generates a 256-bit Ed25519 key pair using the 32-byte public key as the slot ID and stores the private key in ~/.invariant/keys/.',
  },
  {
    cmd: 'invariant print -s <slot_or_content_link>/path/to/file',
    summary:
      'Stream a block or subpath traversal directly to standard output from a ContentLink JSON or mutable slot.',
  },
  {
    cmd: 'invariant nfs --listen :2049 --compress --encrypt',
    summary:
      'Export the Invariant file system as a completely native NFS server without kernel FUSE dependencies.',
  },
  {
    cmd: 'invariant invite create | list | revoke',
    summary:
      'Administer control-plane invitation tokens (create --role <user|service|admin> --name <name> --email <email>, list, revoke <id>).',
  },
  {
    cmd: 'invariant token list | revoke <id>',
    summary: 'List or revoke active control-plane access tokens.',
  },
  {
    cmd: 'invariant provision --install services.yaml',
    summary:
      'Bootstrap a self-hosted control plane and provision service tokens (service.token) and discovery addresses (discovery.url). With --install, installs missing inv-* commands via go install.',
  },
  {
    cmd: 'invariant start services.yaml',
    summary: 'Start and orchestrate self-hosted microservice clusters defined in a YAML configuration file.',
  },
];

const CLIENT_INSTALL_SNIPPET = `go install github.com/chuckjaz/invariant-go/cmd/invariant@latest
alias ir="invariant repository"`;

const CLIENT_REDEEM_SNIPPET = `invariant login
invariant invite redeem "inv_invite_<hex>@itp://tc1<nodekey>:3003"`;

const GO_INSTALL_SNIPPET = `# Client installation (connect to an existing service & mount FUSE workspaces)
go install github.com/chuckjaz/invariant-go/cmd/invariant@latest

# Recommended shell alias for version control (add to ~/.bashrc or ~/.zshrc)
alias ir="invariant repository"

# Full cluster installation (only needed if self-hosting all microservices)
go install github.com/chuckjaz/invariant-go/cmd/...@latest`;

const SERVICES_EXEC_SNIPPET = `# Discovery Service (default port 3003)
go run ./cmd/inv-discovery -port 3003
go run ./cmd/inv-discovery -port 3003 -upstream http://upstream:3003

# Names Service (in-memory or persistent journal)
go run ./cmd/inv-names -port 3005 -dir /tmp/names -discovery http://localhost:3003

# Storage Service (in-memory, local blocks, or AWS S3 backend)
go run ./cmd/inv-storage -port 3000 -s3-bucket my-bucket -s3-prefix invariant-blocks/
go run ./cmd/inv-storage -port 3000 -dir /tmp/blocks -discovery http://localhost:3003 -distribute distribute-1 -notify notify-service-id

# Distribute Service (replication factor N=3 & rate-limited backup MB/hr)
go run ./cmd/inv-distribute -port 3001 -N 3 -discovery http://localhost:3003 -name distribute-1
go run ./cmd/inv-distribute -port 3001 -destination backup-storage-id -backup-rate 100

# Finder Service (Kademlia routing) & Slots Service
go run ./cmd/inv-finder -port 3002 -discovery http://localhost:3003
go run ./cmd/inv-slots -port 3004 -discovery http://localhost:3003 -notify notify-service-id`;

const SERVICES_YAML_SNIPPET = `# Provision service tokens and start services defined in services.yaml
go run ./cmd/invariant provision --install services.yaml
go run ./cmd/invariant start services.yaml

common:
  discovery:
    discovery: "http://localhost:3003"
    advertise: "http://localhost"
  distribute:
    distribute: "distribute-1"

services:
  - command: inv-discovery
    args:
      port: 3003
  - command: inv-names
    use: [discovery]
    args:
      dir: "*/names"
  - command: inv-distribute
    use: [discovery]
    args:
      name: "distribute-1"
  - command: inv-storage
    use: [discovery, distribute]
    args:
      dir: "*/storage-1"
      notify: "distribute-1"
  - command: inv-storage
    use: [discovery, distribute]
    args:
      dir: "*/storage-2"
      notify: "distribute-1"`;

const DOCKER_COMPOSE_SNIPPET = `version: '3.8'

services:
  discovery:
    build: .
    command: ["./bin/inv-discovery", "-port", "3003"]
    ports:
      - "3003:3003"

  names:
    build: .
    command: ["./bin/inv-names", "-port", "3005", "-dir", "/data/names", "-discovery", "http://discovery:3003", "-advertise", "http://0.0.0.0"]
    volumes:
      - ./data/names:/data/names
    depends_on:
      - discovery

  distribute:
    build: .
    command: ["./bin/inv-distribute", "-port", "3001", "-name", "distribute-1", "-discovery", "http://discovery:3003", "-advertise", "http://0.0.0.0"]
    depends_on:
      - discovery

  storage-1:
    build: .
    command: ["./bin/inv-storage", "-port", "3000", "-dir", "/data/storage-1", "-discovery", "http://discovery:3003", "-advertise", "http://0.0.0.0", "-distribute", "distribute-1", "-notify", "distribute-1"]
    volumes:
      - ./data/storage-1:/data/storage-1
    depends_on:
      - discovery
      - distribute

  storage-2:
    build: .
    command: ["./bin/inv-storage", "-port", "3002", "-dir", "/data/storage-2", "-discovery", "http://discovery:3003", "-advertise", "http://0.0.0.0", "-distribute", "distribute-1", "-notify", "distribute-1"]
    volumes:
      - ./data/storage-2:/data/storage-2
    depends_on:
      - discovery
      - distribute`;

export const HomePage: React.FC<HomePageProps> = ({ logoUrl }) => {
  const [activeRepoCategory, setActiveRepoCategory] = useState<RepoCategory>('workflow');
  const [activeCodeTab, setActiveCodeTab] = useState<'cli' | 'install' | 'exec' | 'yaml' | 'docker'>('cli');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRepoCommands = REPO_COMMANDS.filter(
    (item) => item.category === activeRepoCategory
  );

  return (
    <div className="w-full space-y-20 pb-12">
      {/* 1. Hero Section */}
      <section id="overview" className="pt-6 sm:pt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Core Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-300">
                <span>Connect with an Invitation Token</span>
                <span aria-hidden="true" className="text-[#162B54]">·</span>
                <span>CAS Version Control &amp; Code Review</span>
                <span aria-hidden="true" className="text-[#162B54]">·</span>
                <span>FUSE &amp; Native NFS</span>
              </div>

              <h1
                className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Connect to Shared CAS Repositories &amp; Layered File Systems
              </h1>

              <p className="text-base text-sky-100/80 leading-relaxed max-w-2xl">
                Using an existing Invariant service requires zero server setup. Receive an invitation token from your administrator, install the <code className="text-cyan-300 font-mono">invariant</code> CLI, and redeem your token to immediately mount layered FUSE workspaces, collaborate on CAS-backed repositories, and run code reviews without a local <code className="text-cyan-300 font-mono">.git</code> directory.
              </p>

              {/* Primary & Secondary Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#quickstart"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('quickstart')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] text-sm font-bold shadow-lg shadow-cyan-500/15 hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Redeem a Token &amp; Get Started</span>
                </a>

                <a
                  href="#repository"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('repository')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#07112B] hover:bg-[#0B1838] border border-[#162B54] hover:border-cyan-400/50 text-sky-100 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  <GitBranch className="h-4 w-4 text-emerald-400" />
                  <span>Explore Repository &amp; VCS</span>
                </a>
              </div>

              {/* Technical Highlights Strip */}
              <div className="pt-4 border-t border-[#162B54]/80 grid grid-cols-3 gap-6 text-xs">
                <div>
                  <div className="font-mono font-semibold text-cyan-300 tabular-nums">1. Receive Token</div>
                  <div className="text-sky-200/60 mt-0.5">inv_invite_...@itp://...</div>
                </div>
                <div>
                  <div className="font-mono font-semibold text-emerald-300 tabular-nums">2. Install CLI</div>
                  <div className="text-sky-200/60 mt-0.5">invariant</div>
                </div>
                <div>
                  <div className="font-mono font-semibold text-sky-300 tabular-nums">3. Redeem &amp; Work</div>
                  <div className="text-sky-200/60 mt-0.5">WireGuard-pinned access</div>
                </div>
              </div>
            </div>

            {/* Right Column: Brand Emblem & Client Quick Start Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />

                <div className="flex flex-col items-center text-center">
                  {!logoError ? (
                    <div className="rounded-2xl bg-[#03091E] p-3 border border-cyan-400/25 shadow-xl mb-5">
                      <img
                        src={logoUrl}
                        alt="Invariant Project Logo"
                        referrerPolicy="no-referrer"
                        onError={() => setLogoError(true)}
                        className="h-44 w-44 sm:h-52 sm:w-52 rounded-xl object-contain mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="h-40 w-40 rounded-2xl bg-[#03091E] border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono text-2xl font-bold mb-5">
                      iP
                    </div>
                  )}

                  <div className="w-full rounded-xl bg-[#03091E] border border-[#162B54] p-4 text-left font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-sky-300/60 border-b border-[#162B54] pb-2">
                      <span>Client Quick Start · Connect to Service</span>
                      <span className="text-emerald-400">~/.invariant/</span>
                    </div>
                    <div className="text-sky-100 space-y-1 text-[11px] overflow-x-auto">
                      <div className="text-sky-300/50"># 1. Install CLI &amp; set alias</div>
                      <div>
                        <span className="text-cyan-400">$</span> go install github.com/chuckjaz/invariant-go/cmd/invariant@latest
                      </div>
                      <div>
                        <span className="text-cyan-400">$</span> alias ir=&quot;invariant repository&quot;
                      </div>
                      <div className="text-sky-300/50 pt-1"># 2. Authenticate &amp; redeem invitation token</div>
                      <div>
                        <span className="text-cyan-400">$</span> invariant login
                      </div>
                      <div>
                        <span className="text-cyan-400">$</span> invariant invite redeem &quot;inv_invite_...@itp://...&quot;
                      </div>
                      <div className="text-sky-300/50 pt-1"># 3. Open a repository &amp; create a change branch</div>
                      <div>
                        <span className="text-cyan-400">$</span> ir open my-repo
                      </div>
                      <div>
                        <span className="text-cyan-400">$</span> ir change feat-branch
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Client Onboarding Section: Connecting to an Existing Service */}
      <section id="quickstart" className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 mb-2">
              Client Onboarding · Zero Server Setup Required
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Connect to an Existing Service in Three Steps
            </h2>
          </div>
          <p className="text-xs text-sky-200/70 max-w-md">
            You do not need to host or configure storage nodes to use Invariant. Your invitation token contains everything needed to discover and authenticate with the cluster.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Receive Token */}
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 flex flex-col justify-between space-y-5 relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-cyan-300 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30">
                  Step 01
                </span>
                <KeyRound className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Receive an Invitation Token
              </h3>
              <p className="text-xs text-sky-100/80 leading-relaxed">
                Ask your Invariant cluster administrator for a single-use invitation token bound to your email address. The token embeds both the secret invitation code and the control-plane discovery address.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#03091E] border border-[#162B54] space-y-2">
              <div className="text-[11px] font-mono text-sky-300/60">
                Invitation Token Format
              </div>
              <div className="font-mono text-[11px] text-emerald-300 break-all">
                inv_invite_&lt;hex&gt;@itp://tc1&lt;nodekey&gt;:3003
              </div>
              <div className="pt-2 border-t border-[#162B54]/70 text-[11px] text-sky-200/60">
                 embeds the single-use code + WireGuard <code className="text-cyan-300 font-mono">itp://</code> discovery endpoint
              </div>
            </div>
          </div>

          {/* Step 2: Install Invariant */}
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 flex flex-col justify-between space-y-5 relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-emerald-300 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-400/30">
                  Step 02
                </span>
                <Download className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Install <code className="text-cyan-300 font-mono">invariant</code> &amp; Set Alias
              </h3>
              <p className="text-xs text-sky-100/80 leading-relaxed">
                Install the <code className="text-cyan-300 font-mono">invariant</code> CLI and the local <code className="text-cyan-300 font-mono">inv-files</code> FUSE backing service via Go, then add the <code className="text-emerald-300 font-mono">ir</code> alias to your shell profile (<code className="text-sky-200 font-mono">~/.bashrc</code> or <code className="text-sky-200 font-mono">~/.zshrc</code>).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#03091E] border border-[#162B54] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-sky-300/60">Terminal</span>
                <button
                  type="button"
                  onClick={() => handleCopy(CLIENT_INSTALL_SNIPPET, 'step-install')}
                  className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-emerald-300 transition-colors"
                >
                  {copiedId === 'step-install' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedId === 'step-install' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-[11px] text-sky-100 overflow-x-auto leading-relaxed">
                {CLIENT_INSTALL_SNIPPET}
              </pre>
            </div>
          </div>

          {/* Step 3: Redeem Token */}
          <div className="bg-[#07112B] border border-cyan-400/35 rounded-2xl p-6 flex flex-col justify-between space-y-5 relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-sky-300 px-2.5 py-1 rounded-md bg-sky-500/15 border border-sky-400/30">
                  Step 03
                </span>
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Redeem the Token
              </h3>
              <p className="text-xs text-sky-100/80 leading-relaxed">
                Run <code className="text-cyan-300 font-mono">invariant login</code> to verify your OAuth2 email, then run <code className="text-cyan-300 font-mono">invariant invite redeem</code>. Invariant pins your local WireGuard public key with the control plane and stores your credentials.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#03091E] border border-[#162B54] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-sky-300/60">Terminal</span>
                <button
                  type="button"
                  onClick={() => handleCopy(CLIENT_REDEEM_SNIPPET, 'step-redeem')}
                  className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-emerald-300 transition-colors"
                >
                  {copiedId === 'step-redeem' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedId === 'step-redeem' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
                {CLIENT_REDEEM_SNIPPET}
              </pre>
            </div>
          </div>
        </div>

        {/* What Redemption Configures Callout */}
        <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <Terminal className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-sky-100/80 leading-relaxed">
              <strong className="text-white">Automatic Client Configuration:</strong> Redeeming your token writes your WireGuard-pinned access token to <code className="text-cyan-300 font-mono">~/.invariant/keys/client.token</code> and the control-plane discovery address to <code className="text-cyan-300 font-mono">~/.invariant/keys/client.discovery</code>. All subsequent <code className="text-emerald-300 font-mono">ir</code> and <code className="text-emerald-300 font-mono">invariant</code> commands automatically discover storage, slots, and names services through this connection.
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dedicated Version Control Repository (invariant repository) Interactive Explorer */}
      <section id="repository" className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-emerald-400 mb-2">
              invariant repository · alias ir=&quot;invariant repository&quot;
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Working with Repositories &amp; Code Reviews
            </h2>
          </div>
          <a
            href="https://github.com/chuckjaz/invariant-go/blob/main/docs/Repository.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:text-emerald-300 transition-colors shrink-0"
          >
            <span>docs/Repository.md</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Recommended Shell Alias Callout */}
        <div className="bg-[#07112B] border border-cyan-400/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-white">
              Recommended Shell Alias
            </div>
            <p className="text-xs text-sky-100/80 leading-relaxed">
              Because <code className="text-cyan-300 font-mono">invariant repository</code> is invoked frequently during development and code review, we recommend adding <code className="text-emerald-300 font-mono">alias ir=&quot;invariant repository&quot;</code> to your shell profile (<code className="text-sky-200 font-mono">~/.bashrc</code> or <code className="text-sky-200 font-mono">~/.zshrc</code>). All command examples below use the <code className="text-cyan-300 font-mono">ir</code> alias.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#03091E] border border-[#162B54] rounded-xl px-3.5 py-2 shrink-0 self-start sm:self-center">
            <code className="text-xs font-mono text-emerald-300 whitespace-nowrap">
              alias ir=&quot;invariant repository&quot;
            </code>
            <button
              type="button"
              onClick={() => handleCopy('alias ir="invariant repository"', 'alias-ir')}
              className="text-sky-300/60 hover:text-cyan-300 p-1 transition-colors"
              title="Copy alias command"
            >
              {copiedId === 'alias-ir' ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#07112B] border border-[#162B54] rounded-xl">
          {(
            [
              { id: 'workflow', label: 'Primary Workflow' },
              { id: 'review', label: 'Code Reviews' },
              { id: 'init', label: 'Open & Config' },
              { id: 'branch', label: 'Branch Management' },
              { id: 'workspace', label: 'Workspace & Layers' },
              { id: 'diagnostics', label: 'Diagnostics (blame/grep/bisect)' },
              { id: 'git', label: 'Git Import / Export' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveRepoCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeRepoCategory === tab.id
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filtered Repository Commands Grid */}
        <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredRepoCommands.map((item) => (
              <div
                key={item.cmd}
                className="p-4 rounded-xl bg-[#03091E] border border-[#162B54] flex flex-col justify-between gap-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <code className="text-xs font-mono font-semibold text-cyan-300 break-all">
                      {item.cmd}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.cmd, item.cmd)}
                      className="text-sky-300/60 hover:text-cyan-300 p-1 shrink-0 transition-colors"
                      title="Copy command"
                    >
                      {copiedId === item.cmd ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-sky-100/80 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {item.flags && (
                  <div className="pt-2 border-t border-[#162B54]/70 text-[11px] font-mono text-emerald-300/90">
                    Flags: {item.flags}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Core System Capabilities (Asymmetric Bento Grid) */}
      <section id="capabilities" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8">
          <div className="text-xs font-mono text-cyan-400 mb-2">Core Architecture</div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Five Foundational Subsystems
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 01. Layered File System (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-[#07112B] border border-[#162B54] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-300">
                  01. Layered File System &amp; Multi-Machine Sync
                </span>
                <HardDrive className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Mount via FUSE or Export as a Native NFS Server
              </h3>
              <p className="text-sm text-sky-100/80 leading-relaxed">
                Upload any directory to the storage system and interact with it as a standard POSIX file system across multiple machines with automatic synchronization. Layered directory routing (<code className="text-cyan-300 font-mono">.invariant-layer</code> and <code className="text-cyan-300 font-mono">.invariant-workspace</code>) directs different subdirectories to distinct storage tiers.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-[#162B54] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#03091E] border border-[#162B54]">
                <div className="font-semibold text-cyan-300 mb-1">Persistent Source Layer</div>
                <p className="text-sky-200/70 leading-relaxed">
                  Source code subdirectories are cached locally, replicated across local network storage nodes, and encrypted into cloud storage.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#03091E] border border-[#162B54]">
                <div className="font-semibold text-emerald-300 mb-1">Transient Build Layer</div>
                <p className="text-sky-200/70 leading-relaxed">
                  Compiled artifacts and rebuildable outputs remain strictly on local disk, preventing transient build files from consuming cloud storage quota.
                </p>
              </div>
            </div>
          </div>

          {/* 02. Key-Value Store (Spans 1 column) */}
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-300">
                  02. Key-Value Store
                </span>
                <Database className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Immutable Journal &amp; B-Tree Index
              </h3>
              <p className="text-sm text-sky-100/80 leading-relaxed">
                Built directly on top of the content-addressed storage service to store and retrieve arbitrary structured key-value data with deterministic consistency.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-[#162B54] space-y-2.5 text-xs font-mono text-sky-200/80">
              <div className="flex items-center justify-between py-1.5 border-b border-[#162B54]/60">
                <span className="text-sky-300/60">Write Log</span>
                <span className="text-white">Immutable Journal</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#162B54]/60">
                <span className="text-sky-300/60">Lookup Structure</span>
                <span className="text-cyan-300">Immutable B-Tree Index</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sky-300/60">Read Acceleration</span>
                <span className="text-emerald-300">In-Memory Hot Cache</span>
              </div>
            </div>
          </div>

          {/* 03. Version Control Repository (Full 3-column Span Highlight) */}
          <div className="lg:col-span-3 bg-[#07112B] border border-cyan-400/35 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                  <GitBranch className="h-4 w-4 text-cyan-400" />
                  <span>03. Version Control Repository &amp; Integrated Code Review</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Distributed Version Control Built Natively on CAS &amp; FUSE Workspaces
                </h3>
                <p className="text-sm text-sky-100/80 leading-relaxed">
                  Built directly on top of Invariant&apos;s content-addressable storage, mutable slots, names service, and layered FUSE workspaces. Commits, file trees, and blobs are stored directly in CAS rather than a local <code className="text-cyan-300 font-mono">.git</code> directory, and branches and change sets are mounted as isolated workspaces.
                </p>
              </div>

              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#03091E] border border-[#162B54]">
                  <div className="font-semibold text-cyan-300 mb-1">Isolated Change Workspaces</div>
                  <p className="text-sky-200/70 leading-relaxed">
                    Mount branches and peer change sets instantaneously via FUSE with 3-way merge, interactive rebase, cherry-pick, and sub-repository dependency layers.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#03091E] border border-[#162B54]">
                  <div className="font-semibold text-emerald-300 mb-1">Code Reviews &amp; Git Sync</div>
                  <p className="text-sky-200/70 leading-relaxed">
                    First-class review tokens, inline file/line comments, approval workflows, plus bidirectional <code className="text-cyan-300 font-mono">git import</code> and <code className="text-cyan-300 font-mono">git export</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 04. Automatic Backup & Incremental Recovery */}
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-sky-300">
                  04. Cloud Backup &amp; Recovery
                </span>
                <CloudUpload className="h-5 w-5 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Encrypted at Rest &amp; Incremental Restore
              </h3>
              <p className="text-sm text-sky-100/80 leading-relaxed">
                Automatically compresses and encrypts blocks prior to uploading to AWS S3, Google Cloud Storage, or Azure Blob Storage. If a local storage device fails, blocks recover incrementally from the cloud and cache locally as read.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#162B54] text-xs text-sky-200/70 font-mono">
              Key Policies: Deterministic · RandomPerBlock · RandomAllKey · SuppliedAllKey
            </div>
          </div>

          {/* 05. Dynamic Multi-Device Replication (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-[#07112B] border border-[#162B54] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-300">
                  05. Dynamic Multi-Device Replication
                </span>
                <Network className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Elastic Storage Nodes with Zero-Downtime Rebalancing
              </h3>
              <p className="text-sm text-sky-100/80 leading-relaxed">
                Distribute blocks across multiple physical storage devices to guarantee redundancy and availability. Storage devices can be added or removed arbitrarily—the system automatically redistributes data across remaining nodes or populates newly attached devices to maintain the target replication factor.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-[#162B54] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="text-sky-200/80">
                <strong className="text-white">Fault Tolerance Guarantee:</strong> Zero data loss on hardware failure unless total physical devices drop below the replication factor (or zero loss unconditionally when backed by cloud storage).
              </div>
              <span className="font-mono text-cyan-300 shrink-0">-N 3 · -backup-rate 100</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive CLI Utility & Optional Self-Hosting Reference */}
      <section id="cli" className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 mb-2">CLI Reference &amp; Optional Self-Hosting</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Invariant CLI &amp; Cluster Configuration
            </h2>
          </div>

          {/* Interactive Filter / Tab Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#07112B] border border-[#162B54] rounded-xl">
            <button
              type="button"
              onClick={() => setActiveCodeTab('cli')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeCodeTab === 'cli'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              invariant CLI
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('install')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeCodeTab === 'install'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              go install
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('yaml')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeCodeTab === 'yaml'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              Self-Host: services.yaml
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('docker')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeCodeTab === 'docker'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              Self-Host: Docker
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('exec')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeCodeTab === 'exec'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              Self-Host: Binaries
            </button>
          </div>
        </div>

        {/* Tab 1: CLI Subcommands */}
        {activeCodeTab === 'cli' && (
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#162B54]">
              <div>
                <h3 className="text-sm font-bold text-white">
                  The <code className="text-cyan-300 font-mono">invariant</code> CLI Utility
                </h3>
                <p className="text-xs text-sky-200/70 mt-0.5">
                  Uses credentials from <code className="text-emerald-300 font-mono">~/.invariant/</code> established via <code className="text-cyan-300 font-mono">invariant invite redeem</code> to interact with repositories, layered workspaces, FUSE mounts, and storage slots.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {CLI_SUBCOMMANDS.map((item) => (
                <div
                  key={item.cmd}
                  className="p-4 rounded-xl bg-[#03091E] border border-[#162B54] flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono font-semibold text-cyan-300 break-all">
                      {item.cmd}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.cmd, item.cmd)}
                      className="text-sky-300/60 hover:text-cyan-300 p-1 shrink-0 transition-colors"
                      title="Copy command"
                    >
                      {copiedId === item.cmd ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-sky-200/75 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Installing CLI and Services */}
        {activeCodeTab === 'install' && (
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162B54]">
              <div>
                <h3 className="text-sm font-bold text-white">Installing the Client vs. Full Cluster Binaries</h3>
                <p className="text-xs text-sky-200/70 mt-0.5">
                  To use an existing service, install <code className="text-cyan-300 font-mono">invariant</code>. Install all <code className="text-emerald-300 font-mono">cmd/...</code> binaries only if you are hosting a cluster.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(GO_INSTALL_SNIPPET, 'install')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#03091E] border border-[#162B54] text-xs text-cyan-300 hover:border-cyan-400/50 transition-colors shrink-0"
              >
                {copiedId === 'install' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === 'install' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#03091E] border border-[#162B54] font-mono text-xs text-sky-100 overflow-x-auto leading-relaxed">
              {GO_INSTALL_SNIPPET}
            </pre>
          </div>
        )}

        {/* Tab 3: Executing Individual Services */}
        {activeCodeTab === 'exec' && (
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162B54]">
              <div>
                <h3 className="text-sm font-bold text-white">Self-Hosting: Running Microservices Directly</h3>
                <p className="text-xs text-sky-200/70 mt-0.5">
                  Start individual Go server processes with in-memory, local directory, or S3 storage backends when operating your own cluster.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(SERVICES_EXEC_SNIPPET, 'exec')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#03091E] border border-[#162B54] text-xs text-cyan-300 hover:border-cyan-400/50 transition-colors shrink-0"
              >
                {copiedId === 'exec' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === 'exec' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#03091E] border border-[#162B54] font-mono text-xs text-sky-100 overflow-x-auto leading-relaxed">
              {SERVICES_EXEC_SNIPPET}
            </pre>
          </div>
        )}

        {/* Tab 4: services.yaml */}
        {activeCodeTab === 'yaml' && (
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162B54]">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Self-Hosting: Declarative Cluster Configuration (<code className="text-cyan-300 font-mono">services.yaml</code>)
                </h3>
                <p className="text-xs text-sky-200/70 mt-0.5">
                  Used by cluster administrators to bootstrap and run a local or remote service mesh via <code className="text-emerald-300 font-mono">invariant provision</code> and <code className="text-emerald-300 font-mono">invariant start</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(SERVICES_YAML_SNIPPET, 'yaml')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#03091E] border border-[#162B54] text-xs text-cyan-300 hover:border-cyan-400/50 transition-colors shrink-0"
              >
                {copiedId === 'yaml' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === 'yaml' ? 'Copied' : 'Copy YAML'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#03091E] border border-[#162B54] font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              {SERVICES_YAML_SNIPPET}
            </pre>
          </div>
        )}

        {/* Tab 5: Docker Compose */}
        {activeCodeTab === 'docker' && (
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162B54]">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Self-Hosting: Container Topology (<code className="text-cyan-300 font-mono">docker-compose.yml</code>)
                </h3>
                <p className="text-xs text-sky-200/70 mt-0.5">
                  Build all server binaries to <code className="text-cyan-300 font-mono">bin/</code> using <code className="text-emerald-300 font-mono">./build</code> to deploy a self-hosted cluster with Docker Compose.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(DOCKER_COMPOSE_SNIPPET, 'docker')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#03091E] border border-[#162B54] text-xs text-cyan-300 hover:border-cyan-400/50 transition-colors shrink-0"
              >
                {copiedId === 'docker' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === 'docker' ? 'Copied' : 'Copy Compose'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#03091E] border border-[#162B54] font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
              {DOCKER_COMPOSE_SNIPPET}
            </pre>
          </div>
        )}
      </section>

      {/* 6. Microservices Architecture & Security Boundary */}
      <section id="microservices" className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-emerald-400 mb-2">Under the Hood · Modular Service Mesh</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Composable Microservices &amp; Trust Boundary
            </h2>
          </div>
          <p className="text-xs text-sky-200/70 max-w-md">
            Clients only run <code className="text-cyan-300 font-mono">inv-files</code> locally when mounting FUSE/NFS workspaces, while connecting over WireGuard to remote unprivileged cluster services.
          </p>
        </div>

        {/* Privileged vs Unprivileged Security Callout */}
        <div className="bg-[#07112B] border border-cyan-400/30 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
              <Lock className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">
                Cryptographic Privilege Separation
              </h3>
              <p className="text-xs text-sky-100/80 leading-relaxed max-w-3xl">
                Only <strong className="text-cyan-300">Files</strong> and <strong className="text-cyan-300">KeyValue</strong> are privileged services because they are initialized with the root <code className="text-emerald-300 font-mono">content-link</code> and hold transitive access to block decryption keys. The <strong className="text-cyan-300">Files</strong> service runs exclusively on the client host mounting FUSE or exporting NFS. All remote cluster microservices (<strong className="text-white">Storage, Finder, Distribute, Discovery, Slots, Names</strong>) are unprivileged and never have access to unencrypted data.
              </p>
            </div>
          </div>
        </div>

        {/* High-Density Microservices Table */}
        <div className="bg-[#07112B] border border-[#162B54] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#162B54] bg-[#03091E] text-[11px] font-mono text-sky-300/70">
                  <th className="py-3.5 px-5">Service</th>
                  <th className="py-3.5 px-4">Command</th>
                  <th className="py-3.5 px-4">Security Model</th>
                  <th className="py-3.5 px-5">Responsibility &amp; Protocol Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162B54]/70 text-xs">
                {MICROSERVICES.map((svc) => (
                  <tr
                    key={svc.name}
                    className="hover:bg-[#0B1838]/60 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-semibold text-white whitespace-nowrap">
                      {svc.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-300 whitespace-nowrap">
                      {svc.command}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-mono text-[11px] ${
                          svc.privilege === 'Privileged'
                            ? 'text-amber-300 font-semibold'
                            : 'text-emerald-300'
                        }`}
                      >
                        {svc.privilege}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-sky-100/80 leading-relaxed">
                      <span className="font-medium text-white">{svc.role}: </span>
                      {svc.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
