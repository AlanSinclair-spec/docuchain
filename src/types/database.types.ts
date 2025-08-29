export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'foundation' | 'professional' | 'enterprise'
          api_key: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'foundation' | 'professional' | 'enterprise'
          api_key?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'foundation' | 'professional' | 'enterprise'
          api_key?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string | null
          role: 'owner' | 'admin' | 'member'
          subscription_status: string | null
          subscription_plan: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          email: string
          full_name?: string | null
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string | null
          role?: 'owner' | 'admin' | 'member'
          subscription_status?: string | null
          subscription_plan?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          organization_id: string
          name: string
          vendor_type: string | null
          tax_id: string | null
          contact_email: string | null
          contact_phone: string | null
          address: Json | null
          compliance_status: 'pending' | 'approved' | 'expired' | 'rejected'
          risk_score: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          vendor_type?: string | null
          tax_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: Json | null
          compliance_status?: 'pending' | 'approved' | 'expired' | 'rejected'
          risk_score?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          vendor_type?: string | null
          tax_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: Json | null
          compliance_status?: 'pending' | 'approved' | 'expired' | 'rejected'
          risk_score?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          organization_id: string
          vendor_id: string
          document_type: string
          name: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          expiry_date: string | null
          status: 'active' | 'expired' | 'expiring_soon' | 'archived'
          metadata: Json
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          vendor_id: string
          document_type: string
          name: string
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          expiry_date?: string | null
          status?: 'active' | 'expired' | 'expiring_soon' | 'archived'
          metadata?: Json
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          vendor_id?: string
          document_type?: string
          name?: string
          file_url?: string
          file_size?: number | null
          mime_type?: string | null
          expiry_date?: string | null
          status?: 'active' | 'expired' | 'expiring_soon' | 'archived'
          metadata?: Json
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      document_types: {
        Row: {
          id: string
          organization_id: string
          name: string
          required: boolean
          expiry_required: boolean
          default_expiry_days: number | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          required?: boolean
          expiry_required?: boolean
          default_expiry_days?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          required?: boolean
          expiry_required?: boolean
          default_expiry_days?: number | null
          created_at?: string
        }
      }
      compliance_checks: {
        Row: {
          id: string
          organization_id: string
          vendor_id: string
          check_type: string
          status: string
          details: Json | null
          checked_by: string | null
          api_call: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          vendor_id: string
          check_type: string
          status: string
          details?: Json | null
          checked_by?: string | null
          api_call?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          vendor_id?: string
          check_type?: string
          status?: string
          details?: Json | null
          checked_by?: string | null
          api_call?: boolean
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          organization_id: string
          vendor_id: string | null
          document_id: string | null
          alert_type: 'expiry_warning' | 'expired' | 'missing_document' | 'compliance_failed'
          message: string
          resolved: boolean
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          vendor_id?: string | null
          document_id?: string | null
          alert_type: 'expiry_warning' | 'expired' | 'missing_document' | 'compliance_failed'
          message: string
          resolved?: boolean
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          vendor_id?: string | null
          document_id?: string | null
          alert_type?: 'expiry_warning' | 'expired' | 'missing_document' | 'compliance_failed'
          message?: string
          resolved?: boolean
          resolved_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
