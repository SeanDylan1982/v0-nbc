"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, UserPlus, Shield, Mail } from "lucide-react"

interface AdminUser {
  id: string
  email: string
  created_at: string
}

export default function AdminUsersPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const { toast } = useToast()

  // Load admin users
  useEffect(() => {
    loadAdminUsers()
  }, [])

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase.from("admin_users").select(`
          id,
          created_at
        `)

      if (error) throw error

      // For now, just show the IDs since we can't easily get email from auth.users
      const adminUsersWithDetails = data.map((admin) => ({
        id: admin.id,
        email: `Admin User (${admin.id.slice(0, 8)}...)`,
        created_at: admin.created_at,
      }))

      setAdminUsers(adminUsersWithDetails)
    } catch (error) {
      console.error("Error loading admin users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin users.",
      })
    } finally {
      setIsLoadingList(false)
    }
  }

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address.",
      })
      return
    }

    setIsLoading(true)

    try {
      // For now, we'll need to manually get the user ID
      // In a real implementation, you'd search for the user by email
      toast({
        variant: "destructive",
        title: "Manual Setup Required",
        description: "Please add admin users manually via SQL for now.",
      })
    } catch (error) {
      console.error("Error adding admin:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add admin user.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeAdmin = async (adminId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove admin access for ${email}?`)) {
      return
    }

    try {
      const { error } = await supabase.from("admin_users").delete().eq("id", adminId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Admin access removed.`,
      })

      loadAdminUsers()
    } catch (error) {
      console.error("Error removing admin:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove admin user.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin User Management</h1>
        <p className="text-muted-foreground">Manage who has admin access to the dashboard</p>
      </div>

      {/* Add New Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Admin
          </CardTitle>
          <CardDescription>
            To add a new admin, first create a regular user account, then add their user ID to the admin_users table via
            SQL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>SQL Command:</strong>
              <br />
              <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                INSERT INTO admin_users (id) VALUES ('user-id-here');
              </code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Admins
          </CardTitle>
          <CardDescription>Users with admin access to the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <div className="text-center py-4">Loading admin users...</div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No admin users found</div>
          ) : (
            <div className="space-y-2">
              {adminUsers.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{admin.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Admin since {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => removeAdmin(admin.id, admin.email)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
