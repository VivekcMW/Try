import { test, expect } from "./fixtures";

test.describe("Admin dashboard (/admin/dashboard)", () => {
  test("redirects unauthenticated visitors back to /admin/login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("renders PageHeader, four StatCards and three chart cards when authenticated", async ({ adminPage: page }) => {
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // PageHeader title + description
    await expect(page.getByRole("heading", { name: /^overview$/i })).toBeVisible();
    await expect(page.getByText(/platform health at a glance/i)).toBeVisible();

    // Four representative MiniStatCard labels (People section)
    await expect(page.getByText(/^total users$/i)).toBeVisible();
    await expect(page.getByText(/^waitlist$/i).first()).toBeVisible();
    await expect(page.getByText(/^today$/i).first()).toBeVisible();
    await expect(page.getByText(/^this week$/i).first()).toBeVisible();

    // Three chart section titles
    await expect(page.getByText(/signups\s*—\s*last 30 days/i)).toBeVisible();
    await expect(page.getByText(/role breakdown/i)).toBeVisible();
    await expect(page.getByText(/top 10 pin codes/i)).toBeVisible();

    // Recharts renders <svg class="recharts-surface">
    const surfaces = page.locator("svg.recharts-surface");
    await expect(surfaces.first()).toBeVisible({ timeout: 10_000 });
    expect(await surfaces.count()).toBeGreaterThanOrEqual(1);
  });

  test("sidebar exposes navigation to Entries and a Sign out control", async ({ adminPage: page }) => {
    await expect(page.getByRole("link", { name: /dashboard/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /entries/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();
  });

  test("clicking the Entries nav link navigates to /admin/entries", async ({ adminPage: page }) => {
    await page.getByRole("link", { name: /entries/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/entries/);
    await expect(page.getByRole("heading", { name: /waitlist entries/i })).toBeVisible();
  });

  test("Sign out returns the user to the login page", async ({ adminPage: page }) => {
    // The app authenticates admins via a local `admin_session` cookie (not
    // NextAuth's own session endpoint, which is unused/stale here), so verify
    // sign-in/out state by inspecting that cookie directly.
    const cookiesBefore = await page.context().cookies();
    expect(cookiesBefore.some((c) => c.name === "admin_session" && c.value === "authenticated")).toBe(true);

    await page.getByRole("button", { name: /sign out/i }).click();

    await expect.poll(
      async () => {
        const cookiesAfter = await page.context().cookies();
        return cookiesAfter.some((c) => c.name === "admin_session" && c.value === "authenticated");
      },
      { timeout: 15_000, intervals: [200, 400, 800] },
    ).toBe(false);

    // With the session cleared, a protected route must redirect to the login page.
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
