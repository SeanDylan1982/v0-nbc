"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, LogIn } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true)
        setError(null)

        // First check if we have a session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          setError("Failed to check authentication status")
          setAuthChecked(true)
          return
        }

        if (!session) {
          console.log("No session found")
          setAuthChecked(true)
          setLoading(false)
          return
        }

        // If we have a session, get the user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("User error:", userError)
          setError("Failed to load user information")
          setAuthChecked(true)
          return
        }

        if (user) {
          console.log("User loaded successfully:", user.email)
          setUser(user)
        }

        setAuthChecked(true)
      } catch (err) {
        console.error("Error checking auth:", err)
        setError("An unexpected error occurred")
        setAuthChecked(true)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      if (event === "SIGNED_OUT") {
        setUser(null)
        setAuthChecked(true)
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        setAuthChecked(true)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user)
        setAuthChecked(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Show loading state
  if (loading || !authChecked) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" className="ml-4" onClick={() => router.push("/")}>
              Go Home
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10 text-center space-y-4">
            <LogIn className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
            </div>
            <div className="space-x-4">
              <Button onClick={() => router.push("/")}>Go Home</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U"

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal details and account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                  alt={user.user_metadata?.full_name || user.email || ""}
                />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{user.user_metadata?.full_name || "User"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Email Address</span>
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Full Name</span>
                    <span className="text-muted-foreground">{user.user_metadata?.full_name || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Account Status</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email Verified</span>
                    <span className={user.email_confirmed_at ? "text-green-600" : "text-orange-600"}>
                      {user.email_confirmed_at ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Membership Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Member Type</span>
                    <span className="text-muted-foreground">Standard Member</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Join Date</span>
                    <span className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Last Login</span>
                    <span className="text-muted-foreground">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                Back to Home
              </Button>
              <Button onClick={() => router.push("/account-settings")}>Edit Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
