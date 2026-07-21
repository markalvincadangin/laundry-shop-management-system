import { test, expect } from './fixtures';
import { resetDatabase } from './test-setup';
import { loginAsAdmin, createCustomer } from './api-helpers';

const API_BASE = 'http://localhost:8081';

test.describe('Public Tracking & Notifications', () => {

  let validRefNumber: string = '';

  test.beforeAll(async ({ request }) => {
    resetDatabase();
    await loginAsAdmin(request);
    const customer = await createCustomer(request);
    
    // Create an order via API to get a valid reference number
    const orderRes = await request.post(`${API_BASE}/api/v1/orders`, {
      data: {
        customerId: customer.id,
        weight: 5,
        extraMinutes: 0,
      },
    });
    const order = await orderRes.json();
    validRefNumber = order.referenceNumber || order.id; // Fallback if ref number isn't populated
  });

  test('NOT-02: Public Tracking omits PII', async ({ page }) => {
    await page.goto(`/tracking/${validRefNumber}`);

    // Verify it loads the tracking page and shows status
    await expect(page.locator('text=Order Status')).toBeVisible();

    // Verify PII is absent
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain('Test Customer');
    expect(pageText).not.toContain('09123456789');
    expect(pageText).not.toContain('123 Test St');
  });

  test('NOT-03: Invalid Tracking Lookup returns Not Found', async ({ page }) => {
    await page.goto(`/tracking/INVALID-999`);
    
    // Should display a 404/Not Found state
    await expect(page.locator('text=Not Found')).toBeVisible();
  });
});
