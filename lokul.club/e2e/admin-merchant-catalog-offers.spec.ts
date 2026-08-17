import { test, expect } from "./fixtures";

test.describe("Admin merchant catalog & offers oversight", () => {
  test("Merchant Catalog page lists real catalog items", async ({ adminPage: page }) => {
    await page.goto("/admin/merchant-catalog");
    await expect(page.getByRole("heading", { name: /merchant catalog/i })).toBeVisible();
    await expect(page.getByText("Basmati Rice 5kg")).toBeVisible();
    await expect(page.getByText("Rahul's Grocery")).toBeVisible();
  });

  test("Merchant Offers page lists real offers", async ({ adminPage: page }) => {
    await page.goto("/admin/merchant-offers");
    await expect(page.getByRole("heading", { name: /merchant offers/i })).toBeVisible();
    await expect(page.getByText(/weekend 15% off/i)).toBeVisible();
  });

  test("Feature Flags page can open the New flag modal", async ({ adminPage: page }) => {
    await page.goto("/admin/flags");
    await page.getByRole("button", { name: /new flag/i }).click();
    await expect(page.getByRole("heading", { name: /new feature flag/i })).toBeVisible();
    await expect(page.getByPlaceholder(/e\.g\. merchant_reviews/i)).toBeVisible();
  });
});
