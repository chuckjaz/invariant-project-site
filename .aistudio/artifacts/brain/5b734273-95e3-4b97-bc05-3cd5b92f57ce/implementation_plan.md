# Invariant Project - Static CLI Identity Authentication Portal

A static-first identity authentication interface for `invariantproject.com`, designed to provide user identification for the `invariant` command-line tool (CLI). The static site can be hosted on any file hosting service or CDN.

## User Review & Critical Decisions

> [!IMPORTANT]
> Key revisions based on your specifications:
> - **CLI-Focused Scope**: Tailored exclusively to software engineers authenticating via the `invariant` command-line tool. All direct references to NAS have been removed from the active interface.
> - **Identification Only, Not Authorization**: The OAuth/OIDC flow is strictly for user identity verification (establishing and confirming user identity). It does not negotiate service permissions or access scopes. Invariant's internal services handle all authorization and downstream token issuance based on this verified identity.
> - **Dual Terminal Handoff**:
>   1. **Automated Loopback**: Dispatches identity confirmation back to `http://localhost:<port>/callback` with state and identity verification code.
>   2. **Headless & Remote Fallback**: For SSH sessions, Docker containers, or environments where localhost callback is unreachable, displays a copyable one-time verification code with clear terminal instructions (`invariant auth verify <code>`).
> - **Static File Hosting**: Built entirely with static web technologies (HTML, CSS, JS) with zero dynamic server requirements on `invariantproject.com`. Hostable on AWS S3, Cloudflare Pages, Netlify, or GitHub Pages.

---

## 1. Overview & Core Concept

- **What It Does**: Provides the browser-based identity sign-in screen for the `invariant` CLI. When an engineer executes `invariant login`, the CLI launches this static page with OAuth/OIDC parameters (`client_id`, `redirect_uri`, `state`, `nonce`). Once the engineer signs in (via Email/Password, Google SSO, or GitHub SSO), the page issues an identity verification assertion back to the CLI.
- **Target Audience / Persona**: Software engineers configuring and using the `invariant` command-line tool across local workstations, remote dev environments, and CI/CD pipelines.
- **Key Value**: Simple, dependable identity confirmation without server overhead on `invariantproject.com`. Decouples user identity from service-level authorizations, allowing Invariant's backend to independently manage all permissions.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **CLI Invocation (`invariant login`)**:
   - The engineer runs `invariant login` in their terminal.
   - The CLI opens `https://invariantproject.com/login?client_id=invariant-cli&redirect_uri=http://localhost:8085/callback&state=...&nonce=...` in the default browser.
2. **Identity Authentication**:
   - The engineer is presented with a clean Invariant identity portal: "Sign in to verify your Invariant identity for the command-line tool."
   - Supports Email & Password sign-in, account creation, and one-click Google and GitHub SSO.
   - Validation ensures email formatting and password requirements are verified client-side.
3. **Identity Verification & Terminal Handoff**:
   - **Local Loopback Mode**: If `redirect_uri` is a localhost address, the page communicates the verification code and state to the local CLI listener, transitioning to a clean "Identity Verified. You may now return to your terminal." screen.
   - **Manual Verification Code Mode**: If loopback fails or no redirect URI is passed, the screen presents a high-contrast copyable verification code with one-click copy and terminal instructions: `invariant auth verify <code>`.
4. **Developer & Testing Sandbox**:
   - A built-in testing toolbar lets software engineers simulate CLI invocations directly in the browser (testing different loopback ports, inspecting identity tokens, and validating manual code flows).

### Visual Identity & Theme

- **Aesthetic Direction**: High-tech developer console aesthetic with deep obsidian slate tones, subtle hairline dividers, and indigo/cyan highlights.
- **Color Palette**:
  - Dominant Canvas (60%): `#0B0F17` (Deep Obsidian Slate)
  - Structural Surfaces (30%): `#111827` (Card backdrop), `#1F2937` (Borders & dividers), `#94A3B8` (Instructional text)
  - Accent Budget (10%): `#4F46E5` (Indigo Primary Button), `#06B6D4` (Cyan Focus rings & code highlights)
- **Typography & Scale**:
  - Headings: Modern geometric sans with balanced headlines (`text-wrap: balance`).
  - Body & Form Controls: Clean readable sans at 14px–15px.
  - Verification Codes & Terminal Snippets: Monospace with tabular numerals (`tabular-nums font-mono`).
- **Anti-Slop Discipline**:
  - No fake comment headers (`// 01 LOGIN`), no decorative green pulsing dots, no pill badge sandwiches.
  - Clean typographic hierarchy and straightforward human-readable status copy.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Strict Identity Verification Boundary**
  - *Chosen Approach*: The verification response conveys user identity claims (user ID, verified email, username, avatar, provider, timestamp). It explicitly excludes service-level resource scopes or permission grants.
  - *Why*: Invariant itself governs authorization. Decoupling authentication (identity) from authorization ensures maximum security and architecture flexibility.

- **Decision 2: Dual Localhost Loopback & Manual Code Entry**
  - *Chosen Approach*: Automatic localhost loopback response with graceful fallback to a copyable verification code.
  - *Why*: Software engineers frequently use remote development environments (SSH, GitHub Codespaces, Docker containers) where localhost port forwarding may not be configured.

- **Decision 3: Zero-Backend Static Architecture**
  - *Chosen Approach*: Client-side cryptographic token generation and state management using the Web Crypto API.
  - *Why*: Allows hosting the entire portal as static files on any CDN or file hosting service with zero server maintenance.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Software Engineer Terminal                   │
│                 Command: `invariant auth login`                 │
└───────────────┬─────────────────────────────────▲───────────────┘
                │ 1. Launches browser with        │ 5. Transmits identity
                │    client_id, redirect_uri,     │    via loopback or
                │    state, nonce                 │    copyable code
                ▼                                 │
┌─────────────────────────────────────────────────┴───────────────┐
│         Static Hosting (invariantproject.com CDN)               │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     App.tsx (Root)                        │  │
│  │   - Query Parameter Parser (client_id, redirect_uri, ...) │  │
│  │   - Identity Authentication State Manager                 │  │
│  └────────────┬───────────────────────────────┬──────────────┘  │
│               │                               │                 │
│  ┌────────────▼──────────────┐  ┌─────────────▼──────────────┐  │
│  │       IdentityAuthCard    │  │     IdentityVerifiedCard   │  │
│  │ - Email & Password Form   │  │ - Localhost loopback POST  │  │
│  │ - Google & GitHub SSO     │  │ - One-click code copy      │  │
│  │ - Registration & Recovery │  │ - Terminal instructions    │  │
│  └───────────────────────────┘  └────────────────────────────┘  │
│                               │                                 │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │               CliSimulator & Inspector                    │  │
│  │  - Test loopback ports and CLI query parameters           │  │
│  │  - Inspect generated Identity Assertion payload          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
                        ┌─────────────────────────────────────────┐
                        │        Invariant Core Services          │
                        │ (Handles all authorization, permissions │
                        │  and access tokens for verified user)   │
                        └─────────────────────────────────────────┘
```

### Component & State Mapping

- `useIdentityParams`:
  - Parses standard OAuth 2.0 / OpenID Connect request parameters: `client_id`, `redirect_uri`, `state`, `nonce`, `response_type`.
- `IdentityAuthCard`:
  - Handles Email/Password sign-in, account creation, and Google / GitHub SSO.
  - Form validation with clear error messaging.
- `IdentityVerifiedCard`:
  - Dispatches verification result to `redirect_uri` via redirect or fetch when localhost is present.
  - Displays high-contrast copyable verification code with one-click copy and terminal instructions (`invariant auth verify <code>`).
- `CliSimulator`:
  - Interactive testing drawer allowing engineers to simulate different CLI parameters, test loopback listener ports, and inspect identity payloads.
