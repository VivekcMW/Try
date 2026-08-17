import { test, expect } from "./fixtures";

test.describe("Admin merchants list — workflow audit", () => {
  test("lists all merchants and flags missing/mismatched workflow profiles", async ({ adminPage: page }) => {
    await page.goto("/admin/merchants");
    await expect(page.getByRole("heading", { name: /merchants/i })).toBeVisible();

    // All seeded merchants show up in the table.
    await expect(page.getByText("Rahul's Grocery")).toBeVisible();
    await expect(page.getByText("Vikram Electricals")).toBeVisible();
    await expect(page.getByText("Amit Fast Food")).toBeVisible();
    await expect(page.getByText("Priya Boutique")).toBeVisible();

    // Vikram Electricals never had a workflow set → flagged as Missing.
    const vikramRow = page.locator("tr", { hasText: "Vikram Electricals" });
    await expect(vikramRow.getByText("Missing")).toBeVisible();

    // Amit Fast Food is a restaurant stored as "retail" → flagged as mismatched.
    const amitRow = page.locator("tr", { hasText: "Amit Fast Food" });
    await expect(amitRow.getByText(/Retail ≠ Food/i)).toBeVisible();

    // Summary banner surfaces the count needing review.
    await expect(page.getByText(/merchants? need workflow review/i)).toBeVisible();
  });
});
