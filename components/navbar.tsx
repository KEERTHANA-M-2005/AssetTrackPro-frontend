"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCurrentUser, clearAuth } from "@/lib/auth"

interface NavbarProps {
  userName?: string
  role?: "Admin" | "Employee"
}

export default function Navbar({ userName: userNameProp, role: roleProp }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(userNameProp ?? "")
  const [role, setRole] = useState<"Admin" | "Employee">(roleProp ?? "Employee")

  useEffect(() => {
    if (userNameProp) {
      setDisplayName(userNameProp)
    } else {
      const user = getCurrentUser()
      if (user) setDisplayName(user.email)
    }

    if (roleProp) {
      setRole(roleProp)
    } else {
      const user = getCurrentUser()
      if (user) setRole(user.role === "admin" ? "Admin" : "Employee")
    }
  }, [userNameProp, roleProp])

  const handleLogout = () => {
    clearAuth()
    toast.success("Logged out successfully")
    router.push("/login")
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        {/* User info */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <User className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</p>
            <p className="font-semibold text-gray-900 dark:text-white">{displayName || "User"}</p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          {/* Role badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              role === "Admin"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
            }`}
          >
            {role}
          </span>

          {/* Theme toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Profile / logout menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{displayName || "User"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.nav>
  )
}
