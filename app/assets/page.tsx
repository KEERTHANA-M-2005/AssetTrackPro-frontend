"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import DataTable from "@/components/data-table"
import { AddAssetModal } from "@/components/modals/AddAssetModal"
import { assetsApi, type Asset } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/lib/auth"

export default function AssetsPage() {
  const [role, setRole] = useState<"Admin" | "Employee">("Admin")
  const [userName, setUserName] = useState("")
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setRole(user.role === "admin" ? "Admin" : "Employee")
      setUserName(user.email)
    }
    loadAssets()
  }, [])

  const loadAssets = async () => {
    try {
      setLoading(true)
      setAssets(await assetsApi.getAll())
    } catch {
      toast.error("Failed to load assets")
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

  const filteredAssets = assets.filter(
    (a) =>
      a.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.asset_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.asset_status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userName={userName} role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Assets</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage and monitor all your assets</p>
              </div>
              {role === "Admin" && <AddAssetModal onAssetAdded={loadAssets} />}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search assets…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assets Overview</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""} found</p>
              </div>
              <div className="p-6">
                <DataTable data={filteredAssets} onEdit={role === "Admin" ? handleEditAsset : undefined} onDelete={role === "Admin" ? handleDeleteAsset : undefined} loading={loading} />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
