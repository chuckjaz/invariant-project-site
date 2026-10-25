# Invariant Project · Static Home Page

A static site for `invariantproject.com`, presenting the architecture and `invariant` CLI documentation for `invariant-go`.

## Overview

- **Informational Home Page (`/`)**: Documents the Invariant distributed content-addressed storage architecture, layered FUSE/NFS file systems, immutable B-Tree key-value store, `invariant repository` CAS version control and code review workflows, and `inv-*` microservices.
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
   - If using a custom domain (such as `invariantproject.com`):
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
