export const Role = {
  USER: 'USER',
  WORKER: 'WORKER',
  ADMIN: 'ADMIN',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const ServiceRequestStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WORK_COMPLETION_REQUESTED: 'WORK_COMPLETION_REQUESTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type ServiceRequestStatus = (typeof ServiceRequestStatus)[keyof typeof ServiceRequestStatus]

export const WorkerApplicationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const
export type WorkerApplicationStatus = (typeof WorkerApplicationStatus)[keyof typeof WorkerApplicationStatus]

export const DocumentType = {
  AADHAAR: 'AADHAAR',
  PAN: 'PAN',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  VOTER_ID: 'VOTER_ID',
} as const
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType]

export const ComplaintStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const
export type ComplaintStatus = (typeof ComplaintStatus)[keyof typeof ComplaintStatus]

export const ComplaintCategory = {
  NO_SHOW: 'NO_SHOW',
  POOR_WORK_QUALITY: 'POOR_WORK_QUALITY',
  RUDE_BEHAVIOR: 'RUDE_BEHAVIOR',
  OVERCHARGING: 'OVERCHARGING',
  PROPERTY_DAMAGE: 'PROPERTY_DAMAGE',
  FRAUD: 'FRAUD',
  OTHER: 'OTHER',
} as const
export type ComplaintCategory = (typeof ComplaintCategory)[keyof typeof ComplaintCategory]

export const ComplaintDecision = {
  REJECT: 'REJECT',
  RESOLVE: 'RESOLVE',
  WARNING: 'WARNING',
  TEMP_SUSPENSION: 'TEMP_SUSPENSION',
  PERMANENT_BAN: 'PERMANENT_BAN',
} as const
export type ComplaintDecision = (typeof ComplaintDecision)[keyof typeof ComplaintDecision]

export const ComplaintEvidenceType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
} as const
export type ComplaintEvidenceType = (typeof ComplaintEvidenceType)[keyof typeof ComplaintEvidenceType]

export const enumLabels: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WORK_COMPLETION_REQUESTED: 'Completion Requested',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  APPROVED: 'Approved',
  UNDER_REVIEW: 'Under Review',
  RESOLVED: 'Resolved',
  NO_SHOW: 'No Show',
  POOR_WORK_QUALITY: 'Poor Work Quality',
  RUDE_BEHAVIOR: 'Rude Behavior',
  OVERCHARGING: 'Overcharging',
  PROPERTY_DAMAGE: 'Property Damage',
  FRAUD: 'Fraud',
  OTHER: 'Other',
  REJECT: 'Reject',
  RESOLVE: 'Resolve',
  WARNING: 'Warning',
  TEMP_SUSPENSION: 'Temp Suspension',
  PERMANENT_BAN: 'Permanent Ban',
  AADHAAR: 'Aadhaar',
  PAN: 'PAN',
  DRIVING_LICENSE: 'Driving License',
  VOTER_ID: 'Voter ID',
  USER: 'User',
  WORKER: 'Worker',
  ADMIN: 'Admin',
}

export function formatEnum(value: string): string {
  return enumLabels[value] ?? value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function enumValues<T extends Record<string, string>>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][]
}
