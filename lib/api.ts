import axios from "axios"
import { getToken, clearAuth } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401: clear auth state and bounce to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearAuth()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Asset {
  asset_id: number
  asset_name: string
  asset_status: string
  asset_type?: string
  condition?: string
  purchase_date?: string
  purchase_cost?: number
  location?: string
  description?: string
}

export interface Employee {
  employee_id: number
  employee_name: string
  department: string
  email?: string
  user_id?: number
}

export interface Assignment {
  assignment_id: number
  asset_id: number
  employee_id: number
  assigned_date: string
  returned_date?: string
  status: string
  notes?: string
  asset?: Asset
  employee?: Employee
}

export interface ReportData {
  totalAssets: number
  activeAssignments: number
  availableAssets: number
  overdueReturns: number
  assetStatusDistribution?: Array<{ status: string; count: number; percentage: number }>
  departmentUsage?: Array<{ department: string; assetCount: number; percentage: number }>
  recentActivity?: Array<{ description: string; timestamp: string }>
  assetTypes?: Array<{ type: string; count: number; percentage: number }>
}

export interface DashboardStats {
  totalAssets: number
  totalEmployees: number
  availableAssets: number
  assetsInRepair: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  full_name: string
  email: string
  password: string
  role: string
  department?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  role: string
  user_id: number
  email: string
  employee_id: number | null
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/api/auth/login", payload)
    return res.data
  },
  signup: async (payload: SignupPayload): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/api/auth/signup", payload)
    return res.data
  },
}

export const assetsApi = {
  getAll: async (): Promise<Asset[]> => {
    const res = await api.get<Asset[]>("/api/assets/")
    return res.data
  },
  create: async (asset: { asset_name: string }): Promise<Asset> => {
    const res = await api.post<Asset>("/api/assets/", asset)
    return res.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/assets/${id}`)
  },
}

export const employeesApi = {
  getAll: async (): Promise<Employee[]> => {
    const res = await api.get<Employee[]>("/api/employees/")
    return res.data
  },
  create: async (employee: { employee_name: string; department: string; email: string; password: string }): Promise<Employee> => {
    const res = await api.post<Employee>("/api/employees/", employee)
    return res.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/employees/${id}`)
  },
}

export const reportsApi = {
  getReport: async (period = "30d"): Promise<ReportData> => {
    const res = await api.get<ReportData>(`/api/reports/?period=${period}`)
    return res.data
  },
  downloadCsv: (period = "30d"): void => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const url = `${API_BASE_URL}/api/reports/download?period=${period}`
    const a = document.createElement("a")
    a.href = url
    a.style.display = "none"
    // Pass token via query param for file downloads (cannot set headers on anchor clicks)
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob)
        a.href = blobUrl
        a.download = `assettrack_report_${period}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
      })
  },
}

export const assignmentsApi = {
  getAll: async (): Promise<Assignment[]> => {
    const res = await api.get<Assignment[]>("/api/assignments/")
    return res.data
  },
  create: async (assignment: { asset_id: number; employee_id: number }): Promise<Assignment> => {
    const res = await api.post<Assignment>("/api/assignments/", assignment)
    return res.data
  },
  return: async (assignmentId: number): Promise<Assignment> => {
    const res = await api.put<Assignment>(`/api/assignments/${assignmentId}/return`)
    return res.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/assignments/${id}`)
  },
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [assets, employees] = await Promise.all([assetsApi.getAll(), employeesApi.getAll()])
  return {
    totalAssets: assets.length,
    totalEmployees: employees.length,
    availableAssets: assets.filter((a) => a.asset_status === "AVAILABLE").length,
    assetsInRepair: assets.filter((a) => a.asset_status === "REPAIR").length,
  }
}
