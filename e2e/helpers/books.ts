import { expect, type Page } from '@playwright/test';

export async function fillBookUploadForm(page: Page, bookTitle: string, xmlContent: string) {
  await page.getByLabel('Book title').fill(bookTitle);
  await page.getByRole('textbox', { name: 'XML content' }).fill(xmlContent);
}

export async function waitForBookReady(page: Page, bookTitle: string, timeoutMs = 120_000) {
  await expect
    .poll(
      async () => {
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Nuxt + Nest Book Platform', level: 1 })).toBeVisible();
        return page.locator('.v-list-item', { hasText: bookTitle }).textContent();
      },
      {
        timeout: timeoutMs,
        message: 'Waiting for RabbitMQ worker to mark book as READY',
      },
    )
    .toContain('READY');

  return page.locator('.v-list-item', { hasText: bookTitle });
}
