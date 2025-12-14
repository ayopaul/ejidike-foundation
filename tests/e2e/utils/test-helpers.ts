import { Page, expect } from '@playwright/test';

/**
 * Test user credentials - Configure these in .env.test or use test accounts
 */
export const TEST_USERS = {
  applicant: {
    email: process.env.TEST_APPLICANT_EMAIL || 'test.applicant@example.com',
    password: process.env.TEST_APPLICANT_PASSWORD || 'TestPassword123!',
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'test.admin@example.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'TestPassword123!',
  },
  mentor: {
    email: process.env.TEST_MENTOR_EMAIL || 'test.mentor@example.com',
    password: process.env.TEST_MENTOR_PASSWORD || 'TestPassword123!',
  },
  partner: {
    email: process.env.TEST_PARTNER_EMAIL || 'test.partner@example.com',
    password: process.env.TEST_PARTNER_PASSWORD || 'TestPassword123!',
  },
};

/**
 * Login helper function
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for navigation after login
  await page.waitForURL(/\/(dashboard|admin|mentor|partner)/, { timeout: 10000 });
}

/**
 * Logout helper function
 */
export async function logout(page: Page) {
  // Click user menu and logout
  await page.click('[data-testid="user-menu"]').catch(() => {
    // Try alternative selector
    return page.click('button:has-text("Sign out")');
  });
  await page.click('text=Sign out').catch(() => {});
  await page.waitForURL('/login', { timeout: 10000 }).catch(() => {});
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  // Also wait a moment for React to hydrate
  await page.waitForTimeout(1000);
}

/**
 * Generate random email for testing
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test.user.${timestamp}.${random}@example.com`;
}

/**
 * Generate random phone number for testing
 */
export function generateTestPhone(): string {
  const digits = Math.floor(Math.random() * 9000000000) + 1000000000;
  return `+234${digits}`;
}

/**
 * Fill form field helper
 */
export async function fillFormField(page: Page, selector: string, value: string) {
  const field = page.locator(selector);
  await field.click();
  await field.fill(value);
}

/**
 * Select dropdown option helper
 */
export async function selectOption(page: Page, selector: string, value: string) {
  await page.click(selector);
  await page.click(`[data-value="${value}"]`).catch(() => {
    return page.click(`text=${value}`);
  });
}

/**
 * Upload file helper
 */
export async function uploadFile(page: Page, selector: string, filePath: string) {
  const fileInput = page.locator(selector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Check toast message
 */
export async function expectToast(page: Page, message: string | RegExp) {
  const toast = page.locator('[data-sonner-toast]').first();
  await expect(toast).toContainText(message);
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse((response) => {
    if (typeof urlPattern === 'string') {
      return response.url().includes(urlPattern);
    }
    return urlPattern.test(response.url());
  });
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `tests/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Accessibility check helper
 */
export async function checkAccessibility(page: Page) {
  // Basic accessibility checks
  const images = page.locator('img');
  const imageCount = await images.count();

  for (let i = 0; i < imageCount; i++) {
    const img = images.nth(i);
    const alt = await img.getAttribute('alt');
    expect(alt, `Image ${i} should have alt text`).toBeTruthy();
  }

  // Check for proper heading hierarchy
  const h1Count = await page.locator('h1').count();
  expect(h1Count, 'Page should have at least one h1').toBeGreaterThanOrEqual(1);
}

/**
 * Check for console errors
 */
export function setupConsoleErrorCapture(page: Page, errors: string[]) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
}

/**
 * Navigation helpers
 */
export const navigate = {
  toHome: (page: Page) => page.goto('/'),
  toLogin: (page: Page) => page.goto('/login'),
  toSignup: (page: Page) => page.goto('/register'),
  toDashboard: (page: Page) => page.goto('/dashboard'),
  toPrograms: (page: Page) => page.goto('/programs'),
  toFunding: (page: Page) => page.goto('/funding'),
  toAbout: (page: Page) => page.goto('/about'),
  toMentorship: (page: Page) => page.goto('/mentorship'),
  toBrowsePrograms: (page: Page) => page.goto('/browse-programs'),
  toApplications: (page: Page) => page.goto('/applications'),
  toAdminDashboard: (page: Page) => page.goto('/admin/dashboard'),
  toAdminApplications: (page: Page) => page.goto('/admin/dashboard/applications'),
  toPartnerDashboard: (page: Page) => page.goto('/partner/dashboard'),
  toMentorDashboard: (page: Page) => page.goto('/mentor/dashboard'),
};
