# Playwright + MCP Playbook

Comprehensive reference for patterns, anti-patterns, selector strategies, and best practices for E2E testing with Playwright and Playwright MCP.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Selector Strategy](#selector-strategy)
- [Patterns](#patterns)
- [Anti-Patterns](#anti-patterns)
- [MCP Integration](#mcp-integration)
- [CI/CD Best Practices](#cicd-best-practices)
- [Debugging Guide](#debugging-guide)
- [Performance Optimization](#performance-optimization)

## Testing Philosophy

### Deterministic Tests

Tests must be **100% reliable** - no flakiness tolerance:

- ✅ Every test should pass every time in any environment
- ✅ Tests should work on slow machines and fast CI runners
- ✅ Tests should be independent (no execution order dependency)
- ✅ Tests should clean up after themselves

### Test Pyramid for E2E

E2E tests should focus on:
1. **Critical user journeys** - Happy paths that users must complete
2. **Integration points** - Where multiple systems interact
3. **Cross-browser compatibility** - Features that behave differently across browsers

Avoid:
- ❌ Testing every edge case (that's for unit tests)
- ❌ Testing implementation details (test behavior, not internals)
- ❌ Redundant coverage (if unit tests cover it well, skip E2E)

## Selector Strategy

### Priority Hierarchy

Always prefer the highest available option:

#### 1. Role-based Selectors (Most Accessible)

Best for: Semantic HTML elements, accessibility compliance

```javascript
// Buttons
page.getByRole('button', { name: 'Submit' })
page.getByRole('button', { name: /submit/i })  // Case-insensitive

// Links
page.getByRole('link', { name: 'Home' })
page.getByRole('navigation').getByRole('link', { name: 'About' })

// Form controls
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: 'Remember me' })
page.getByRole('combobox', { name: 'Country' })

// Headings
page.getByRole('heading', { name: 'Welcome', level: 1 })
```

**When to use**: Element has proper semantic HTML and ARIA attributes

#### 2. Label Selectors

Best for: Form inputs with associated labels

```javascript
page.getByLabel('Email address')
page.getByLabel('Password', { exact: true })
page.getByLabel(/username/i)
```

**When to use**: Forms with proper label elements

#### 3. Placeholder Selectors

Best for: Inputs without labels (less ideal, but common)

```javascript
page.getByPlaceholder('Enter your email')
page.getByPlaceholder(/search/i)
```

**When to use**: Modern UIs with placeholder-as-label pattern

#### 4. Text Content Selectors

Best for: Unique visible text

```javascript
page.getByText('Welcome back')
page.getByText('Sign in', { exact: true })
page.getByText(/total: \$\d+\.\d{2}/i)
```

**When to use**: Text is static and unique on the page

#### 5. Test ID Selectors

Best for: When semantic selectors aren't viable

```javascript
page.getByTestId('submit-button')
page.getByTestId('user-profile-dropdown')
page.getByTestId('cart-item-123')
```

**When to use**:
- Dynamic content (user-generated text, IDs, dates)
- Multiple similar elements
- CSS framework with generated classes
- Third-party components without semantic HTML

**Naming convention for data-testid**:
- Use kebab-case: `data-testid="login-button"`
- Be specific: `data-testid="checkout-submit-button"` not `data-testid="btn"`
- Include context: `data-testid="cart-total-price"` not `data-testid="price"`

#### 6. CSS Selectors (Last Resort)

Use only when absolutely necessary:

```javascript
// Attribute selectors
page.locator('[data-custom-id="value"]')

// Combinators (be careful with specificity)
page.locator('.modal >> button.primary')

// Nth-child (fragile - avoid if possible)
page.locator('.list-item:nth-child(3)')
```

**When to use**: Legacy code, third-party widgets, unavoidable cases

### Chaining and Filtering

Narrow down selections for complex scenarios:

```javascript
// Chain locators
const modal = page.locator('.modal');
const submitButton = modal.getByRole('button', { name: 'Submit' });

// Filter by text
page.getByRole('listitem').filter({ hasText: 'Active' });

// Filter by child
page.getByRole('article').filter({
  has: page.getByRole('button', { name: 'Delete' })
});

// Get nth match
page.getByRole('button').nth(0);  // First match
page.getByRole('button').last();  // Last match
```

## Patterns

### Pattern 1: Page Object Model (POM)

Encapsulate page structure and interactions:

```javascript
// pages/LoginPage.js
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByTestId('error-message');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}

// Usage in test
import { LoginPage } from './pages/LoginPage';

test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('demo', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

**When to use**: Complex pages with many interactions

### Pattern 2: Fixtures for Reusable State

Set up common state across tests:

```javascript
// fixtures/auth.js
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup: log in
    await page.goto('/login');
    await page.getByLabel('Username').fill(process.env.E2E_USER);
    await page.getByLabel('Password').fill(process.env.E2E_PASS);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');

    // Provide authenticated page to test
    await use(page);

    // Teardown: log out
    await page.getByRole('button', { name: 'Logout' }).click();
  },
});

// Usage in test
import { test } from './fixtures/auth';

test('view profile', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/profile');
  // Already logged in!
});
```

**When to use**: Multiple tests need the same setup

### Pattern 3: Custom Assertions

Create domain-specific assertions:

```javascript
// helpers/custom-matchers.js
import { expect } from '@playwright/test';

export async function expectToBeLoggedIn(page) {
  await expect(page.getByTestId('user-menu')).toBeVisible();
  await expect(page).toHaveURL(/\/(dashboard|home)/);
}

export async function expectCartCount(page, count) {
  const cartBadge = page.getByTestId('cart-count');
  await expect(cartBadge).toHaveText(String(count));
}

// Usage in test
import { expectToBeLoggedIn, expectCartCount } from './helpers/custom-matchers';

test('add to cart', async ({ page }) => {
  await expectToBeLoggedIn(page);
  await page.getByTestId('add-to-cart-button').click();
  await expectCartCount(page, 1);
});
```

**When to use**: Complex assertions repeated across tests

### Pattern 4: API Mocking for Edge Cases

Mock API responses for hard-to-reproduce scenarios:

```javascript
test('handles server error gracefully', async ({ page }) => {
  // Mock API to return error
  await page.route('**/api/user', route =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  );

  await page.goto('/profile');

  // Verify error handling
  await expect(page.getByTestId('error-banner')).toBeVisible();
  await expect(page.getByTestId('error-banner')).toContainText('Server Error');
});
```

**When to use**: Testing error states, loading states, edge cases

### Pattern 5: Waiting for Network Requests

Ensure API calls complete before assertions:

```javascript
test('loads user data', async ({ page }) => {
  await page.goto('/profile');

  // Wait for specific API call
  await page.waitForResponse(
    response => response.url().includes('/api/user') && response.status() === 200
  );

  // Now safe to assert
  await expect(page.getByTestId('user-name')).not.toBeEmpty();
});
```

**When to use**: Data-driven pages, async operations

## Anti-Patterns

### ❌ Anti-Pattern 1: Arbitrary Sleeps

**Bad**:
```javascript
await page.click('[data-testid="submit"]');
await page.waitForTimeout(5000);  // ❌ Fragile and slow
```

**Good**:
```javascript
await page.getByTestId('submit').click();
await expect(page.getByTestId('success-message')).toBeVisible();  // ✅ Auto-retry
```

### ❌ Anti-Pattern 2: Fragile CSS Selectors

**Bad**:
```javascript
await page.locator('.btn.btn-primary.btn-lg.mt-4').click();  // ❌ Breaks on style changes
```

**Good**:
```javascript
await page.getByRole('button', { name: 'Submit' }).click();  // ✅ Semantic and stable
await page.getByTestId('submit-button').click();  // ✅ Explicit test hook
```

### ❌ Anti-Pattern 3: Test Interdependence

**Bad**:
```javascript
test('create user', async ({ page }) => {
  // Creates user in DB
});

test('login user', async ({ page }) => {
  // ❌ Depends on previous test running first
});
```

**Good**:
```javascript
test('create and login user', async ({ page }) => {
  // ✅ Self-contained
});

// Or use fixtures for shared setup
```

### ❌ Anti-Pattern 4: Testing Implementation Details

**Bad**:
```javascript
test('click increments counter state', async ({ page }) => {
  await page.evaluate(() => window.app.state.counter);  // ❌ Testing internals
});
```

**Good**:
```javascript
test('click increments counter display', async ({ page }) => {
  await page.getByRole('button', { name: 'Increment' }).click();
  await expect(page.getByTestId('counter-value')).toHaveText('1');  // ✅ Testing behavior
});
```

### ❌ Anti-Pattern 5: Ignoring Flakiness

**Bad**:
```javascript
// Test fails randomly - just rerun it ❌
```

**Good**:
```javascript
// Investigate root cause:
// - Missing waits?
// - Race conditions?
// - Network timing?
// - Animations interfering?
// Fix the underlying issue ✅
```

## MCP Integration

### When to Use MCP

**Exploration Phase** (before writing tests):
- Discover critical user flows
- Identify robust selectors
- Find missing data-testid attributes
- Understand app behavior

**Debugging Phase** (when tests fail):
- Reproduce failures interactively
- Inspect DOM structure
- Validate selector strategies
- Understand timing issues

### MCP Prompts for Exploration

```plaintext
# Discover selectors
"Navigate to the login page and find the best selector for the submit button"

# Map user journey
"Walk through the checkout flow step by step and document each action"

# Find missing test IDs
"Identify form inputs on the registration page that lack data-testid attributes"

# Validate responsiveness
"Navigate to the home page and test the mobile menu behavior"

# Reproduce bug
"Go to the cart page, add an item, then try to checkout without entering shipping info. What happens?"
```

### From MCP Exploration to Test Code

**MCP Output**:
```
Selector found: getByRole('button', { name: 'Sign in' })
Stable: Yes
Recommendation: Use this selector in tests
```

**Test Code**:
```javascript
test('login flow', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // ...
});
```

### Security with MCP

Configure `.mcp.json` to restrict MCP actions:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "true",
        "PLAYWRIGHT_ALLOWED_HOSTS": "localhost,127.0.0.1,*.staging.example.com",
        "PLAYWRIGHT_FORBIDDEN_ACTIONS": "download,upload"
      }
    }
  }
}
```

## CI/CD Best Practices

### Parallelization

```javascript
// playwright.config.js
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,  // Limit workers in CI
});
```

### Retries for Stability

```javascript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,  // Retry flaky tests in CI
});
```

### Artifact Collection

```yaml
# .github/workflows/e2e.yml
- name: Upload artifacts on failure
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-artifacts
    path: |
      .artifacts/test-results/
      playwright-report/
```

### Sharding for Large Suites

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

## Debugging Guide

### Local Debugging

```bash
# Interactive UI mode
npm run test:e2e:ui

# Debug mode with inspector
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e:headed

# Trace viewer
npx playwright show-trace trace.zip
```

### CI Debugging

1. **Enable trace on first retry**:
```javascript
use: {
  trace: 'on-first-retry',
}
```

2. **Download trace from CI artifacts**

3. **View locally**:
```bash
npx playwright show-trace trace.zip
```

### Common Issues

#### "Element not found"

1. Check selector in UI mode
2. Verify element is visible: `await expect(locator).toBeVisible()`
3. Wait for element: `await page.waitForSelector('[data-testid="element"]')`

#### "Test timeout"

1. Check for missing waits
2. Increase timeout: `test.setTimeout(60000)`
3. Verify server is running

#### "Flaky test"

1. Look for race conditions
2. Add explicit waits for network/animations
3. Use `waitForLoadState('networkidle')`

## Performance Optimization

### Run Smoke Tests First

```javascript
// smoke.spec.js
test.describe('Smoke Tests @smoke', () => {
  // Fast, critical tests
});

// Run only smoke tests
npx playwright test --grep @smoke
```

### Parallel Execution

```javascript
test.describe.configure({ mode: 'parallel' });
```

### Reuse Authentication State

```javascript
// global-setup.js
export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Perform login
  await page.goto('/login');
  await page.getByLabel('Username').fill('demo');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Save state
  await page.context().storageState({ path: 'auth.json' });
  await browser.close();
}

// playwright.config.js
export default defineConfig({
  globalSetup: './global-setup.js',
  use: {
    storageState: 'auth.json',  // Reuse auth across tests
  },
});
```

---

**Remember**: Reliable E2E tests are an investment. Spend time upfront on robust selectors and deterministic patterns to avoid maintenance burden later.
