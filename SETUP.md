# Playwright E2E Setup Instructions

This document explains how to set up and run the Playwright E2E tests locally.

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm (or pnpm/yarn/bun)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Demo web application server
- `@playwright/test` - Playwright testing framework

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

Or install all browsers:
```bash
npx playwright install
```

### 3. Create Symlinks (Optional)

To make the skill available in `.codex/skills/` and `.github/skills/`:

```bash
chmod +x .claude/skills/playwright-e2e/scripts/setup-symlinks.sh
./.claude/skills/playwright-e2e/scripts/setup-symlinks.sh
```

Or manually:
```bash
ln -s ../../.claude/skills/playwright-e2e .codex/skills/playwright-e2e
ln -s ../../.claude/skills/playwright-e2e .github/skills/playwright-e2e
```

### 4. Make Scripts Executable (Unix/Linux/macOS)

```bash
chmod +x .claude/skills/playwright-e2e/scripts/*.sh
```

## Running Tests

### Quick Start

```bash
# Run all E2E tests (starts app automatically)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run with visible browser
npm run test:e2e:headed
```

### Manual Testing

Start the demo app manually:
```bash
npm run dev
# or
node demo-app/server.js
```

Access at: http://localhost:3000

Then run tests in another terminal:
```bash
npx playwright test
```

## Environment Variables

Optional configuration:

```bash
# Base URL (default: http://localhost:3000)
export E2E_BASE_URL=http://localhost:3000

# Test credentials (default: demo/password123)
export E2E_USER=demo
export E2E_PASS=password123

# Port for demo app (default: 3000)
export PORT=3000
```

## CI/CD

### GitHub Actions Workflow

⚠️ **Note**: The workflow file `.github/workflows/e2e.yml` exists locally but could not be committed due to GitHub App permissions. You need to add it manually.

**Option 1: Create the workflow file manually**

Create `.github/workflows/e2e.yml` with this content:

```yaml
name: E2E Tests

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  e2e:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install chromium --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          E2E_BASE_URL: http://localhost:3000
          # Uncomment and configure secrets if auth tests require them:
          # E2E_USER: ${{ secrets.E2E_USER }}
          # E2E_PASS: ${{ secrets.E2E_PASS }}

      - name: Upload test results on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: |
            .artifacts/test-results/
            playwright-report/
          retention-days: 7

      - name: Upload trace files on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces
          path: .artifacts/test-results/**/*.zip
          retention-days: 7
```

**Option 2: Use the local file**

The workflow file exists locally at `.github/workflows/e2e.yml`. You can commit it separately:

```bash
git add .github/workflows/e2e.yml
git commit -m "ci: Add E2E tests workflow"
git push
```

### What the Workflow Does

- Runs on pull requests and pushes to main branch
- Installs dependencies and Playwright browsers
- Executes E2E tests with CI-optimized settings
- Uploads test artifacts (reports, traces) on failure for debugging

## Troubleshooting

### Command not found: playwright

Install Playwright browsers:
```bash
npx playwright install chromium --with-deps
```

### Port 3000 already in use

Change the port:
```bash
export PORT=3001
npm run test:e2e
```

### Tests fail with "Element not found"

Use debug mode to inspect:
```bash
npm run test:e2e:debug
```

### Permission denied on scripts

Make scripts executable:
```bash
chmod +x .claude/skills/playwright-e2e/scripts/*.sh
```

## Documentation

- [E2E Test Documentation](./e2e/README.md)
- [Playwright E2E Skill](/.claude/skills/playwright-e2e/SKILL.md)
- [Reference Playbook](/.claude/skills/playwright-e2e/reference.md)
- [Test Examples](/.claude/skills/playwright-e2e/examples.md)

## Demo App

The demo application includes:
- Home page with navigation
- Login/logout authentication flow
- Protected dashboard
- About page
- Health check endpoint

**Test credentials**: `demo` / `password123`

All pages use `data-testid` attributes for stable test selectors.
