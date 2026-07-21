import { test, expect } from './fixtures';

test.describe('Authentication & Access Control', () => {

  test.beforeAll(() => {
    // We don't necessarily need DB reset here if we only read, but good practice per file.
    // Assuming the test DB is fresh and seeded with 'teststaff' and 'testadmin'.
  });

  test('SEC-01: Staff cannot access Admin Settings via UI', async ({ page }) => {
    // 1. Log in as staff
    await page.goto('/login');
    await page.fill('input[name="username"]', 'teststaff');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // 2. Wait for dashboard
    await expect(page).toHaveURL(/\/orders/);

    // 3. Attempt to navigate to Settings via UI or URL
    await page.goto('/settings');

    // 4. Expect redirect or 403 Forbidden message
    // If it redirects back to dashboard:
    await expect(page).not.toHaveURL(/\/settings/);
    // Alternatively, if it shows a 403 page, we can assert on the text. 
    // Usually App Router redirects unauthorized users.
  });

  test('SEC-04: Staff cannot access admin API routes', async ({ request }) => {
    // 1. Login as staff via API to get token
    const loginRes = await request.post('/api/v1/auth/login', {
      data: { username: 'teststaff', password: 'Password123!' }
    });
    const { token } = await loginRes.json();

    // 2. Call an admin-only API (e.g. settings or user management)
    // Assuming GET /api/v1/users is admin only
    const res = await request.get('/api/v1/users', {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 3. Expect 403 Forbidden
    expect(res.status()).toBe(403);
  });
});
