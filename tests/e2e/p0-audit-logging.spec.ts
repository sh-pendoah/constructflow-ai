import { test, expect } from '@playwright/test';

/**
 * Test to verify P0.3 fix: Review Queue Audit Logging
 * 
 * This test validates that approve, reject, and correction actions
 * on the review queue are properly logged to the audit trail.
 * 
 * NOTE: These tests verify that the UI actions complete successfully.
 * Direct database verification of audit logs would require MongoDB access
 * which is not available in E2E tests. Integration tests should verify
 * the actual audit log entries in the database.
 */

// Helper function to login
async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@worklight.com');
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'Test1234$');
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
}

test.describe('P0.3: Review Queue Audit Logging', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should complete correction without errors (audit logging happens server-side)', async ({ page }) => {
    // Navigate to review queue
    await page.goto('/review-queue');
    
    // Wait for items to load
    const firstItem = page.locator('.review-queue-item').first();
    
    // Skip if no items in queue
    if (!(await firstItem.isVisible({ timeout: 5000 }))) {
      test.skip('No review queue items available for testing');
    }
    
    await firstItem.click();

    // Make a correction - UI action should complete successfully
    // The audit log is created server-side in the API route
    await page.click('button:has-text("Make Correction")');
    await page.fill('input[name="field"]', 'vendorName');
    await page.fill('input[name="correctedValue"]', 'Corrected Vendor Name');
    await page.click('button:has-text("Submit Correction")');
    
    // Verify correction completed successfully
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 5000 });
    
    // Server-side: createAuditLog with REVIEW_ITEM_CORRECTED event is called
    // Database: AuditLog entry created with actor='USER', beforeState, afterState
  });

  test('should complete approval without errors (audit logging happens server-side)', async ({ page }) => {
    // Navigate to review queue
    await page.goto('/review-queue');
    
    const firstItem = page.locator('.review-queue-item').first();
    if (!(await firstItem.isVisible({ timeout: 5000 }))) {
      test.skip('No review queue items available for testing');
    }
    
    await firstItem.click();

    // Approve the item - UI action should complete successfully
    // The audit log is created server-side via logReviewApproval()
    await page.click('button:has-text("Approve")');
    
    // Handle optional notes field
    const notesField = page.locator('textarea[name="notes"]');
    if (await notesField.isVisible({ timeout: 2000 })) {
      await notesField.fill('Approved for P0 testing');
    }
    
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Verify approval completed successfully
    await expect(page.locator('.success-message')).toContainText(/approved/i);
    
    // Server-side: logReviewApproval creates AuditLog with REVIEW_ITEM_APPROVED
    // Database: AuditLog entry with actor='USER', actorUserId, metadata.notes
  });

  test('should complete rejection without errors (audit logging happens server-side)', async ({ page }) => {
    // Navigate to review queue
    await page.goto('/review-queue');
    
    const firstItem = page.locator('.review-queue-item').first();
    if (!(await firstItem.isVisible({ timeout: 5000 }))) {
      test.skip('No review queue items available for testing');
    }
    
    await firstItem.click();

    // Reject the item - UI action should complete successfully
    // The audit log is created server-side via logReviewRejection()
    await page.click('button:has-text("Reject")');
    
    // Notes are required for rejection
    await page.fill('textarea[name="notes"]', 'Rejected for P0 testing - invalid data');
    await page.click('button:has-text("Confirm Rejection")');
    
    // Verify rejection completed successfully
    await expect(page.locator('.success-message')).toContainText(/rejected/i);
    
    // Server-side: logReviewRejection creates AuditLog with REVIEW_ITEM_REJECTED
    // Database: AuditLog entry with actor='USER', actorUserId, metadata.reason
  });
});

/**
 * Integration Test Guidance (for developers with database access):
 * 
 * To verify audit logging in integration tests:
 * 
 * 1. Connect to MongoDB test database
 * 2. Perform approve/reject/correction via API
 * 3. Query AuditLog collection:
 *    - For corrections: { eventType: 'REVIEW_ITEM_CORRECTED', reviewItemId: <id> }
 *    - For approvals: { eventType: 'REVIEW_ITEM_APPROVED', reviewItemId: <id> }
 *    - For rejections: { eventType: 'REVIEW_ITEM_REJECTED', reviewItemId: <id> }
 * 4. Assert audit log exists with correct:
 *    - actor: 'USER'
 *    - actorUserId: <userId>
 *    - beforeState/afterState (for corrections)
 *    - metadata (notes/reason)
 *    - createdAt timestamp
 * 5. Verify AuditLog is immutable (cannot be updated)
 */

