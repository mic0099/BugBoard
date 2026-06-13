import { test, expect } from '@playwright/test';

test.describe('User Creation', () => {

  test('should create a new User account', async ({ page }) => {

    await page.goto('/projectList');
    await expect(page).toHaveURL(/projectList/);

    await page.getByTestId('new-user-button').click();
    await expect(page).toHaveURL(/addUser/);

    await page.getByTestId('user-name-input').fill('user');

    await page.getByTestId('user-surname-input').fill('test');

    await page.getByTestId('user-email-input').fill(
      `test${Date.now()}@test.com`
    );

    await page.getByTestId('user-password-input').fill('Test09*123');

    const createUserResponse = page.waitForResponse(
      response =>
        response.url().includes('/register') && 
        response.request().method() === 'POST'
    );

    await page.getByTestId('user-submit-button').click();

    const response = await createUserResponse;

    expect(response.status()).toBe(201); 
 
    await expect(
      page.getByText(/user created/i)
    ).toBeVisible();

  }); 
})
