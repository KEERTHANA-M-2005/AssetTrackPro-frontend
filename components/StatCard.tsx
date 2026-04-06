"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  gradient: string
  delay?: number
}

export default function StatCard({ title, value, icon: Icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
      className="h-full"
    >
      <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${gradient}`}>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
              <h2 className="text-3xl font-bold text-white">{value}</h2>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      </Card>
    </motion.div>
  )
}