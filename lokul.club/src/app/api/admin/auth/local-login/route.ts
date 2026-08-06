import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Local admin credentials (from .env)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@lokul.club";
const ADMIN_PASSWORD = "admin123"; // Hardcoded for local dev

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Simple credential check
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Set a simple admin session cookie
      const cookieStore = await cookies();
      cookieStore.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: { email: ADMIN_EMAIL, role: "admin" },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
