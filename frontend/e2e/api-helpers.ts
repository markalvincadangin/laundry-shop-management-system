import { APIRequestContext, expect } from '@playwright/test';

const API_BASE = 'http://localhost:8081';

/**
 * Logs in via the backend API and returns an authenticated APIRequestContext
 * with the access_token cookie set. All subsequent requests using this context
 * will automatically include the auth cookie.
 */
export async function loginAsAdmin(request: APIRequestContext) {
  const response = await request.post(`${API_BASE}/api/v1/auth/login`, {
    data: {
      username: 'testadmin',
      password: 'Password123!',
    },
  });
  expect(response.status()).toBe(200);
  // The Set-Cookie header is automatically captured by the APIRequestContext,
  // so subsequent calls on this `request` will carry the cookie.
  return response;
}

/**
 * Creates a test customer using the backend API directly.
 * The request context must already be authenticated (call loginAsAdmin first).
 */
export async function createCustomer(request: APIRequestContext) {
  const response = await request.post(`${API_BASE}/api/v1/customers`, {
    data: {
      firstName: 'Test',
      lastName: 'Customer',
      contactNumber: '09123456789',
    },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}
