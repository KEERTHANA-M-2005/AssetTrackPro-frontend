"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Mail, Building2, UserCheck, UserX, Users,
  Trash2, ChevronDown, ChevronUp, Shield, Briefcase
} from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import { AddEmployeeModal } from "@/components/modals/AddEmployeeModal"
import { employeesApi, type Employee } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/auth"

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  const colors = [
    "from-purple-500 to-purple-600",
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
    "from-cyan-500 to-cyan-600",
    "from-indigo-500 to-indigo-600",
  ]
  const color = colors[name.charCodeAt(0) % colors.length]
  const sizeClass = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" }[size]

  return (
    <div className={`${sizeClass} bg-gradient-to-br ${color} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm`}>
      {initials}
    </div>
  )
}

type SortKey = "employee_name" | "department" | "email"
type SortDir = "asc" | "desc"

export default function EmployeesPage() {
  const [userName, setUserName] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("employee_name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) setUserName(user.email)
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      setEmployees(await employeesApi.getAll())
    } catch {
      toast.error("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (emp: Employee) => {
    setDeletingId(emp.employee_id)
    try {
      await employeesApi.delete(emp.employee_id)
      setEmployees((prev) => prev.filter((e) => e.employee_id !== emp.employee_id))
      toast.success(`${emp.employee_name} removed`)
    } catch {
      toast.error("Failed to delete employee")
    } finally {
      setDeletingId(null)
    }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sorted = [...employees]
    .filter(
      (e) =>
        e.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const av = (a[sortKey] ?? "").toLowerCase()
      const bv = (b[sortKey] ?? "").toLowerCase()
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const withAccount = employees.filter((e) => e.email).length
  const withoutAccount = employees.filter((e) => !e.email).length
  const departments = [...new Set(employees.map((e) => e.department))].length

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 opacity-30" />
    )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="Admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userName={userName} role="Admin" />
        <main className="flex-1 overflow-y-auto">

          {/* Hero header */}
          <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 px-8 py-8">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Users className="h-8 w-8 opacity-80" />
                    Employees
                  </h1>
                  <p className="text-purple-200 mt-1">Manage team members and their login accounts</p>
                </div>
                <AddEmployeeModal onEmployeeAdded={loadEmployees} />
              </div>

              {/* Stat chips */}
              {!loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-3 mt-6">
                  <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                    <Users className="h-4 w-4 opacity-70" />
                    {employees.length} Total
                  </div>
                  <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                    <UserCheck className="h-4 w-4 opacity-70" />
                    {withAccount} with login
                  </div>
                  {withoutAccount > 0 && (
                    <div className="flex items-center gap-2 bg-amber-400/30 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                      <UserX className="h-4 w-4 opacity-70" />
                      {withoutAccount} no account
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                    <Briefcase className="h-4 w-4 opacity-70" />
                    {departments} departments
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-4">

            {/* Search bar */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4"
            >
              <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, department, or email…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 dark:border-gray-600 focus:ring-purple-500"
                />
              </div>
            </motion.div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              {/* Table header */}
              <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="w-10" />
                <button onClick={() => toggleSort("employee_name")} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-left">
                  Name <SortIcon col="employee_name" />
                </button>
                <button onClick={() => toggleSort("department")} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-left">
                  Department <SortIcon col="department" />
                </button>
                <button onClick={() => toggleSort("email")} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-left">
                  Login Email <SortIcon col="email" />
                </button>
                <div className="text-right">Actions</div>
              </div>

              {/* Rows */}
              {loading ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-4 px-6 py-4 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="space-y-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" /><div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-20" /></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : sorted.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <Users className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {searchTerm ? "No employees match your search" : "No employees yet"}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    {searchTerm ? "Try a different search term" : "Click \"Add Employee\" to create the first one"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  <AnimatePresence>
                    {sorted.map((emp, index) => (
                      <motion.div
                        key={emp.employee_id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12, height: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        {/* Avatar */}
                        <Avatar name={emp.employee_name} />

                        {/* Name + ID */}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{emp.employee_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">ID #{emp.employee_id}</p>
                        </div>

                        {/* Department */}
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{emp.department}</span>
                        </div>

                        {/* Email / status */}
                        {emp.email ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                            <Mail className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate font-mono">{emp.email}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
                            <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700 text-xs">
                              No login account
                            </Badge>
                          </div>
                        )}

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(emp)}
                          disabled={deletingId === emp.employee_id}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          {deletingId === emp.employee_id ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Footer count */}
              {!loading && sorted.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-xs text-gray-400">
                  {searchTerm ? `${sorted.length} of ${employees.length} employees` : `${employees.length} employees`}
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
