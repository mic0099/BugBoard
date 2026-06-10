import { test, expect } from '@playwright/test';

test.use({
  storageState: { cookies: [], origins: [] }
});

test.describe('Login', () => {

  test('should login successfully', async ({ page }) => {

    await page.goto('/login');

    await expect(page)
      .toHaveURL(/login/);

    await page.locator('[formcontrolname="email"]')
      .fill('playwright_admin@test.it');

    await page.locator('[formcontrolname="password"]')
      .fill('PlaywrightTester12345!');

    await page.locator('[formcontrolname="rememberMe"]')
      .check();

    await page.getByRole('button', {
      name: /log in/i
    }).click();

    await expect(page)
      .toHaveURL(/projectList/);

    await expect(
      page.getByText(/project dashboard/i)
    ).toBeVisible();

  });

});