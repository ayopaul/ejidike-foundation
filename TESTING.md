# Testing Guide for Ejidike Foundation

This document explains how to run tests for the Ejidike Foundation application.

## Test Framework

The application uses **Playwright** for end-to-end (E2E) testing. Playwright provides reliable cross-browser testing with features like:

- Automatic waiting
- Screenshot capture on failure
- Video recording
- Trace viewer for debugging

## Test Structure

```
tests/
├── e2e/
│   ├── utils/
│   │   └── test-helpers.ts    # Shared utilities and helpers
│   ├── public-pages.spec.ts   # Tests for public pages
│   ├── auth.spec.ts           # Authentication tests
│   ├── application-form.spec.ts # Application form tests
│   ├── admin-dashboard.spec.ts  # Admin dashboard tests
│   └── api.spec.ts            # API endpoint tests
└── screenshots/               # Screenshots from test failures
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run All Tests

```bash
npm test
```

This will:
- Start the dev server automatically
- Run all test files
- Generate an HTML report

### 3. View Test Report

```bash
npm run test:report
```

## Available Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests in headless mode |
| `npm run test:ui` | Run tests with Playwright UI (interactive) |
| `npm run test:headed` | Run tests with browser visible |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:report` | Open the HTML test report |
| `npm run test:public` | Run only public pages tests |
| `npm run test:auth` | Run only authentication tests |
| `npm run test:api` | Run only API tests |

## Test Suites

### 1. Public Pages (`public-pages.spec.ts`)

Tests for publicly accessible pages that don't require authentication:

- **Homepage**
  - Page loads successfully
  - Navigation links work
  - Apply Now buttons redirect correctly

- **Programs Page**
  - Displays program types (Education, Business)
  - Shows Types of Support section
  - Shows application process steps

- **Funding Page**
  - Displays eligibility criteria
  - Shows grant amounts (N500,000, N300,000, N1,000,000)

- **About Page**
  - Page loads successfully

- **Mentorship Page**
  - Displays mentorship content
  - Shows feature cards
  - Request Mentorship links correctly

- **Responsive Design**
  - Mobile viewport (375x667)
  - Tablet viewport (768x1024)

- **Performance**
  - Page load time under 10 seconds

### 2. Authentication (`auth.spec.ts`)

Tests for login and signup functionality:

- **Login Page**
  - Form displays correctly
  - Shows error with invalid credentials
  - Has link to signup page
  - Validates email format
  - Requires password

- **Signup Page**
  - Form displays correctly
  - Has link to login page
  - Validates password requirements
  - Requires email

- **Protected Routes**
  - Redirects to login when accessing dashboard without auth
  - Redirects to login when accessing applications without auth
  - Redirects to login when accessing admin dashboard without auth

### 3. Application Form (`application-form.spec.ts`)

Tests for the application form structure:

- **Form Sections**
  - Applicant Information
  - Academic Background
  - Grant Request Details
  - Personal Statement
  - Supporting Documents
  - Declaration

- **Grant Types**
  - Level 1 Education Grant (up to N500,000)
  - Level 2 Education Grant (up to N300,000)
  - Business Grant (up to N1,000,000)

- **Document Types**
  - Academic transcripts
  - Proof of enrollment
  - Recommendation letters
  - Financial need statement
  - State of origin certificate
  - Additional documents

### 4. Admin Dashboard (`admin-dashboard.spec.ts`)

Tests for admin functionality:

- **Access Control**
  - Redirects unauthenticated users

- **Application Review**
  - Supports status changes (approve, reject, request more info)
  - Tracks reviewer metadata

- **Partner Management**
  - Verification status changes
  - Tracks verification metadata

- **Mentor Management**
  - Approval status changes

### 5. API Endpoints (`api.spec.ts`)

Tests for API routes:

- **Security**
  - Requires authentication for sensitive endpoints
  - Doesn't expose sensitive data
  - Handles invalid methods

- **Response Format**
  - Returns appropriate content types

## Setting Up Test Users

For authenticated tests to work, you need to create test accounts in Supabase:

### 1. Create `.env.test` file

```bash
cp .env.test.example .env.test
```

### 2. Create Test Accounts in Supabase

1. Go to Supabase Dashboard > Authentication > Users
2. Create test users with the following emails:
   - `test.applicant@example.com` (role: applicant)
   - `test.admin@example.com` (role: admin)
   - `test.mentor@example.com` (role: mentor)
   - `test.partner@example.com` (role: partner)

3. Set passwords and update `.env.test` with credentials

### 3. Update Profile Roles

In Supabase SQL Editor, update user roles:

```sql
-- Find user IDs first
SELECT id, email FROM auth.users WHERE email LIKE 'test.%';

-- Update profile roles (use the user IDs from above)
UPDATE profiles SET role = 'admin' WHERE user_id = '<admin-user-id>';
UPDATE profiles SET role = 'mentor' WHERE user_id = '<mentor-user-id>';
UPDATE profiles SET role = 'partner' WHERE user_id = '<partner-user-id>';
```

## Running Tests in CI/CD

For GitHub Actions or other CI environments:

```yaml
# .github/workflows/test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm test
        env:
          CI: true
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Debugging Tests

### Using Playwright UI

```bash
npm run test:ui
```

This opens an interactive UI where you can:
- Run tests one by one
- See test steps in real-time
- Inspect DOM snapshots
- View console logs

### Using Debug Mode

```bash
npm run test:debug
```

This pauses execution and opens browser DevTools.

### Viewing Traces

After a failed test:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## Writing New Tests

### Test File Template

```typescript
import { test, expect } from '@playwright/test';
import { waitForPageLoad, navigate } from './utils/test-helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await navigate.toHome(page);
    await waitForPageLoad(page);

    // Assert something
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Best Practices

1. **Use descriptive test names** - Explain what the test verifies
2. **One assertion per test** - Keep tests focused
3. **Use helpers** - Leverage test-helpers.ts for common operations
4. **Handle async properly** - Always await async operations
5. **Clean up state** - Don't leave test data in the database

## Troubleshooting

### Tests failing with timeout

- Increase timeout in playwright.config.ts
- Check if dev server is running
- Verify network connectivity

### Screenshots not saving

- Ensure tests/screenshots directory exists
- Check file permissions

### Auth tests skipped

- Verify TEST_* environment variables are set
- Check that test accounts exist in Supabase

### Browser not starting

```bash
npx playwright install chromium
```
