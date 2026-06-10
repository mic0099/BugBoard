import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {

  await page.goto('http://localhost:4200/login');

  await page.locator('[formcontrolname="email"]')
    .fill('playwright_admin@test.it');  

  await page.locator('[formcontrolname="password"]')
    .fill('PlaywrightTester12345!'); 

  await page.locator('[formcontrolname="rememberMe"]')
    .check();

  await page.getByRole('button', {
    name: /log in/i
  }).click();

  await expect(page).toHaveURL(/projectList/);

  await page.context().storageState({
    path: 'tests/.auth/user.json'
  });

});