import { test, expect } from '@playwright/test';

test.describe('Issue Creation', () => {

  test('should create a new issue with tag and image', async ({ page }) => {

    const issueTitle = `issue-E2E-${Date.now() % 10000}`;
    const projectTitle = `project-test-E2E${Date.now() % 10000}`;
    const tagName = 'test-tag'; 

    await page.goto('/projectList');

    await expect(page).toHaveURL(/projectList/);

    // CREATE PROJECT

    await page.getByTestId('new-project-button')
      .click();

    await expect(page)
      .toHaveURL(/newproject/);

    await page.getByTestId('project-name-input')
      .fill(projectTitle);

    await page.getByTestId('project-add-email-button')
      .click();

    await page.getByTestId('project-email-input')
      .fill('playwright_admin@test.it');

    const createProjectResponse = page.waitForResponse(
      response =>
        response.url().includes('/addProject') &&
        response.request().method() === 'POST'
    );

    await page.getByTestId('project-submit-button')
      .click();

    const projectResponse = await createProjectResponse;

    expect(projectResponse.status())
      .toBe(201);

    await page.getByTestId('project-cancel-button')
      .click();

    await expect(page)
      .toHaveURL(/projectList/);

    await page.reload();

    await page.waitForLoadState('networkidle');

    await page
      .getByTestId('name-project')
      .filter({ hasText: projectTitle })
      .click();

    await expect(page).toHaveURL(/issues/);

    // CREATE ISSUE

    await page.getByTestId('new-issue-button')
      .click();

    await expect(page).toHaveURL(/issues\/new/);

    await page.locator('#issue-title-input')
      .fill(issueTitle);

    await page.locator('#issue-description-input')
      .fill('issue generata da test end to end');

    await page.locator('#issue-priority-select')
      .selectOption('high');

    await page.locator('#issue-type-select')
      .selectOption('bug');

    await page.locator('#issue-status-select')
      .selectOption('open');

    await page.locator('#issue-add-tag-button')
      .click();

    await page.getByTestId('issue-tag-input')
      .fill(tagName);

    await page.locator('#issue-image-input')
      .setInputFiles('tests/fixtures/test-image.jpg');

    const createIssueResponse = page.waitForResponse(
      response =>
        response.url().includes('/addIssue') &&
        response.request().method() === 'POST'
    );

    await page.locator('#issue-submit-button')
      .click();

    const response = await createIssueResponse;

    expect(response.status()).toBe(201);

    await page.locator('#issue-decline-button')
      .click();

    await expect(page).toHaveURL(/issues/);

    await page.reload();

    await page.waitForLoadState('networkidle');

    const issues = await page
      .getByTestId('issue-title')
      .allTextContents();

    const normalizedIssues =
      issues.map(issue => issue.trim());

    expect(normalizedIssues)
      .toContain(issueTitle);

    await page.getByText(issueTitle)
      .click();

    await expect(page)
      .toHaveURL(/comments\/\d+/);

    const image = page.getByTestId('comment-issue-image');

    await expect(image)
      .toBeVisible();

    const isLoaded = await image.evaluate(
      (img: HTMLImageElement) => {
        return img.complete && img.naturalWidth > 0;
      }
    );

    expect(isLoaded)
      .toBe(true);

  });

});


test.describe('Issue Creation', () => {

  test('should create a new issue without tag and image', async ({ page }) => {

    const issueTitle = `issue-E2E-${Date.now() % 10000}`;
    const projectTitle = `project-test-E2E${Date.now() % 10000}`;

    await page.goto('/projectList');

    await expect(page).toHaveURL(/projectList/);

    // CREATE PROJECT

    await page.getByTestId('new-project-button')
      .click();

    await expect(page)
      .toHaveURL(/newproject/);

    await page.getByTestId('project-name-input')
      .fill(projectTitle);

    await page.getByTestId('project-add-email-button')
      .click();

    await page.getByTestId('project-email-input')
      .fill('playwright_admin@test.it');

    const createProjectResponse = page.waitForResponse(
      response =>
        response.url().includes('/addProject') &&
        response.request().method() === 'POST'
    );

    await page.getByTestId('project-submit-button')
      .click();

    const projectResponse = await createProjectResponse;

    expect(projectResponse.status())
      .toBe(201);

    await page.getByTestId('project-cancel-button')
      .click();

    await expect(page)
      .toHaveURL(/projectList/);

    await page.reload();

    await page.waitForLoadState('networkidle');

    await page
      .getByTestId('name-project')
      .filter({ hasText: projectTitle })
      .click();

    await expect(page).toHaveURL(/issues/);

    // CREATE ISSUE

    await page.getByTestId('new-issue-button')
      .click();

    await expect(page).toHaveURL(/issues\/new/);

    await page.locator('#issue-title-input')
      .fill(issueTitle);

    await page.locator('#issue-description-input')
      .fill('issue generata da test end to end');

    await page.locator('#issue-priority-select')
      .selectOption('high');

    await page.locator('#issue-type-select')
      .selectOption('bug');

    await page.locator('#issue-status-select')
      .selectOption('open');

    const createIssueResponse = page.waitForResponse(
      response =>
        response.url().includes('/addIssue') &&
        response.request().method() === 'POST'
    );

    await page.locator('#issue-submit-button')
      .click();

    const response = await createIssueResponse;

    expect(response.status()).toBe(201);

    await page.locator('#issue-decline-button')
      .click();

    await expect(page).toHaveURL(/issues/);

    await page.reload();

    await page.waitForLoadState('networkidle');

    const issues = await page
      .getByTestId('issue-title')
      .allTextContents();

    const normalizedIssues =
      issues.map(issue => issue.trim());

    expect(normalizedIssues)
      .toContain(issueTitle);

  });

});