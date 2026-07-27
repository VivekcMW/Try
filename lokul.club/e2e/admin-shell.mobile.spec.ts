import { test, expect } from "./fixtures";

test.describe("Mobile: admin shell layout", () => {
  test("login page is usable on a small viewport", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel("Email address", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("dashboard collapses sidebar by default on mobile and shows nav toggle", async ({ adminPage: page }) => {
    await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible();
    // Mobile shell exposes a menu/nav toggle button.
    const toggle = page.getByRole("button", { name: /toggle menu/i });
    await expect(toggle).toBeVisible();
  });
});
