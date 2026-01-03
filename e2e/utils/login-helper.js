/**
 * Login helper for E2E tests
 * Provides reusable login functionality with stable selectors
 */

export async function login(page, username, password) {
  await page.goto('/login');
  await page.getByTestId('username-input').fill(username);
  await page.getByTestId('password-input').fill(password);
  await page.getByTestId('login-button').click();

  // Wait for navigation to complete
  await page.waitForURL(/\/(dashboard|login)/);
}

export async function loginAsTestUser(page) {
  const username = process.env.E2E_USER || 'demo';
  const password = process.env.E2E_PASS || 'password123';
  await login(page, username, password);
}

export async function logout(page) {
  await page.getByTestId('logout-link').click();
  await page.waitForURL('/');
}

export async function isLoggedIn(page) {
  try {
    await page.getByTestId('user-name').waitFor({ timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}
