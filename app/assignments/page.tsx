"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, User, Package } from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import { AssignAssetModal } from "@/components/modals/AssignAssetModal"
import { assignmentsApi, type Assignment } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/auth"

export default function AssignmentsPage() {
  const [role, setRole] = useState<"Admin" | "Employee">("Admin")
  const [userName, setUserName] = useState("")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setRole(user.role === "admin" ? "Admin" : "Employee")
      setUserName(user.email)
    }
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      setAssignments(await assignmentsApi.getAll())
    } catch {
      toast.error("Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }

  const handleReturnAssignment = async (assignment: Assignment) => {
    try {
      await assignmentsApi.return(assignment.assignment_id)
      toast.success("Asset returned successfully")
      loadAssignments()
    } catch {
      toast.error("Failed to return assignment")
    }
  }

  const handleDeleteAssignment = async (assignment: Assignment) => {
    try {
      await assignmentsApi.delete(assignment.assignment_id)
      setAssignments((prev) => prev.filter((a) => a.assignment_id !== assignment.assignment_id))
      toast.success("Assignment deleted successfully")
    } catch {
      toast.error("Failed to delete assignment")
    }
  }

  const filtered = assignments.filter((a) => {
    const q = searchTerm.toLowerCase()
    return (
      a.asset?.asset_name?.toLowerCase().includes(q) ||
      a.employee?.employee_name?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    )
  })

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "assigned": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "returned": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userName={userName} role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Assignments</h1>
                <p className="text-gray-600 dark:text-gray-400">Track asset assignments and returns</p>
              </div>
              {role === "Admin" && <AssignAssetModal onAssignmentCreated={loadAssignments} />}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search assignments…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" /></CardHeader>
                      <CardContent><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" /></CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((a) => (
                    <motion.div key={a.assignment_id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                      <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center">
                                <Package className="mr-2 h-5 w-5 text-purple-600" />
                                {a.asset?.asset_name ?? "Unknown asset"}
                              </CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                {a.employee?.employee_name ?? "Unknown employee"}
                              </p>
                            </div>
                            <Badge className={statusColor(a.status ?? "")}>{a.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Assigned</p>
                              <p className="font-medium">{fmt(a.assigned_date)}</p>
                            </div>
                            {a.returned_date && (
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Returned</p>
                                <p className="font-medium">{fmt(a.returned_date)}</p>
                              </div>
                            )}
                          </div>
                          {role === "Admin" && (
                            <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                              {a.status === "ASSIGNED" && (
                                <Button size="sm" onClick={() => handleReturnAssignment(a)} className="flex-1 bg-green-600 hover:bg-green-700">Return</Button>
                              )}
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteAssignment(a)} className="flex-1">Delete</Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12 text-lg">No assignments found.</p>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
