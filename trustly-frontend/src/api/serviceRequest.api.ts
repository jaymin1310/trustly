import { apiClient } from './client'
import type { ServiceRequestStatus } from '../types/enums'
import type {
  CancelServiceRequestRequest,
  CreateServiceRequestRequest,
  RejectServiceRequestRequest,
  ServiceRequestResponse,
} from '../types/models'

export const serviceRequestApi = {
  create: (data: CreateServiceRequestRequest) =>
    apiClient.post<ServiceRequestResponse>('/api/service-requests', data).then((r) => r.data),

  getCustomerRequests: (status?: ServiceRequestStatus) =>
    apiClient
      .get<ServiceRequestResponse[]>('/api/service-requests/customer', { params: { status } })
      .then((r) => r.data),

  getWorkerRequests: (status?: ServiceRequestStatus) =>
    apiClient
      .get<ServiceRequestResponse[]>('/api/service-requests/worker', { params: { status } })
      .then((r) => r.data),

  accept: (id: number) =>
    apiClient.patch<ServiceRequestResponse>(`/api/service-requests/${id}/accept`).then((r) => r.data),

  reject: (id: number, data: RejectServiceRequestRequest) =>
    apiClient
      .patch<ServiceRequestResponse>(`/api/service-requests/${id}/reject`, data)
      .then((r) => r.data),

  requestCompletion: (id: number) =>
    apiClient
      .patch<ServiceRequestResponse>(`/api/service-requests/${id}/request-completion`)
      .then((r) => r.data),

  complete: (id: number) =>
    apiClient.patch<ServiceRequestResponse>(`/api/service-requests/${id}/complete`).then((r) => r.data),

  cancel: (id: number, data: CancelServiceRequestRequest) =>
    apiClient
      .patch<ServiceRequestResponse>(`/api/service-requests/${id}/cancel`, data)
      .then((r) => r.data),
}
