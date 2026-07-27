import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration for lokul.club admin dashboard.
 *
 * Boots a dedicated Next.js dev server on port 3398 with `E2E_TEST=1` so the
 * admin-stats layer returns deterministic in-memory fixtures (no Postgres
 * required). Set `E2E_BASE_URL=http://localhost:3399` to instead run against
 * an already-running dev server.
 */

// Make E2E_TEST visible to the Playwright test process itself (not just the
// webServer child process) so that conditional skips in spec files work.
process.env.E2E_TEST = "1";

const PORT = Number(process.env.E2E_PORT || 3398);
const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 8_000,
    navigationTimeout: 30_000,
  },

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- -p ${PORT}`,
        url: `${BASE_URL}/admin/login`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe",
        env: {
          E2E_TEST: "1",
          NODE_ENV: "development",
          // next-auth uses these to build the redirect URL it returns to the
          // client (e.g. for signOut). They MUST match the port Playwright
          // boots on, otherwise the client gets sent to a different origin
          // and cookies / session state appear stale to subsequent assertions.
          NEXTAUTH_URL: BASE_URL,
          NEXTAUTH_URL_INTERNAL: BASE_URL,
        },
      },

  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /.*\.mobile\.spec\.ts/,
    },
  ],
});
