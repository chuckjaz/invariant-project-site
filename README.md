# Invariant Project · Static CLI Identity Portal

A static-first OAuth identity verification interface for `invariantproject.com`, designed to authenticate developer identity for the `invariant` command-line tool (CLI).

## Overview

- **OAuth2 Identity Verification & Invitation Binding**: Confirms user identity (OpenID Connect / UserInfo email verification) via OAuth2 identity providers (Google and GitHub). When redeeming a single-use user invitation (`inv_invite_<hex>@itp://tc1...`) via `invariant invite redeem`, `invariant` validates the user's OAuth2 credentials, verifies that the authenticated OAuth2 email matches the email bound to the invitation, and exchanges the invitation and WireGuard node public key with the control plane (`inv-discovery`) for a WireGuard-pinned access token (`inv_at_...`).
- **RFC 8252 Native App Support**:
  - **Automated Localhost Loopback**: Returns authorization credentials to the local terminal listener (e.g. `http://127.0.0.1:8085/callback`).
  - **Manual / Headless Mode**: Displays a copyable token and `invariant login` / `invariant invite redeem` command for remote SSH, Docker container, or headless terminal sessions.
- **100% Static Deployment**: Requires zero backend server runtime. The compiled bundle consists exclusively of static HTML, CSS, and JavaScript files hostable on any static CDN or file hosting platform.

---

## Deployment on GitHub Pages

You can deploy this site to GitHub Pages using either an automated GitHub Actions workflow or a manual branch push.

### Method 1: Automated Deployment with GitHub Actions (Recommended)

1. **Enable GitHub Actions for Pages**:
   - In your repository, navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.

2. **Add the Workflow File**:
   - Create a file at `.github/workflows/deploy.yml` in your repository with the following contents:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. **Configure Custom Domain (`invariantproject.com`)**:
   - If using a custom domain (such as `invariantproject.com` or `auth.invariantproject.com`):
     - In **Settings** > **Pages** > **Custom domain**, enter your domain name.
     - Add a `CNAME` file in the `public/` directory (or add it directly to `dist/` before deployment) containing:
       ```
       invariantproject.com
       ```
     - Configure your DNS provider:
       - For an apex domain (`invariantproject.com`): Add `A` records pointing to GitHub's IPs:
         ```
         185.199.108.153
         185.199.109.153
         185.199.110.153
         185.199.111.153
         ```
       - For a subdomain (`auth.invariantproject.com`): Add a `CNAME` record pointing to `<your-github-username>.github.io`.
     - Check **Enforce HTTPS** in repository settings once DNS propagates.

---

### Method 2: Subpath Hosting without Custom Domain

If hosting at `https://<username>.github.io/<repository-name>/` instead of a custom root domain:

1. Update `vite.config.ts` to include the base path:
   ```ts
   export default defineConfig({
     base: '/<repository-name>/',
     // ... rest of config
   });
   ```
2. Build and deploy:
   ```bash
   npm run build
   ```

---

## Local Development & Testing

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run static production build
npm run build

# Preview static production build locally
npm run preview
```

---

## CLI & Service Installation

Install the `invariant` CLI and the `inv-*` microservices (`inv-discovery`, `inv-names`, `inv-slots`, `inv-storage`, `inv-finder`, `inv-distribute`, `inv-kv`, `inv-files`) using `go install`:

```bash
# Install the CLI and all microservices at once
go install github.com/chuckjaz/invariant-go/cmd/...@latest

# Provision control-plane and service tokens (auto-installing any missing inv-* commands)
invariant provision --install services.yaml

# Start all configured services
invariant start services.yaml
```

---

## CLI Integration Protocol

The `invariant login` command initiates the OAuth2 flow by launching the user's browser with standard OAuth 2.0 / OIDC parameters:

```bash
https://invariantproject.com/?client_id=invariant-cli&redirect_uri=http://127.0.0.1:8085/callback&state=<RANDOM_STATE>&nonce=<RANDOM_NONCE>&response_type=code
```

When redeeming a single-use control-plane invitation created with `invariant invite create --role user --name <name> --email <email>`, the user runs:

```bash
invariant invite redeem "inv_invite_<hex>@itp://tc1<discovery-nodekey>:3003"
```

`invariant invite redeem` validates the user's OAuth2 credentials against the OAuth2 UserInfo endpoint, verifies that the authenticated email matches the invitation email, and redeems the invitation against the embedded control plane (`itp://tc1...`) to store a WireGuard-pinned access token in `~/.invariant/keys/client.token` and control plane address in `~/.invariant/keys/client.discovery`.

### Parameter Reference

| Parameter | Required | Description |
| :--- | :--- | :--- |
| `client_id` | Yes | Identifier for the client (default: `invariant-cli`). |
| `redirect_uri` | Optional | Loopback address (e.g. `http://127.0.0.1:8085/callback`). If omitted, headless manual copy mode is engaged. |
| `state` | Recommended | Anti-CSRF token verified by the CLI upon receiving callback. |
| `nonce` | Optional | Replay-protection token embedded into the identity assertion payload. |
| `response_type` | Yes | Defaults to `code`. |

### Callback Execution

- **Loopback Mode**: When `redirect_uri` points to `localhost` or `127.0.0.1`, the page notifies the local listener:
  ```
  GET http://127.0.0.1:8085/callback?code=inv_id_...&state=...
  ```
- **Headless Mode**: When running in remote SSH or containerized terminals, the page provides the verification token and the terminal command:
  ```bash
  invariant login --token inv_id_...
  invariant invite redeem "inv_invite_<hex>@itp://..." --token inv_id_...
  ```
