import { defineConfig } from "@playwright/test";

/**
 * Browser smoke tests against a production build: `npm run build` first,
 * then `npm run test:smoke`, which starts `next start` on a spare port and
 * opens the main pages in Chromium. Without Supabase credentials the site
 * serves the illustrative fixtures, which is enough to catch a page that
 * no longer renders.
 */
const PORT = Number(process.env.SMOKE_PORT ?? 3100);

/**
 * A Chromium outside Playwright's own cache, such as a system install:
 * set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to use it instead of running
 * `npx playwright install chromium`.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
});
