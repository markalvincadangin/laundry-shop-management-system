import { test, expect } from './fixtures';
import { resetDatabase } from './test-setup';
import { loginAsAdmin, createCustomer } from './api-helpers';

test.describe('Pricing & Boundaries', () => {

  let customerId: string;

  test.beforeAll(async ({ request }) => {
    resetDatabase();
    await loginAsAdmin(request);
    const customer = await createCustomer(request);
    customerId = customer.id;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testadmin');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/orders/);
  });

  test('DOM-01, DOM-03: Base Load Pricing and 8.0kg inclusive boundary', async ({ page }) => {
    await page.goto('/orders/new');
    
    // Select customer
    await page.click('text=Select Customer');
    await page.click('text=Test Customer');

    // Fill 5kg
    await page.fill('input[name="weight"]', '5');
    // Verify total shows 140 (1 load)
    await expect(page.locator('.grand-total')).toHaveText(/₱140/);

    // Fill exactly 8.0kg
    await page.fill('input[name="weight"]', '8.0');
    // Verify total is still 140
    await expect(page.locator('.grand-total')).toHaveText(/₱140/);
  });

  test('DOM-04: Exact load thresholds (16.0kg vs 16.01kg)', async ({ page }) => {
    await page.goto('/orders/new');
    
    // Select customer
    await page.click('text=Select Customer');
    await page.click('text=Test Customer');

    // 16.0kg should be exactly 2 loads (₱280)
    await page.fill('input[name="weight"]', '16.0');
    await expect(page.locator('.grand-total')).toHaveText(/₱280/);

    // 16.01kg should tip into 3 loads (₱420)
    await page.fill('input[name="weight"]', '16.01');
    await expect(page.locator('.grand-total')).toHaveText(/₱420/);
  });

  test('DOM-05, DOM-07: Zero extra minutes and currency arithmetic', async ({ page }) => {
    await page.goto('/orders/new');
    
    // Select customer
    await page.click('text=Select Customer');
    await page.click('text=Test Customer');

    // 8.0kg
    await page.fill('input[name="weight"]', '8.0');

    // 0 extra minutes
    await page.fill('input[name="extraMinutes"]', '0');
    await expect(page.locator('.grand-total')).toHaveText(/₱140/);

    // 47 extra minutes (₱1 each)
    await page.fill('input[name="extraMinutes"]', '47');
    await expect(page.locator('.grand-total')).toHaveText(/₱187/);
  });

  test('DOM-06: Negative inputs are blocked', async ({ page }) => {
    await page.goto('/orders/new');
    
    // Select customer
    await page.click('text=Select Customer');
    await page.click('text=Test Customer');

    // Negative weight
    await page.fill('input[name="weight"]', '-5');
    // Form should show error or not compute negative totals
    await page.click('button:has-text("Create Order")');
    await expect(page.locator('text=Must be greater than 0')).toBeVisible();
  });
});
