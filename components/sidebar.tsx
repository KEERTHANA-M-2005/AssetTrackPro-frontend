"use client"

export default function Sidebar({ role }: { role: string }) {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">
      <h2 className="text-xl font-bold mb-6">AssetTrack Pro</h2>

      <ul className="space-y-3">

        <li>Dashboard</li>

        {role === "Admin" && (
          <>
            <li>Assets</li>
            <li>Employees</li>
            <li>Inventory</li>
          </>
        )}

        {role === "Employee" && (
          <>
            <li>My Assets</li>
            <li>Report Issue</li>
          </>
        )}

      </ul>
    </div>
  )
}