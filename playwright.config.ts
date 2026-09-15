import { defineConfig } from '@playwright/test';

// Escape hatch for ad-hoc local runs (e.g. `npx playwright test`) in an
// environment without the system libs `npx playwright install` needs.
// Do NOT use this to generate/update committed baselines — a different
// Chromium build renders fonts with slightly different anti-aliasing,
// which fails ~every screenshot in CI even with no real layout change
// (see CLAUDE.md). Baselines must come from the same Chromium build CI
// uses: unset this var, or run inside the official Docker image.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL: 'http://localhost:3000',
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { QA_FIXTURES_ENABLED: 'true' },
  },
  projects: [
    {
      name: '1280x720',
      use: { viewport: { width: 1280, height: 720 } },
    },
    {
      name: '1366x768',
      use: { viewport: { width: 1366, height: 768 } },
    },
    {
      name: '1920x1080',
      use: { viewport: { width: 1920, height: 1080 } },
    },
    // Logical (CSS px) viewports for current-generation phones, per DEV.md's
    // mobile pass — iPhone 17 and the Galaxy S line. Not from Playwright's
    // `devices` presets: neither is in the bundled device list yet.
    {
      name: 'iphone-17',
      use: {
        viewport: { width: 393, height: 852 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'galaxy-s',
      use: {
        viewport: { width: 384, height: 854 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
