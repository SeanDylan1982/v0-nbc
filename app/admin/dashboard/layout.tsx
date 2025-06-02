import type React from "react"
import { Mail } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigationItems = [
    {
      title: "Overview",
      href: "/admin/dashboard",
      icon: "LayoutDashboard",
    },
    {
      title: "Analytics",
      href: "/admin/dashboard/analytics",
      icon: "BarChart",
    },
    {
      title: "Settings",
      href: "/admin/dashboard/settings",
      icon: "Settings",
    },
    {
      title: "Messages",
      href: "/admin/dashboard/messages",
      icon: Mail,
    },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-200 p-4">
        <nav>
          <ul>
            {navigationItems.map((item) => (
              <li key={item.title} className="mb-2">
                <a href={item.href} className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  )
}
