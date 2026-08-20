import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

type DemoPayload = { weeklyReviews: Array<{ weekStart: string }> };

function completedWeek(): string {
  const payload = JSON.parse(readFileSync('public/demo/trajectory-demo.json', 'utf8')) as DemoPayload;
  return payload.weeklyReviews.at(-1)!.weekStart;
}

async function settleScreenshot(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

test('bootstraps the synthetic Today state and captures the mobile screen', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Сегодня', level: 1 })).toBeVisible();
  await expect(page.getByLabel('Текущая цель')).toContainText('Подготовить короткий доклад');
  await expect(page.getByText('Первый час без уведомлений')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Сбросить демо-данные' })).toBeVisible();
  const navigation = page.locator('.bottom-nav');
  const lastNavigationItem = navigation.locator('.bottom-nav__item').last();
  await expect(navigation.locator('.bottom-nav__item')).toHaveCount(3);
  const navigationBox = await navigation.boundingBox();
  const lastNavigationItemBox = await lastNavigationItem.boundingBox();
  expect(navigationBox).not.toBeNull();
  expect(lastNavigationItemBox).not.toBeNull();
  expect(navigationBox!.x + navigationBox!.width - (lastNavigationItemBox!.x + lastNavigationItemBox!.width)).toBeLessThanOrEqual(8);
  await settleScreenshot(page);
  await page.locator('.demo-controls').evaluate((element) => ((element as HTMLElement).style.visibility = 'hidden'));
  await page.screenshot({ path: 'docs/screenshots/trajectory-today-mobile.png' });
  await context.close();
});

test('accepts a decimal comma and persists changes in IndexedDB across reloads', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const note = page.getByPlaceholder('Например: после прогулки стало легче собраться с мыслями');
  await note.fill('Synthetic persistence check');
  const weight = page.getByLabel('Вес');
  await weight.fill('88,2');
  const saveButton = page.locator('.floating-save-button');
  await expect(saveButton).toContainText('Сохранить изменения');
  await saveButton.click();
  await expect(page.getByText(/обновлена на устройстве|День сохранён на устройстве/)).toBeVisible();
  await page.reload();
  await expect(note).toHaveValue('Synthetic persistence check');
  await expect(weight).toHaveValue('88.2');
});

test('keeps the help dialog open after a pointer gesture from content to backdrop', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Как работает приложение' }).click();
  const dialog = page.getByRole('dialog', { name: 'Зачем нужна «Траектория»' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  const dialogBox = await dialog.boundingBox();
  const backdropBox = await page.locator('.help-backdrop').boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(backdropBox).not.toBeNull();
  await page.mouse.move(dialogBox!.x + 20, dialogBox!.y + 20);
  await page.mouse.down();
  await page.mouse.move(backdropBox!.x + 2, backdropBox!.y + 2);
  await page.mouse.up();
  await expect(dialog).toBeVisible();

  await page.getByRole('button', { name: 'Закрыть объяснение' }).click();
  await expect(dialog).toBeHidden();
});

test('navigates through Week and Trends and captures representative analytics', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/#/week?week=${completedWeek()}`);
  await expect(page.getByRole('heading', { name: 'Неделя', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'На что обратить внимание' })).toBeVisible();
  await settleScreenshot(page);
  await page.screenshot({ path: 'docs/screenshots/trajectory-week-review.png' });

  const review = page.locator('#week-review');
  await expect(review).toBeVisible();
  const reviewContext = review.locator('.review-context-details');
  if ((await reviewContext.getAttribute('open')) !== null) await reviewContext.locator('summary').click();
  await review.screenshot({
    path: 'docs/screenshots/trajectory-week-decision.png',
    style: '.bottom-nav { display: none !important; }',
  });

  await page.setViewportSize({ width: 1400, height: 600 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await settleScreenshot(page);
  await page.screenshot({ path: 'docs/screenshots/trajectory-profile-cover.png' });

  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.getByRole('link', { name: 'История' }).click();
  await expect(page.getByRole('heading', { name: 'История изменений', level: 1 })).toBeVisible();
  await page.getByText('Показать один показатель по месяцам').click();
  await expect(page.locator('[aria-label^="Динамика:"]')).toBeVisible();
  await page.locator('.history-timeline--featured').evaluate((element) => element.setAttribute('hidden', ''));
  await page.locator('.dashboard-card--insights').evaluate((element) => element.setAttribute('hidden', ''));
  await page.evaluate(() => window.scrollTo(0, 0));
  await settleScreenshot(page);
  await page.screenshot({ path: 'docs/screenshots/trajectory-trends.png' });
});
