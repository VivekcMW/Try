/**
 * E2E tests for the Merchant Dashboard (/merchant/*)
 *
 * Auth flow: phone+OTP login (OTP is always "123456" in E2E/dev mode).
 * All API calls that hit the DB are handled by the E2E stubs — no real DB needed.
 */
import { test, expect, type Page } from "@playwright/test";

const MERCHANT_PHONE = "9000000206"; // seeded merchant account from the live DB

// ── helpers ──────────────────────────────────────────────────────────────────

async function loginAsMerchant(page: Page) {
  await page.goto("/merchant/login");
  await expect(page.getByRole("heading", { name: /merchant dashboard/i })).toBeVisible();

  // The live app defaults to Email mode, and the OTP flow is only rendered after
  // the phone request completes successfully.
  await page.getByRole("button", { name: /^phone$/i }).click();
  await page.getByPlaceholder("98765 43210").fill(MERCHANT_PHONE);

  const sendOtpRequest = page.waitForResponse(
    (response) => response.url().includes("/api/web/otp/send") && response.request().method() === "POST"
  );

  await page.getByRole("button", { name: /send otp/i }).click();
  await sendOtpRequest;

  await expect(page.getByText(/we sent a code to/i)).toBeVisible({ timeout: 15_000 });

  const otpBoxes = page.locator('input[maxlength="1"]');
  await expect(otpBoxes).toHaveCount(6, { timeout: 15_000 });
  await expect(otpBoxes.first()).toBeVisible({ timeout: 15_000 });

  const otp = "123456";
  for (let i = 0; i < otp.length; i++) {
    await otpBoxes.nth(i).fill(otp[i]);
  }

  await page.getByRole("button", { name: /verify otp/i }).click();
  await page.waitForURL(/\/merchant$/, { timeout: 15_000 });
}

// ── fixture ───────────────────────────────────────────────────────────────────

const test2 = test.extend<{ merchantPage: Page }>({
  merchantPage: async ({ page }, use) => {
    await loginAsMerchant(page);
    await use(page);
  },
});

// ── Login page ────────────────────────────────────────────────────────────────

test.describe("Merchant login", () => {
  test("renders the phone entry form", async ({ page }) => {
    await page.goto("/merchant/login");
    await expect(page.getByRole("heading", { name: /merchant dashboard/i })).toBeVisible();
    await page.getByRole("button", { name: /^phone$/i }).click();
    await expect(page.getByPlaceholder("98765 43210")).toBeVisible();
    await expect(page.getByRole("button", { name: /send otp/i })).toBeVisible();
  });

  test("shows OTP step after valid phone", async ({ page }) => {
    await page.goto("/merchant/login");
    await page.getByRole("button", { name: /^phone$/i }).click();
    await page.getByPlaceholder("98765 43210").fill(MERCHANT_PHONE);

    const sendOtpRequest = page.waitForResponse(
      (response) => response.url().includes("/api/web/otp/send") && response.request().method() === "POST"
    );

    await page.getByRole("button", { name: /send otp/i }).click();
    await sendOtpRequest;

    await expect(page.getByText(/we sent a code to/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('input[maxlength="1"]')).toHaveCount(6, { timeout: 15_000 });
    await expect(page.locator('input[maxlength="1"]').first()).toBeVisible({ timeout: 15_000 });
  });

  test("logs in and lands on dashboard", async ({ page }) => {
    await loginAsMerchant(page);
    await expect(page).toHaveURL(/\/merchant$/);
    await expect(page.getByRole("heading", { name: /^dashboard$/i })).toBeVisible();
  });

  test("redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto("/merchant");
    await expect(page).toHaveURL(/\/merchant\/login/, { timeout: 10_000 });
  });
});

// ── Dashboard ─────────────────────────────────────────────────────────────────

test2.describe("Merchant dashboard", () => {
  test2("shows stat cards and quick actions", async ({ merchantPage: page }) => {
    await expect(page.getByRole("heading", { name: /^dashboard$/i })).toBeVisible();
    // At least one stat card
    await expect(page.getByText(/catalog items|pending orders|active offers/i).first()).toBeVisible();
    // Quick Actions section
    await expect(page.getByRole("heading", { name: /quick actions/i })).toBeVisible();
  });

  test2("sidebar has nav links", async ({ merchantPage: page }) => {
    await expect(page.getByRole("link", { name: /catalog/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /offers/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /orders/i }).first()).toBeVisible();
  });

  test2("shows pro tip panel", async ({ merchantPage: page }) => {
    await expect(page.getByText(/pro tip/i)).toBeVisible();
  });
});

// ── Catalog ───────────────────────────────────────────────────────────────────

test2.describe("Catalog page", () => {
  test2.beforeEach(async ({ merchantPage: page }) => {
    await page.goto("/merchant/catalog");
  });

  test2("renders the catalog heading", async ({ merchantPage: page }) => {
    // scope to the page title (h1) — the empty-state h3 ("No catalog items
    // yet") also matches /catalog/i and would otherwise trip strict mode.
    await expect(page.getByRole("heading", { name: /catalog/i, level: 1 })).toBeVisible({ timeout: 10_000 });
  });

  test2("shows Add Item button", async ({ merchantPage: page }) => {
    // the empty-state also renders its own "Add Product" CTA; .first() picks
    // the header button.
    await expect(page.getByRole("button", { name: /add.*item|add product/i }).first()).toBeVisible();
  });

  test2("Import CSV button opens modal", async ({ merchantPage: page }) => {
    await page.getByRole("button", { name: /import csv/i }).click();
    await expect(page.getByRole("heading", { name: /import from csv/i })).toBeVisible({ timeout: 5_000 });
    // Template download link
    await expect(page.getByRole("button", { name: /download template/i })).toBeVisible();
  });
});

// ── Orders ────────────────────────────────────────────────────────────────────

test2.describe("Orders page", () => {
  test2("renders orders heading and filter tabs", async ({ merchantPage: page }) => {
    await page.goto("/merchant/orders");
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /pending/i }).first()).toBeVisible();
  });
});

// ── Service workflow pages ─────────────────────────────────────────────────────

test2.describe("Service workflow pages", () => {
  test2("renders appointment and home-service management screens", async ({ merchantPage: page }) => {
    await page.goto("/merchant/slots");
    await expect(page.getByRole("heading", { name: /slots|availability/i })).toBeVisible({ timeout: 10_000 });

    await page.goto("/merchant/bookings");
    await expect(page.getByRole("heading", { name: /bookings/i })).toBeVisible({ timeout: 10_000 });

    await page.goto("/merchant/requests");
    await expect(page.getByRole("heading", { name: /requests|jobs/i })).toBeVisible({ timeout: 10_000 });

    await page.goto("/merchant/jobs");
    await expect(page.getByRole("heading", { name: /jobs/i })).toBeVisible({ timeout: 10_000 });
  });
});

// ── Offers ────────────────────────────────────────────────────────────────────

test2.describe("Offers page", () => {
  test2("renders offers heading", async ({ merchantPage: page }) => {
    await page.goto("/merchant/offers");
    // scope to the page title (h1) — the empty-state h3 ("No offers yet")
    // also matches /offers/i and would otherwise trip strict mode.
    await expect(page.getByRole("heading", { name: /offers/i, level: 1 })).toBeVisible({ timeout: 10_000 });
  });

  test2("shows Create Offer button", async ({ merchantPage: page }) => {
    await page.goto("/merchant/offers");
    // the empty-state also renders its own "Create Offer" CTA; .first()
    // picks the header button.
    await expect(page.getByRole("button", { name: /create offer/i }).first()).toBeVisible({ timeout: 10_000 });
  });
});

// ── Analytics ─────────────────────────────────────────────────────────────────

test2.describe("Analytics page", () => {
  test2("renders stats without crashing", async ({ merchantPage: page }) => {
    await page.goto("/merchant/analytics");
    await expect(page.getByRole("heading", { name: /analytics/i })).toBeVisible({ timeout: 10_000 });
    // Summary cards
    await expect(page.getByText(/total orders/i)).toBeVisible();
    await expect(page.getByText(/revenue/i).first()).toBeVisible();
    // "Completion Rate" appears in both the chart legend and a summary card;
    // .first() avoids the strict-mode ambiguity.
    await expect(page.getByText(/completion rate/i).first()).toBeVisible();
    // No JS error about toLocaleString
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.waitForTimeout(1000);
    expect(errors.filter((e) => /toLocaleString|undefined/i.test(e))).toHaveLength(0);
  });

  test2("period toggle switches between weekly and monthly", async ({ merchantPage: page }) => {
    await page.goto("/merchant/analytics");
    await page.getByRole("button", { name: /monthly/i }).click();
    await expect(page.getByRole("button", { name: /monthly/i })).toHaveClass(/bg-brand-600/);
    await page.getByRole("button", { name: /weekly/i }).click();
    await expect(page.getByRole("button", { name: /weekly/i })).toHaveClass(/bg-brand-600/);
  });
});

// ── Settings ──────────────────────────────────────────────────────────────────

test2.describe("Settings page", () => {
  test2("renders settings heading", async ({ merchantPage: page }) => {
    await page.goto("/merchant/settings");
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible({ timeout: 10_000 });
  });

  test2("shows business profile card", async ({ merchantPage: page }) => {
    await page.goto("/merchant/settings");
    // the page subtitle ("Manage your business profile...") also matches
    // /business profile/i; target the card's own heading instead.
    await expect(page.getByRole("heading", { name: /business profile/i })).toBeVisible({ timeout: 10_000 });
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────

test2.describe("Logout", () => {
  test2("logout button redirects to login", async ({ merchantPage: page }) => {
    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/merchant\/login/, { timeout: 10_000 });
  });
});
