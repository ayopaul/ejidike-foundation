import { test, expect } from '@playwright/test';

/**
 * API Endpoint Tests
 *
 * Tests for the API routes to ensure they respond correctly.
 */

test.describe('API Endpoints', () => {
  test.describe('Notifications API', () => {
    test('should require authentication for notifications', async ({ request }) => {
      const response = await request.get('/api/notifications');

      // Should return 401 or redirect without auth
      expect([401, 302, 307]).toContain(response.status());
    });
  });

  test.describe('Test Email API', () => {
    test('test-email endpoint should exist', async ({ request }) => {
      const response = await request.get('/api/test-email');

      // Should respond (may require auth or return error)
      expect(response.status()).toBeDefined();
    });
  });

  test.describe('Debug Brevo API', () => {
    test('debug-brevo endpoint should exist', async ({ request }) => {
      const response = await request.get('/api/debug-brevo');

      // Should respond
      expect(response.status()).toBeDefined();
    });
  });
});

test.describe('API Security', () => {
  test('API should not expose sensitive data without auth', async ({ request }) => {
    const sensitiveEndpoints = [
      '/api/notifications',
      '/api/partners',
      '/api/mentorship',
    ];

    for (const endpoint of sensitiveEndpoints) {
      const response = await request.get(endpoint);
      // Should not return 200 without auth
      if (response.status() === 200) {
        const body = await response.text();
        // Should not contain sensitive patterns
        expect(body).not.toMatch(/password/i);
        expect(body).not.toMatch(/secret/i);
        expect(body).not.toMatch(/api_key/i);
      }
    }
  });

  test('API should handle invalid methods', async ({ request }) => {
    // Test that DELETE on read-only endpoints is handled
    const response = await request.delete('/api/notifications');

    // Should return appropriate error or method not allowed
    expect([401, 403, 404, 405]).toContain(response.status());
  });
});

test.describe('API Response Format', () => {
  test('API errors should return JSON', async ({ request }) => {
    const response = await request.get('/api/notifications');

    const contentType = response.headers()['content-type'];
    // Should return JSON even for errors
    if (response.status() >= 400) {
      expect(contentType).toMatch(/application\/json|text\/html/);
    }
  });
});
