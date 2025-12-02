/**
 * FILE PATH: /ejdk/ejidike-foundation/types/database.ts
 * PURPOSE: Supabase database types - matches actual schema
 */

export type UserRole = 'applicant' | 'mentor' | 'partner' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  email: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  type: 'education' | 'business';
  eligibility_criteria: Record<string, any>;
  budget: number;
  start_date: string;
  end_date: string;
  application_start_date?: string;
  application_end_date?: string;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  program_id: string;
  applicant_id: string;
  status: string;
  application_data: Record<string, any>;
  submitted_at?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  file_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
}

export interface MentorProfile {
  id: string;
  user_id: string;
  headline?: string;
  bio: string;
  expertise_areas: string[];
  skills?: string[];
  years_of_experience: number;
  availability_status: 'available' | 'limited' | 'unavailable';
  max_mentees: number;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MentorApplication {
  id: string;
  profile_id: string;
  motivation: string;
  experience_description: string;
  areas_of_support: string;
  status: string;
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface MentorshipMatch {
  id: string;
  mentor_id: string;
  mentee_id: string;
  program_id?: string;
  status: string;
  goals?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface MentorshipSession {
  id: string;
  match_id: string;
  session_date: string;
  duration_minutes: number;
  mode: string;
  notes?: string;
  attendance?: string;
  mentor_feedback?: string;
  mentee_feedback?: string;
  created_at: string;
}

export interface PartnerOrganization {
  id: string;
  user_id: string;
  organization_name: string;
  sector: string;
  description: string;
  website?: string;
  logo_url?: string;
  location?: string;
  contact_person?: string;
  contact_email: string;
  contact_phone: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerOpportunity {
  id: string;
  partner_id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  remote_option: boolean;
  requirements?: string[];
  application_link?: string;
  open_date?: string;
  application_deadline: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalDocument {
  id: number;
  privacy_policy?: string;
  terms_of_service?: string;
  cookie_policy?: string;
  data_protection_policy?: string;
  acceptable_use_policy?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

// Unified Database type for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at'>>;
      };
      programs: {
        Row: Program;
        Insert: Omit<Program, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Program, 'id' | 'created_at'>>;
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Application, 'id' | 'created_at'>>;
      };
      application_documents: {
        Row: ApplicationDocument;
        Insert: Omit<ApplicationDocument, 'id' | 'uploaded_at'>;
        Update: Partial<Omit<ApplicationDocument, 'id' | 'uploaded_at'>>;
      };
      mentor_profiles: {
        Row: MentorProfile;
        Insert: Omit<MentorProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MentorProfile, 'id' | 'created_at'>>;
      };
      mentor_applications: {
        Row: MentorApplication;
        Insert: Omit<MentorApplication, 'id' | 'submitted_at'>;
        Update: Partial<Omit<MentorApplication, 'id' | 'submitted_at'>>;
      };
      mentorship_matches: {
        Row: MentorshipMatch;
        Insert: Omit<MentorshipMatch, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MentorshipMatch, 'id' | 'created_at'>>;
      };
      mentorship_sessions: {
        Row: MentorshipSession;
        Insert: Omit<MentorshipSession, 'id' | 'created_at'>;
        Update: Partial<Omit<MentorshipSession, 'id' | 'created_at'>>;
      };
      partner_organizations: {
        Row: PartnerOrganization;
        Insert: Omit<PartnerOrganization, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PartnerOrganization, 'id' | 'created_at'>>;
      };
      partner_opportunities: {
        Row: PartnerOpportunity;
        Insert: Omit<PartnerOpportunity, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PartnerOpportunity, 'id' | 'created_at'>>;
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Announcement, 'id' | 'created_at'>>;
      };
      faqs: {
        Row: FAQ;
        Insert: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FAQ, 'id' | 'created_at'>>;
      };
      legal_documents: {
        Row: LegalDocument;
        Insert: Omit<LegalDocument, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LegalDocument, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}