import { apiClient } from './client'
import type { AdminDashboardResponse } from '../types/models'

export const adminApi = {
  getDashboard: () =>
    apiClient.get<AdminDashboardResponse>('/api/admin/dashboard').then((r) => r.data),
}
