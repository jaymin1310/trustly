import { apiClient } from './client'
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/models'

export const categoryApi = {
  getActive: () =>
    apiClient.get<CategoryResponse[]>('/api/categories').then((r) => r.data),

  getAll: () =>
    apiClient.get<CategoryResponse[]>('/api/admin/categories').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<CategoryResponse>(`/api/admin/categories/${id}`).then((r) => r.data),

  create: (data: CreateCategoryRequest) =>
    apiClient.post<CategoryResponse>('/api/admin/categories', data).then((r) => r.data),

  update: (id: number, data: UpdateCategoryRequest) =>
    apiClient.patch<CategoryResponse>(`/api/admin/categories/${id}`, data).then((r) => r.data),
}
