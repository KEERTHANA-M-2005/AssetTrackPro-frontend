"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter } from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import { reportsApi, type ReportData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsPage() {
  const [role, setRole] = useState<"Admin" | "Employee">("Admin")
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")

  useEffect(() => {
    loadReports()
  }, [selectedPeriod])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await reportsApi.getReport(selectedPeriod)
      setReportData(data)
    } catch (error) {
      console.error("Failed to load reports:", error)
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSwitch = (newRole: "Admin" | "Employee") => {
    setRole(newRole)
    toast.success(`Switched to ${newRole} mode`)
  }

  const handleExportReport = (reportType: string) => {
    toast.info(`${reportType} report export coming soon`)
    // TODO: Implement export functionality
  }

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string
    value: string | number
    icon: any
    color: string
  }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

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

        {/* Reports Content */}
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
                  Reports & Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Insights and analytics for your asset management
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handleExportReport("All Reports")}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard
                title="Total Assets"
                value={reportData?.totalAssets || 0}
                icon={BarChart3}
                color="bg-purple-600"
              />
              <StatCard
                title="Active Assignments"
                value={reportData?.activeAssignments || 0}
                icon={TrendingUp}
                color="bg-green-600"
              />
              <StatCard
                title="Available Assets"
                value={reportData?.availableAssets || 0}
                icon={PieChart}
                color="bg-blue-600"
              />
              <StatCard
                title="Overdue Returns"
                value={reportData?.overdueReturns || 0}
                icon={Calendar}
                color="bg-red-600"
              />
            </motion.div>

            {/* Report Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Status Distribution */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Asset Status Distribution</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportReport("Asset Status")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reportData?.assetStatusDistribution?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                item.status === 'Available' ? 'bg-green-500' :
                                item.status === 'Assigned' ? 'bg-blue-500' :
                                item.status === 'Maintenance' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`} />
                              <span className="text-sm font-medium">{item.status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.count} assets
                              </span>
                              <span className="text-sm font-medium">
                                {item.percentage}%
                              </span>
                            </div>
                          </div>
                        )) || (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            No data available
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Department Usage */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Department Usage</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportReport("Department Usage")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reportData?.departmentUsage?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.department}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.assetCount} assets
                              </span>
                              <span className="text-sm font-medium">
                                {item.percentage}%
                              </span>
                            </div>
                          </div>
                        )) || (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            No data available
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportReport("Recent Activity")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reportData?.recentActivity?.map((activity, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        )) || (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            No recent activity
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Asset Types Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Asset Types</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportReport("Asset Types")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reportData?.assetTypes?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.count} assets
                              </span>
                              <span className="text-sm font-medium">
                                {item.percentage}%
                              </span>
                            </div>
                          </div>
                        )) || (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            No data available
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}