import { apiClient } from './client'
import type {
  CreateReviewRequest,
  PageResponse,
  ReviewResponse,
  UpdateReviewRequest,
} from '../types/models'

export const reviewApi = {
  create: (data: CreateReviewRequest) =>
    apiClient.post<ReviewResponse>('/api/reviews', data).then((r) => r.data),

  update: (id: number, data: UpdateReviewRequest) =>
    apiClient.put<ReviewResponse>(`/api/reviews/${id}`, data).then((r) => r.data),

  getByWorker: (workerProfileId: number, page = 0, size = 10) =>
    apiClient
      .get<PageResponse<ReviewResponse>>(`/api/reviews/worker/${workerProfileId}`, {
        params: { page, size },
      })
      .then((r) => r.data),

  getByServiceRequest: (serviceRequestId: number) =>
    apiClient
      .get<ReviewResponse>(`/api/reviews/service-request/${serviceRequestId}`)
      .then((r) => r.data),

  getMyForWorker: (workerProfileId: number) =>
    apiClient
      .get<ReviewResponse[]>(`/api/reviews/worker/${workerProfileId}/my-reviews`)
      .then((r) => r.data),
}
