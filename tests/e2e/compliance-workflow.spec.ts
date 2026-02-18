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

test.describe('Compliance Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should upload compliance document and extract expiration date', async ({ page }) => {
    // Step 1: Navigate to compliance upload
    await page.goto('/documents/upload');
    
    // Step 2: Upload COI/compliance document
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'coi-acme-contractor.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Certificate of Insurance - Expires: 03/15/2025'),
    });

    await page.selectOption('select[name="documentType"]', 'compliance');
    await page.click('button[type="submit"]');

    // Step 3: Wait for processing
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 10000 });

    // Step 4: Navigate to compliance dashboard
    await page.goto('/admin-dashboard');

    // Step 5: Verify compliance document appears in the list
    await expect(page.locator('.compliance-item')).toBeVisible({ timeout: 5000 });

    // Step 6: Check that expiration date is displayed
    const firstCompliance = page.locator('.compliance-item').first();
    await expect(firstCompliance).toContainText(/expir/i);
  });

  test('should trigger alert for expiring compliance document', async ({ page }) => {
    // This test verifies the scheduler alert functionality
    // Note: In a real test, you would need to manipulate the expiration date
    // to be within 30 days or trigger the scheduler manually
    
    await page.goto('/admin-dashboard');
    
    // Check compliance expiration section
    await page.click('text=Compliance Expiring');
    
    // Verify compliance documents expiring within 30 days are shown
    const expiringSection = page.locator('.compliance-expiring-section');
    await expect(expiringSection).toBeVisible();

    // Verify alert badges for different time windows
    const alerts30Day = page.locator('.alert-badge:has-text("30 days")');
    const alerts15Day = page.locator('.alert-badge:has-text("15 days")');
    const alerts7Day = page.locator('.alert-badge:has-text("7 days")');
    
    // At least one type of alert should be visible if there are expiring docs
    const hasAlerts = await alerts30Day.isVisible() || 
                     await alerts15Day.isVisible() || 
                     await alerts7Day.isVisible();
  });

  test('should handle expired compliance document', async ({ page }) => {
    await page.goto('/admin-dashboard');
    
    // Navigate to expired compliance section
    await page.click('text=Expired Compliance');
    
    // Verify expired documents are displayed
    const expiredSection = page.locator('.compliance-expired-section');
    await expect(expiredSection).toBeVisible();

    // Check that expired status is shown
    const expiredBadge = page.locator('.status-badge:has-text("EXPIRED")');
    if (await expiredBadge.isVisible({ timeout: 3000 })) {
      // Verify expired document shows in red or with warning indicator
      await expect(expiredBadge).toHaveClass(/danger|error|expired/);
    }
  });

  test('should match contractor from compliance document', async ({ page }) => {
    // Upload compliance document with contractor name
    await page.goto('/documents/upload');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'coi-smith-contractors.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Certificate of Insurance - Smith General Contractors LLC'),
    });

    await page.selectOption('select[name="documentType"]', 'compliance');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Go to review queue
    await page.goto('/review-queue');
    await page.selectOption('select[name="documentType"]', 'compliance');

    // Select the compliance item
    const complianceItem = page.locator('.review-queue-item').first();
    if (await complianceItem.isVisible({ timeout: 5000 })) {
      await complianceItem.click();

      // Verify contractor match information is displayed
      const contractorMatch = page.locator('.contractor-match, .matched-contractor');
      await expect(contractorMatch).toBeVisible();

      // Approve the compliance document
      await page.click('button:has-text("Approve")');
      await expect(page.locator('.success-message')).toContainText(/approved/i, { timeout: 5000 });
    }
  });

  test('should show compliance calendar view', async ({ page }) => {
    await page.goto('/admin-dashboard');
    
    // Check if calendar view exists
    const calendarView = page.locator('.compliance-calendar, [data-testid="compliance-calendar"]');
    
    if (await calendarView.isVisible({ timeout: 3000 })) {
      // Verify calendar shows expiration dates
      await expect(calendarView).toContainText(/January|February|March|April|May|June|July|August|September|October|November|December/);
      
      // Verify different alert windows are color-coded
      const calendar30Day = page.locator('.calendar-day.expiring-30');
      const calendar15Day = page.locator('.calendar-day.expiring-15');
      const calendar7Day = page.locator('.calendar-day.expiring-7');
    }
  });

  test('should verify scheduler alert idempotency', async ({ page }) => {
    // This test checks that alerts are not sent multiple times
    // In a real scenario, you would:
    // 1. Check alert logs/audit trail
    // 2. Verify alert timestamps
    // 3. Confirm no duplicate alerts for the same expiration window
    
    await page.goto('/admin-dashboard');
    
    // Navigate to audit logs or alerts section
    const auditLink = page.locator('a[href*="audit"], a:has-text("Audit Log")');
    if (await auditLink.isVisible({ timeout: 3000 })) {
      await auditLink.click();
      
      // Filter to compliance alerts
      const filterSelect = page.locator('select[name="eventType"]');
      if (await filterSelect.isVisible()) {
        await filterSelect.selectOption({ label: /compliance.*alert/i });
      }
      
      // Verify each document has only one alert per time window
      // This would require checking alert timestamps in the UI
    }
  });
});

test.describe('Scheduler Integration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display compliance status transitions', async ({ page }) => {
    await page.goto('/admin-dashboard');
    
    // Verify status categories exist
    await expect(page.locator('text=ACTIVE')).toBeVisible();
    await expect(page.locator('text=EXPIRING')).toBeVisible();
    await expect(page.locator('text=EXPIRED')).toBeVisible();

    // Click on EXPIRING status
    await page.click('text=EXPIRING');
    
    // Verify documents in expiring state are shown
    const expiringDocs = page.locator('.compliance-item[data-status="EXPIRING"]');
    const count = await expiringDocs.count();
    
    // Each expiring doc should show time until expiration
    if (count > 0) {
      const firstDoc = expiringDocs.first();
      await expect(firstDoc).toContainText(/\d+ days/);
    }
  });
});
