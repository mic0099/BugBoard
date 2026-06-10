import { test, expect } from '@playwright/test';

test.describe('Comment Creation', () => {

  test('should create a new comment', async ({ page }) => {

    const timestamp = Date.now();

    const projectName = `project-test-E2E-${timestamp}`;
    const issueTitle = `issue-E2E-${timestamp % 10000}`;
    const commentContent = `commento creato da test end to end-${timestamp}`;

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
      .fill('issue creata per test commenti');

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

    const issueResponse = await createIssueResponse;

    expect(issueResponse.status()).toBe(201);

    const issueBody = await issueResponse.json();

    const issueId = issueBody.issueId;

    await page.locator('#issue-decline-button')
      .click();

    await expect(page).toHaveURL(/issues/);

    // ==========================================
    // Creazione commento
    // ==========================================

    await page.goto(`/comments/${issueId}`);

    await expect(page).toHaveURL(
      new RegExp(`/comments/${issueId}`)
    );

    await page.getByTestId('comment-input')
      .fill(commentContent);

    const createCommentResponse = page.waitForResponse(
      response =>
        response.url().includes('/comments') &&
        response.request().method() === 'POST'
    );

    await page.getByTestId('comment-submit-button')
      .click();

    const response = await createCommentResponse;

    expect(response.status()).toBe(201);

    await page.reload();

    await page.waitForLoadState('networkidle');

    const comments = await page
      .getByTestId('comment-item')
      .allTextContents();

    const normalizedComments =
      comments.map(comment => comment.trim());

    expect(normalizedComments)
      .toContain(commentContent);

  });

});