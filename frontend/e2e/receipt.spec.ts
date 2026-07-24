import { test, expect } from './fixtures';
import { resetDatabase } from './test-setup';
import { loginAsAdmin, createCustomer } from './api-helpers';

const API_BASE = 'http://localhost:8081';

test.describe('Receipt Generation', () => {

  let orderId: string;

  test.beforeAll(async ({ request }) => {
    resetDatabase();
    await loginAsAdmin(request);
    const customer = await createCustomer(request);
    
    // Create an order via API
    const orderRes = await request.post(`${API_BASE}/api/v1/orders`, {
      data: {
        customerId: customer.id,
        weight: 5,
        extraMinutes: 0,
      },
    });
    const order = await orderRes.json();
    orderId = order.id;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testadmin');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
  });

  test('REP-04: Receipt Data Integrity', async ({ page }) => {
    await page.goto(`/orders/${orderId}`);
    
    // Click Generate/Print Receipt
    await page.click('button:has-text("Print Receipt")');

    // Assert that the receipt modal or view is visible
    const receiptView = page.locator('.receipt-container');
    await expect(receiptView).toBeVisible();

    const receiptText = await receiptView.textContent();
    
    // 6 required fields per REP-04
    expect(receiptText).toContain('Test Customer'); // Name
    expect(receiptText).toContain('09123456789'); // Contact
    // Date might be dynamic, so we just check for a generic date format or presence of "Date:"
    expect(receiptText).toMatch(/Date:/);
    expect(receiptText).toContain('₱140'); // Amount
    expect(receiptText).toContain('Faith Laundry'); // Shop Name
    expect(receiptText).toContain('Authorized Signature'); // Signature line
  });
});
