import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, FileText, ImageIcon, MessageSquare, Trophy, Users, Upload } from "lucide-react"
import { InitializeStorage } from "./initialize-storage"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <InitializeStorage />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Northmead Bowls Club admin dashboard.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Next: Joker Draw (Friday)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 membership inquiries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild className="h-20 flex flex-col gap-1">
                <Link href="/admin/dashboard/events">
                  <Calendar className="h-5 w-5 mb-1" />
                  <span>Manage Events</span>
                </Link>
              </Button>
              <Button asChild className="h-20 flex flex-col gap-1">
                <Link href="/admin/dashboard/gallery">
                  <ImageIcon className="h-5 w-5 mb-1" />
                  <span>Update Gallery</span>
                </Link>
              </Button>
              <Button asChild className="h-20 flex flex-col gap-1">
                <Link href="/admin/dashboard/results">
                  <Trophy className="h-5 w-5 mb-1" />
                  <span>Add Results</span>
                </Link>
              </Button>
              <Button asChild className="h-20 flex flex-col gap-1">
                <Link href="/admin/dashboard/documents">
                  <FileText className="h-5 w-5 mb-1" />
                  <span>Manage Documents</span>
                </Link>
              </Button>
              <Button asChild className="h-20 flex flex-col gap-1">
                <Link href="/admin/dashboard/import-images">
                  <Upload className="h-5 w-5 mb-1" />
                  <span>Import Images</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="font-medium">Gallery Updated</p>
                <p className="text-sm text-muted-foreground">Added 5 new photos from the Club Championships</p>
                <p className="text-xs text-muted-foreground">2 hours ago by Admin</p>
              </div>
              <div className="border-b pb-2">
                <p className="font-medium">New Event Added</p>
                <p className="text-sm text-muted-foreground">Added "Annual General Meeting" to the events calendar</p>
                <p className="text-xs text-muted-foreground">Yesterday by Admin</p>
              </div>
              <div className="border-b pb-2">
                <p className="font-medium">Results Updated</p>
                <p className="text-sm text-muted-foreground">Updated results for the Veterans Tournament</p>
                <p className="text-xs text-muted-foreground">2 days ago by Admin</p>
              </div>
              <div>
                <p className="font-medium">New Member Added</p>
                <p className="text-sm text-muted-foreground">Added new member "James Wilson" to the database</p>
                <p className="text-xs text-muted-foreground">3 days ago by Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
