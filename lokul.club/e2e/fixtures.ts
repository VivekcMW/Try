import { test as base, expect, type Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL || "admin@lokul.club";
export const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD || "admin123";

/**
 * Performs a real credential-based login against /admin/login and waits for
 * the dashboard route to be reached.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Email address", { exact: true }).fill(ADMIN_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(ADMIN_PASSWORD);
  await Promise.all([
    page.waitForURL(/\/admin\/dashboard/, { timeout: 15_000 }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);
}

export const test = base.extend<{ adminPage: Page }>({
  adminPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
});

export { expect };
