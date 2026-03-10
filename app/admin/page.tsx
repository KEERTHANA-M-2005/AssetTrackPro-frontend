import Sidebar from "@/components/sidebar"
import ThemeToggle from "@/components/theme-toggle"

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen">

      <Sidebar role="admin" />

      <div className="p-10 flex-1">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <ThemeToggle />
        </div>

        <p className="text-gray-500">
          Welcome to the Admin Dashboard. Manage assets and employees here.
        </p>

      </div>

    </div>
  )
}