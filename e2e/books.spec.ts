import { expect, test } from './fixtures/auth.fixture';
import { fillBookUploadForm, waitForBookReady } from './helpers/books';

const sampleXml = `<book>
  <title>E2E Playwright Book</title>
  <chapters>
    <chapter>
      <title>Automation</title>
      <paragraph>Playwright validates the upload flow end to end.</paragraph>
    </chapter>
  </chapters>
</book>`;

test.describe('Books', () => {
  test('uploads a book and shows it in the list', async ({ authenticatedPage: page }) => {
    const bookTitle = `E2E Book ${Date.now()}`;

    await fillBookUploadForm(page, bookTitle, sampleXml);
    await page.getByRole('button', { name: 'Queue Book Upload' }).click();

    await expect(page.getByText('Book uploaded. RabbitMQ worker will parse in background.')).toBeVisible();
    await expect(page.getByText(bookTitle)).toBeVisible();
  });

  test('processes uploaded book content in the background', async ({ authenticatedPage: page }) => {
    test.setTimeout(150_000);

    const bookTitle = `E2E Ready Book ${Date.now()}`;

    await fillBookUploadForm(page, bookTitle, sampleXml);
    await page.getByRole('button', { name: 'Queue Book Upload' }).click();
    await expect(page.getByText(bookTitle)).toBeVisible();

    const bookItem = await waitForBookReady(page, bookTitle);

    await bookItem.getByRole('button', { name: 'View' }).click();
    await expect(page.getByText(bookTitle, { exact: true })).toBeVisible();
    await expect(page.getByText('Playwright validates the upload flow end to end.')).toBeVisible();
  });

  test('searches uploaded book content', async ({ authenticatedPage: page }) => {
    test.setTimeout(150_000);

    const bookTitle = `E2E Search Book ${Date.now()}`;

    await fillBookUploadForm(page, bookTitle, sampleXml);
    await page.getByRole('button', { name: 'Queue Book Upload' }).click();
    await expect(page.getByText(bookTitle)).toBeVisible();

    await waitForBookReady(page, bookTitle);

    await page.getByLabel('Search title/content').fill('Playwright validates');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText(bookTitle)).toBeVisible();
  });

});
