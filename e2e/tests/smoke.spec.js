import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('home page loads successfully', async ({ page }) => {
    await page.goto('/');

    // Verify main heading is visible
    const heading = page.getByTestId('main-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('AI Coding Agent Skills');

    // Verify welcome message
    const welcomeMessage = page.getByTestId('welcome-message');
    await expect(welcomeMessage).toBeVisible();
    await expect(welcomeMessage).toContainText('Welcome to the demo web application');
  });

  test('navigation links are present and working', async ({ page }) => {
    await page.goto('/');

    // Verify all nav links are visible
    await expect(page.getByTestId('nav-home')).toBeVisible();
    await expect(page.getByTestId('nav-login')).toBeVisible();
    await expect(page.getByTestId('nav-dashboard')).toBeVisible();
    await expect(page.getByTestId('nav-about')).toBeVisible();

    // Test navigation to about page
    await page.getByTestId('nav-about').click();
    await expect(page.getByTestId('about-heading')).toBeVisible();
    await expect(page.getByTestId('about-heading')).toHaveText('About');
  });

  test('health endpoint returns OK', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  test('login page loads successfully', async ({ page }) => {
    await page.goto('/login');

    // Verify login form elements
    await expect(page.getByTestId('login-heading')).toBeVisible();
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });
});
