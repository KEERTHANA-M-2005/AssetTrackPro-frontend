"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Plus, MapPin } from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import { AddEmployeeModal } from "@/components/modals/AddEmployeeModal"
import { employeesApi, type Employee } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function EmployeesPage() {
  const [role, setRole] = useState<"Admin" | "Employee">("Admin")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const data = await employeesApi.getAll()
      setEmployees(data)
    } catch (error) {
      console.error("Failed to load employees:", error)
      toast.error("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSwitch = (newRole: "Admin" | "Employee") => {
    setRole(newRole)
    toast.success(`Switched to ${newRole} mode`)
  }

  const handleEditEmployee = (employee: Employee) => {
    toast.info(`Edit employee: ${employee.employee_name}`)
    // TODO: Open edit modal
  }

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      await employeesApi.delete(employee.employee_id)
      setEmployees(employees.filter(e => e.employee_id !== employee.employee_id))
      toast.success("Employee deleted successfully")
    } catch (error) {
      console.error("Failed to delete employee:", error)
      toast.error("Failed to delete employee")
    }
  }

  const handleAddEmployee = () => {
    toast.info("Add employee functionality coming soon")
    // TODO: Open add employee modal
  }

  const filteredEmployees = employees.filter(employee =>
    employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'on leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
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

        {/* Employees Content */}
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
                  Employees
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your team members and their information
                </p>
              </div>
              {role === "Admin" && (
                <AddEmployeeModal onEmployeeAdded={loadEmployees} />
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
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </motion.div>

            {/* Employees Grid */}
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
                  {filteredEmployees.map((employee) => (
                    <motion.div
                      key={employee.employee_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {employee.employee_name}
                              </CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {employee.department || 'Employee'}
                              </p>
                            </div>
                            <Badge className={getStatusColor('active')}>
                              Active
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="mr-2 h-4 w-4" />
                            {employee.department || 'Department not set'}
                          </div>
                          {role === "Admin" && (
                            <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditEmployee(employee)}
                                className="flex-1"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteEmployee(employee)}
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

            {!loading && filteredEmployees.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No employees found matching your search.
                </p>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}