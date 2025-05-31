import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Protected routes that require authentication
      const protectedPaths = ["/profile", "/account-settings", "/members"]
      const isProtectedRoute = protectedPaths.some((path) => 
        req.nextUrl.pathname.startsWith(path)
      )

      return isProtectedRoute ? !!token : true
    },
  },
})

export const config = {
  matcher: ["/profile", "/account-settings", "/members"],
}