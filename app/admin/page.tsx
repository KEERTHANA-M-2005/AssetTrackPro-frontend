"use client"

import Sidebar from "@/components/sidebar"
import StatCard from "@/components/StatCard"
import { Package, Users, CheckCircle, Eye } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="Admin" />

      <div className="flex-1 p-10 space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <p className="text-gray-500">
          Welcome to the Admin Dashboard. Manage assets and employees here.
        </p>

        {/* 🔥 Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <StatCard
            title="Total Assets"
            value="120"
            icon={Package}
            gradient="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          <StatCard
            title="Employees"
            value="45"
            icon={Users}
            gradient="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatCard
            title="Active Assets"
            value="98"
            icon={CheckCircle}
            gradient="bg-gradient-to-r from-green-500 to-green-600"
          />
          <StatCard
            title="Visitors"
            value="1.2K"
            icon={Eye}
            gradient="bg-gradient-to-r from-orange-500 to-orange-600"
          />
        </div>
      </div>
    </div>
  )
}