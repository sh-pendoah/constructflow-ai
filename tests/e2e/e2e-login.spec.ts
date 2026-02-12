import { test, expect } from '@playwright/test';

test('Login flow', async ({ page }) => {
  // 1. Navigate to login page
  await page.goto('http://localhost:3001/login');
  await expect(page).toHaveTitle(/Worklighter/); 

  // 2. Enter credentials
  await page.fill('input[type="email"]', 'lee321@yopmail.com');
  await page.fill('input[type="password"]', 'Test1234$');


  // 3. Click Sign In
  const signInButton = page.getByRole('button', { name: /Sign In/i });
  await expect(signInButton).toBeVisible();
  await signInButton.click();

  // 4. Wait for redirect
  // This waits for the URL to contain dashboard. If it redirects back to login, this might pass if it hit dashboard briefly, or fail if it never hit it.
  // We'll wait longer and print URL.
  await page.waitForTimeout(3000); // Wait for potential redirects
  console.log(`Current URL: ${page.url()}`);
  
  if (page.url().includes('login')) {
      console.error('Redirected back to login page. Auth failed?');
      throw new Error('Redirected back to login');
  }

  // 5. Verify dashboard content
  await expect(page).toHaveURL(/.*dashboard/);
  // Matches "Welcome, User!" or similar
  await expect(page.getByText(/Welcome/i)).toBeVisible({ timeout: 10000 });
});
