import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];
const AUTH_PAGES = ["/login", "/register", "/reset-password"];

/**
 * Called from src/proxy.ts (Next 16 renamed middleware -> proxy; see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 *
 * This is an OPTIMISTIC check per Next's own auth guide -- it calls
 * supabase.auth.getUser(), which validates the JWT and refreshes it if
 * expired, but does NOT touch this app's Postgres tables. That's the right
 * amount of work for something that runs on every request, including
 * prefetches. It is not the security boundary -- RLS is. This only exists so
 * a logged-out user gets redirected to /login before a page even starts
 * rendering, instead of after.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  // getUser() (not getSession()) -- this actually validates the token against
  // Supabase Auth rather than trusting whatever is sitting in the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.some((p) => path === p || path.startsWith(`${p}/`));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: don't add logic between createServerClient and getUser(), and
  // return supabaseResponse as-is (not a new NextResponse.next()) -- both are
  // required for the refreshed session cookies to actually reach the browser.
  return supabaseResponse;
}
