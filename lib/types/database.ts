// lib/types/database.ts
// BarrelVerse Database Type Definitions

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
      // 2026-09-01: hidden_cards, user_digital_cards and discovery_events added,
      // GENERATED from the live schema.
      //
      // Those three tables DID NOT EXIST until today. app/api/hidden-cards/route.ts
      // has been inserting into them and calling add_user_rewards() since it was
      // written, so every card discovery failed at runtime. Three TypeScript errors
      // were reporting it and nobody could see them: this repo had no typecheck
      // workflow until 2026-08-31.
      //
      // This file is hand-maintained and declares 12 tables against a database with
      // 381. That is the same drift as HYDRATE_KEYS (39 of 181) and the backup table
      // list (36 of 378). It should be generated — platform-sdk/tools/generate-types.py
      // already does exactly this for the whole schema.
      discovery_events: {
        Row: {
          id: string
          user_id: string
          card_id: string
          location: string | null
          is_foil: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          location?: string | null
          is_foil?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          location?: string | null
          is_foil?: boolean
          created_at?: string
        }
        Relationships: []
      }
      hidden_cards: {
        Row: {
          id: string
          name: string
          series: string | null
          rarity: string
          is_secret: boolean
          xp_reward: number
          credit_reward: number
          total_supply: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          series?: string | null
          rarity?: string
          is_secret?: boolean
          xp_reward?: number
          credit_reward?: number
          total_supply?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          series?: string | null
          rarity?: string
          is_secret?: boolean
          xp_reward?: number
          credit_reward?: number
          total_supply?: number | null
          created_at?: string
        }
        Relationships: []
      }
      user_digital_cards: {
        Row: {
          id: string
          user_id: string
          card_id: string
          discovered_at: string
          discovery_location: string | null
          instance_number: number | null
          is_foil: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          discovered_at?: string
          discovery_location?: string | null
          instance_number?: number | null
          is_foil?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          discovered_at?: string
          discovery_location?: string | null
          instance_number?: number | null
          is_foil?: boolean
          created_at?: string
        }
        Relationships: []
      }
      bv_profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          favorite_spirit: string | null
          experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
          location: string | null
          birth_date: string | null
          age_verified: boolean
          age_verified_at: string | null
          proof_balance: number
          total_proof_earned: number
          games_played: number
          correct_answers: number
          bottles_collected: number
          reviews_written: number
          badges: Json
          preferences: Json
          is_premium: boolean
          premium_until: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          favorite_spirit?: string | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
          location?: string | null
          birth_date?: string | null
          age_verified?: boolean
          age_verified_at?: string | null
          proof_balance?: number
          total_proof_earned?: number
          games_played?: number
          correct_answers?: number
          bottles_collected?: number
          reviews_written?: number
          badges?: Json
          preferences?: Json
          is_premium?: boolean
          premium_until?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          favorite_spirit?: string | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
          location?: string | null
          birth_date?: string | null
          age_verified?: boolean
          age_verified_at?: string | null
          proof_balance?: number
          total_proof_earned?: number
          games_played?: number
          correct_answers?: number
          bottles_collected?: number
          reviews_written?: number
          badges?: Json
          preferences?: Json
          is_premium?: boolean
          premium_until?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bv_spirits: {
        Row: {
          id: string
          name: string
          brand: string | null
          category: SpiritCategory
          subcategory: string | null
          country: string | null
          region: string | null
          distillery: string | null
          proof: number | null
          abv: number | null
          age_statement: string | null
          mash_bill: string | null
          barrel_type: string | null
          finish: string | null
          tasting_notes: Json
          flavor_profile: Json
          awards: Json
          msrp: number | null
          current_market_price: number | null
          rarity: Rarity
          image_url: string | null
          thumbnail_url: string | null
          description: string | null
          producer_notes: string | null
          is_allocated: boolean
          is_discontinued: boolean
          release_year: number | null
          bottle_size: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          category: SpiritCategory
          subcategory?: string | null
          country?: string | null
          region?: string | null
          distillery?: string | null
          proof?: number | null
          abv?: number | null
          age_statement?: string | null
          mash_bill?: string | null
          barrel_type?: string | null
          finish?: string | null
          tasting_notes?: Json
          flavor_profile?: Json
          awards?: Json
          msrp?: number | null
          current_market_price?: number | null
          rarity?: Rarity
          image_url?: string | null
          thumbnail_url?: string | null
          description?: string | null
          producer_notes?: string | null
          is_allocated?: boolean
          is_discontinued?: boolean
          release_year?: number | null
          bottle_size?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          category?: SpiritCategory
          subcategory?: string | null
          country?: string | null
          region?: string | null
          distillery?: string | null
          proof?: number | null
          abv?: number | null
          age_statement?: string | null
          mash_bill?: string | null
          barrel_type?: string | null
          finish?: string | null
          tasting_notes?: Json
          flavor_profile?: Json
          awards?: Json
          msrp?: number | null
          current_market_price?: number | null
          rarity?: Rarity
          image_url?: string | null
          thumbnail_url?: string | null
          description?: string | null
          producer_notes?: string | null
          is_allocated?: boolean
          is_discontinued?: boolean
          release_year?: number | null
          bottle_size?: string
          created_at?: string
          updated_at?: string
        }
      }
      bv_user_collection: {
        Row: {
          id: string
          user_id: string
          spirit_id: string
          quantity: number
          purchase_price: number | null
          purchase_date: string | null
          purchase_location: string | null
          current_fill_level: number
          is_opened: boolean
          opened_date: string | null
          personal_rating: number | null
          personal_notes: string | null
          storage_location: string | null
          for_trade: boolean
          trade_value: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          spirit_id: string
          quantity?: number
          purchase_price?: number | null
          purchase_date?: string | null
          purchase_location?: string | null
          current_fill_level?: number
          is_opened?: boolean
          opened_date?: string | null
          personal_rating?: number | null
          personal_notes?: string | null
          storage_location?: string | null
          for_trade?: boolean
          trade_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          spirit_id?: string
          quantity?: number
          purchase_price?: number | null
          purchase_date?: string | null
          purchase_location?: string | null
          current_fill_level?: number
          is_opened?: boolean
          opened_date?: string | null
          personal_rating?: number | null
          personal_notes?: string | null
          storage_location?: string | null
          for_trade?: boolean
          trade_value?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      bv_trivia_questions: {
        Row: {
          id: string
          category: TriviaCategory
          difficulty: Difficulty
          question: string
          correct_answer: string
          wrong_answers: Json
          explanation: string | null
          image_url: string | null
          source: string | null
          proof_reward: number
          times_shown: number
          times_correct: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: TriviaCategory
          difficulty: Difficulty
          question: string
          correct_answer: string
          wrong_answers: Json
          explanation?: string | null
          image_url?: string | null
          source?: string | null
          proof_reward?: number
          times_shown?: number
          times_correct?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: TriviaCategory
          difficulty?: Difficulty
          question?: string
          correct_answer?: string
          wrong_answers?: Json
          explanation?: string | null
          image_url?: string | null
          source?: string | null
          proof_reward?: number
          times_shown?: number
          times_correct?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bv_trivia_progress: {
        Row: {
          id: string
          user_id: string
          question_id: string
          answered_correctly: boolean
          time_to_answer: number | null
          proof_earned: number
          answered_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          answered_correctly: boolean
          time_to_answer?: number | null
          proof_earned?: number
          answered_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          answered_correctly?: boolean
          time_to_answer?: number | null
          proof_earned?: number
          answered_at?: string
        }
      }
      bv_game_sessions: {
        Row: {
          id: string
          user_id: string | null
          game_type: GameType
          category: string | null
          difficulty: string | null
          total_questions: number
          correct_answers: number
          total_proof_earned: number
          time_taken: number | null
          completed: boolean
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          game_type: GameType
          category?: string | null
          difficulty?: string | null
          total_questions?: number
          correct_answers?: number
          total_proof_earned?: number
          time_taken?: number | null
          completed?: boolean
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          game_type?: GameType
          category?: string | null
          difficulty?: string | null
          total_questions?: number
          correct_answers?: number
          total_proof_earned?: number
          time_taken?: number | null
          completed?: boolean
          started_at?: string
          completed_at?: string | null
        }
      }
      bv_rewards: {
        Row: {
          id: string
          name: string
          description: string | null
          category: RewardCategory
          proof_cost: number
          image_url: string | null
          quantity_available: number | null
          is_limited: boolean
          expiry_date: string | null
          partner_name: string | null
          redemption_instructions: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: RewardCategory
          proof_cost: number
          image_url?: string | null
          quantity_available?: number | null
          is_limited?: boolean
          expiry_date?: string | null
          partner_name?: string | null
          redemption_instructions?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: RewardCategory
          proof_cost?: number
          image_url?: string | null
          quantity_available?: number | null
          is_limited?: boolean
          expiry_date?: string | null
          partner_name?: string | null
          redemption_instructions?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      bv_proof_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: TransactionType
          source: string
          reference_id: string | null
          description: string | null
          balance_after: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: TransactionType
          source: string
          reference_id?: string | null
          description?: string | null
          balance_after: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: TransactionType
          source?: string
          reference_id?: string | null
          description?: string | null
          balance_after?: number
          created_at?: string
        }
      }
      bv_courses: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          category: string
          difficulty: Difficulty
          certification_name: string | null
          estimated_minutes: number | null
          total_lessons: number | null
          proof_reward: number
          is_premium: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          category: string
          difficulty: Difficulty
          certification_name?: string | null
          estimated_minutes?: number | null
          total_lessons?: number | null
          proof_reward?: number
          is_premium?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          category?: string
          difficulty?: Difficulty
          certification_name?: string | null
          estimated_minutes?: number | null
          total_lessons?: number | null
          proof_reward?: number
          is_premium?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      bv_leaderboards: {
        Row: {
          id: string
          user_id: string
          period_type: PeriodType
          period_start: string
          category: string
          proof_earned: number
          games_played: number
          correct_answers: number
          accuracy_rate: number | null
          rank: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          period_type: PeriodType
          period_start: string
          category?: string
          proof_earned?: number
          games_played?: number
          correct_answers?: number
          accuracy_rate?: number | null
          rank?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          period_type?: PeriodType
          period_start?: string
          category?: string
          proof_earned?: number
          games_played?: number
          correct_answers?: number
          accuracy_rate?: number | null
          rank?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_proof: {
        Args: {
          p_user_id: string
          p_amount: number
          p_source: string
          p_description?: string
          p_reference_id?: string
        }
        Returns: number
      }
      get_random_trivia: {
        Args: {
          p_category?: string
          p_difficulty?: string
          p_limit?: number
          p_exclude_ids?: string[]
        }
        Returns: Database['public']['Tables']['bv_trivia_questions']['Row'][]
      }
    }
    Enums: {
      [_ in never]: never
    }
    // 2026-09-01: CompositeTypes was MISSING, and its absence is why every insert
    // in this repo failed to typecheck.
    //
    // supabase-js checks the schema type against its GenericSchema constraint, which
    // requires Tables, Views, Functions, Enums AND CompositeTypes. Miss one and the
    // whole schema fails the constraint, the client silently degrades, and every
    // table resolves to `never` — which is why the errors read 'values: never' and
    // 'user_id does not exist in type never[]' rather than naming a missing table.
    //
    // I read those as the three new tables being absent and regenerated them. They
    // were already correct. The real fault was one missing key affecting ALL twelve
    // tables, and it has been in this file since it was written.
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type SpiritCategory = 
  | 'bourbon' 
  | 'scotch' 
  | 'irish' 
  | 'japanese' 
  | 'wine' 
  | 'beer' 
  | 'tequila' 
  | 'rum' 
  | 'gin' 
  | 'vodka' 
  | 'cognac' 
  | 'sake' 
  | 'liqueurs'

export type TriviaCategory = 
  | 'bourbon' 
  | 'scotch' 
  | 'irish' 
  | 'japanese' 
  | 'wine' 
  | 'beer' 
  | 'tequila' 
  | 'rum' 
  | 'gin' 
  | 'vodka' 
  | 'cognac' 
  | 'sake' 
  | 'general' 
  | 'history' 
  | 'production' 
  | 'brands'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'ultra_rare' | 'legendary'

export type GameType = 'quick_pour' | 'masters_challenge' | 'daily_dram' | 'blind_tasting' | 'speed_round'

export type RewardCategory = 'merchandise' | 'experience' | 'digital' | 'discount' | 'exclusive'

export type TransactionType = 'earn' | 'spend' | 'bonus' | 'refund' | 'transfer_in' | 'transfer_out' | 'purchase'

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'all_time'

// Convenience types for components
export type Spirit = Database['public']['Tables']['bv_spirits']['Row']
export type Profile = Database['public']['Tables']['bv_profiles']['Row']
export type TriviaQuestion = Database['public']['Tables']['bv_trivia_questions']['Row']
export type UserCollection = Database['public']['Tables']['bv_user_collection']['Row']
export type GameSession = Database['public']['Tables']['bv_game_sessions']['Row']
export type Reward = Database['public']['Tables']['bv_rewards']['Row']
export type ProofTransaction = Database['public']['Tables']['bv_proof_transactions']['Row']
export type Course = Database['public']['Tables']['bv_courses']['Row']
export type Leaderboard = Database['public']['Tables']['bv_leaderboards']['Row']

// Collection item with spirit details
export type CollectionItemWithSpirit = UserCollection & {
  spirit: Spirit
}
