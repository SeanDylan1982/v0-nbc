import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ["/profile", "/account-settings", "/members"]

  // Check if the route is protected and the user is not authenticated
  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route)) && !session) {
    const redirectUrl = new URL("/", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/profile", "/account-settings", "/members"],
}
