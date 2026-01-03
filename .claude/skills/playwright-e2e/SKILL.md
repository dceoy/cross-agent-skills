---
name: playwright-e2e
description: Create and maintain E2E tests using Playwright Test runner (deterministic CI) and Playwright MCP (LLM-driven browser exploration + selector discovery + interactive triage). Use when user asks to add e2e tests, create Playwright tests, smoke test, fix flaky e2e, regression tests, verify quickly, reproduce bug in UI, or check staging.
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, WebFetch
---

# Playwright E2E Testing Skill

Enables reliable end-to-end testing using Playwright Test runner for CI and Playwright MCP for LLM-assisted browser exploration, selector discovery, and interactive debugging.

## When to Use

**Test Creation/Maintenance**:
- User asks to "add e2e tests", "create Playwright tests"
- User requests "smoke test", "regression test"
- User reports "flaky e2e" or test instability issues
- User wants to improve test reliability

**Interactive Exploration**:
- User asks to "verify quickly", "check staging"
- User wants to "reproduce bug in UI"
- User needs to validate critical flows manually

## Prerequisites

### Required Tools

1. **Playwright Test** - For deterministic CI testing
```bash
npm install -D @playwright/test
npx playwright install  # Install browsers
```

2. **Playwright MCP** (Optional but recommended) - For LLM-assisted exploration
```bash
# Project-scoped (recommended - see .mcp.json)
npx @playwright/mcp@latest

# Or user-scoped install:
claude mcp add playwright npx @playwright/mcp@latest
```

3. **Node.js** - v18 or higher recommended

## Execution Workflow

### Phase 1: Repository Reconnaissance

Before creating or modifying tests, analyze the project:

1. **Detect framework and structure**:
   ```bash
   # Check package.json for framework
   cat package.json | grep -E "(react|vue|angular|svelte|express|next)"

   # Find existing tests
   find . -name "*.spec.*" -o -name "*.test.*" | grep -E "(e2e|test)"

   # Check for existing Playwright config
   ls playwright.config.*
   ```

2. **Identify dev server setup**:
   ```bash
   # Check package.json scripts
   cat package.json | grep -A5 '"scripts"'

   # Common dev commands: dev, start, serve
   # Common ports: 3000, 5173, 8080, 4200
   ```

3. **Check for authentication**:
   - Look for login pages, auth routes, session management
   - Identify if env vars are used for test credentials
   - Check for existing auth fixtures or helpers

4. **Review existing conventions**:
   - Test naming patterns
   - Selector strategies (data-testid, role, text)
   - Directory structure

### Phase 2: Ensure Playwright Test Harness

If Playwright isn't set up, initialize it:

1. **Install dependencies**:
```bash
npm install -D @playwright/test
npx playwright install chromium  # Or all browsers
```

2. **Create playwright.config.js** (if missing):
```javascript
import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',  // Adjust to project's dev command
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  outputDir: '.artifacts/test-results',
});
```

3. **Add package.json scripts**:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### Phase 3: Use Playwright MCP for Exploration

**When .mcp.json is configured** (project-scoped MCP):

1. **Explore the app interactively**:
   - Ask MCP to navigate to critical pages
   - Identify robust selectors (prefer role, label, text, data-testid)
   - Confirm user flows work as expected
   - Discover where data-testid attributes are missing

2. **Example MCP exploration prompts**:
   ```
   "Navigate to the home page and click the login button"
   "Find all form inputs on the registration page"
   "What's the best selector for the submit button?"
   "Navigate through the checkout flow and list all steps"
   ```

3. **Document findings**:
   - Critical user journeys identified
   - Selectors discovered (with stability assessment)
   - Missing data-testid attributes to add
   - Potential flakiness points (animations, async ops)

**When data-testid is missing**:
- Propose minimal additions to HTML:
  ```html
  <!-- Before -->
  <button class="btn-primary">Submit</button>

  <!-- After -->
  <button class="btn-primary" data-testid="submit-button">Submit</button>
  ```

### Phase 4: Generate/Maintain Playwright Test Code

Create deterministic, CI-friendly tests:

1. **Follow best practices**:
   - ✅ Use Playwright's auto-waiting (no arbitrary sleeps)
   - ✅ Prefer stable selectors: `getByRole`, `getByLabel`, `getByTestId`
   - ✅ Use `expect` assertions with built-in retries
   - ✅ Keep tests independent (no shared state)
   - ✅ Handle async operations properly

2. **Avoid anti-patterns**:
   - ❌ No `page.waitForTimeout(5000)` - use explicit waits
   - ❌ No CSS selectors unless unavoidable
   - ❌ No test interdependencies
   - ❌ No hardcoded waits for animations

3. **Example test structure**:
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should accomplish specific goal', async ({ page }) => {
    // Navigate
    await page.goto('/path');

    // Interact using stable selectors
    await page.getByTestId('input-field').fill('value');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Assert with auto-retry
    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page).toHaveURL(/\/success/);
  });
});
```

4. **Create reusable helpers** (in `e2e/utils/` or `e2e/fixtures/`):
```javascript
// e2e/utils/login-helper.js
export async function login(page, username, password) {
  await page.goto('/login');
  await page.getByTestId('username-input').fill(username);
  await page.getByTestId('password-input').fill(password);
  await page.getByTestId('login-button').click();
  await page.waitForURL('/dashboard');
}
```

### Phase 5: Ad-Hoc Exploration (Not for CI)

When user asks to "verify quickly" or "reproduce bug":

1. **Use MCP for scripted exploration**:
   - Execute the flow interactively
   - Document steps and observed results
   - Capture screenshots or videos if helpful

2. **Output format**:
   ```markdown
   ## Exploration Results

   ### Steps Executed
   1. Navigated to /checkout
   2. Clicked "Add to cart" (selector: getByTestId('add-to-cart'))
   3. Proceeded to checkout page

   ### Observed Results
   - Cart count updated correctly
   - Price calculation matches expected value
   - Checkout button is visible and enabled

   ### Issues Found
   - Shipping address validation is missing
   - Error message not displayed on invalid ZIP code

   ### Suggested Test Coverage
   - Add test: "should validate shipping address format"
   - Add test: "should display error for invalid ZIP"
   ```

## Scripts

The skill includes helper scripts in `.claude/skills/playwright-e2e/scripts/`:

### run_e2e.sh

Runs E2E tests with automatic setup:

```bash
./claude/skills/playwright-e2e/scripts/run_e2e.sh
```

Features:
- Auto-detects package manager (npm, pnpm, yarn, bun)
- Installs dependencies if needed
- Installs Playwright browsers if missing
- Runs tests with CI-friendly settings

### start_app.sh

Starts the web app for testing:

```bash
./claude/skills/playwright-e2e/scripts/start_app.sh
```

Features:
- Auto-detects package manager
- Respects environment variables (PORT, NODE_ENV)
- Detects dev server command from package.json
- Runs in foreground (for debugging) or background (for CI)

### wait_for_url.js

Waits for URL to be ready:

```bash
node .claude/skills/playwright-e2e/scripts/wait_for_url.js http://localhost:3000 120
```

Features:
- Polls URL with exponential backoff
- Configurable timeout (default: 120s)
- Exit code 0 on success, 1 on timeout

## Environment Variables

Configure tests with environment variables (never commit secrets):

```bash
# Base URL for tests
export E2E_BASE_URL=http://localhost:3000

# Test credentials (if auth tests exist)
export E2E_USER=demo
export E2E_PASS=password123

# CI/CD flags
export CI=true
```

## MCP Configuration

### Project-Scoped (.mcp.json)

Recommended approach - configure MCP for the project:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "true",
        "PLAYWRIGHT_ALLOWED_HOSTS": "localhost,127.0.0.1,*.example.dev"
      }
    }
  },
  "outputDir": ".artifacts/mcp"
}
```

**Security**:
- Restrict `PLAYWRIGHT_ALLOWED_HOSTS` to trusted domains
- Use `PLAYWRIGHT_HEADLESS=true` in CI, `false` locally for debugging
- Never commit credentials in .mcp.json

### User-Scoped (Optional)

If team prefers user-level config:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

## CI Integration

### GitHub Actions Example (.github/workflows/e2e.yml)

```yaml
name: E2E Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          E2E_BASE_URL: http://localhost:3000
          # E2E_USER: ${{ secrets.E2E_USER }}  # Uncomment if auth tests need secrets
          # E2E_PASS: ${{ secrets.E2E_PASS }}

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: |
            .artifacts/test-results
            playwright-report/
          retention-days: 7
```

## Selector Strategy

### Preference Order (Most stable → Least stable)

1. **Semantic role selectors** (best for accessibility):
   ```javascript
   page.getByRole('button', { name: 'Submit' })
   page.getByRole('textbox', { name: 'Email' })
   page.getByRole('link', { name: 'Home' })
   ```

2. **Label selectors**:
   ```javascript
   page.getByLabel('Email address')
   page.getByLabel('Password')
   ```

3. **Text content** (for unique text):
   ```javascript
   page.getByText('Welcome back')
   page.getByText('Sign in', { exact: true })
   ```

4. **data-testid** (when semantic selectors aren't viable):
   ```javascript
   page.getByTestId('submit-button')
   page.getByTestId('username-input')
   ```

5. **CSS selectors** (last resort):
   ```javascript
   page.locator('[data-custom-attr="value"]')
   page.locator('.specific-class >> nth=0')
   ```

### When to Add data-testid

Propose adding data-testid when:
- Element has no semantic role
- Text content is dynamic or translated
- Multiple similar elements exist
- CSS classes are auto-generated (like Tailwind)

## Best Practices Summary

✅ **DO**:
- Use Playwright's auto-waiting and retries
- Prefer semantic selectors (role, label, text)
- Keep tests independent and parallelizable
- Use environment variables for configuration
- Create reusable helpers for common flows
- Configure MCP with security restrictions
- Upload artifacts on CI failures

❌ **DON'T**:
- Use arbitrary sleeps (`waitForTimeout`)
- Commit secrets or credentials
- Create test interdependencies
- Use fragile CSS selectors
- Skip MCP exploration for complex flows
- Force-push to main
- Run tests without proper CI setup

## Troubleshooting

### Tests are flaky

1. Check for arbitrary timeouts - replace with explicit waits:
   ```javascript
   // ❌ Bad
   await page.waitForTimeout(5000);

   // ✅ Good
   await page.waitForSelector('[data-testid="loaded"]');
   await expect(page.getByTestId('content')).toBeVisible();
   ```

2. Ensure proper waiting for network requests:
   ```javascript
   await page.waitForLoadState('networkidle');
   await page.waitForResponse(response =>
     response.url().includes('/api/data') && response.status() === 200
   );
   ```

### Selectors not found

1. Use Playwright Inspector to debug:
   ```bash
   npm run test:e2e:debug
   ```

2. Use MCP to explore and find better selectors:
   ```
   "Find the submit button on the login page and suggest the best selector"
   ```

3. Verify element timing:
   ```javascript
   await page.waitForSelector('[data-testid="element"]', { state: 'visible' });
   ```

### CI fails but local passes

1. Check browser installation:
   ```bash
   npx playwright install --with-deps
   ```

2. Verify environment variables are set in CI

3. Check for timing differences (CI may be slower):
   ```javascript
   // Increase timeout in CI
   test.setTimeout(process.env.CI ? 60000 : 30000);
   ```

## Related Documentation

- [Playwright Official Docs](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright MCP Documentation](https://github.com/playwright/playwright-mcp)
- See `reference.md` for detailed playbook
- See `examples.md` for common test patterns

## Quick Start

1. **Setup** (first time):
   ```bash
   npm install -D @playwright/test
   npx playwright install chromium
   ```

2. **Create smoke test**:
   ```bash
   mkdir -p e2e/tests
   # Then create e2e/tests/smoke.spec.js with basic tests
   ```

3. **Run tests**:
   ```bash
   npm run test:e2e
   ```

4. **Add to CI**:
   - Create `.github/workflows/e2e.yml` (see CI Integration above)
   - Configure secrets if needed

5. **Configure MCP** (optional):
   - Create `.mcp.json` in repo root
   - Set allowed hosts and output directory

---

**Remember**: Playwright tests should be deterministic, fast, and reliable. Use MCP for exploration and discovery, then codify findings into stable test suites.
