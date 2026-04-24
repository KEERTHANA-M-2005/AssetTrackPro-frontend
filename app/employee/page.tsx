"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, ClipboardList, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import StatCard from "@/components/StatCard"
import { assetsApi, assignmentsApi, type Asset, type Assignment } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function EmployeeDashboard() {
  const [userName, setUserName] = useState("")
  const [assets, setAssets] = useState<Asset[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) setUserName(user.email)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [a, b] = await Promise.all([assetsApi.getAll(), assignmentsApi.getAll()])
      setAssets(a)
      setAssignments(b)
    } catch {
      toast.error("Failed to load your data")
    } finally {
      setLoading(false)
    }
  }

  const activeAssignments = assignments.filter((a) => a.status === "ASSIGNED")
  const returnedAssignments = assignments.filter((a) => a.status === "RETURNED")

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="Employee" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userName={userName} role="Employee" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
              <p className="text-gray-500 mt-1">View your assigned assets and history.</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="My Assets"           value={assets.length}              icon={Package}       gradient="bg-gradient-to-r from-purple-500 to-purple-600" />
              <StatCard title="Active Assignments"  value={activeAssignments.length}   icon={ClipboardList} gradient="bg-gradient-to-r from-blue-500 to-blue-600" />
              <StatCard title="Returned"            value={returnedAssignments.length} icon={CheckCircle}   gradient="bg-gradient-to-r from-green-500 to-green-600" />
            </div>

            {/* Active assignments */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>My Current Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />)}
                    </div>
                  ) : activeAssignments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No active assignments</p>
                  ) : (
                    <div className="space-y-3">
                      {activeAssignments.map((a) => (
                        <div key={a.assignment_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{a.asset?.asset_name ?? "Unknown asset"}</p>
                            <p className="text-sm text-gray-500">
                              Assigned {new Date(a.assigned_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Active</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
