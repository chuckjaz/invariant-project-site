import React, { useState } from 'react';
import {
  Terminal,
  HardDrive,
  Database,
  CloudUpload,
  Network,
  Lock,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface HomePageProps {
  logoUrl: string;
}

interface MicroserviceSpec {
  name: string;
  privilege: 'Unprivileged' | 'Privileged';
  role: string;
  description: string;
  binary: string;
}

const MICROSERVICES: MicroserviceSpec[] = [
  {
    name: 'Storage',
    privilege: 'Unprivileged',
    role: 'Content-Addressed Block Store',
    description:
      'Primary service used to store and retrieve arbitrary blobs of data by cryptographic content address. Supports in-memory storage, persistent nested local filesystem blocks, or AWS S3 backends.',
    binary: './cmd/storage',
  },
  {
    name: 'Distribute',
    privilege: 'Unprivileged',
    role: 'Replication & Backup Coordinator',
    description:
      'Coordinates block replication across storage nodes with configurable replication factor (-N), handles Notify protocol events, and manages rate-limited backup destinations (MB/hour).',
    binary: './cmd/distribute',
  },
  {
    name: 'Finder',
    privilege: 'Unprivileged',
    role: 'Kademlia DHT Routing',
    description:
      'Locates content blocks distributed across multiple physical or cloud storage devices using Kademlia routing logic over the Peer protocol.',
    binary: './cmd/finder',
  },
  {
    name: 'Discovery',
    privilege: 'Unprivileged',
    role: 'Service Registry & Delegation',
    description:
      'Provides service detection, registration, and upstream delegation across local and distributed cluster topologies.',
    binary: './cmd/discovery',
  },
  {
    name: 'Slots',
    privilege: 'Unprivileged',
    role: 'Mutable Root Pointers',
    description:
      'Allocates and manages updateable slots that maintain the current root address of a file system or key-value journal. Supports Ed25519 256-bit cryptographic protection.',
    binary: './cmd/slots',
  },
  {
    name: 'Names',
    privilege: 'Unprivileged',
    role: 'Logical Naming & Local DNS',
    description:
      'Binds human-readable logical names to 64-character hex IDs (such as mapping device IDs or mutable slot IDs to service names) with optional DNS and upstream delegation.',
    binary: './cmd/names',
  },
  {
    name: 'Files',
    privilege: 'Privileged',
    role: 'FUSE Mount & Native NFS Backing',
    description:
      'Backing service for the FUSE file system and native NFS server. Initialized with the root content-link and transitive decryption keys; runs strictly on the mounting host.',
    binary: './cmd/invariant (mount / nfs)',
  },
  {
    name: 'KeyValue',
    privilege: 'Privileged',
    role: 'Immutable Journal & B-Tree Store',
    description:
      'Provides structured key-value storage backed by an immutable journal, immutable B-Tree index, and in-memory cache. Initialized with the root content-link.',
    binary: './cmd/kv',
  },
];

const CLI_SUBCOMMANDS = [
  {
    cmd: 'invariant start services.yaml',
    summary: 'Start and orchestrate local microservice clusters defined in a YAML configuration file.',
  },
  {
    cmd: 'invariant slot --protected',
    summary:
      'Allocate a mutable slot from the slots service. With --protected, generates a 256-bit Ed25519 key pair using the 32-byte public key as the slot ID and stores the private key in ~/.invariant/keys/.',
  },
  {
    cmd: 'invariant name <logical_name> <id>',
    summary: 'Register a human-readable logical name to a 64-character slot or device ID.',
  },
  {
    cmd: 'invariant lookup <logical_name>',
    summary: 'Resolve a registered logical name to its corresponding 64-character ID or network address.',
  },
  {
    cmd: 'invariant upload <dir> --slot <name> --compress --encrypt',
    summary:
      'Upload a local directory as a content-addressed file tree preserving ctime/mtime and splitting zip archives. Supports --key-policy (Deterministic, RandomPerBlock, RandomAllKey, SuppliedAllKey), --prev, --dry-run, and --stats.',
  },
  {
    cmd: 'invariant mount <dir> --compress --encrypt',
    summary:
      'Mount the Invariant file system locally via FUSE with dynamic .invariant-layer reloading, name resolution, read/write disk caching, and dirty directory merging.',
  },
  {
    cmd: 'invariant nfs --listen :2049 --compress --encrypt',
    summary:
      'Export the Invariant file system as a completely native NFS server without kernel FUSE dependencies.',
  },
  {
    cmd: 'invariant workspace create | mount | unmount | pull',
    summary:
      'Manage layered workspaces (.invariant-workspace / .invariant-layer) separating persistent core network files from transient local build directories with ~/.cache/invariant caching and offline overflow.',
  },
  {
    cmd: 'invariant print -s <slot_or_content_link>/path/to/file',
    summary:
      'Stream a block or subpath traversal directly to standard output from a ContentLink JSON or mutable slot.',
  },
];

const SERVICES_EXEC_SNIPPET = `# Discovery Service (default port 3003)
go run ./cmd/discovery -port 3003
go run ./cmd/discovery -port 3003 -upstream http://upstream:3003

# Names Service (in-memory or persistent journal)
go run ./cmd/names -port 3005 -dir /tmp/names -discovery http://localhost:3003

# Storage Service (in-memory, local blocks, or AWS S3 backend)
go run ./cmd/storage -port 3000 -s3-bucket my-bucket -s3-prefix invariant-blocks/
go run ./cmd/storage -port 3000 -dir /tmp/blocks -discovery http://localhost:3003 -distribute distribute-1 -notify notify-service-id

# Distribute Service (replication factor N=3 & rate-limited backup MB/hr)
go run ./cmd/distribute -port 3001 -N 3 -discovery http://localhost:3003 -name distribute-1
go run ./cmd/distribute -port 3001 -destination backup-storage-id -backup-rate 100

# Finder Service (Kademlia routing) & Slots Service
go run ./cmd/finder -port 3002 -discovery http://localhost:3003
go run ./cmd/slots -port 3004 -discovery http://localhost:3003 -notify notify-service-id`;

const SERVICES_YAML_SNIPPET = `common:
  discovery:
    discovery: "http://localhost:3003"
    advertise: "http://localhost"
  distribute:
    distribute: "distribute-1"

services:
  - command: discovery
    args:
      port: 3003
  - command: names
    use: [discovery]
    args:
      dir: "*/names"
  - command: distribute
    use: [discovery]
    args:
      name: "distribute-1"
  - command: storage
    use: [discovery, distribute]
    args:
      dir: "*/storage-1"
      notify: "distribute-1"
  - command: storage
    use: [discovery, distribute]
    args:
      dir: "*/storage-2"
      notify: "distribute-1"`;

const DOCKER_COMPOSE_SNIPPET = `version: '3.8'

services:
  discovery:
    build: .
    command: ["./bin/discovery", "-port", "3003"]
    ports:
      - "3003:3003"

  names:
    build: .
    command: ["./bin/names", "-port", "3005", "-dir", "/data/names", "-discovery", "http://discovery:3003", "-advertise", "http://0.0.0.0"]
    volumes:
      - ./data/names:/data/names
    depends_on:
      - discovery

  distribute:
    build: .
    command: ["./bin/distribute", "-port", "3001", "-name", "distribute-1", "-discovery", "http://discovery:3003", "-advertise", "http://0.0.0.0"]
    depends_on:
      - discovery

  storage-1:
    build: .
    command: ["./bin/storage", "-port", "3000", "-dir", "/data/storage-1", "-discovery", "http://discovery:3003", "-advertise", "http://0.0.0.0", "-distribute", "distribute-1", "-notify", "distribute-1"]
    volumes:
      - ./data/storage-1:/data/storage-1
    depends_on:
      - discovery
      - distribute

  storage-2:
    build: .
    command: ["./bin/storage", "-port", "3002", "-dir", "/data/storage-2", "-discovery", "http://discovery:3003", "-advertise", "http://0.0.0.0", "-distribute", "distribute-1", "-notify", "distribute-1"]
    volumes:
      - ./data/storage-2:/data/storage-2
    depends_on:
      - discovery
      - distribute`;

export const HomePage: React.FC<HomePageProps> = ({ logoUrl }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'cli' | 'exec' | 'yaml' | 'docker'>('cli');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-20 pb-12">
      {/* 1. Hero Section */}
      <section id="overview" className="pt-6 sm:pt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Core Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <span>Content-Addressed Distributed Storage</span>
                <span aria-hidden="true" className="text-[#162B54]">·</span>
                <span>FUSE &amp; Native NFS</span>
                <span aria-hidden="true" className="text-[#162B54]">·</span>
                <span>Ed25519 Slots</span>
              </div>

              <h1
                className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Content-Addressing Storage &amp; Layered File System
              </h1>

              <p className="text-base text-sky-100/80 leading-relaxed max-w-2xl">
                The Invariant Project is a distributed, content-addressing storage architecture for arbitrary data. Upload directories, retrieve immutable trees via cryptographic content links, and mount live volumes across workstations via FUSE or native NFS.
              </p>

              {/* Primary & Secondary Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="https://github.com/chuckjaz/invariant-go"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] text-sm font-bold shadow-lg shadow-cyan-500/15 hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
                >
                  <span>View invariant-go on GitHub</span>
                  <ExternalLink className="h-4 w-4" />
                </a>

                <a
                  href="#cli"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('cli')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#07112B] hover:bg-[#0B1838] border border-[#162B54] hover:border-cyan-400/50 text-sky-100 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <span>Explore CLI &amp; Cluster Config</span>
                </a>
              </div>

              {/* Technical Highlights Strip */}
              <div className="pt-4 border-t border-[#162B54]/80 grid grid-cols-3 gap-6 text-xs">
                <div>
                  <div className="font-mono font-semibold text-cyan-300 tabular-nums">8 Microservices</div>
                  <div className="text-sky-200/60 mt-0.5">Independently replaceable</div>
                </div>
                <div>
                  <div className="font-mono font-semibold text-emerald-300 tabular-nums">Ed25519 / 256-bit</div>
                  <div className="text-sky-200/60 mt-0.5">Protected mutable slots</div>
                </div>
                <div>
                  <div className="font-mono font-semibold text-sky-300 tabular-nums">FUSE &amp; NFS :2049</div>
                  <div className="text-sky-200/60 mt-0.5">Multi-host live sync</div>
                </div>
              </div>
            </div>

            {/* Right Column: Brand Emblem & Quick Architecture Card */}
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
                        className="h-48 w-48 sm:h-56 sm:w-56 rounded-xl object-contain mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="h-40 w-40 rounded-2xl bg-[#03091E] border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono text-2xl font-bold mb-5">
                      iP
                    </div>
                  )}

                  <div className="w-full rounded-xl bg-[#03091E] border border-[#162B54] p-4 text-left font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-sky-300/60 border-b border-[#162B54] pb-2">
                      <span>Quick Start · Local Cluster</span>
                      <span className="text-emerald-400">~/.invariant/config.yaml</span>
                    </div>
                    <div className="text-sky-100 space-y-1 text-[11px]">
                      <div>
                        <span className="text-cyan-400">$</span> ./build
                      </div>
                      <div>
                        <span className="text-cyan-400">$</span> go run ./cmd/invariant start services.yaml
                      </div>
                      <div>
                        <span className="text-cyan-400">$</span> invariant upload ./project --slot main-workspace --compress --encrypt
                      </div>
                      <div>
                        <span className="text-cyan-400">$</span> invariant mount /mnt/project
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core System Capabilities (Asymmetric Bento Grid) */}
      <section id="capabilities" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8">
          <div className="text-xs font-mono text-cyan-400 mb-2">Core Architecture</div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Designed for Resilient Distributed Storage
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

          {/* 03. Automatic Backup & Incremental Recovery */}
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-sky-300">
                  03. Cloud Backup &amp; Recovery
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

          {/* 04. Dynamic Multi-Device Replication (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-[#07112B] border border-[#162B54] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-300">
                  04. Dynamic Multi-Device Replication
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

      {/* 3. Microservices Architecture & Security Boundary */}
      <section id="microservices" className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-emerald-400 mb-2">Modular Service Mesh</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Composable Microservices &amp; Trust Boundary
            </h2>
          </div>
          <p className="text-xs text-sky-200/70 max-w-md">
            Services run independently or together and support dynamic port binding (<code className="text-cyan-300 font-mono">-port 0</code>) to avoid port collisions.
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
                Only <strong className="text-cyan-300">Files</strong> and <strong className="text-cyan-300">KeyValue</strong> are privileged services because they are initialized with the root <code className="text-emerald-300 font-mono">content-link</code> and hold transitive access to block decryption keys. The <strong className="text-cyan-300">Files</strong> service runs exclusively on the host mounting FUSE or exporting NFS. All other microservices (<strong className="text-white">Storage, Finder, Distribute, Discovery, Slots, Names</strong>) are unprivileged and never have access to unencrypted data.
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
                      <div>{svc.name}</div>
                      <div className="text-[11px] font-mono text-sky-300/50 font-normal mt-0.5">
                        {svc.binary}
                      </div>
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

      {/* 4. Interactive CLI Utility & Cluster Configuration Reference */}
      <section id="cli" className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 mb-2">Command-Line Orchestration</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Invariant CLI &amp; Cluster Deployment
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
              onClick={() => setActiveCodeTab('exec')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeCodeTab === 'exec'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-[#03091E] font-semibold'
                  : 'text-sky-200/70 hover:text-white'
              }`}
            >
              Executing Services
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
              services.yaml
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
              Docker Compose
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
                  Reads global configuration from <code className="text-emerald-300 font-mono">~/.invariant/config.yaml</code> and orchestrates cluster storage, slots, mounts, and layered workspaces.
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

        {/* Tab 2: Executing Individual Services */}
        {activeCodeTab === 'exec' && (
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162B54]">
              <div>
                <h3 className="text-sm font-bold text-white">Running Microservices Directly</h3>
                <p className="text-xs text-sky-200/70 mt-0.5">
                  Start individual Go services with in-memory, local directory, or S3 storage backends.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(SERVICES_EXEC_SNIPPET, 'exec')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#03091E] border border-[#162B54] text-xs text-cyan-300 hover:border-cyan-400/50 transition-colors"
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

        {/* Tab 3: services.yaml */}
        {activeCodeTab === 'yaml' && (
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162B54]">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Declarative Cluster Configuration (<code className="text-cyan-300 font-mono">services.yaml</code>)
                </h3>
                <p className="text-xs text-sky-200/70 mt-0.5">
                  Supports an <code className="text-emerald-300 font-mono">environment</code> map with <code className="text-emerald-300 font-mono">$key:&lt;filename&gt;</code> substitution from <code className="text-emerald-300 font-mono">~/.invariant/keys/</code> so secrets never appear in config files.
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

        {/* Tab 4: Docker Compose */}
        {activeCodeTab === 'docker' && (
          <div className="bg-[#07112B] border border-[#162B54] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162B54]">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Production Container Topology (<code className="text-cyan-300 font-mono">docker-compose.yml</code>)
                </h3>
                <p className="text-xs text-sky-200/70 mt-0.5">
                  Build all binaries to <code className="text-cyan-300 font-mono">bin/</code> using <code className="text-emerald-300 font-mono">./build</code> and verify with <code className="text-emerald-300 font-mono">go test -v ./...</code>.
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
    </div>
  );
};
