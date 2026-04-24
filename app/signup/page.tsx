"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Eye, EyeOff, UserCog, Briefcase, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { authApi } from "@/lib/api"
import { setToken, isAuthenticated, getCurrentUser } from "@/lib/auth"

type Role = "admin" | "employee"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<"role" | "details">("role")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    department: "",
  })

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser()
      router.replace(user?.role === "admin" ? "/dashboard" : "/employee")
    }
  }, [router])

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setStep("details")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.full_name.trim()) { toast.error("Full name is required"); return }
    if (!form.email.trim()) { toast.error("Email is required"); return }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return }
    if (form.password !== form.confirm_password) { toast.error("Passwords do not match"); return }
    if (selectedRole === "employee" && !form.department.trim()) { toast.error("Department is required"); return }

    try {
      setLoading(true)
      const data = await authApi.signup({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: selectedRole!,
        department: selectedRole === "employee" ? form.department.trim() : undefined,
      })
      setToken(data.access_token)
      toast.success("Account created! Welcome to AssetTrack Pro.")
      router.push(data.role === "admin" ? "/dashboard" : "/employee")
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Signup failed. Please try again."
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AssetTrack Pro</span>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {step === "role" ? (
            <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-0 shadow-2xl">
                <CardHeader className="pb-4 text-center">
                  <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                  <CardDescription>Choose how you want to join AssetTrack Pro</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  <button
                    onClick={() => handleRoleSelect("admin")}
                    className="w-full group p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 transition-colors">
                        <UserCog className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-base">Admin</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage assets, employees, and reports</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect("employee")}
                    className="w-full group p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors">
                        <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-base">Employee</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View your assigned assets and history</p>
                      </div>
                    </div>
                  </button>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                    Already have an account?{" "}
                    <Link href="/login" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Sign in</Link>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-0 shadow-2xl">
                <CardHeader className="pb-4">
                  <button onClick={() => setStep("role")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-3 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selectedRole === "admin" ? "bg-purple-100 dark:bg-purple-900/40" : "bg-blue-100 dark:bg-blue-900/40"}`}>
                      {selectedRole === "admin"
                        ? <UserCog className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        : <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {selectedRole === "admin" ? "Admin Account" : "Employee Account"}
                      </CardTitle>
                      <CardDescription>Fill in your details to get started</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Full Name</Label>
                      <Input id="full-name" placeholder="Jane Smith" value={form.full_name} onChange={set("full_name")} autoComplete="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="jane@company.com" value={form.email} onChange={set("email")} autoComplete="email" required />
                    </div>
                    {selectedRole === "employee" && (
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" placeholder="Engineering" value={form.department} onChange={set("department")} required />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 6 characters"
                          value={form.password}
                          onChange={set("password")}
                          autoComplete="new-password"
                          required
                          className="pr-10"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={form.confirm_password}
                        onChange={set("confirm_password")}
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={`w-full mt-2 ${selectedRole === "admin" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Creating account…
                        </span>
                      ) : "Create Account"}
                    </Button>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Already have an account?{" "}
                      <Link href="/login" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Sign in</Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
