import { apiClient } from './client'
import type {
  SuccessResponse,
  WorkerProfileRequest,
  WorkerProfileResponse,
  WorkerSearchResponse,
} from '../types/models'
import type { PageResponse } from '../types/models'

export const workerProfileApi = {
  getMy: () =>
    apiClient.get<WorkerProfileResponse>('/api/worker/profile/me').then((r) => r.data),

  complete: (data: WorkerProfileRequest) =>
    apiClient.put<SuccessResponse>('/api/worker/profile', data).then((r) => r.data),
}

export const workerSearchApi = {
  search: (params: {
    category?: number
    city?: string
    state?: string
    minimumRating?: number
    sort?: string
    page?: number
    size?: number
  }) =>
    apiClient
      .get<PageResponse<WorkerSearchResponse>>('/workers', { params })
      .then((r) => r.data),
}
