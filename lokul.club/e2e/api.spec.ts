import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./fixtures";

test.describe("API: NextAuth endpoints", () => {
  test("GET /api/auth/providers returns the credentials provider", async ({ request }) => {
    const res = await request.get("/api/auth/providers");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("credentials");
    expect(body.credentials).toMatchObject({ id: "credentials", type: "credentials" });
  });

  test("GET /api/auth/csrf returns a csrfToken", async ({ request }) => {
    const res = await request.get("/api/auth/csrf");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.csrfToken).toBe("string");
    expect(body.csrfToken.length).toBeGreaterThan(10);
  });

  test("GET /api/auth/session returns an empty object when unauthenticated", async ({ request }) => {
    const res = await request.get("/api/auth/session");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toEqual({});
  });
});

test.describe("API: /api/admin/export (CSV)", () => {
  test("returns 401 for unauthenticated callers", async ({ request }) => {
    const res = await request.get("/api/admin/export");
    expect(res.status()).toBe(401);
    expect(await res.text()).toContain("Unauthorized");
  });

  test("returns CSV content for authenticated admin", async ({ browser }) => {
    // Use a real browser context so the next-auth session cookie is set.
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsAdmin(page);

    const res = await context.request.get("/api/admin/export");
    expect(res.status()).toBe(200);

    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("text/csv");

    const disposition = res.headers()["content-disposition"];
    expect(disposition).toContain("attachment");
    expect(disposition).toMatch(/lokul-waitlist-\d{4}-\d{2}-\d{2}\.csv/);

    const body = await res.text();
    expect(body).toMatch(/^Name,Email,Pin Code,Role,Notify,Signed Up/);
    // Fixture rows present
    expect(body).toContain("alice@example.com");
    expect(body).toContain("bob@example.com");

    await context.close();
  });
});
