# E2E Tests

End-to-end tests for the demo web application using Playwright.

## Quick Start

### Local Development

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install chromium
   ```

3. **Run tests** (starts app automatically):
   ```bash
   npm run test:e2e
   ```

### Additional Commands

```bash
# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/tests/smoke.spec.js

# Run tests matching a pattern
npx playwright test --grep "login"

# Show test report
npx playwright show-report
```

## Test Structure

```
e2e/
├── tests/              # Test files
│   ├── smoke.spec.js   # Smoke tests (fast, critical paths)
│   └── auth.spec.js    # Authentication flow tests
├── utils/              # Helper utilities
│   └── login-helper.js # Reusable login functions
└── README.md           # This file
```

## Environment Variables

Configure tests using environment variables:

```bash
# Base URL for the app (default: http://localhost:3000)
export E2E_BASE_URL=http://localhost:3000

# Test user credentials (default: demo / password123)
export E2E_USER=demo
export E2E_PASS=password123
```

## Writing Tests

### Best Practices

1. **Use stable selectors** (in order of preference):
   - `getByRole()` - Semantic, accessible
   - `getByLabel()` - Form inputs with labels
   - `getByTestId()` - Explicit test hooks
   - Avoid CSS selectors when possible

2. **No arbitrary waits**:
   ```javascript
   // ❌ Bad
   await page.waitForTimeout(5000);

   // ✅ Good
   await expect(page.getByTestId('success-message')).toBeVisible();
   ```

3. **Keep tests independent**:
   - Each test should work in isolation
   - Don't rely on execution order
   - Clean up state if needed

4. **Use descriptive test names**:
   ```javascript
   test('successful login redirects to dashboard', async ({ page }) => {
     // ...
   });
   ```

### Example Test

```javascript
import { test, expect } from '@playwright/test';

test('home page loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('main-heading')).toBeVisible();
  await expect(page.getByTestId('main-heading')).toHaveText('AI Coding Agent Skills');
});
```

## CI/CD

Tests run automatically on:
- Pull requests
- Pushes to main branch

See `.github/workflows/e2e.yml` for CI configuration.

### CI Requirements

- Node.js 20+
- Playwright browsers (installed automatically in CI)
- Environment variables (set via GitHub Secrets if needed)

### Debugging CI Failures

1. Check workflow logs in GitHub Actions
2. Download `playwright-report` artifact from failed run
3. View locally:
   ```bash
   npx playwright show-report path/to/downloaded/report
   ```
4. Download trace files to debug interactively:
   ```bash
   npx playwright show-trace path/to/trace.zip
   ```

## Troubleshooting

### Tests fail locally but pass in CI (or vice versa)

- Check browser installation: `npx playwright install chromium`
- Verify environment variables are set correctly
- Check for timing differences (CI may be slower or faster)

### "Element not found" errors

- Use Playwright Inspector: `npm run test:e2e:debug`
- Verify selector in UI mode: `npm run test:e2e:ui`
- Check if element is rendered conditionally

### Flaky tests

- Look for race conditions
- Add explicit waits for network requests:
  ```javascript
  await page.waitForResponse(response =>
    response.url().includes('/api/data') && response.status() === 200
  );
  ```
- Verify animations are complete before interactions

### Port already in use

The demo app runs on port 3000 by default. If that port is busy:
```bash
export PORT=3001
npm run test:e2e
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright MCP](https://github.com/playwright/playwright-mcp)
- [Skill Documentation](../.claude/skills/playwright-e2e/SKILL.md)

## Demo App

The demo app (`demo-app/server.js`) is a simple Express application with:

- Home page with navigation
- Login/logout flow
- Protected dashboard
- About page
- Health check endpoint

**Test credentials**: `demo` / `password123`

Start manually:
```bash
npm run dev
# or
node demo-app/server.js
```

Access at: http://localhost:3000
