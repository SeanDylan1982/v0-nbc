"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function MembersPage() {
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
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Members Area</h1>

      <Tabs defaultValue="announcements">
        <TabsList className="mb-4">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="directory">Member Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Latest news and updates for members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium">Annual General Meeting</h3>
                  <p className="text-sm text-muted-foreground">Posted on May 15, 2023</p>
                  <p className="mt-2">
                    The Annual General Meeting will be held on June 10th at 7:00 PM in the clubhouse. All members are
                    encouraged to attend.
                  </p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium">Green Maintenance Schedule</h3>
                  <p className="text-sm text-muted-foreground">Posted on May 10, 2023</p>
                  <p className="mt-2">
                    The green will be closed for maintenance on May 20th and 21st. We apologize for any inconvenience.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">New Member Welcome</h3>
                  <p className="text-sm text-muted-foreground">Posted on May 5, 2023</p>
                  <p className="mt-2">
                    Please join us in welcoming our new members: John Smith, Jane Doe, and Bob Johnson.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Member Resources</CardTitle>
              <CardDescription>Documents and resources for club members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium">Club Constitution</h3>
                  <p className="text-sm text-muted-foreground">Last updated: January 2023</p>
                  <p className="mt-2">The official constitution and bylaws of the Northmead Bowls Club.</p>
                  <a href="#" className="text-primary hover:underline text-sm">
                    Download PDF
                  </a>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium">Membership Form</h3>
                  <p className="text-sm text-muted-foreground">Last updated: March 2023</p>
                  <p className="mt-2">Membership renewal form for the 2023-2024 season.</p>
                  <a href="#" className="text-primary hover:underline text-sm">
                    Download PDF
                  </a>
                </div>
                <div>
                  <h3 className="font-medium">Club Calendar</h3>
                  <p className="text-sm text-muted-foreground">Last updated: May 2023</p>
                  <p className="mt-2">Calendar of events and competitions for the current season.</p>
                  <a href="#" className="text-primary hover:underline text-sm">
                    Download PDF
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory">
          <Card>
            <CardHeader>
              <CardTitle>Member Directory</CardTitle>
              <CardDescription>Contact information for club members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">This feature is coming soon. Check back later for updates.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
