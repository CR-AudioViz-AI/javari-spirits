// lib/types/database.ts
// BarrelVerse Database Type Definitions

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// 2026-09-01: `type`, not `interface`.
//
// An INTERFACE has no implicit index signature, so it cannot satisfy supabase-js's
// GenericSchema constraint — which is a mapped type. The client silently degrades
// and EVERY table resolves to `never`, which is why the errors read 'values: never'
// and 'user_id does not exist in type never[]' rather than naming anything.
//
// A `type` alias gets that index signature implicitly. This is the only difference,
// and it is the fourth thing I tried on this file: the tables were real, the
// generated types were correct, and CompositeTypes was genuinely missing — none of
// which was the cause.
export type Database = {
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
        // 2026-09-01: the foreign key is DECLARED here, not just in the database.
        //
        // The route selects `card:hidden_cards(*)` — an embedded join — and
        // supabase-js types that join from this array. An empty Relationships meant
        // the join produced no type, so `c.card` did not exist on the row and both
        // reduce callbacks failed. The FK exists in Postgres; the type had to be
        // told about it too.
        Relationships: [
          {
            foreignKeyName: "discovery_events_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "hidden_cards"
            referencedColumns: ["id"]
          }
        ]
      }
      hidden_cards: {
        Row: {
          id?: string
          name: string
          series?: string | null
          rarity: string
          is_secret: boolean
          xp_reward: number
          credit_reward: number
          created_at?: string
          description?: string | null
          image_url?: string | null
          max_supply?: number | null
          unlock_code?: string | null
          location_hint?: string | null
        }
        Insert: {
          id?: string
          name: string
          series?: string | null
          rarity: string
          is_secret: boolean
          xp_reward: number
          credit_reward: number
          created_at?: string
          description?: string | null
          image_url?: string | null
          max_supply?: number | null
          unlock_code?: string | null
          location_hint?: string | null
        }
        Update: {
          id?: string
          name?: string
          series?: string | null
          rarity?: string
          is_secret?: boolean
          xp_reward?: number
          credit_reward?: number
          created_at?: string
          description?: string | null
          image_url?: string | null
          max_supply?: number | null
          unlock_code?: string | null
          location_hint?: string | null
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
        // 2026-09-01: the foreign key is DECLARED here, not just in the database.
        //
        // The route selects `card:hidden_cards(*)` — an embedded join — and
        // supabase-js types that join from this array. An empty Relationships meant
        // the join produced no type, so `c.card` did not exist on the row and both
        // reduce callbacks failed. The FK exists in Postgres; the type had to be
        // told about it too.
        Relationships: [
          {
            foreignKeyName: "user_digital_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "hidden_cards"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      // 2026-09-01: the RPC signature. My first attempt to add this was skipped by a
      // guard that tested `'add_user_rewards' not in s` — the name already appeared
      // in a COMMENT higher up the file, so the guard saw it and did nothing.
      // Checking for a substring when you mean a declaration is how an edit reports
      // success and changes nothing.
      add_user_rewards: {
        Args: {
          p_user_id: string
          p_xp: number
          p_credits: number
        }
        Returns: undefined
      }
      award_proof: {
        Args: {
          p_user_id: string
          p_amount: number
          p_source: string
          p_description?: string
          p_reference_id?: string
        }
        Returns: number
        Relationships: []
      }
      get_random_trivia: {
        Args: {
          p_category?: string
          p_difficulty?: string
          p_limit?: number
          p_exclude_ids?: string[]
        }
        Returns: Database['public']['Tables']['bv_trivia_questions']['Row'][]
        Relationships: []
      }
    }
    Enums: {
      [_ in never]: never
    }
    // 2026-09-01: CompositeTypes was genuinely missing and is required — but it was
    // NOT the cause of the insert failures. See the Relationships note above.
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
export type UserCollection = Database['public']['Tables']['bv_user_collections']['Row']
export type GameSession = Database['public']['Tables']['bv_game_sessions']['Row']
export type Reward = Database['public']['Tables']['bv_rewards']['Row']
export type ProofTransaction = Database['public']['Tables']['bv_proof_transactions']['Row']
export type Course = Database['public']['Tables']['bv_courses']['Row']
export type Leaderboard = Database['public']['Tables']['bv_leaderboards']['Row']

// Collection item with spirit details
export type CollectionItemWithSpirit = UserCollection & {
  spirit: Spirit
}
