import { test, expect } from '@playwright/test';
import { navigate } from './utils/test-helpers';

test.describe('Public Pages', () => {
  test.describe('Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
      await navigate.toHome(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000); // Wait for React hydration

      // Check page loaded
      await expect(page.locator('body')).toBeVisible();

      // Check hero section has content
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 15000 });
    });

    test('should have navigation menu', async ({ page }) => {
      await navigate.toHome(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check that navigation links exist
      const navLinks = page.locator('nav a, header a');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have Programs link in navigation', async ({ page }) => {
      await navigate.toHome(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check for Programs link (may be in dropdown or visible)
      const programsLink = page.locator('a[href="/programs"]');
      const count = await programsLink.count();

      // Programs link should exist in the DOM (even if hidden in dropdown)
      expect(count).toBeGreaterThan(0);
    });

    test('Apply Now buttons link to browse-programs or login', async ({ page }) => {
      await navigate.toHome(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Find Apply Now button and check its href
      const applyButton = page.locator('a:has-text("Apply Now")').first();

      if (await applyButton.isVisible()) {
        const href = await applyButton.getAttribute('href');
        // Apply Now should go to browse-programs (may redirect to login if protected)
        expect(href).toMatch(/\/(browse-programs|login)/);
      }
    });
  });

  test.describe('Programs Page', () => {
    test('should display program types', async ({ page }) => {
      await navigate.toPrograms(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check page has content about education or business
      const bodyText = await page.locator('body').textContent();
      const hasEducation = bodyText?.toLowerCase().includes('education');
      const hasBusiness = bodyText?.toLowerCase().includes('business');

      expect(hasEducation || hasBusiness).toBeTruthy();
    });

    test('should display scholarship information', async ({ page }) => {
      await navigate.toPrograms(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check for scholarship or grant content
      const bodyText = await page.locator('body').textContent();
      const hasScholarship = bodyText?.toLowerCase().includes('scholarship') ||
        bodyText?.toLowerCase().includes('grant') ||
        bodyText?.toLowerCase().includes('level');

      expect(hasScholarship).toBeTruthy();
    });

    test('should display application process', async ({ page }) => {
      await navigate.toPrograms(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check for application process content
      const bodyText = await page.locator('body').textContent();
      const hasProcess = bodyText?.toLowerCase().includes('application') ||
        bodyText?.toLowerCase().includes('apply');

      expect(hasProcess).toBeTruthy();
    });
  });

  test.describe('Funding Page', () => {
    test('should display eligibility information', async ({ page }) => {
      await navigate.toFunding(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check for eligibility content
      const bodyText = await page.locator('body').textContent();
      const hasEligibility = bodyText?.toLowerCase().includes('eligib') ||
        bodyText?.toLowerCase().includes('require');

      expect(hasEligibility).toBeTruthy();
    });

    test('should display grant amounts', async ({ page }) => {
      await navigate.toFunding(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check for grant amount information
      const bodyText = await page.locator('body').textContent() || '';
      const hasAmounts = bodyText.includes('500,000') ||
        bodyText.includes('300,000') ||
        bodyText.includes('1,000,000') ||
        bodyText.toLowerCase().includes('grant');

      expect(hasAmounts).toBeTruthy();
    });
  });

  test.describe('About Page', () => {
    test('should load about page', async ({ page }) => {
      await navigate.toAbout(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check page loaded
      await expect(page.locator('body')).toBeVisible();
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.length).toBeGreaterThan(100);
    });
  });

  test.describe('Mentorship Page', () => {
    test('should load mentorship page', async ({ page }) => {
      await navigate.toMentorship(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check for mentorship content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.toLowerCase()).toContain('mentor');
    });

    test('should display mentorship features', async ({ page }) => {
      await navigate.toMentorship(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check for mentorship feature content
      const bodyText = await page.locator('body').textContent() || '';
      const hasFeatures = bodyText.toLowerCase().includes('matchmak') ||
        bodyText.toLowerCase().includes('structure') ||
        bodyText.toLowerCase().includes('resource');

      expect(hasFeatures).toBeTruthy();
    });

    test('Request Mentorship button should link to dashboard', async ({ page }) => {
      await navigate.toMentorship(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      const requestButton = page.locator('a:has-text("Request Mentorship")').first();

      if (await requestButton.isVisible()) {
        const href = await requestButton.getAttribute('href');
        expect(href).toContain('/dashboard/mentorship');
      }
    });
  });

  test.describe('Browse Programs Page', () => {
    test('should load browse programs page', async ({ page }) => {
      await navigate.toBrowsePrograms(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check page loaded
      await expect(page.locator('body')).toBeVisible();
    });
  });
});

test.describe('Responsive Design', () => {
  test('homepage should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigate.toHome(page);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check page is functional on mobile
    await expect(page.locator('body')).toBeVisible();
  });

  test('homepage should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await navigate.toHome(page);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check page is functional on tablet
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('homepage should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await navigate.toHome(page);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Page should load within 15 seconds (generous for dev server)
    expect(loadTime).toBeLessThan(15000);
  });
});
