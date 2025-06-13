"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  FileText,
  Home,
  ImageIcon,
  LogOut,
  Menu,
  MessageSquare,
  Trophy,
  Upload,
  Shield,
  Spade,
} from "lucide-react"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Events", href: "/admin/dashboard/events", icon: Calendar },
    { name: "Competitions", href: "/admin/dashboard/competitions", icon: Trophy },
    { name: "Results", href: "/admin/dashboard/results", icon: FileText },
    { name: "Joker Draw", href: "/admin/dashboard/joker-draw", icon: Spade },
    { name: "Gallery", href: "/admin/dashboard/gallery", icon: ImageIcon },
    { name: "Import Images", href: "/admin/dashboard/import-images", icon: Upload },
    { name: "Documents", href: "/admin/dashboard/documents", icon: FileText },
    { name: "Messages", href: "/admin/dashboard/messages", icon: MessageSquare },
    { name: "Admin Users", href: "/admin/dashboard/admin-users", icon: Shield },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900 border-b border-gray-800">
            <h1 className="text-white font-bold">Northmead Admin</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}
                    `}
                  >
                    <IconComponent className="mr-3 h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-800 p-4">
            <Link href="/" className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <Button variant="ghost" className="text-gray-300 hover:text-white flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100 dark:bg-gray-900">
          <Button variant="outline" size="icon" className="md:hidden">
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
