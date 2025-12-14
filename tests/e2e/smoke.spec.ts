import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Quick verification that the app is running
 *
 * These tests verify basic functionality and should be run first
 * to ensure the application is working before running more comprehensive tests.
 */

test.describe('Smoke Tests', () => {
  test('app is running and homepage loads', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');

    // Check that page has loaded (body exists)
    await expect(page.locator('body')).toBeVisible();

    // Check for any content in the page
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Check page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('programs page loads', async ({ page }) => {
    await page.goto('/programs');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('funding page loads', async ({ page }) => {
    await page.goto('/funding');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('mentorship page loads', async ({ page }) => {
    await page.goto('/mentorship');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('browse-programs page loads', async ({ page }) => {
    await page.goto('/browse-programs');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Page Content Verification', () => {
  test('homepage has hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for React hydration

    // Look for main heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('programs page has tabs', async ({ page }) => {
    await page.goto('/programs');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check for program-related content
    const body = page.locator('body');
    const text = await body.textContent();

    // Should have Education or Business text
    const hasEducation = text?.includes('Education') || text?.includes('education');
    const hasBusiness = text?.includes('Business') || text?.includes('business');

    expect(hasEducation || hasBusiness).toBeTruthy();
  });

  test('funding page has grant information', async ({ page }) => {
    await page.goto('/funding');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check for grant-related content
    const body = page.locator('body');
    const text = await body.textContent();

    // Should mention grants or funding
    const hasGrant = text?.toLowerCase().includes('grant');
    const hasFunding = text?.toLowerCase().includes('funding');

    expect(hasGrant || hasFunding).toBeTruthy();
  });

  test('mentorship page has mentorship content', async ({ page }) => {
    await page.goto('/mentorship');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const body = page.locator('body');
    const text = await body.textContent();

    // Should mention mentorship
    expect(text?.toLowerCase()).toContain('mentor');
  });

  test('login page has form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Should have email and password inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput.or(page.locator('input[name="email"]'))).toBeVisible({ timeout: 10000 });
    await expect(passwordInput.or(page.locator('input[name="password"]'))).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Navigation Works', () => {
  test('can navigate from homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Find any link element
    const links = page.locator('a');
    const linkCount = await links.count();

    // Should have navigation links
    expect(linkCount).toBeGreaterThan(0);
  });
});
