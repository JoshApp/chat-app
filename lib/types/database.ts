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
      users: {
        Row: {
          id: string
          username: string
          display_name: string
          email: string | null
          password_hash: string | null
          gender: string
          age: number
          is_guest: boolean
          country_code: string | null
          show_country_flag: boolean
          age_verified_at: string
          last_seen_at: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          display_name: string
          email?: string | null
          password_hash?: string | null
          gender: string
          age: number
          is_guest?: boolean
          country_code?: string | null
          show_country_flag?: boolean
          age_verified_at?: string
          last_seen_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          email?: string | null
          password_hash?: string | null
          gender?: string
          age?: number
          is_guest?: boolean
          country_code?: string | null
          show_country_flag?: boolean
          age_verified_at?: string
          last_seen_at?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          read_at?: string | null
        }
      }
      blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          reason: string
          details: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          reason: string
          details?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          reason?: string
          details?: string | null
          status?: string
          created_at?: string
        }
      }
    }
    Functions: {
      get_or_create_conversation: {
        Args: {
          user1: string
          user2: string
        }
        Returns: string
      }
      is_blocked: {
        Args: {
          user_a: string
          user_b: string
        }
        Returns: boolean
      }
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Block = Database['public']['Tables']['blocks']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
