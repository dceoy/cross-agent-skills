import { test, expect } from '@playwright/test';

const TEST_USER = process.env.E2E_USER || 'demo';
const TEST_PASS = process.env.E2E_PASS || 'password123';

test.describe('Authentication Flow', () => {
  test('successful login and logout flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in credentials
    await page.getByTestId('username-input').fill(TEST_USER);
    await page.getByTestId('password-input').fill(TEST_PASS);

    // Submit form
    await page.getByTestId('login-button').click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('dashboard-heading')).toBeVisible();

    // Verify user name is displayed
    const userName = page.getByTestId('user-name');
    await expect(userName).toBeVisible();
    await expect(userName).toHaveText(TEST_USER);

    // Verify login time is displayed
    await expect(page.getByTestId('login-time')).toBeVisible();

    // Logout
    await page.getByTestId('logout-link').click();

    // Verify redirect to home
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('main-heading')).toBeVisible();
  });

  test('failed login with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.getByTestId('username-input').fill('invalid-user');
    await page.getByTestId('password-input').fill('wrong-password');

    // Submit form
    await page.getByTestId('login-button').click();

    // Verify error message
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toContainText('Invalid credentials');
  });

  test('dashboard requires authentication', async ({ page }) => {
    // Try to access dashboard without session
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByTestId('login-heading')).toBeVisible();
  });
});
