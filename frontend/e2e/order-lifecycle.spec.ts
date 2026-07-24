import { test, expect } from './fixtures';
import { resetDatabase } from './test-setup';
import { loginAsAdmin, createCustomer } from './api-helpers';

test.describe('Order Lifecycle & Payments', () => {

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
  });

  test('BIZ-01, PAY-01, BIZ-02: Golden Path - Create, Pay, Wash, Claim', async ({ page }) => {
    // Create Order
    await page.goto('/orders/new');
    await page.click('text=Select Customer');
    await page.click('text=Test Customer');
    await page.fill('input[name="weight"]', '5'); // 140 pesos
    await page.click('button:has-text("Create Order")');
    await expect(page).toHaveURL(/\/orders\/ord_/);

    // Save order ID for later API assertions if needed
    const orderUrl = page.url();

    // Verify initial state
    await expect(page.locator('.order-status')).toHaveText(/RECEIVED/);
    await expect(page.locator('.payment-status')).toHaveText(/UNPAID/);

    // BIZ-02: Attempt to claim an unpaid order
    const claimButton = page.locator('button:has-text("Mark as Claimed")');
    // Claiming button shouldn't be available or should be disabled
    await expect(claimButton).toBeDisabled();

    // PAY-01: Partial Payment
    await page.click('button:has-text("Record Payment")');
    await page.fill('input[name="amount"]', '70'); // 50%
    await page.click('button:has-text("Confirm Payment")');
    await expect(page.locator('.payment-status')).toHaveText(/PARTIAL/);

    // PAY-01: Full Payment
    await page.click('button:has-text("Record Payment")');
    await page.fill('input[name="amount"]', '70');
    await page.click('button:has-text("Confirm Payment")');
    await expect(page.locator('.payment-status')).toHaveText(/PAID/);

    // BIZ-01: Transition to WASHING
    await page.click('button:has-text("Start Washing")');
    // Select washer
    await page.click('text=Test Washer 1');
    await page.click('button:has-text("Assign")');
    await expect(page.locator('.order-status')).toHaveText(/WASHING/);

    // BIZ-01: Transition to READY
    await page.click('button:has-text("Mark as Ready")');
    await expect(page.locator('.order-status')).toHaveText(/READY/);

    // Golden Path end: Claim
    await expect(claimButton).toBeEnabled();
    await claimButton.click();
    await expect(page.locator('.order-status')).toHaveText(/CLAIMED/);
  });

  test('PAY-03: Overpayment Handling', async ({ page }) => {
    // Create Order
    await page.goto('/orders/new');
    await page.click('text=Select Customer');
    await page.click('text=Test Customer');
    await page.fill('input[name="weight"]', '5'); // 140 pesos
    await page.click('button:has-text("Create Order")');

    // Attempt overpayment
    await page.click('button:has-text("Record Payment")');
    await page.fill('input[name="amount"]', '500'); 
    
    // UI should show change due or reject
    await expect(page.locator('.change-due')).toHaveText(/₱360/);
    await page.click('button:has-text("Confirm Payment")');
    await expect(page.locator('.payment-status')).toHaveText(/PAID/);
  });

  test('BIZ-04, PAY-02: Cancel WASHING order, machine freed, revenue voided', async ({ page }) => {
    // Create Order
    await page.goto('/orders/new');
    await page.click('text=Select Customer');
    await page.click('text=Test Customer');
    await page.fill('input[name="weight"]', '5');
    await page.click('button:has-text("Create Order")');

    // Pay full
    await page.click('button:has-text("Record Payment")');
    await page.fill('input[name="amount"]', '140');
    await page.click('button:has-text("Confirm Payment")');

    // Start washing
    await page.click('button:has-text("Start Washing")');
    await page.click('text=Test Washer 2');
    await page.click('button:has-text("Assign")');

    // Cancel order
    await page.click('button:has-text("Cancel Order")');
    await page.fill('textarea[name="reason"]', 'Customer requested');
    await page.click('button:has-text("Confirm Cancel")');

    await expect(page.locator('.order-status')).toHaveText(/CANCELLED/);
    await expect(page.locator('.payment-status')).toHaveText(/VOIDED/);

    // Verify machine is free by trying to use it for another order
    await page.goto('/orders/new');
    await page.click('text=Select Customer');
    await page.click('text=Test Customer');
    await page.fill('input[name="weight"]', '5');
    await page.click('button:has-text("Create Order")');
    
    await page.click('button:has-text("Start Washing")');
    // Test Washer 2 should be available in the list
    await expect(page.locator('text=Test Washer 2')).toBeVisible();
  });
});
