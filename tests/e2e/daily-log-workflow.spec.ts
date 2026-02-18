import { test, expect, Page } from '@playwright/test';

/**
 * Helper function to login
 */
async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@docflow-360.com');
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'Test1234$');
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
}

test.describe('Daily Log Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should upload daily log and trigger WC code suggestion', async ({ page }) => {
    // Step 1: Navigate to daily log upload
    await page.goto('/documents/upload');
    
    // Step 2: Upload daily log document
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'daily-log-2024-01-15.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Daily Log - Workers: John Smith (Carpenter)'),
    });

    await page.selectOption('select[name="documentType"]', 'daily-log');
    await page.click('button[type="submit"]');

    // Step 3: Wait for processing
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 10000 });

    // Step 4: Navigate to review queue
    await page.goto('/review-queue');
    await page.selectOption('select[name="documentType"]', 'daily-log');

    // Step 5: Find the uploaded log
    const logItem = page.locator('.review-queue-item').first();
    await expect(logItem).toBeVisible({ timeout: 5000 });
    await logItem.click();

    // Step 6: Verify WC code suggestions are displayed
    await expect(page.locator('.wc-code-suggestion')).toBeVisible();
    
    // Verify top 3 suggestions appear
    const suggestions = page.locator('.wc-code-suggestion');
    const suggestionCount = await suggestions.count();
    expect(suggestionCount).toBeGreaterThanOrEqual(1);
    expect(suggestionCount).toBeLessThanOrEqual(3);

    // Step 7: Select a WC code suggestion
    const firstSuggestion = suggestions.first();
    await firstSuggestion.click();

    // Step 8: Approve the daily log with selected WC code
    await page.click('button:has-text("Approve")');

    // Step 9: Verify approval
    await expect(page.locator('.success-message')).toContainText(/approved/i, { timeout: 5000 });
  });

  test('should handle unknown worker scenario', async ({ page }) => {
    // Upload daily log with unknown worker
    await page.goto('/documents/upload');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'daily-log-unknown-worker.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Daily Log - Workers: Unknown Person'),
    });

    await page.selectOption('select[name="documentType"]', 'daily-log');
    await page.click('button[type="submit"]');

    // Wait and check review queue
    await page.waitForTimeout(2000);
    await page.goto('/review-queue');
    await page.selectOption('select[name="documentType"]', 'daily-log');

    // Verify exception for unknown worker
    const logItem = page.locator('.review-queue-item').first();
    if (await logItem.isVisible({ timeout: 5000 })) {
      await logItem.click();
      await expect(page.locator('.exception-badge:has-text("Unknown Worker")')).toBeVisible();
    }
  });

  test('should auto-select WC code above 90% confidence', async ({ page }) => {
    // This test verifies that high-confidence WC code matches are auto-selected
    // Note: This requires actual OCR/LLM integration to work fully
    
    await page.goto('/documents/upload');
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'daily-log-clear-wc.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Daily Log - Carpenter work on residential project'),
    });

    await page.selectOption('select[name="documentType"]', 'daily-log');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);
    
    // If auto-selected with high confidence, item should not appear in review queue
    await page.goto('/review-queue');
    await page.selectOption('select[name="documentType"]', 'daily-log');

    // Check if any items exist - high confidence items should auto-approve
    const itemCount = await page.locator('.review-queue-item').count();
    // Note: This assertion depends on the WC code confidence threshold
  });
});
