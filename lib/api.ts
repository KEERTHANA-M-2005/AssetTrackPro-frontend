import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Asset {
  asset_id: number;
  asset_name: string;
  asset_status: string;
  asset_type?: string;
  condition?: string;
  purchase_date?: string;
  purchase_cost?: number;
  location?: string;
  description?: string;
}

export interface Employee {
  employee_id: number;
  employee_name: string;
  department: string;
}

export interface Assignment {
  assignment_id: number;
  asset_id: number;
  employee_id: number;
  assigned_date: string;
  returned_date?: string;
  status: string;
  notes?: string;
  asset?: Asset;
  employee?: Employee;
}

export interface ReportData {
  totalAssets: number;
  activeAssignments: number;
  availableAssets: number;
  overdueReturns: number;
  assetStatusDistribution?: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  departmentUsage?: Array<{
    department: string;
    assetCount: number;
    percentage: number;
  }>;
  recentActivity?: Array<{
    description: string;
    timestamp: string;
  }>;
  assetTypes?: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export interface DashboardStats {
  totalAssets: number;
  totalEmployees: number;
  availableAssets: number;
  assetsInRepair: number;
}

// API functions
export const assetsApi = {
  getAll: async (): Promise<Asset[]> => {
    const response = await api.get('/api/assets/');
    return response.data;
  },

  create: async (asset: { asset_name: string }): Promise<Asset> => {
    const response = await api.post('/api/assets/', asset);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/assets/${id}`);
  },
};

export const employeesApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/api/employees/');
    return response.data;
  },

  create: async (employee: { employee_name: string; department: string }): Promise<Employee> => {
    const response = await api.post('/api/employees/', employee);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/employees/${id}`);
  },
};

export const assignmentsApi = {
  getAll: async (): Promise<Assignment[]> => {
    const response = await api.get('/api/assignments/');
    return response.data;
  },

  create: async (assignment: { asset_id: number; employee_id: number }): Promise<Assignment> => {
    const response = await api.post('/api/assignments/', assignment);
    return response.data;
  },

  return: async (assignmentId: number): Promise<Assignment> => {
    const response = await api.put(`/api/assignments/${assignmentId}/return`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/assignments/${id}`);
  },
};

export const reportsApi = {
  getReport: async (period: string = '30d'): Promise<ReportData> => {
    const response = await api.get(`/api/reports/?period=${period}`);
    return response.data;
  },
};

// Dashboard stats calculation
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [assets, employees] = await Promise.all([
    assetsApi.getAll(),
    employeesApi.getAll(),
  ]);

  return {
    totalAssets: assets.length,
    totalEmployees: employees.length,
    availableAssets: assets.filter(asset => asset.asset_status === 'AVAILABLE').length,
    assetsInRepair: assets.filter(asset => asset.asset_status === 'REPAIR').length,
  };
};