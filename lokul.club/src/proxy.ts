import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Route protection proxy (Next.js 16 - uses Supabase auth).
 *
 * Rate limiting is handled inside each API route handler (Node.js runtime),
 * not here, because ioredis is not Edge-runtime compatible.
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Check for local admin session cookie (development mode)
  const adminSessionCookie = request.cookies.get('admin_session');
  const isLocalAdminAuth = adminSessionCookie?.value === 'authenticated';

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow login page
    if (request.nextUrl.pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      if (session || isLocalAdminAuth) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return response;
    }

    // Require authentication for all other admin pages
    if (!session && !isLocalAdminAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
