"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { clearAuth } from "@/lib/auth"

interface SidebarProps {
  role: "Admin" | "Employee"
  className?: string
}

const navigationItems = {
  Admin: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Assets", href: "/assets", icon: Package },
    { name: "Employees", href: "/employees", icon: Users },
    { name: "Assignments", href: "/assignments", icon: ClipboardList },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ],
  Employee: [
    { name: "Dashboard", href: "/employee", icon: LayoutDashboard },
    { name: "My Assets", href: "/assets", icon: Package },
    { name: "My Assignments", href: "/assignments", icon: ClipboardList },
    { name: "My Reports", href: "/reports", icon: BarChart3 },
  ],
}

export default function Sidebar({ role, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const items = navigationItems[role]

  const handleLogout = () => {
    clearAuth()
    toast.success("Logged out successfully")
    router.push("/login")
  }

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={cn(
        "relative h-screen bg-gradient-to-b from-purple-800 to-purple-900 text-white shadow-xl transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-700">
        {!collapsed && (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-white"
          >
            AssetTrack Pro
          </motion.h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-purple-700 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {items.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white border-l-4 border-white"
                      : "hover:bg-purple-700/50 text-purple-100 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-purple-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-purple-700/50 text-purple-100 hover:text-white transition-all duration-200"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.div>
  )
}
