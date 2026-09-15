import { defineConfig } from '@playwright/test';

// executablePath pins Playwright to the system Chromium instead of
// downloading its own browser binary, matching what CI/sandboxed
// environments already have available.
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
  ],
});
