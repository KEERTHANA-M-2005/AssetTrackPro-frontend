"use client"

import Sidebar from "@/components/sidebar"
import StatCard from "@/components/StatCard"
import { Package, AlertTriangle, CheckCircle } from "lucide-react"

export default function EmployeeDashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="Employee" />

      <div className="flex-1 p-10 space-y-6">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>

        <p className="text-gray-500">
          View your assigned assets and report issues here.
        </p>

        {/* 🔥 Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <StatCard
            title="My Assets"
            value="2"
            icon={Package}
            gradient="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          <StatCard
            title="Pending Issues"
            value="1"
            icon={AlertTriangle}
            gradient="bg-gradient-to-r from-orange-500 to-orange-600"
          />
          <StatCard
            title="Resolved Tickets"
            value="5"
            icon={CheckCircle}
            gradient="bg-gradient-to-r from-green-500 to-green-600"
          />
        </div>
      </div>
    </div>
  )
}