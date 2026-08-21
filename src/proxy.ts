import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed middleware.ts -> proxy.ts (function `middleware` ->
// `proxy`); see node_modules/next/dist/docs/.../file-conventions/proxy.md.
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every route except static assets and image optimization --
     * matches the Next docs' own negative-matching example. Intentionally
     * NOT excluding /api: an API route that needs auth should still get the
     * optimistic redirect treatment for consistency, though every route
     * handler must re-verify the session itself regardless (see the Next
     * auth guide's "Proxy is not your only line of defense").
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
