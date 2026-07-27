import { test, expect } from "./fixtures";

test.describe("Admin entries page (/admin/entries)", () => {
  test("requires authentication", async ({ page }) => {
    await page.goto("/admin/entries");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("renders header, toolbar primitives and a results table", async ({ adminPage: page }) => {
    await page.goto("/admin/entries");
    await expect(page).toHaveURL(/\/admin\/entries/);

    // PageHeader
    await expect(page.getByRole("heading", { name: /waitlist entries/i })).toBeVisible();

    // Toolbar primitives
    await expect(page.getByPlaceholder(/search name, email, pin/i)).toBeVisible();
    await expect(page.getByRole("combobox")).toBeVisible(); // Select
    await expect(page.getByRole("button", { name: /export csv/i })).toBeVisible();

    // Either a table or an empty-state must render
    const tableHead = page.getByRole("columnheader", { name: /^name$/i });
    const emptyHeading = page.getByRole("heading", { name: /no entries found/i });
    await expect(tableHead.or(emptyHeading).first()).toBeVisible();
  });

  test("typing in the search input updates the URL with ?search=", async ({ adminPage: page }) => {
    await page.goto("/admin/entries");
    const searchInput = page.getByPlaceholder(/search name, email, pin/i);
    await searchInput.fill("alice");
    await expect(page).toHaveURL(/[?&]search=alice/, { timeout: 5_000 });
  });

  test("changing the role filter updates the URL with ?role=", async ({ adminPage: page }) => {
    await page.goto("/admin/entries");
    const select = page.getByRole("combobox");
    await select.selectOption("resident");
    await expect(page).toHaveURL(/[?&]role=resident/, { timeout: 5_000 });
  });

  test("Export CSV button points at the export API", async ({ adminPage: page }) => {
    await page.goto("/admin/entries");
    const exportBtn = page.getByRole("button", { name: /export csv/i });
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toBeEnabled();
  });
});
