import { test, expect, Page } from '@playwright/test';

/**
 * Helper function to login
 */
async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@docflow-360.com');
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'Test1234$');
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
}

test.describe('Invoice Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should complete invoice upload and review workflow', async ({ page }) => {
    // Step 1: Navigate to document upload page
    await page.goto('/documents/upload');
    await expect(page.locator('h1')).toContainText('Upload Document');

    // Step 2: Upload invoice PDF (using a test file)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-invoice.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test content'),
    });

    // Select document type as invoice
    await page.selectOption('select[name="documentType"]', 'invoice');
    
    // Submit upload
    await page.click('button[type="submit"]');

    // Step 3: Wait for document processing
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 10000 });

    // Step 4: Navigate to review queue
    await page.goto('/review-queue');
    await expect(page.locator('h1')).toContainText('Review Queue');

    // Step 5: Find the uploaded invoice in the queue
    const firstItem = page.locator('.review-queue-item').first();
    await expect(firstItem).toBeVisible({ timeout: 5000 });

    // Click on the item to see details
    await firstItem.click();

    // Step 6: Verify exception details are shown
    await expect(page.locator('.exception-badge')).toBeVisible();

    // Step 7: Approve the invoice
    await page.click('button:has-text("Approve")');
    
    // Confirm approval in modal if present
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Step 8: Verify item is removed from queue or marked as approved
    await expect(page.locator('.success-message')).toContainText(/approved/i);

    // Step 9: Verify audit log entry exists
    await page.goto('/admin-dashboard');
    // Note: Actual audit log verification would require API access or dedicated audit page
  });

  test('should reject invoice with notes', async ({ page }) => {
    // Navigate to review queue
    await page.goto('/review-queue');
    
    // Filter to invoices only
    await page.selectOption('select[name="documentType"]', 'invoice');

    // Select first item
    const firstItem = page.locator('.review-queue-item').first();
    if (await firstItem.isVisible({ timeout: 5000 })) {
      await firstItem.click();

      // Click reject button
      await page.click('button:has-text("Reject")');

      // Enter rejection notes
      await page.fill('textarea[name="notes"]', 'Invalid vendor information - requires correction');

      // Confirm rejection
      await page.click('button:has-text("Confirm Rejection")');

      // Verify success
      await expect(page.locator('.success-message')).toContainText(/rejected/i);
    }
  });

  test('should handle duplicate invoice detection', async ({ page }) => {
    // Upload first invoice
    await page.goto('/documents/upload');
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'invoice-001.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Invoice #001'),
    });

    await page.selectOption('select[name="documentType"]', 'invoice');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Upload duplicate invoice
    await page.goto('/documents/upload');
    await fileInput.setInputFiles({
      name: 'invoice-001-duplicate.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Invoice #001'),
    });

    await page.selectOption('select[name="documentType"]', 'invoice');
    await page.click('button[type="submit"]');

    // Verify duplicate warning appears
    await expect(page.locator('.warning-message')).toContainText(/duplicate/i, { timeout: 10000 });
  });
});

test.describe('Review Queue Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/review-queue');
  });

  test('should navigate with arrow keys', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.review-queue-item', { timeout: 10000 });

    const items = page.locator('.review-queue-item');
    const itemCount = await items.count();

    if (itemCount > 1) {
      // Press down arrow to select next item
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);

      // Press up arrow to select previous item
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(500);

      // Verify navigation worked (item should have focus class)
      const focusedItem = page.locator('.review-queue-item.focused');
      await expect(focusedItem).toBeVisible();
    }
  });

  test('should approve with Y keyboard shortcut', async ({ page }) => {
    await page.waitForSelector('.review-queue-item', { timeout: 10000 });

    const firstItem = page.locator('.review-queue-item').first();
    if (await firstItem.isVisible()) {
      await firstItem.click();

      // Press Y to approve
      await page.keyboard.press('y');

      // Wait for approval confirmation
      await expect(page.locator('.success-message, .confirm-dialog')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should reject with N keyboard shortcut', async ({ page }) => {
    await page.waitForSelector('.review-queue-item', { timeout: 10000 });

    const firstItem = page.locator('.review-queue-item').first();
    if (await firstItem.isVisible()) {
      await firstItem.click();

      // Press N to reject
      await page.keyboard.press('n');

      // Verify reject dialog appears
      await expect(page.locator('.reject-dialog, textarea[name="notes"]')).toBeVisible({ timeout: 5000 });
    }
  });
});
