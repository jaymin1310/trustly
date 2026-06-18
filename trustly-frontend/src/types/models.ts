import type {
  ComplaintCategory,
  ComplaintDecision,
  ComplaintEvidenceType,
  ComplaintStatus,
  DocumentType,
  Role,
  ServiceRequestStatus,
  WorkerApplicationStatus,
} from './enums'

export interface ApiErrorResponse {
  success: boolean
  message: string
  errors?: Record<string, string>
  timestamp?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  email: string
  roles: Role[]
}

export interface ApiResponse {
  success: boolean
  message: string
}

export interface SuccessResponse {
  success: boolean
  message: string
}

export interface CategoryResponse {
  id: number
  name: string
  description: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  active?: boolean
}

export interface CustomerDTO {
  id: number
  name: string
}

export interface WorkerDTO {
  profileId: number
  userId: number
  name: string
}

export interface CategoryDTO {
  id: number
  name: string
}

export interface ServiceRequestResponse {
  id: number
  customer: CustomerDTO
  worker: WorkerDTO
  category: CategoryDTO
  title: string
  description: string
  address: string
  status: ServiceRequestStatus
  requestedAt: string
  respondedAt: string | null
  completedAt: string | null
  workerRemark: string | null
  customerRemark: string | null
}

export interface CreateServiceRequestRequest {
  workerProfileId: number
  title: string
  description: string
  address: string
}

export interface RejectServiceRequestRequest {
  workerRemark: string
}

export interface CancelServiceRequestRequest {
  customerRemark: string
}

export interface ReviewResponse {
  id: number
  serviceRequestId: number
  customerId: number
  customerName: string
  workerProfileId: number
  rating: number
  reviewText: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateReviewRequest {
  serviceRequestId: number
  rating: number
  reviewText?: string
}

export interface UpdateReviewRequest {
  rating: number
  reviewText?: string
}

export interface ComplaintResponse {
  id: number
  serviceRequestId: number
  workerProfileId: number
  category: ComplaintCategory
  description: string
  status: ComplaintStatus
  createdAt: string
}

export interface ComplaintEvidenceResponse {
  id: number
  fileUrl: string
  fileType: ComplaintEvidenceType
  uploadedAt: string
}

export interface ComplaintDetailsResponse {
  id: number
  serviceRequestId: number
  customerId: number
  customerName: string
  workerProfileId: number
  workerName: string
  category: ComplaintCategory
  description: string
  status: ComplaintStatus
  resolutionNote: string | null
  resolvedBy: string | null
  resolvedAt: string | null
  evidences: ComplaintEvidenceResponse[]
  createdAt: string
}

export interface CreateComplaintRequest {
  serviceRequestId: number
  category: ComplaintCategory
  description: string
}

export interface ComplaintDecisionRequest {
  decision: ComplaintDecision
  resolutionNote: string
  suspensionDays?: number
}

export interface WorkerApplicationResponse {
  id: number
  applicantName: string
  email: string
  categoryId: number
  categoryName: string
  status: WorkerApplicationStatus
}

export interface WorkerApplicationDetailResponse {
  id: number
  applicantName: string
  applicantEmail: string
  phone: string
  categoryId: number
  categoryName: string
  experienceYears: number
  address: string
  documentType: DocumentType
  documentNumber: string
  documentUrl: string
  status: WorkerApplicationStatus
  adminRemark: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface MyWorkerApplicationResponse {
  id: number
  categoryId: number
  categoryName: string
  status: WorkerApplicationStatus
  adminRemark: string | null
  createdAt: string
  reviewedAt: string | null
}

export interface ApplyWorkerRequest {
  phone: string
  categoryId: number
  experienceYears: number
  address: string
  documentType: DocumentType
  documentNumber: string
}

export interface ReviewWorkerRequest {
  remark: string
}

export interface WorkerProfileResponse {
  id: number
  workerId: number
  categoryId: number
  categoryName: string
  workerName: string
  bio: string
  experienceYears: number
  city: string
  state: string
  profileCompleted: boolean
}

export interface WorkerProfileRequest {
  bio: string
  experienceYears: number
  city: string
  state: string
}

export interface WorkerSearchResponse {
  id: number
  workerId: number
  workerName: string
  categoryId: number
  categoryName: string
  bio: string
  experienceYears: number
  city: string
  state: string
  averageRating: number
  totalReviews: number
}

export interface AdminDashboardResponse {
  totalUsers: number
  totalWorkers: number
  totalCategories: number
  totalServiceRequests: number
  totalReviews: number
  activePenalties: number
  serviceRequestsByStatus: Record<ServiceRequestStatus, number>
  workerApplicationsByStatus: Record<WorkerApplicationStatus, number>
  complaintsByStatus: Record<ComplaintStatus, number>
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface OtpRequest {
  email: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
}
