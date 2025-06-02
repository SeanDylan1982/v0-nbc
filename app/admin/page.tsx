"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Lock, Loader2, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is already logged in and is admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Check if user is admin
          const { data: isAdmin, error } = await supabase.rpc("is_admin", {
            user_id: session.user.id,
          })

          if (error) {
            console.error("Error checking admin status:", error)
          } else if (isAdmin) {
            console.log("Admin user already logged in, redirecting to dashboard")
            router.push("/admin/dashboard")
            return
          } else {
            console.log("User logged in but not admin")
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "You don't have admin privileges.",
            })
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both email and password",
      })
      return
    }

    setIsLoading(true)
    console.log("Admin login attempt with:", email)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      console.log("Admin login result:", { data, error })

      if (error) {
        console.error("Admin login error:", error)
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        })
        return
      }

      if (data.user) {
        // Check if user is admin
        const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin", {
          user_id: data.user.id,
        })

        if (adminError) {
          console.error("Error checking admin status:", adminError)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to verify admin status.",
          })
          return
        }

        if (!isAdmin) {
          console.log("User logged in but not admin:", data.user.email)
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You don't have admin privileges.",
          })
          // Sign out the user since they're not admin
          await supabase.auth.signOut()
          return
        }

        console.log("Admin login successful:", data.user.email)
        toast({
          title: "Welcome Admin!",
          description: "Successfully logged in to admin dashboard.",
        })

        // Redirect to admin dashboard
        router.push("/admin/dashboard")
      }
    } catch (error) {
      console.error("Unexpected admin login error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Admin Access</CardTitle>
          <CardDescription className="text-center">
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@northmeadbowls.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Admin Access...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Admin Login
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-muted-foreground">
            Only authorized administrators can access this area
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
