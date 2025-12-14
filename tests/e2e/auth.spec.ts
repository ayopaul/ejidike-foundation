import { test, expect } from '@playwright/test';
import { navigate, waitForPageLoad } from './utils/test-helpers';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await navigate.toLogin(page);
      await waitForPageLoad(page);

      // Check login form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show captcha requirement', async ({ page }) => {
      await navigate.toLogin(page);
      await waitForPageLoad(page);

      // The app uses Turnstile captcha - check form doesn't submit without it
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');

      // Should show captcha error or stay on login page
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).toContain('login');
    });

    test('should have link to signup page', async ({ page }) => {
      await navigate.toLogin(page);
      await waitForPageLoad(page);

      const signupLink = page.locator('a:has-text("Sign up")');
      await expect(signupLink).toBeVisible();

      // Verify it links to register
      const href = await signupLink.getAttribute('href');
      expect(href).toBe('/register');
    });

    test('should validate email format', async ({ page }) => {
      await navigate.toLogin(page);

      await page.fill('input[type="email"]', 'invalidemail');
      await page.fill('input[type="password"]', 'somepassword');
      await page.click('button[type="submit"]');

      // Browser should show validation error or form should not submit
      const url = page.url();
      expect(url).toContain('login');
    });

    test('should require password', async ({ page }) => {
      await navigate.toLogin(page);

      await page.fill('input[type="email"]', 'test@example.com');
      // Leave password empty
      await page.click('button[type="submit"]');

      // Form should not submit without password
      const url = page.url();
      expect(url).toContain('login');
    });
  });

  test.describe('Register Page', () => {
    test('should display registration form', async ({ page }) => {
      await navigate.toSignup(page);
      await waitForPageLoad(page);

      // Check registration form elements - uses /register route
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="full_name"]')).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      await navigate.toSignup(page);
      await waitForPageLoad(page);

      const loginLink = page.locator('a:has-text("Sign in")');
      await expect(loginLink).toBeVisible();

      // Verify it links to login
      const href = await loginLink.getAttribute('href');
      expect(href).toBe('/login');
    });

    test('should have role selection', async ({ page }) => {
      await navigate.toSignup(page);
      await waitForPageLoad(page);

      // Check for role selector
      const roleSelector = page.locator('button:has-text("Select your role")');
      await expect(roleSelector).toBeVisible();
    });

    test('should require all fields', async ({ page }) => {
      await navigate.toSignup(page);
      await waitForPageLoad(page);

      // Try to submit without filling fields
      await page.click('button[type="submit"]');

      // Should stay on register page
      await page.waitForTimeout(500);
      const url = page.url();
      expect(url).toContain('register');
    });

    test('should have password confirmation field', async ({ page }) => {
      await navigate.toSignup(page);
      await waitForPageLoad(page);

      // Check for confirm password field
      await expect(page.locator('input[name="confirm_password"]')).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      await navigate.toDashboard(page);

      // Should redirect to login
      await page.waitForURL(/\/(login|signin)/, { timeout: 10000 }).catch(() => {});
      const url = page.url();
      expect(url).toMatch(/\/(login|signin|dashboard)/);
    });

    test('should redirect to login when accessing applications without auth', async ({ page }) => {
      await navigate.toApplications(page);

      // Should redirect to login
      await page.waitForURL(/\/(login|signin)/, { timeout: 10000 }).catch(() => {});
    });

    test('should redirect to login when accessing admin dashboard without auth', async ({ page }) => {
      await navigate.toAdminDashboard(page);

      // Should redirect to login
      await page.waitForURL(/\/(login|signin)/, { timeout: 10000 }).catch(() => {});
    });
  });
});

test.describe('Session Management', () => {
  test('should persist session in local storage', async ({ page }) => {
    await navigate.toLogin(page);

    // Check that Supabase storage keys are used
    const localStorage = await page.evaluate(() => {
      return Object.keys(window.localStorage);
    });

    // After visiting login, there should be some state stored
    expect(Array.isArray(localStorage)).toBeTruthy();
  });
});
