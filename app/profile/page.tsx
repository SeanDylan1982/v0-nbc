"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
        return
      }

      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) return null

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
    : user.email?.charAt(0).toUpperCase() || "U"

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>View and manage your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                alt={user.user_metadata?.full_name || user.email || ""}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium">{user.user_metadata?.full_name || "User"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Email</div>
                <div className="col-span-2">{user.email}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Name</div>
                <div className="col-span-2">{user.user_metadata?.full_name || "Not provided"}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Member Since</div>
                <div className="col-span-2">{new Date(user.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => router.push("/account-settings")}>
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
