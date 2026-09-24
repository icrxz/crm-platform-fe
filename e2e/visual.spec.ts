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
    // Some forms dynamically import(...) client-only widgets (e.g. the file
    // uploader in form-details, ssr:false) that mount after first paint —
    // without this wait the screenshot can race that mount and flake
    // (content shifting into/out of the viewport crop below).
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`${route}.png`, { fullPage: false });
  });
}
