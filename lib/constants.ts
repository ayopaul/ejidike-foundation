/**
 * FILE PATH: /ejdk/ejidike-foundation/lib/constants.ts
 * PURPOSE: Application-wide constants
 */

export const APP_NAME = 'Ejidike Foundation';
export const APP_DESCRIPTION = "Empowering Nigeria's Youth to Learn, Lead & Innovate";

export const ROLES = {
  APPLICANT: 'applicant',
  MENTOR: 'mentor',
  PARTNER: 'partner',
  ADMIN: 'admin'
} as const;

export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const PROGRAM_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  DRAFT: 'draft'
} as const;

export const PROGRAM_TYPES = {
  EDUCATION: 'education',
  BUSINESS: 'business'
} as const;

export const OPPORTUNITY_TYPES = {
  INTERNSHIP: 'internship',
  APPRENTICESHIP: 'apprenticeship',
  VOLUNTEER: 'volunteer'
} as const;

export const MENTORSHIP_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const SESSION_MODE = {
  VIRTUAL: 'virtual',
  IN_PERSON: 'in-person',
  PHONE: 'phone'
} as const;

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_IMAGE_SIZE_MB: 2,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
} as const;

export const STORAGE_BUCKETS = {
  APPLICATION_DOCUMENTS: 'application-documents',
  PROFILE_AVATARS: 'profile-avatars',
  ORGANIZATION_LOGOS: 'organization-logos'
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100]
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  FULL: 'MMMM dd, yyyy',
  SHORT: 'MM/dd/yyyy',
  ISO: 'yyyy-MM-dd'
} as const;

export const CURRENCY = {
  SYMBOL: '₦',
  CODE: 'NGN',
  LOCALE: 'en-NG'
} as const;

export const CONTACT = {
  EMAIL: 'support@ejidikefoundation.com',
  PHONE: '+234 XXX XXX XXXX',
  ADDRESS: 'Lagos, Nigeria'
} as const;

export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/ejidikefoundation',
  FACEBOOK: 'https://facebook.com/ejidikefoundation',
  LINKEDIN: 'https://linkedin.com/company/ejidikefoundation',
  INSTAGRAM: 'https://instagram.com/ejidikefoundation'
} as const;