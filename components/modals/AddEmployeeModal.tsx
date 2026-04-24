"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { employeesApi } from "@/lib/api"
import { Plus, Eye, EyeOff, User, Building2, Mail, Lock, UserPlus } from "lucide-react"

interface AddEmployeeModalProps {
  onEmployeeAdded: () => void
}

export function AddEmployeeModal({ onEmployeeAdded }: AddEmployeeModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ employee_name: "", department: "", email: "", password: "" })

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const reset = () => setForm({ employee_name: "", department: "", email: "", password: "" })

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.employee_name.trim() || !form.department.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("All fields are required")
      return
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    try {
      setLoading(true)
      await employeesApi.create({
        employee_name: form.employee_name.trim(),
        department: form.department.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      toast.success(`${form.employee_name.trim()} added — they can now log in`)
      reset()
      setOpen(false)
      onEmployeeAdded()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to add employee"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-sm gap-2">
          <UserPlus className="w-4 h-4" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-semibold">Add New Employee</DialogTitle>
              <p className="text-purple-200 text-sm mt-0.5">Creates a record and a login account</p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="emp-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="emp-name"
                value={form.employee_name}
                onChange={set("employee_name")}
                placeholder="e.g. Jane Smith"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label htmlFor="emp-dept" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Department
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="emp-dept"
                value={form.department}
                onChange={set("department")}
                placeholder="e.g. Engineering"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="emp-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Login Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="emp-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="jane@company.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="emp-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Initial Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="emp-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 6 characters"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400">The employee can change this after logging in.</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Employee
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
