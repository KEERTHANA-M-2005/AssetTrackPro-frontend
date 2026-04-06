"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Plus, User, Package } from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import { AssignAssetModal } from "@/components/modals/AssignAssetModal"
import { assignmentsApi, type Assignment } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AssignmentsPage() {
  const [role, setRole] = useState<"Admin" | "Employee">("Admin")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      const data = await assignmentsApi.getAll()
      setAssignments(data)
    } catch (error) {
      console.error("Failed to load assignments:", error)
      toast.error("Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSwitch = (newRole: "Admin" | "Employee") => {
    setRole(newRole)
    toast.success(`Switched to ${newRole} mode`)
  }

  const handleEditAssignment = (assignment: Assignment) => {
    toast.info(`Edit assignment: ${assignment.asset?.asset_name} → ${assignment.employee?.employee_name}`)
    // TODO: Open edit modal
  }

  const handleReturnAssignment = async (assignment: Assignment) => {
    try {
      await assignmentsApi.return(assignment.assignment_id)
      toast.success("Asset returned successfully")
      loadAssignments()
    } catch (error) {
      console.error("Failed to return assignment:", error)
      toast.error("Failed to return assignment")
    }
  }

  const handleAddAssignment = () => {
    toast.info("Add assignment functionality coming soon")
    // TODO: Open add assignment modal
  }

  const handleDeleteAssignment = async (assignment: Assignment) => {
    try {
      await assignmentsApi.delete(assignment.assignment_id)
      setAssignments((prev) => prev.filter((item) => item.assignment_id !== assignment.assignment_id))
      toast.success("Assignment deleted successfully")
    } catch (error) {
      console.error("Failed to delete assignment:", error)
      toast.error("Failed to delete assignment")
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    const assetName = assignment.asset?.asset_name?.toLowerCase() || ''
    const employeeName = assignment.employee?.employee_name?.toLowerCase() || ''
    const status = assignment.status?.toLowerCase() || ''
    const query = searchTerm.toLowerCase()

    return (
      assetName.includes(query) ||
      employeeName.includes(query) ||
      status.includes(query)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'returned':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          userName="John Doe"
          role={role}
          onRoleSwitch={handleRoleSwitch}
        />

        {/* Assignments Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Assignments
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track asset assignments and returns
                </p>
              </div>
              {role === "Admin" && (
                <AssignAssetModal onAssignmentCreated={loadAssignments} />
              )}
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </motion.div>

            {/* Assignments Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAssignments.map((assignment) => (
                    <motion.div
                      key={assignment.assignment_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center">
                                <Package className="mr-2 h-5 w-5 text-purple-600" />
                                {assignment.asset?.asset_name || 'Unknown asset'}
                              </CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                {assignment.employee?.employee_name || 'Unknown employee'}
                              </p>
                            </div>
                            <Badge className={getStatusColor(assignment.status || 'unknown')}>
                              {assignment.status || 'UNKNOWN'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Assigned</p>
                              <p className="font-medium">{formatDate(assignment.assigned_date)}</p>
                            </div>
                            {assignment.returned_date && (
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Returned</p>
                                <p className="font-medium">{formatDate(assignment.returned_date)}</p>
                              </div>
                            )}
                          </div>
                          {assignment.notes && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 text-sm">Notes</p>
                              <p className="text-sm">{assignment.notes}</p>
                            </div>
                          )}
                          {role === "Admin" && (
                            <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                              {assignment.status === "ASSIGNED" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleReturnAssignment(assignment)}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  Return
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAssignment(assignment)}
                                className="flex-1"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteAssignment(assignment)}
                                className="flex-1"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {!loading && filteredAssignments.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No assignments found matching your search.
                </p>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}