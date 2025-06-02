import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if this is a protected route
  const protectedRoutes = ["/profile", "/account-settings", "/members"]
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        const redirectUrl = new URL("/", req.url)
        redirectUrl.searchParams.set("message", "Please log in to access this page")
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("Middleware error:", error)
      const redirectUrl = new URL("/", req.url)
      redirectUrl.searchParams.set("message", "Authentication error occurred")
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ["/profile/:path*", "/account-settings/:path*", "/members/:path*"],
}
