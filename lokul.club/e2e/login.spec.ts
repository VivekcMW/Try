import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./fixtures";

test.describe("Admin login page", () => {
  test("renders the login form using design-system primitives", async ({ page }) => {
    await page.goto("/admin/login");

    // The actual h1 rendered by the login card
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

    // FormField labels (exact match avoids matching unrelated text)
    await expect(page.getByLabel("Email address", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();

    // Primary Button primitive
    const submit = page.getByRole("button", { name: /sign in/i });
    await expect(submit).toBeVisible();
    await expect(submit).toBeEnabled();
  });

  test("shows an Alert when credentials are invalid", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email address", { exact: true }).fill("wrong@example.com");
    await page.getByLabel("Password", { exact: true }).fill("badpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Filter out the Next.js route announcer (also role="alert" but always empty).
    const alert = page
      .getByRole("alert")
      .filter({ hasText: /invalid|incorrect|failed|wrong/i });
    await expect(alert).toBeVisible({ timeout: 10_000 });

    // Still on the login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("logs in successfully with valid credentials and redirects to dashboard", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email address", { exact: true }).fill(ADMIN_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(ADMIN_PASSWORD);

    await Promise.all([
      page.waitForURL(/\/admin\/dashboard/, { timeout: 15_000 }),
      page.getByRole("button", { name: /sign in/i }).click(),
    ]);

    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});
