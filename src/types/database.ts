export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ── Row types ──────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  country: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'monthly' | 'yearly'
  status: 'active' | 'inactive' | 'cancelled' | 'lapsed' | 'trialing'
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  stripe_price_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  amount_cents: number
  currency: string
  created_at: string
  updated_at: string
}

export interface GolfScore {
  id: string
  user_id: string
  score: number
  score_date: string
  created_at: string
  updated_at: string
}

export interface Charity {
  id: string
  name: string
  description: string | null
  short_description: string | null
  logo_url: string | null
  images: string[]
  website_url: string | null
  is_featured: boolean
  is_active: boolean
  upcoming_events: Json
  total_raised: number
  created_at: string
  updated_at: string
}

export interface CharitySelection {
  id: string
  user_id: string
  charity_id: string | null
  contribution_percentage: number
  created_at: string
  updated_at: string
}

export interface IndependentDonation {
  id: string
  user_id: string
  charity_id: string | null
  amount_cents: number
  currency: string
  stripe_payment_intent_id: string | null
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export interface Draw {
  id: string
  draw_month: number
  draw_year: number
  draw_type: 'random' | 'algorithmic'
  status: 'pending' | 'simulated' | 'published'
  winning_numbers: number[]
  total_pool_cents: number
  jackpot_pool_cents: number
  four_match_pool_cents: number
  three_match_pool_cents: number
  rollover_cents: number
  active_subscribers: number
  published_at: string | null
  simulation_data: Json
  created_at: string
  updated_at: string
}

export interface DrawEntry {
  id: string
  draw_id: string
  user_id: string
  scores: number[]
  created_at: string
}

export interface DrawResult {
  id: string
  draw_id: string
  user_id: string
  match_count: 3 | 4 | 5
  matched_numbers: number[]
  prize_amount_cents: number
  payment_status: 'pending' | 'paid' | 'rejected'
  created_at: string
  updated_at: string
}

export interface WinnerVerification {
  id: string
  draw_result_id: string
  user_id: string
  proof_url: string
  admin_notes: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface JackpotRollover {
  id: string
  from_draw_id: string | null
  to_draw_id: string | null
  amount_cents: number
  created_at: string
}

// ── Database shape for Supabase client ────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>
      }
      golf_scores: {
        Row: GolfScore
        Insert: Omit<GolfScore, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<GolfScore, 'id' | 'created_at' | 'updated_at'>>
      }
      charities: {
        Row: Charity
        Insert: Omit<Charity, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Charity, 'id' | 'created_at' | 'updated_at'>>
      }
      charity_selections: {
        Row: CharitySelection
        Insert: Omit<CharitySelection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CharitySelection, 'id' | 'created_at' | 'updated_at'>>
      }
      independent_donations: {
        Row: IndependentDonation
        Insert: Omit<IndependentDonation, 'id' | 'created_at'>
        Update: Partial<Omit<IndependentDonation, 'id' | 'created_at'>>
      }
      draws: {
        Row: Draw
        Insert: Omit<Draw, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Draw, 'id' | 'created_at' | 'updated_at'>>
      }
      draw_entries: {
        Row: DrawEntry
        Insert: Omit<DrawEntry, 'id' | 'created_at'>
        Update: Partial<Omit<DrawEntry, 'id' | 'created_at'>>
      }
      draw_results: {
        Row: DrawResult
        Insert: Omit<DrawResult, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DrawResult, 'id' | 'created_at' | 'updated_at'>>
      }
      winner_verifications: {
        Row: WinnerVerification
        Insert: Omit<WinnerVerification, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<WinnerVerification, 'id' | 'created_at' | 'updated_at'>>
      }
      jackpot_rollovers: {
        Row: JackpotRollover
        Insert: Omit<JackpotRollover, 'id' | 'created_at'>
        Update: Partial<Omit<JackpotRollover, 'id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
