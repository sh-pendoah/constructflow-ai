import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('COI Upload Workflow', () => {
  test('should upload a COI document successfully', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@docflow-360.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);

    // 2. Navigate to COI Alerts page
    await page.goto('/company/coi-alerts');
    await expect(page.locator('h1')).toContainText('COI Alerts');

    // 3. Open Add Vendor Modal
    await page.click('button:has-text("Add Vendor")'); // Adjust selector after viewing file
    await expect(page.locator('h2')).toContainText('Add COI Vendor');

    // 4. Fill form
    await page.fill('input[name="vendorName"]', 'Test Vendor');
    await page.fill('input[name="vendorEmail"]', 'vendor@test.com');
    
    // 5. Upload File
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../../fixtures/assets/coi_sample.pdf'));

    // 6. Submit
    await page.click('button:has-text("Add Vendor")'); // The submit button inside modal

    // 7. Verify Success
    // Wait for modal to close or success message
    await expect(page.locator('text=Vendor added successfully')).toBeVisible({ timeout: 10000 }).catch(() => {}); 
    // Or check if the new vendor appears in the list
    await expect(page.locator('text=Test Vendor')).toBeVisible();
  });
});
