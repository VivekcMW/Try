import { test, expect } from "@playwright/test";

test.describe("Language translation", () => {
  test("switches the public landing page between English and Hindi", async ({ page }) => {
    await page.goto("/");

    const languageSelect = page.getByLabel("Language");
    const nav = page.getByRole("navigation");

    await expect(languageSelect).toBeVisible();
    await expect(nav.getByRole("link", { name: "How it works" })).toBeVisible();

    await languageSelect.selectOption("hi");

    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
    await expect(nav.getByRole("link", { name: "यह कैसे काम करता है" })).toBeVisible();

    await languageSelect.selectOption("en");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(nav.getByRole("link", { name: "How it works" })).toBeVisible();
  });
});
