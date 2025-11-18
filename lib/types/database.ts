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
          age: number
          is_guest: boolean
          country_code: string | null
          show_country_flag: boolean
          vibe: 'soft' | 'flirty' | 'spicy' | 'intense' | null
          interests: string[]
          status_line: string | null
          premium_tier: 'free' | 'premium'
          email_verified: boolean
          email_verified_at: string | null
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
          age: number
          is_guest?: boolean
          country_code?: string | null
          show_country_flag?: boolean
          vibe?: 'soft' | 'flirty' | 'spicy' | 'intense' | null
          interests?: string[]
          status_line?: string | null
          premium_tier?: 'free' | 'premium'
          email_verified?: boolean
          email_verified_at?: string | null
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
          age?: number
          is_guest?: boolean
          country_code?: string | null
          show_country_flag?: boolean
          vibe?: 'soft' | 'flirty' | 'spicy' | 'intense' | null
          interests?: string[]
          status_line?: string | null
          premium_tier?: 'free' | 'premium'
          email_verified?: boolean
          email_verified_at?: string | null
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
          reply_to_message_id: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
          read_at?: string | null
          reply_to_message_id?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          read_at?: string | null
          reply_to_message_id?: string | null
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
      profile_reactions: {
        Row: {
          id: string
          reactor_id: string
          target_id: string
          emoji: '👋' | '❤️' | '😏' | '🔥'
          created_at: string
        }
        Insert: {
          id?: string
          reactor_id: string
          target_id: string
          emoji: '👋' | '❤️' | '😏' | '🔥'
          created_at?: string
        }
        Update: {
          id?: string
          reactor_id?: string
          target_id?: string
          emoji?: '👋' | '❤️' | '😏' | '🔥'
          created_at?: string
        }
      }
      reaction_quota: {
        Row: {
          id: string
          user_id: string
          date: string
          count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          count?: number
          created_at?: string
          updated_at?: string
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
      check_mutual_spark: {
        Args: {
          user_a: string
          user_b: string
        }
        Returns: boolean
      }
      get_reaction_quota: {
        Args: {
          user_uuid: string
          is_premium?: boolean
        }
        Returns: number
      }
      increment_reaction_quota: {
        Args: {
          user_uuid: string
        }
        Returns: void
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
export type ProfileReaction = Database['public']['Tables']['profile_reactions']['Row']
export type ReactionQuota = Database['public']['Tables']['reaction_quota']['Row']

// Vibe and interest types
export type Vibe = 'soft' | 'flirty' | 'spicy' | 'intense'
export type SparkEmoji = '👋' | '❤️' | '😏' | '🔥'
export type PremiumTier = 'free' | 'premium'

// Interest tag options
export const INTEREST_TAGS = [
  'Vanilla',
  'Kink-friendly',
  'Roleplay',
  'Power exchange',
  'Emotional support',
  'Confessions',
  'Story-driven',
  'Playful teasing',
] as const

export type InterestTag = typeof INTEREST_TAGS[number]

// Message with resolved parent message for reply functionality
export interface MessageWithReply extends Message {
  replyToMessage?: Message | null
}

// Message send states for optimistic rendering
export type MessageSendState = 'sending' | 'sent' | 'failed'

// Message with send state tracking (for client-side optimistic updates)
export interface MessageWithSendState extends Message {
  sendState?: MessageSendState
  clientId?: string // Temporary ID for optimistic messages
  error?: string // Error message if failed
}
