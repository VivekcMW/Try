import { withAuth } from "next-auth/middleware";

/**
 * Route protection proxy (Next.js 16 replacement for middleware.ts).
 *
 * Rate limiting is handled inside each API route handler (Node.js runtime),
 * not here, because ioredis is not Edge-runtime compatible.
 */
export default withAuth(
  function proxy(_req) {
    // Authenticated — let the request through.
    // Additional per-route logic lives in the route handlers.
    return undefined;
  },
  {
    callbacks: {
      authorized({ token }) {
        return token?.role === "admin";
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: [
    // Only protect admin UI routes — mobile API routes handle their own auth.
    "/admin/dashboard/:path*",
    "/admin/entries/:path*",
  ],
};
