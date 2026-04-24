"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Users, CheckCircle, Wrench } from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import StatCard from "@/components/StatCard"
import DataTable from "@/components/data-table"
import { getDashboardStats, assetsApi, type Asset, type DashboardStats } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"

export default function Dashboard() {
  const [role, setRole] = useState<"Admin" | "Employee">("Admin")
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalEmployees: 0,
    availableAssets: 0,
    assetsInRepair: 0,
  })
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setRole(user.role === "admin" ? "Admin" : "Employee")
      setUserName(user.email)
    }
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, assetsData] = await Promise.all([getDashboardStats(), assetsApi.getAll()])
      setStats(statsData)
      setAssets(assetsData)
    } catch {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleEditAsset = (asset: Asset) => toast.info(`Edit asset: ${asset.asset_name}`)

  const handleDeleteAsset = async (asset: Asset) => {
    try {
      await assetsApi.delete(asset.asset_id)
      setAssets((prev) => prev.filter((a) => a.asset_id !== asset.asset_id))
      toast.success("Asset deleted successfully")
    } catch {
      toast.error("Failed to delete asset")
    }
  }

  const statCards = [
    { title: "Total Assets",     value: stats.totalAssets,     icon: Package,     gradient: "bg-gradient-to-r from-purple-500 to-purple-600", delay: 0 },
    { title: "Total Employees",  value: stats.totalEmployees,  icon: Users,       gradient: "bg-gradient-to-r from-blue-500 to-blue-600",   delay: 0.1 },
    { title: "Available Assets", value: stats.availableAssets, icon: CheckCircle, gradient: "bg-gradient-to-r from-green-500 to-green-600",  delay: 0.2 },
    { title: "Assets in Repair", value: stats.assetsInRepair,  icon: Wrench,      gradient: "bg-gradient-to-r from-orange-500 to-orange-600", delay: 0.3 },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userName={userName} role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome to AssetTrack Pro — manage your assets efficiently</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((c) => (
                <StatCard key={c.title} title={c.title} value={c.value} icon={c.icon} gradient={c.gradient} delay={c.delay} />
              ))}
            </div>

            {role === "Admin" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assets Overview</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and monitor all your assets</p>
                </div>
                <div className="p-6">
                  <DataTable data={assets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} loading={loading} />
                </div>
              </motion.div>
            )}

            {role === "Employee" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Assigned Assets</h2>
                <div className="space-y-4">
                  {assets.filter((a) => a.asset_status === "ASSIGNED").map((asset, i) => (
                    <motion.div key={asset.asset_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{asset.asset_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{asset.asset_type ?? "N/A"}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">{asset.asset_status}</span>
                    </motion.div>
                  ))}
                  {assets.filter((a) => a.asset_status === "ASSIGNED").length === 0 && (
                    <p className="text-gray-500 text-center py-8">No assets assigned to you</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
