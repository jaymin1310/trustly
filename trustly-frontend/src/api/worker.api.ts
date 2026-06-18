import { apiClient } from './client'
import type { WorkerApplicationStatus } from '../types/enums'
import type {
  ApplyWorkerRequest,
  MyWorkerApplicationResponse,
  PageResponse,
  ReviewWorkerRequest,
  SuccessResponse,
  WorkerApplicationDetailResponse,
  WorkerApplicationResponse,
} from '../types/models'

export const workerApi = {
  apply: (data: ApplyWorkerRequest, document: File) => {
    const formData = new FormData()
    formData.append('phone', data.phone)
    formData.append('categoryId', String(data.categoryId))
    formData.append('experienceYears', String(data.experienceYears))
    formData.append('address', data.address)
    formData.append('documentType', data.documentType)
    formData.append('documentNumber', data.documentNumber)
    formData.append('document', document)
    return apiClient
      .post<SuccessResponse>('/api/workers/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  getMyApplication: () =>
    apiClient.get<MyWorkerApplicationResponse>('/api/workers/my-application').then((r) => r.data),
}

export const adminWorkerApi = {
  getApplications: (status?: WorkerApplicationStatus, page = 0, size = 10) =>
    apiClient
      .get<PageResponse<WorkerApplicationResponse>>('/api/admin/worker-applications', {
        params: { status, page, size },
      })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<WorkerApplicationDetailResponse>(`/api/admin/worker-applications/${id}`)
      .then((r) => r.data),

  approve: (id: number) =>
    apiClient
      .patch<SuccessResponse>(`/api/admin/worker-applications/${id}/approve`)
      .then((r) => r.data),

  reject: (id: number, data: ReviewWorkerRequest) =>
    apiClient
      .patch<SuccessResponse>(`/api/admin/worker-applications/${id}/reject`, data)
      .then((r) => r.data),
}
