import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number
          name: string
          slug: string
          created_at: string
          updated_at: string
          settings: Json | null
        }
        Insert: {
          name: string
          slug: string
          settings?: Json | null
        }
        Update: {
          name?: string
          slug?: string
          settings?: Json | null
        }
      }
      company_branding: {
        Row: {
          id: number
          company_id: number
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id: number
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
        }
        Update: {
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
        }
      }
      gift_cards: {
        Row: {
          id: number
          code: string
          value: number
          status: string
          purchaser: string
          recipient: string
          created_at: string
          amount_spent: number | null
          phone_number: string
          responsible: string
          spent_date: string | null
          company_id: number
          created_by: number
          updated_at: string
        }
        Insert: {
          code: string
          value: number
          status?: string
          purchaser: string
          recipient: string
          amount_spent?: number | null
          phone_number: string
          responsible: string
          spent_date?: string | null
          company_id: number
          created_by: number
        }
        Update: {
          status?: string
          amount_spent?: number | null
          spent_date?: string | null
        }
      }
      users: {
        Row: {
          id: number
          email: string
          username: string
          role: 'system_admin' | 'company_admin' | 'staff'
          company_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          username: string
          role?: 'system_admin' | 'company_admin' | 'staff'
          company_id: number
        }
        Update: {
          email?: string
          username?: string
          role?: 'system_admin' | 'company_admin' | 'staff'
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
      user_role: 'system_admin' | 'company_admin' | 'staff'
    }
  }
}
