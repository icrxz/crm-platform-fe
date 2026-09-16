import { expect, test } from '@playwright/test';

// Fixture routes render each page's real component tree with fixed mock
// data (no auth/backend needed) — see src/app/qa-fixtures. Catches "content
// invisible/unreachable at some monitor resolution" regressions, the class
// of bug that motivated this suite (justify-center hiding overflowed
// content, missing overflow-y-auto on the sidebar, etc).
const routes = [
  'cases',
  'customers',
  'partners',
  'contractors',
  'payments',
  'users',
  'sidebar',
  'case-details',
];

for (const route of routes) {
  test(`${route} renders with no clipped/hidden content`, async ({ page }) => {
    await page.goto(`/qa-fixtures/${route}`);
    await expect(page).toHaveScreenshot(`${route}.png`, { fullPage: false });
  });
}
