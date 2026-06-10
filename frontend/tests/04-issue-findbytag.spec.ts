import test, { expect } from "@playwright/test";

test.describe('Issue Search', () => {

  test('should search issues by tag', async ({ page }) => {

    const timestamp = Date.now();

    const projectName = `project-test-E2E-${timestamp}`;
    const issueTitle = `issue-E2E-${timestamp % 10000}`;
    const tagName = `test-tag-${timestamp}`;

    await page.goto('/projectList');

    await expect(page).toHaveURL(/projectList/);

    // ==========================================
    // Creazione progetto
    // ==========================================

    const createProjectResponse = page.waitForResponse(
      response =>
        response.url().includes('/addProject') &&
        response.request().method() === 'POST'
    );

    await page.getByTestId('new-project-button')
      .click();

    await expect(page).toHaveURL(/newproject/);

    await page.getByTestId('project-name-input')
      .fill(projectName);

    await page.getByTestId('project-submit-button')
      .click();

    const projectResponse = await createProjectResponse;

    expect(projectResponse.status()).toBe(201);

    await page.getByTestId('project-cancel-button')
      .click();

    await expect(page).toHaveURL(/projectList/);

    await page.reload();

    await page.waitForLoadState('networkidle');

    // Apertura progetto appena creato

 await page.getByTestId('name-project')
  .filter({ hasText: projectName })
  .click();

    await expect(page).toHaveURL(/issues/);

    // ==========================================
    // Creazione issue
    // ==========================================

    await page.getByTestId('new-issue-button')
      .click();

    await expect(page).toHaveURL(/issues\/new/);

    await page.locator('#issue-title-input')
      .fill(issueTitle);

    await page.locator('#issue-description-input')
      .fill('issue creata per test ricerca tag');

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

    const createIssueResponse = page.waitForResponse(
      response =>
        response.url().includes('/addIssue') &&
        response.request().method() === 'POST'
    );

    await page.locator('#issue-submit-button')
      .click();

    const createResponse = await createIssueResponse;

    expect(createResponse.status()).toBe(201);

    await page.locator('#issue-decline-button')
      .click();

    await expect(page).toHaveURL(/issues/);

    // ==========================================
    // Ricerca per tag
    // ==========================================

    await page.getByTestId('tag-search-input')
      .fill(tagName);

    await page.getByTestId('tag-search-input')
      .press('Enter');

    await expect(
      page.getByText(issueTitle)
    ).toBeVisible();

    const issues = await page
      .getByTestId('issue-title')
      .allTextContents();

    expect(
      issues.some(issue => issue.includes(issueTitle))
    ).toBeTruthy();

  });

});