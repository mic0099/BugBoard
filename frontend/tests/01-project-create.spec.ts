import { test, expect } from '@playwright/test';

test.describe('Project Creation', () => {

  test('should create a new project', async ({ page }) => {

    const projectTitle = `project-test-E2E-${Date.now()}`;  

    await page.goto('/projectList');
    await expect(page).toHaveURL(/projectList/);

    await page.getByTestId('new-project-button').click();
    await expect(page).toHaveURL(/newproject/);

    await page.getByTestId('project-name-input').fill(projectTitle);

    await page.getByTestId('project-add-email-button').click();

    await page.getByTestId('project-email-input')
      .fill('playwright_admin@test.it');

    const createProjectResponse = page.waitForResponse(response =>
      response.url().includes('/addProject') &&
      response.request().method() === 'POST'
    );

    await page.getByTestId('project-submit-button').click();

    const response = await createProjectResponse;
    expect(response.status()).toBe(201);

    await page.getByTestId('project-cancel-button').click();

    await expect(page).toHaveURL(/projectList/);

    await page.reload();
    await page.waitForLoadState('networkidle');

    const projects = await page
      .getByTestId('name-project')
      .allTextContents();

    const normalizedProjects = projects.map(p => p.trim());

    expect(normalizedProjects).toContain(projectTitle);

  });

});