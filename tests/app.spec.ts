import { test, expect } from '@playwright/test';

const DEPLOYED_URL = 'https://kristopherjohnson.github.io/blackjack_strategy_react/';

test.describe('Blackjack Strategy E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the deployed app before each test
    await page.goto(DEPLOYED_URL);
  });

  test('should load the page and verify the title', async ({ page }) => {
    // Verify the page title
    await expect(page).toHaveTitle('Blackjack Strategy');

    // Verify that the table header exists
    await expect(page.locator('text=Dealer Shows')).toBeVisible();
    await expect(page.locator('text=Your Hand')).toBeVisible();
  });

  test('should support bottom navigation tab switching', async ({ page }) => {
    // We start in Practice tab. Verify practice elements exist
    await expect(page.locator('#practice-tab-panel')).toBeVisible();

    // Click on Reference tab button
    await page.click('id=tab-reference');
    await expect(page.locator('#reference-tab-panel')).toBeVisible();
    // Verify Strategy Chart elements are visible
    await expect(page.locator('text=Strategy Chart')).toBeVisible();
    await expect(page.locator('text=Hard')).toBeVisible();

    // Click on Statistics tab button
    await page.click('id=tab-statistics');
    await expect(page.locator('#statistics-tab-panel')).toBeVisible();
    // Verify Statistics dashboard components
    await expect(page.locator('h2:has-text("Statistics")')).toBeVisible();
    await expect(page.locator('text=All Hands')).toBeVisible();
  });

  test('should perform practice gameplay sequence', async ({ page }) => {
    // Ensure we are in Practice tab
    await expect(page.locator('#practice-tab-panel')).toBeVisible();

    // Verify action buttons are visible and active
    const hitButton = page.locator('button:has-text("Hit")');
    const standButton = page.locator('button:has-text("Stand")');
    const doubleButton = page.locator('button:has-text("Double")');

    await expect(hitButton).toBeVisible();
    await expect(standButton).toBeVisible();
    await expect(doubleButton).toBeVisible();

    // Click on "Stand" button to make a play
    await standButton.click();

    // Verify feedback card is shown (e.g. Correct! or Wrong)
    const feedbackCard = page.locator('.glass-card', { hasText: /(Correct!|Wrong)/ });
    await expect(feedbackCard).toBeVisible();

    // Verify that the buttons are replaced by the "Next Hand" button
    const nextHandBtn = page.locator('button:has-text("Next Hand")');
    await expect(nextHandBtn).toBeVisible();
    await expect(hitButton).not.toBeVisible();

    // Click "Next Hand" and verify it returns to awaiting action state
    await nextHandBtn.click();
    await expect(feedbackCard).not.toBeVisible();
    await expect(hitButton).toBeVisible();
  });
});
