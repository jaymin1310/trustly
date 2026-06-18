import { apiClient } from './client'
import type { ComplaintStatus } from '../types/enums'
import type {
  ComplaintDecisionRequest,
  ComplaintDetailsResponse,
  ComplaintResponse,
  CreateComplaintRequest,
} from '../types/models'

export const complaintApi = {
  create: (request: CreateComplaintRequest, evidences?: File[]) => {
    const formData = new FormData()
    formData.append('request', JSON.stringify(request))
    evidences?.forEach((file) => formData.append('evidences', file))
    return apiClient
      .post<ComplaintResponse>('/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  getMy: () => apiClient.get<ComplaintResponse[]>('/api/complaints/my').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<ComplaintDetailsResponse>(`/api/complaints/${id}`).then((r) => r.data),
}

export const adminComplaintApi = {
  getAll: (status?: ComplaintStatus) =>
    apiClient
      .get<ComplaintResponse[]>('/api/admin/complaints', { params: { status } })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<ComplaintDetailsResponse>(`/api/admin/complaints/${id}`).then((r) => r.data),

  decide: (id: number, data: ComplaintDecisionRequest) =>
    apiClient.post(`/api/admin/complaints/${id}/decision`, data).then((r) => r.data),
}
