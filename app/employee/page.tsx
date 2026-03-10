import Sidebar from "@/components/sidebar"
import ThemeToggle from "@/components/theme-toggle"

export default function EmployeeDashboard() {
  return (
    <div className="flex min-h-screen">

      <Sidebar role="employee" />

      <div className="p-10 flex-1">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <ThemeToggle />
        </div>

        <p className="text-gray-500">
          View your assigned assets and report issues here.
        </p>

      </div>

    </div>
  )
}