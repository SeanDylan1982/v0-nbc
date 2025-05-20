import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - Northmead Bowls Club",
  description: "Admin dashboard for Northmead Bowls Club website",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="min-h-screen flex flex-col">{children}</div>
}
