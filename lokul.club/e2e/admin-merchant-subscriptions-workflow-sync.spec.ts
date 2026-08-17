import { test, expect } from "./fixtures";

test.describe("Admin merchant subscriptions oversight", () => {
  test("Merchant Subscriptions page lists real subscriptions", async ({ adminPage: page }) => {
    await page.goto("/admin/merchant-subscriptions");
    await expect(page.getByRole("heading", { name: /merchant subscriptions/i })).toBeVisible();
    await expect(page.getByText("Daily Milk 1L")).toBeVisible();
    await expect(page.getByText("Rahul's Grocery")).toBeVisible();
  });
});

test.describe("Admin merchants — workflow sync action", () => {
  test("Sync button appears next to a Missing/Mismatch workflow badge", async ({ adminPage: page }) => {
    await page.goto("/admin/merchants");
    const vikramRow = page.locator("tr", { hasText: "Vikram Electricals" });
    await expect(vikramRow.getByText("Missing")).toBeVisible();
    await expect(vikramRow.getByRole("button", { name: /sync/i })).toBeVisible();
  });
});
