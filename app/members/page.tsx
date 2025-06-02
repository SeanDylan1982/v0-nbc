"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Club service fees data
const clubServiceFees = [
  { service: "Full Membership", fee: "R 1,800.00", notes: "Annual fee" },
  { service: "Country Membership", fee: "R 900.00", notes: "Annual fee" },
  { service: "Student Membership", fee: "R 900.00", notes: "Annual fee" },
  { service: "Social Membership", fee: "R 600.00", notes: "Annual fee" },
  { service: "Green Fees (Members)", fee: "R 20.00", notes: "Per session" },
  { service: "Green Fees (Visitors)", fee: "R 30.00", notes: "Per session" },
  { service: "Locker Rental", fee: "R 100.00", notes: "Annual fee" },
  { service: "Club Tournaments", fee: "R 50.00", notes: "Per tournament" },
  { service: "Coaching Sessions", fee: "Free", notes: "For members" },
  { service: "Equipment Hire", fee: "R 30.00", notes: "Per session" },
  { service: "Function Hall Hire (Members)", fee: "R 1,500.00", notes: "Per day" },
  { service: "Function Hall Hire (Non-Members)", fee: "R 3,000.00", notes: "Per day" },
]

// Club officials data
const clubOfficials = [
  { position: "President", name: "John Smith", contact: "president@northmeadbowls.co.za" },
  { position: "Vice President", name: "Sarah Johnson", contact: "vicepresident@northmeadbowls.co.za" },
  { position: "Secretary", name: "Michael Brown", contact: "secretary@northmeadbowls.co.za" },
  { position: "Treasurer", name: "Emily Davis", contact: "treasurer@northmeadbowls.co.za" },
  { position: "Club Captain", name: "David Wilson", contact: "captain@northmeadbowls.co.za" },
  { position: "Competition Secretary", name: "Jennifer Taylor", contact: "competitions@northmeadbowls.co.za" },
  { position: "Greens Manager", name: "Robert Miller", contact: "greens@northmeadbowls.co.za" },
  { position: "Bar Manager", name: "Thomas Anderson", contact: "bar@northmeadbowls.co.za" },
]

export default function MembersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
  }, [router])

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

      <Tabs defaultValue="services">
        <TabsList className="mb-4">
          <TabsTrigger value="services">Club Services & Fees</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="officials">Club Officials</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Club Services & Fees</CardTitle>
              <CardDescription>Current fees and services available to members</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Club services and fees for the current season</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Service</TableHead>
                    <TableHead className="w-[200px]">Fee</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubServiceFees.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.service}</TableCell>
                      <TableCell>{item.fee}</TableCell>
                      <TableCell>{item.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 text-sm text-muted-foreground">
                <p>* All fees are subject to annual review and may change.</p>
                <p>* Payment can be made via EFT or at the club office.</p>
                <p>* Please contact the treasurer for any fee-related queries.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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

        <TabsContent value="officials">
          <Card>
            <CardHeader>
              <CardTitle>Club Officials</CardTitle>
              <CardDescription>Current committee members and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Club officials for the current season</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Position</TableHead>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubOfficials.map((official, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{official.position}</TableCell>
                      <TableCell>{official.name}</TableCell>
                      <TableCell>{official.contact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 text-sm text-muted-foreground">
                <p>* Committee members are elected annually at the AGM.</p>
                <p>* Please direct queries to the appropriate official.</p>
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
      </Tabs>
    </div>
  )
}
