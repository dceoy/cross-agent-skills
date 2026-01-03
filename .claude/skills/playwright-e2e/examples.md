# Playwright E2E Test Examples

Common test patterns and templates for typical web application scenarios.

## Table of Contents

- [Authentication Flows](#authentication-flows)
- [Form Interactions](#form-interactions)
- [Navigation Testing](#navigation-testing)
- [API Integration](#api-integration)
- [Error Handling](#error-handling)
- [Accessibility Testing](#accessibility-testing)
- [Mobile/Responsive](#mobileresponsive)
- [File Upload/Download](#file-uploaddownload)

## Authentication Flows

### Basic Login

```javascript
import { test, expect } from '@playwright/test';

test('successful login', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByTestId('welcome-message')).toBeVisible();
});
```

### Login with Remember Me

```javascript
test('login with remember me', async ({ page, context }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('checkbox', { name: 'Remember me' }).check();
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/dashboard');

  // Verify cookie/localStorage was set
  const cookies = await context.cookies();
  expect(cookies.some(c => c.name === 'remember_token')).toBeTruthy();
});
```

### Failed Login

```javascript
test('failed login shows error', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('wrong@example.com');
  await page.getByLabel('Password').fill('wrongpassword');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByTestId('error-message')).toBeVisible();
  await expect(page.getByTestId('error-message')).toContainText('Invalid credentials');
  await expect(page).toHaveURL('/login');  // Stayed on login page
});
```

### Logout Flow

```javascript
test('logout redirects to home', async ({ page }) => {
  // Assume we have a logged-in fixture or helper
  await loginAsTestUser(page);

  await page.getByTestId('user-menu').click();
  await page.getByRole('button', { name: 'Logout' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('login-button')).toBeVisible();
});
```

## Form Interactions

### Simple Form Submission

```javascript
test('contact form submission', async ({ page }) => {
  await page.goto('/contact');

  await page.getByLabel('Name').fill('John Doe');
  await page.getByLabel('Email').fill('john@example.com');
  await page.getByLabel('Message').fill('This is a test message.');
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByTestId('success-message')).toBeVisible();
  await expect(page.getByTestId('success-message')).toContainText('Message sent successfully');
});
```

### Form Validation

```javascript
test('shows validation errors for empty required fields', async ({ page }) => {
  await page.goto('/register');

  // Try to submit without filling anything
  await page.getByRole('button', { name: 'Register' }).click();

  // Check for validation errors
  await expect(page.getByTestId('email-error')).toContainText('Email is required');
  await expect(page.getByTestId('password-error')).toContainText('Password is required');
});

test('validates email format', async ({ page }) => {
  await page.goto('/register');

  await page.getByLabel('Email').fill('invalid-email');
  await page.getByLabel('Email').blur();  // Trigger validation

  await expect(page.getByTestId('email-error')).toContainText('Invalid email format');
});
```

### Multi-Step Form (Wizard)

```javascript
test('complete multi-step registration', async ({ page }) => {
  await page.goto('/register');

  // Step 1: Account Info
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('SecurePass123!');
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 2: Personal Info
  await expect(page.getByTestId('step-indicator')).toContainText('Step 2 of 3');
  await page.getByLabel('First Name').fill('John');
  await page.getByLabel('Last Name').fill('Doe');
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 3: Confirmation
  await expect(page.getByTestId('step-indicator')).toContainText('Step 3 of 3');
  await expect(page.getByTestId('email-preview')).toContainText('user@example.com');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page).toHaveURL('/welcome');
});
```

### Select Dropdown

```javascript
test('select from dropdown', async ({ page }) => {
  await page.goto('/settings');

  await page.getByLabel('Country').selectOption('US');
  await page.getByLabel('State').selectOption({ label: 'California' });

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByTestId('success-message')).toBeVisible();
});
```

### Date Picker

```javascript
test('select date from picker', async ({ page }) => {
  await page.goto('/booking');

  // Method 1: Direct input (if supported)
  await page.getByLabel('Check-in Date').fill('2026-12-25');

  // Method 2: Click picker and select
  await page.getByLabel('Check-out Date').click();
  await page.getByRole('button', { name: '26' }).click();  // Select day 26

  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByTestId('search-results')).toBeVisible();
});
```

## Navigation Testing

### Menu Navigation

```javascript
test('navigate through main menu', async ({ page }) => {
  await page.goto('/');

  // Click nav items
  await page.getByRole('navigation').getByRole('link', { name: 'Products' }).click();
  await expect(page).toHaveURL('/products');
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

  await page.getByRole('navigation').getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL('/about');
});
```

### Breadcrumbs

```javascript
test('breadcrumb navigation works', async ({ page }) => {
  await page.goto('/products/electronics/laptops/dell-xps-13');

  // Navigate back through breadcrumbs
  await page.getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { name: 'Laptops' }).click();

  await expect(page).toHaveURL('/products/electronics/laptops');
  await expect(page.getByRole('heading')).toContainText('Laptops');
});
```

### Tabs

```javascript
test('switch between tabs', async ({ page }) => {
  await page.goto('/profile');

  // Initially on Overview tab
  await expect(page.getByTestId('overview-content')).toBeVisible();

  // Switch to Settings tab
  await page.getByRole('tab', { name: 'Settings' }).click();
  await expect(page.getByTestId('settings-content')).toBeVisible();
  await expect(page.getByTestId('overview-content')).not.toBeVisible();

  // Switch to Activity tab
  await page.getByRole('tab', { name: 'Activity' }).click();
  await expect(page.getByTestId('activity-content')).toBeVisible();
});
```

## API Integration

### Wait for API Response

```javascript
test('loads user data from API', async ({ page }) => {
  await page.goto('/profile');

  // Wait for API call to complete
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/user') && response.status() === 200
  );

  await responsePromise;

  // Now data should be loaded
  await expect(page.getByTestId('user-name')).not.toBeEmpty();
  await expect(page.getByTestId('user-email')).not.toBeEmpty();
});
```

### Mock API for Testing Edge Cases

```javascript
test('handles API error gracefully', async ({ page }) => {
  // Mock API to return error
  await page.route('**/api/products', route =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  );

  await page.goto('/products');

  await expect(page.getByTestId('error-banner')).toBeVisible();
  await expect(page.getByTestId('error-banner')).toContainText('Failed to load products');
});
```

### Mock Successful API Response

```javascript
test('displays mocked product data', async ({ page }) => {
  await page.route('**/api/products', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Test Product 1', price: 29.99 },
        { id: 2, name: 'Test Product 2', price: 49.99 },
      ]),
    })
  );

  await page.goto('/products');

  await expect(page.getByText('Test Product 1')).toBeVisible();
  await expect(page.getByText('Test Product 2')).toBeVisible();
});
```

## Error Handling

### 404 Page

```javascript
test('shows 404 page for invalid route', async ({ page }) => {
  await page.goto('/nonexistent-page');

  await expect(page.getByRole('heading')).toContainText('404');
  await expect(page.getByText(/page not found/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go Home' })).toBeVisible();
});
```

### Network Error

```javascript
test('handles offline mode', async ({ page, context }) => {
  await page.goto('/');

  // Go offline
  await context.setOffline(true);

  await page.getByRole('link', { name: 'Products' }).click();

  // Verify offline message
  await expect(page.getByTestId('offline-banner')).toBeVisible();

  // Go back online
  await context.setOffline(false);
  await page.reload();

  await expect(page.getByTestId('offline-banner')).not.toBeVisible();
});
```

## Accessibility Testing

### Keyboard Navigation

```javascript
test('form can be navigated with keyboard', async ({ page }) => {
  await page.goto('/contact');

  // Tab through form
  await page.keyboard.press('Tab');  // Focus email
  await page.keyboard.type('user@example.com');

  await page.keyboard.press('Tab');  // Focus message
  await page.keyboard.type('Test message');

  await page.keyboard.press('Tab');  // Focus submit button
  await page.keyboard.press('Enter');  // Submit

  await expect(page.getByTestId('success-message')).toBeVisible();
});
```

### Screen Reader Landmarks

```javascript
test('page has proper ARIA landmarks', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('banner')).toBeVisible();  // Header
  await expect(page.getByRole('navigation')).toBeVisible();  // Nav
  await expect(page.getByRole('main')).toBeVisible();  // Main content
  await expect(page.getByRole('contentinfo')).toBeVisible();  // Footer
});
```

### Color Contrast (with axe-core)

```javascript
import AxeBuilder from '@axe-core/playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Mobile/Responsive

### Mobile Viewport

```javascript
test('mobile menu works', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });  // iPhone SE
  await page.goto('/');

  // Mobile menu should be hidden initially
  await expect(page.getByTestId('mobile-menu')).not.toBeVisible();

  // Click hamburger
  await page.getByTestId('hamburger-button').click();

  // Menu should appear
  await expect(page.getByTestId('mobile-menu')).toBeVisible();

  // Click nav link
  await page.getByTestId('mobile-menu').getByRole('link', { name: 'About' }).click();

  await expect(page).toHaveURL('/about');
});
```

### Responsive Behavior

```javascript
test('layout adapts to screen size', async ({ page }) => {
  await page.goto('/products');

  // Desktop: sidebar should be visible
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.getByTestId('sidebar')).toBeVisible();

  // Tablet: sidebar might be collapsed
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByTestId('sidebar-toggle')).toBeVisible();

  // Mobile: sidebar hidden by default
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.getByTestId('sidebar')).not.toBeVisible();
});
```

## File Upload/Download

### File Upload

```javascript
test('uploads file successfully', async ({ page }) => {
  await page.goto('/upload');

  // Set files on input
  const fileInput = page.getByLabel('Choose file');
  await fileInput.setInputFiles('./fixtures/test-file.pdf');

  await page.getByRole('button', { name: 'Upload' }).click();

  // Wait for upload to complete
  await expect(page.getByTestId('upload-success')).toBeVisible();
  await expect(page.getByTestId('file-name')).toContainText('test-file.pdf');
});
```

### Multiple Files

```javascript
test('uploads multiple files', async ({ page }) => {
  await page.goto('/upload');

  await page.getByLabel('Choose files').setInputFiles([
    './fixtures/file1.pdf',
    './fixtures/file2.png',
  ]);

  await page.getByRole('button', { name: 'Upload All' }).click();

  await expect(page.getByTestId('upload-count')).toContainText('2 files uploaded');
});
```

### File Download

```javascript
test('downloads file', async ({ page }) => {
  await page.goto('/downloads');

  // Start waiting for download before clicking
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download Report' }).click();

  const download = await downloadPromise;

  // Verify download
  expect(download.suggestedFilename()).toBe('report.pdf');

  // Save to path (optional)
  await download.saveAs('./downloads/report.pdf');
});
```

---

## Template: Complete User Journey

```javascript
import { test, expect } from '@playwright/test';

test.describe('E-commerce Checkout Flow', () => {
  test('complete purchase from browse to confirmation', async ({ page }) => {
    // 1. Browse products
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // 2. Add to cart
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    // 3. View cart
    await page.getByTestId('cart-icon').click();
    await expect(page).toHaveURL('/cart');
    await expect(page.getByTestId('cart-item-1')).toBeVisible();

    // 4. Proceed to checkout
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL('/checkout');

    // 5. Fill shipping info
    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByLabel('Address').fill('123 Main St');
    await page.getByLabel('City').fill('San Francisco');
    await page.getByLabel('ZIP Code').fill('94102');
    await page.getByRole('button', { name: 'Continue to Payment' }).click();

    // 6. Fill payment info
    await page.getByLabel('Card Number').fill('4242424242424242');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');
    await page.getByRole('button', { name: 'Place Order' }).click();

    // 7. Verify confirmation
    await expect(page).toHaveURL(/\/order\/confirmation/);
    await expect(page.getByTestId('order-success')).toBeVisible();
    await expect(page.getByTestId('order-number')).not.toBeEmpty();
  });
});
```

---

**Pro Tip**: Copy templates and adapt them to your application's specific selectors and flows. Always prefer semantic selectors (role, label) over test IDs when possible.
