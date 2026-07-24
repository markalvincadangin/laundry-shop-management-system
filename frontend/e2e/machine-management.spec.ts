import { test, expect } from './fixtures';
import { resetDatabase } from './test-setup';
import { loginAsAdmin, createCustomer } from './api-helpers';

test.describe('Machine Management', () => {

  test.beforeAll(async ({ request }) => {
    resetDatabase();
    await loginAsAdmin(request);
    await createCustomer(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testadmin');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
  });

  test('MAC-01: Prevent hoarding machines', async ({ page }) => {
    // 1 load order (8kg)
    await page.goto('/orders/new');
    await page.click('text=Select Customer');
    await page.click('text=Test Customer');
    await page.fill('input[name="weight"]', '8.0');
    await page.click('button:has-text("Create Order")');
    
    // Start washing
    await page.click('button:has-text("Start Washing")');
    
    // Select first washer
    const washer1 = page.locator('text=Test Washer 1');
    await washer1.click();
    
    // Try to select second washer, it should be prevented (disabled or show alert)
    const washer2 = page.locator('text=Test Washer 2');
    await washer2.click();

    // Verify only 1 machine is selected or an error is shown
    // We expect the form to only allow 1 machine for a 1 load order
    const selectedCount = await page.locator('.selected-machine').count();
    expect(selectedCount).toBeLessThanOrEqual(1);

    // Assign
    await page.click('button:has-text("Assign")');
    await expect(page.locator('.order-status')).toHaveText(/WASHING/);
  });

  test('MAC-06: Machines IN_USE are visibly disabled, not hidden', async ({ page }) => {
    // Second order
    await page.goto('/orders/new');
    await page.click('text=Select Customer');
    await page.click('text=Test Customer');
    await page.fill('input[name="weight"]', '5');
    await page.click('button:has-text("Create Order")');

    await page.click('button:has-text("Start Washing")');

    // Test Washer 1 is in use from the previous test, it should be visible but disabled
    const washer1 = page.locator('text=Test Washer 1').locator('..');
    await expect(washer1).toBeVisible();
    
    // Determine how it's disabled. Might be a 'disabled' attribute on button or a specific class
    const isDisabled = await washer1.getAttribute('disabled') !== null || await washer1.evaluate((el) => el.classList.contains('opacity-50') || el.classList.contains('disabled'));
    expect(isDisabled).toBe(true);
  });
});
