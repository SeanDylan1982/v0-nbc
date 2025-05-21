"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { AuthButton } from "./auth/auth-button"
import { UserNav } from "./auth/user-nav"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // This will force a refresh when auth state changes
  const refreshParam = searchParams.get("refresh")

  useEffect(() => {
    async function getUser() {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, refreshParam])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Northmead Bowls Club Logo" width={40} height={40} className="rounded-full" />
            <span className="hidden font-bold sm:inline-block">Northmead Bowls Club</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/members" className="text-sm font-medium hover:underline">
                    Members Area
                  </Link>
                  <UserNav user={user} />
                </>
              ) : (
                <AuthButton />
              )}
            </>
          )}
          <Link href="/admin" className="text-sm font-medium hover:underline">
            Admin Login
          </Link>
          <ModeToggle />
        </nav>
        <div className="flex md:hidden items-center gap-4">
          <ModeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                {!loading && user && (
                  <Link
                    href="/members"
                    className="text-sm font-medium hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    Members Area
                  </Link>
                )}
                <Link href="/admin" className="text-sm font-medium hover:underline" onClick={() => setIsOpen(false)}>
                  Admin Login
                </Link>
                {!loading && (
                  <>
                    {user ? (
                      <Button
                        variant="outline"
                        onClick={async () => {
                          await supabase.auth.signOut()
                          setIsOpen(false)
                        }}
                      >
                        Sign Out
                      </Button>
                    ) : (
                      <AuthButton />
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
