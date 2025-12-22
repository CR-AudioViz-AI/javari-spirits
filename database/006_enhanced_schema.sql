-- ============================================================================
-- CRAV Barrels - Enhanced Database Schema
-- Spirit Images, History, Rarity, Learning, and Gamification
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENHANCED SPIRIT IMAGES
-- Multi-source image system with proper rights tracking
-- ============================================================================

-- Drop existing if exists (be careful in production!)
-- DROP TABLE IF EXISTS spirit_images CASCADE;

CREATE TABLE IF NOT EXISTS spirit_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spirit_id UUID NOT NULL REFERENCES spirits(id) ON DELETE CASCADE,
  
  -- Image URLs
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Rights tracking (CRITICAL for legal compliance)
  source TEXT NOT NULL CHECK (source IN ('official', 'wikimedia', 'openverse', 'user', 'partner', 'generic')),
  license TEXT NOT NULL CHECK (license IN ('cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'proprietary', 'user-submitted')),
  attribution_required BOOLEAN DEFAULT FALSE,
  attribution_text TEXT,
  source_url TEXT,
  
  -- Image metadata
  width INTEGER,
  height INTEGER,
  format TEXT CHECK (format IN ('jpg', 'jpeg', 'png', 'webp', 'gif')),
  file_size_bytes INTEGER,
  
  -- Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Primary flag
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one primary image per spirit
CREATE UNIQUE INDEX IF NOT EXISTS idx_spirit_primary_image 
  ON spirit_images(spirit_id) 
  WHERE is_primary = TRUE;

-- Index for finding images by source
CREATE INDEX IF NOT EXISTS idx_spirit_images_source ON spirit_images(source);
CREATE INDEX IF NOT EXISTS idx_spirit_images_status ON spirit_images(status);

-- ============================================================================
-- SECTION 2: HISTORY & MUSEUM CONTENT
-- For "Today in Spirits History" and Museum Mode
-- ============================================================================

CREATE TABLE IF NOT EXISTS history_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Date (MM-DD format for recurring annual events)
  event_date TEXT NOT NULL,  -- Format: 'MM-DD'
  event_year INTEGER,        -- Specific year if known
  
  -- Content
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  full_story TEXT,           -- Markdown for long-form content
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN (
    'prohibition', 'distillery', 'brand', 'law', 'culture', 
    'invention', 'person', 'event', 'milestone'
  )),
  era TEXT CHECK (era IN (
    'ancient', 'medieval', 'colonial', 'pre-prohibition', 
    'prohibition', 'post-prohibition', 'modern'
  )),
  significance TEXT DEFAULT 'moderate' CHECK (significance IN ('minor', 'moderate', 'major', 'landmark')),
  
  -- Related entities
  spirits_mentioned UUID[],
  locations JSONB,           -- [{name, city, state, country, coordinates}]
  people JSONB,              -- [{name, role, dates, bio}]
  
  -- Media
  primary_image TEXT,
  gallery_images TEXT[],
  video_urls TEXT[],
  
  -- Sources & citations
  sources JSONB,             -- [{name, url, type}]
  loc_references TEXT[],     -- Library of Congress IDs
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_events_date ON history_events(event_date);
CREATE INDEX IF NOT EXISTS idx_history_events_category ON history_events(category);
CREATE INDEX IF NOT EXISTS idx_history_events_era ON history_events(era);

-- ============================================================================
-- SECTION 3: SPEAKEASIES & HIDDEN BARS
-- National speakeasy directory
-- ============================================================================

CREATE TABLE IF NOT EXISTS speakeasies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Location
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  postal_code TEXT,
  coordinates POINT,         -- PostGIS point or (lng, lat)
  
  -- The experience
  hidden_entrance TEXT,      -- How to find/enter
  password_required BOOLEAN DEFAULT FALSE,
  password_hint TEXT,
  dress_code TEXT,
  reservation_required BOOLEAN DEFAULT FALSE,
  reservation_url TEXT,
  
  -- Atmosphere & details
  vibe TEXT[],               -- ['intimate', 'jazz', 'prohibition-era', 'upscale']
  capacity TEXT CHECK (capacity IN ('intimate', 'small', 'medium', 'large')),
  noise_level TEXT CHECK (noise_level IN ('quiet', 'moderate', 'lively', 'loud')),
  best_for TEXT[],           -- ['date night', 'special occasion', 'craft cocktails']
  
  -- Menu
  signature_cocktails JSONB, -- [{name, description, price}]
  spirits_focus TEXT[],      -- ['whiskey', 'gin', 'rum']
  has_food BOOLEAN DEFAULT FALSE,
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  
  -- History
  historical_significance TEXT,
  original_speakeasy BOOLEAN DEFAULT FALSE,
  year_opened INTEGER,
  
  -- Media
  photos TEXT[],
  
  -- External integrations
  yelp_id TEXT,
  google_place_id TEXT,
  website_url TEXT,
  phone TEXT,
  
  -- Ratings
  average_rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  
  -- Status
  verified BOOLEAN DEFAULT FALSE,
  last_verified TIMESTAMPTZ,
  permanently_closed BOOLEAN DEFAULT FALSE,
  
  -- Who added it
  added_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speakeasies_city ON speakeasies(city, state);
CREATE INDEX IF NOT EXISTS idx_speakeasies_verified ON speakeasies(verified);
-- Note: For spatial queries, use PostGIS: CREATE INDEX idx_speakeasies_location ON speakeasies USING GIST(coordinates);

-- ============================================================================
-- SECTION 4: RARITY SCORING
-- Investment-grade bottle analysis
-- ============================================================================

CREATE TABLE IF NOT EXISTS spirit_rarity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spirit_id UUID NOT NULL REFERENCES spirits(id) ON DELETE CASCADE,
  
  -- Overall score
  rarity_score INTEGER NOT NULL CHECK (rarity_score >= 0 AND rarity_score <= 100),
  rarity_tier TEXT NOT NULL CHECK (rarity_tier IN (
    'common', 'uncommon', 'rare', 'very_rare', 'ultra_rare', 'grail'
  )),
  
  -- Individual factors (1-10 scale)
  factor_production INTEGER CHECK (factor_production >= 1 AND factor_production <= 10),
  factor_age INTEGER CHECK (factor_age >= 1 AND factor_age <= 10),
  factor_reputation INTEGER CHECK (factor_reputation >= 1 AND factor_reputation <= 10),
  factor_region INTEGER CHECK (factor_region >= 1 AND factor_region <= 10),
  factor_release_type INTEGER CHECK (factor_release_type >= 1 AND factor_release_type <= 10),
  factor_market_price INTEGER CHECK (factor_market_price >= 1 AND factor_market_price <= 10),
  factor_auction_frequency INTEGER CHECK (factor_auction_frequency >= 1 AND factor_auction_frequency <= 10),
  factor_historical INTEGER CHECK (factor_historical >= 1 AND factor_historical <= 10),
  factor_packaging INTEGER CHECK (factor_packaging >= 1 AND factor_packaging <= 10),
  factor_discontinued INTEGER CHECK (factor_discontinued >= 1 AND factor_discontinued <= 10),
  
  -- Market data
  estimated_value_low DECIMAL(10,2),
  estimated_value_high DECIMAL(10,2),
  last_auction_price DECIMAL(10,2),
  last_auction_date DATE,
  
  -- Rankings
  rank_in_category INTEGER,
  rank_overall INTEGER,
  
  -- AI analysis
  investment_potential TEXT CHECK (investment_potential IN ('low', 'medium', 'high', 'exceptional')),
  ai_analysis TEXT,
  
  -- Timestamps
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(spirit_id)
);

CREATE INDEX IF NOT EXISTS idx_spirit_rarity_score ON spirit_rarity(rarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_spirit_rarity_tier ON spirit_rarity(rarity_tier);

-- ============================================================================
-- SECTION 5: LEARNING & CERTIFICATIONS
-- Training paths, quizzes, progress tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_hours DECIMAL(4,1),
  
  -- Visuals
  thumbnail_url TEXT,
  hero_image_url TEXT,
  
  -- Prerequisites
  prerequisites UUID[],      -- Other path IDs
  
  -- Rewards
  certificate_name TEXT,
  badge_id UUID,
  xp_total INTEGER DEFAULT 0,
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Order within path
  sort_order INTEGER NOT NULL,
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  badge_id UUID,
  
  -- Time estimate
  estimated_minutes INTEGER DEFAULT 30,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'interactive', 'gallery', 'quiz')),
  
  -- Content
  content TEXT,              -- Markdown for articles
  video_url TEXT,
  interactive_component TEXT,
  
  -- Media
  images TEXT[],
  
  -- Order
  sort_order INTEGER NOT NULL,
  
  -- Time & rewards
  estimated_minutes INTEGER DEFAULT 10,
  xp_reward INTEGER DEFAULT 25,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Settings
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  randomize_questions BOOLEAN DEFAULT TRUE,
  randomize_answers BOOLEAN DEFAULT TRUE,
  show_correct_answers BOOLEAN DEFAULT TRUE,
  allow_retakes BOOLEAN DEFAULT TRUE,
  max_retakes INTEGER,
  
  -- Rewards
  xp_reward INTEGER DEFAULT 50,
  badge_on_perfect UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  
  question_type TEXT NOT NULL CHECK (question_type IN (
    'multiple_choice', 'true_false', 'image_identify', 'fill_blank', 'matching'
  )),
  
  question_text TEXT NOT NULL,
  question_image TEXT,
  
  -- Answers stored as JSONB
  -- Format: [{text, is_correct, explanation}]
  answers JSONB NOT NULL,
  
  -- For image identification
  image_options TEXT[],
  
  -- Metadata
  points INTEGER DEFAULT 1,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  sort_order INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 6: USER PROGRESS & GAMIFICATION
-- XP, badges, achievements, streaks
-- ============================================================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Visuals
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#FFD700',
  
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  
  -- Requirements
  requirement_type TEXT NOT NULL,  -- path_completion, quiz_perfect, collection, engagement, special
  requirement_value JSONB,         -- Specific requirements
  
  -- XP bonus for earning
  xp_value INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_displayed BOOLEAN DEFAULT FALSE,  -- Featured on profile
  
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- XP & Level
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  
  -- Current title based on level
  current_title TEXT DEFAULT 'Novice',
  
  -- Streaks
  daily_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Stats
  lessons_completed INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  bottles_collected INTEGER DEFAULT 0,
  photos_uploaded INTEGER DEFAULT 0,
  reviews_written INTEGER DEFAULT 0,
  speakeasies_visited INTEGER DEFAULT 0,
  
  -- Leaderboard
  global_rank INTEGER,
  regional_rank INTEGER,
  
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What they're progressing in
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES learning_lessons(id) ON DELETE CASCADE,
  
  -- Progress
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER DEFAULT 0,
  
  -- For quizzes
  quiz_score INTEGER,
  quiz_attempts INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);

-- ============================================================================
-- SECTION 7: INDEXES & PERFORMANCE
-- ============================================================================

-- Add foreign key to spirits table for primary image
-- Note: Run this only if the column doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'spirits' AND column_name = 'primary_image_id'
  ) THEN
    ALTER TABLE spirits ADD COLUMN primary_image_id UUID REFERENCES spirit_images(id);
    CREATE INDEX idx_spirits_primary_image ON spirits(primary_image_id);
  END IF;
END $$;

-- ============================================================================
-- SECTION 8: ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE spirit_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakeasies ENABLE ROW LEVEL SECURITY;
ALTER TABLE spirit_rarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Public read for content tables
CREATE POLICY "Public can read spirit images" ON spirit_images FOR SELECT USING (status = 'approved');
CREATE POLICY "Public can read history events" ON history_events FOR SELECT USING (true);
CREATE POLICY "Public can read speakeasies" ON speakeasies FOR SELECT USING (NOT permanently_closed);
CREATE POLICY "Public can read rarity" ON spirit_rarity FOR SELECT USING (true);
CREATE POLICY "Public can read learning paths" ON learning_paths FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read badges" ON badges FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ CRAV Barrels Enhanced Schema Created!';
  RAISE NOTICE '📸 Spirit Images with rights tracking';
  RAISE NOTICE '🏛️ History & Museum content';
  RAISE NOTICE '🍸 Speakeasy directory';
  RAISE NOTICE '💎 Rarity scoring system';
  RAISE NOTICE '📚 Learning paths & certifications';
  RAISE NOTICE '🏆 Badges & gamification';
  RAISE NOTICE '📊 User progress tracking';
END $$;
