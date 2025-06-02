import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Temporarily disable middleware to test authentication
  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/account-settings/:path*", "/members/:path*"],
}
