-- Javari Spirits Database Migration
-- Auto-generated: December 14, 2025
-- Run this in Supabase SQL Editor

-- =====================================================
-- BARS & RETAILERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_bars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'bar', -- bar, pub, store, restaurant
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  phone TEXT,
  website TEXT,
  opening_hours TEXT,
  rating DECIMAL(2,1),
  review_count INT DEFAULT 0,
  specialties TEXT[], -- Array of spirit types they specialize in
  verified BOOLEAN DEFAULT false,
  submitted_by UUID,
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bars_location ON bv_bars(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_bars_city ON bv_bars(city);
CREATE INDEX IF NOT EXISTS idx_bars_type ON bv_bars(type);

-- =====================================================
-- PRICE REPORTS TABLE (Community-sourced pricing)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_price_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  store TEXT,
  location TEXT,
  city TEXT,
  state TEXT,
  user_id UUID,
  proof_url TEXT, -- Photo proof
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_price_reports_spirit ON bv_price_reports(spirit_id);
CREATE INDEX IF NOT EXISTS idx_price_reports_date ON bv_price_reports(reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_reports_location ON bv_price_reports(city, state);

-- =====================================================
-- PRICE ALERTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
  target_price DECIMAL(10,2) NOT NULL,
  alert_type TEXT DEFAULT 'below', -- below, above, any
  triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON bv_price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON bv_price_alerts(spirit_id) WHERE triggered = false;

-- =====================================================
-- SYNC LOGS TABLE (API sync tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,
  source TEXT, -- cocktaildb, openbrewerydb, etc
  records_synced INT DEFAULT 0,
  records_failed INT DEFAULT 0,
  results JSONB,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_type ON bv_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_date ON bv_sync_logs(started_at DESC);

-- =====================================================
-- GAMES & LEADERBOARD TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- trivia, blind_tasting, collection_challenge
  description TEXT,
  rules JSONB,
  rewards JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bv_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  game_id UUID REFERENCES bv_games(id),
  score INT NOT NULL,
  rank INT,
  period TEXT DEFAULT 'all_time', -- daily, weekly, monthly, all_time
  metadata JSONB,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_game ON bv_leaderboard(game_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON bv_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON bv_leaderboard(period, score DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment proof points
CREATE OR REPLACE FUNCTION increment_proof_points(p_user_id UUID, p_amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE bv_profiles 
  SET proof_points = COALESCE(proof_points, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboard rankings
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bv_leaderboard l
  SET rank = r.rank
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY game_id, period ORDER BY score DESC) as rank
    FROM bv_leaderboard
  ) r
  WHERE l.id = r.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE bv_bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_price_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_leaderboard ENABLE ROW LEVEL SECURITY;

-- Public read access for bars
CREATE POLICY "Public read access for bars" ON bv_bars
  FOR SELECT USING (true);

-- Authenticated users can submit bars
CREATE POLICY "Authenticated users can submit bars" ON bv_bars
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Public read access for price reports
CREATE POLICY "Public read access for price reports" ON bv_price_reports
  FOR SELECT USING (true);

-- Authenticated users can submit price reports
CREATE POLICY "Authenticated users can submit price reports" ON bv_price_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can manage their own price alerts
CREATE POLICY "Users can manage own price alerts" ON bv_price_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for games
CREATE POLICY "Public read access for games" ON bv_games
  FOR SELECT USING (true);

-- Public read access for leaderboard
CREATE POLICY "Public read access for leaderboard" ON bv_leaderboard
  FOR SELECT USING (true);

-- =====================================================
-- SEED DATA: SAMPLE GAMES
-- =====================================================
INSERT INTO bv_games (name, type, description, rules, rewards) VALUES
('Spirit Trivia Challenge', 'trivia', 'Test your knowledge of spirits, distilleries, and cocktails', 
 '{"questions_per_round": 10, "time_per_question": 30, "difficulty_levels": ["easy", "medium", "hard"]}',
 '{"first_place": 100, "second_place": 50, "third_place": 25, "participation": 5}'),
('Blind Tasting Master', 'blind_tasting', 'Identify spirits based on tasting notes',
 '{"rounds": 5, "spirits_per_round": 3, "hint_penalty": 10}',
 '{"perfect_score": 200, "per_correct": 20}'),
('Collection Quest', 'collection_challenge', 'Complete themed collections to earn badges',
 '{"themes": ["bourbon_journey", "scotch_explorer", "world_whiskey"]}',
 '{"completion_bonus": 500, "per_bottle": 10}')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON bv_bars TO authenticated;
GRANT ALL ON bv_price_reports TO authenticated;
GRANT ALL ON bv_price_alerts TO authenticated;
GRANT ALL ON bv_games TO authenticated;
GRANT ALL ON bv_leaderboard TO authenticated;
GRANT SELECT ON bv_bars TO anon;
GRANT SELECT ON bv_price_reports TO anon;
GRANT SELECT ON bv_games TO anon;
GRANT SELECT ON bv_leaderboard TO anon;
