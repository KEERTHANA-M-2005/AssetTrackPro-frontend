"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Users, CheckCircle, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import StatCard from "@/components/StatCard"
import { getDashboardStats, type DashboardStats } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"

export default function AdminDashboard() {
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState<DashboardStats>({ totalAssets: 0, totalEmployees: 0, availableAssets: 0, assetsInRepair: 0 })

  useEffect(() => {
    const user = getCurrentUser()
    if (user) setUserName(user.email)
    getDashboardStats()
      .then(setStats)
      .catch(() => toast.error("Failed to load stats"))
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="Admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userName={userName} role="Admin" />
        <main className="flex-1 overflow-y-auto p-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Welcome, {userName}. Manage assets and employees here.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Assets"     value={stats.totalAssets}     icon={Package}     gradient="bg-gradient-to-r from-purple-500 to-purple-600" />
            <StatCard title="Employees"        value={stats.totalEmployees}  icon={Users}       gradient="bg-gradient-to-r from-blue-500 to-blue-600" />
            <StatCard title="Available Assets" value={stats.availableAssets} icon={CheckCircle} gradient="bg-gradient-to-r from-green-500 to-green-600" />
            <StatCard title="Assets in Repair" value={stats.assetsInRepair}  icon={BarChart3}   gradient="bg-gradient-to-r from-orange-500 to-orange-600" />
          </div>
        </main>
      </div>
    </div>
  )
}
