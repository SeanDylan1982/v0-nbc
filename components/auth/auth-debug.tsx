"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User, Session } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthDebug() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        console.log("AuthDebug: Session:", session)
        console.log("AuthDebug: Session error:", sessionError)

        setSession(session)

        if (session) {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser()

          console.log("AuthDebug: User:", user)
          console.log("AuthDebug: User error:", userError)

          setUser(user)
        }
      } catch (error) {
        console.error("AuthDebug: Error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase.auth])

  if (loading) {
    return <div>Loading auth debug...</div>
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Session:</strong> {session ? "✅ Active" : "❌ None"}
        </div>
        <div>
          <strong>User:</strong> {user ? `✅ ${user.email}` : "❌ None"}
        </div>
        <div>
          <strong>User ID:</strong> {user?.id || "None"}
        </div>
        <div>
          <strong>Email Confirmed:</strong> {user?.email_confirmed_at ? "✅ Yes" : "❌ No"}
        </div>
        <Button
          onClick={async () => {
            const { data, error } = await supabase.auth.getSession()
            console.log("Manual session check:", data, error)
            alert(`Session: ${data.session ? "Active" : "None"}`)
          }}
        >
          Check Session
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = "/profile"
          }}
        >
          Try Profile Page
        </Button>
      </CardContent>
    </Card>
  )
}
