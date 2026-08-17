import { test, expect } from "./fixtures";

test.describe("Admin merchant back-office oversight", () => {
  test("Merchant Orders page lists real merchant orders", async ({ adminPage: page }) => {
    await page.goto("/admin/merchant-orders");
    await expect(page.getByRole("heading", { name: /merchant orders/i })).toBeVisible();
    await expect(page.getByText("#LK-2026-0001")).toBeVisible();
    await expect(page.getByText("Rahul's Grocery")).toBeVisible();
  });

  test("Merchant Coupons page lists real coupons", async ({ adminPage: page }) => {
    await page.goto("/admin/merchant-coupons");
    await expect(page.getByRole("heading", { name: /merchant coupons/i })).toBeVisible();
    await expect(page.getByText("WELCOME10")).toBeVisible();
  });

  test("Merchant Broadcasts page lists real broadcasts", async ({ adminPage: page }) => {
    await page.goto("/admin/merchant-broadcasts");
    await expect(page.getByRole("heading", { name: /merchant broadcasts/i })).toBeVisible();
    await expect(page.getByText(/diwali sale/i)).toBeVisible();
  });

  test("Merchant Branches page lists real branches", async ({ adminPage: page }) => {
    await page.goto("/admin/merchant-branches");
    await expect(page.getByRole("heading", { name: /merchant branches/i })).toBeVisible();
    await expect(page.getByText(/hsr layout branch/i)).toBeVisible();
  });

  test("Revenue page surfaces merchant GMV alongside ad revenue", async ({ adminPage: page }) => {
    await page.goto("/admin/revenue");
    await expect(page.getByText(/merchant gmv \(all-time\)/i)).toBeVisible();
    await expect(page.getByText(/top merchants by gmv/i)).toBeVisible();
  });
});
