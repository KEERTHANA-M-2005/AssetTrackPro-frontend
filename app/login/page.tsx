"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Package, Eye, EyeOff, LogIn } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { authApi } from "@/lib/api"
import { setToken, isAuthenticated, getCurrentUser } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect already-authenticated users
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser()
      router.replace(user?.role === "admin" ? "/dashboard" : "/employee")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password")
      return
    }

    try {
      setLoading(true)
      const data = await authApi.login({ email: email.trim(), password })
      setToken(data.access_token)
      toast.success(`Welcome back! Logged in as ${data.role}`)
      router.push(data.role === "admin" ? "/dashboard" : "/employee")
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Login failed. Please check your credentials."
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AssetTrack Pro</span>
          </motion.div>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@assettrack.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </span>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
