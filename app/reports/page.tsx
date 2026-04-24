"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Activity } from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import { reportsApi, type ReportData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"

export default function ReportsPage() {
  const [userName, setUserName] = useState("")
  const [role, setRole] = useState<"Admin" | "Employee">("Admin")
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setUserName(user.email)
      setRole(user.role === "admin" ? "Admin" : "Employee")
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [selectedPeriod])

  const loadReports = async () => {
    try {
      setLoading(true)
      setReportData(await reportsApi.getReport(selectedPeriod))
    } catch {
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    try {
      setDownloading(true)
      reportsApi.downloadCsv(selectedPeriod)
      toast.success("Download started")
    } finally {
      setTimeout(() => setDownloading(false), 1500)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) => (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const BarRow = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: max ? `${(value / max) * 100}%` : "0%" }} />
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userName={userName} role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {role === "Admin" ? "Reports & Analytics" : "My Asset Report"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {role === "Admin"
                    ? "Full asset and assignment insights across the organisation"
                    : "Your personal assignment history and asset usage"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleDownload} disabled={downloading || loading} className="bg-purple-600 hover:bg-purple-700 gap-2">
                  <Download className="h-4 w-4" />
                  {downloading ? "Downloading…" : "Export CSV"}
                </Button>
              </div>
            </motion.div>

            {/* Stat cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={`grid grid-cols-1 sm:grid-cols-2 ${role === "Admin" ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}
            >
              <StatCard title={role === "Admin" ? "Total Assets" : "My Assets"} value={reportData?.totalAssets ?? 0} icon={BarChart3} color="bg-purple-600" />
              <StatCard title="Active Assignments" value={reportData?.activeAssignments ?? 0} icon={TrendingUp} color="bg-green-600" />
              {role === "Admin" && <StatCard title="Available Assets" value={reportData?.availableAssets ?? 0} icon={PieChart} color="bg-blue-600" />}
              <StatCard title="Overdue Returns" value={reportData?.overdueReturns ?? 0} icon={Calendar} color="bg-red-500" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Asset Status */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border border-gray-200 dark:border-gray-700 h-full">
                  <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-4 w-4 text-purple-500" />Asset Status</CardTitle></CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}</div>
                    ) : (reportData?.assetStatusDistribution?.length ?? 0) === 0 ? (
                      <p className="text-gray-400 text-center py-8">No data available</p>
                    ) : (
                      <div className="space-y-4">
                        {(reportData?.assetStatusDistribution ?? []).map((item, i) => {
                          const dot: Record<string, string> = { Available: "bg-green-500", Assigned: "bg-blue-500", Repair: "bg-yellow-500" }
                          const bar: Record<string, string> = { Available: "bg-green-500", Assigned: "bg-blue-500", Repair: "bg-yellow-500" }
                          return (
                            <div key={i} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dot[item.status] ?? "bg-gray-400"}`} />
                                <span className="text-sm font-medium">{item.status}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${bar[item.status] ?? "bg-gray-400"}`} style={{ width: `${item.percentage}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 w-24 text-right">{item.count} ({item.percentage}%)</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Department Usage (admin) / Recent Activity (employee) */}
              {role === "Admin" ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="border border-gray-200 dark:border-gray-700 h-full">
                    <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-500" />Department Usage</CardTitle></CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}</div>
                      ) : (reportData?.departmentUsage?.length ?? 0) === 0 ? (
                        <p className="text-gray-400 text-center py-8">No department data</p>
                      ) : (
                        <div className="space-y-4">
                          {(reportData?.departmentUsage ?? []).map((item, i) => {
                            const maxCount = Math.max(...(reportData?.departmentUsage ?? []).map((d) => d.assetCount))
                            return <BarRow key={i} label={item.department} value={item.assetCount} max={maxCount} color="bg-blue-500" />
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="border border-gray-200 dark:border-gray-700 h-full">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-green-500" />Recent Activity</CardTitle></CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}</div>
                      ) : (reportData?.recentActivity?.length ?? 0) === 0 ? (
                        <p className="text-gray-400 text-center py-8">No activity yet</p>
                      ) : (
                        <div className="space-y-3">
                          {(reportData?.recentActivity ?? []).map((a, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.description}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Recent Activity (admin only) */}
              {role === "Admin" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="border border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-purple-500" />Recent Activity</CardTitle></CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}</div>
                      ) : (reportData?.recentActivity?.length ?? 0) === 0 ? (
                        <p className="text-gray-400 text-center py-8">No recent activity</p>
                      ) : (
                        <div className="space-y-3">
                          {(reportData?.recentActivity ?? []).map((a, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.description}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Asset Types */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: role === "Admin" ? 0.5 : 0.4 }}>
                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" />Asset Types</CardTitle></CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}</div>
                    ) : (reportData?.assetTypes?.length ?? 0) === 0 ? (
                      <p className="text-gray-400 text-center py-8">No data available</p>
                    ) : (
                      <div className="space-y-4">
                        {(reportData?.assetTypes ?? []).map((item, i) => {
                          const maxCount = Math.max(...(reportData?.assetTypes ?? []).map((t) => t.count))
                          return <BarRow key={i} label={item.type} value={item.count} max={maxCount} color="bg-green-500" />
                        })}
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
