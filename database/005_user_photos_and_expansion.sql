-- ============================================================
-- BARRELVERSE - USER PHOTOS & DATABASE EXPANSION SCHEMA
-- Created: December 21, 2025
-- Purpose: User-submitted photos with legal disclaimers,
--          comprehensive alcohol database expansion
-- ============================================================

-- ============================================================
-- 1. USER PHOTO SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bv_user_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Photo details
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    original_filename TEXT,
    file_size INTEGER,
    mime_type TEXT,
    
    -- Photo metadata
    width INTEGER,
    height INTEGER,
    
    -- Quality metrics (AI evaluated)
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    clarity_score INTEGER DEFAULT 0,
    lighting_score INTEGER DEFAULT 0,
    composition_score INTEGER DEFAULT 0,
    label_visibility_score INTEGER DEFAULT 0,
    
    -- Source & Attribution
    source TEXT DEFAULT 'user_upload',  -- user_upload, api_scraped, brand_official, community
    attribution TEXT,
    photographer_credit TEXT,
    
    -- Legal
    license_type TEXT DEFAULT 'user_submitted', -- user_submitted, cc_by, cc0, editorial, brand_official
    rights_granted BOOLEAN DEFAULT true,
    terms_accepted_at TIMESTAMPTZ,
    ip_address INET,
    
    -- Moderation
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderation_notes TEXT,
    moderated_by UUID,
    moderated_at TIMESTAMPTZ,
    
    -- AI Analysis
    ai_analysis JSONB DEFAULT '{}',
    is_product_match BOOLEAN DEFAULT false,
    brand_match_confidence DECIMAL(3,2) DEFAULT 0,
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    reports INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Flags
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_nsfw BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_photos_spirit ON bv_user_photos(spirit_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_user ON bv_user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_status ON bv_user_photos(status);
CREATE INDEX IF NOT EXISTS idx_user_photos_quality ON bv_user_photos(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_photos_primary ON bv_user_photos(spirit_id, is_primary) WHERE is_primary = true;

-- ============================================================
-- 2. USER COLLECTION IMAGE PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS bv_collection_image_prefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    collection_id UUID REFERENCES bv_user_collections(id) ON DELETE CASCADE,
    spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Image preference
    preferred_image_url TEXT NOT NULL,
    preferred_image_source TEXT, -- default, user_upload, community
    user_photo_id UUID REFERENCES bv_user_photos(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one preference per spirit per collection
    UNIQUE(collection_id, spirit_id)
);

-- ============================================================
-- 3. PHOTO TERMS ACCEPTANCE LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS bv_photo_terms_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Terms version tracking
    terms_version TEXT NOT NULL DEFAULT '1.0',
    terms_type TEXT NOT NULL DEFAULT 'photo_upload', -- photo_upload, community_share, commercial_use
    
    -- Legal details
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Full terms text at time of acceptance
    terms_text TEXT,
    
    -- Revocation
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT
);

-- ============================================================
-- 4. PHOTO VOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bv_photo_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID REFERENCES bv_user_photos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One vote per user per photo
    UNIQUE(photo_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_photo_votes_photo ON bv_photo_votes(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_votes_user ON bv_photo_votes(user_id);

-- RLS for photo votes
ALTER TABLE bv_photo_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all votes" ON bv_photo_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON bv_photo_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change own votes" ON bv_photo_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove own votes" ON bv_photo_votes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 5. IMAGE PROCESSING QUEUE
-- ============================================================
CREATE TABLE IF NOT EXISTS bv_image_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source
    spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    source_type TEXT NOT NULL, -- scrape, user_upload, api
    
    -- Processing status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    
    -- Processing details
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Output
    processed_url TEXT,
    transformations_applied JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_image_queue_status ON bv_image_queue(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_image_queue_spirit ON bv_image_queue(spirit_id);

-- ============================================================
-- 5. EXPANDED SPIRIT FIELDS
-- ============================================================
-- Add columns to bv_spirits if they don't exist
DO $$ 
BEGIN
    -- User photo tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'user_photo_count') THEN
        ALTER TABLE bv_spirits ADD COLUMN user_photo_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'primary_user_photo_id') THEN
        ALTER TABLE bv_spirits ADD COLUMN primary_user_photo_id UUID;
    END IF;
    
    -- Image source tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'image_source') THEN
        ALTER TABLE bv_spirits ADD COLUMN image_source TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'image_confidence') THEN
        ALTER TABLE bv_spirits ADD COLUMN image_confidence DECIMAL(3,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'image_updated_at') THEN
        ALTER TABLE bv_spirits ADD COLUMN image_updated_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'image_license') THEN
        ALTER TABLE bv_spirits ADD COLUMN image_license TEXT;
    END IF;
    
    -- UPC/Barcode
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'upc') THEN
        ALTER TABLE bv_spirits ADD COLUMN upc TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'ean') THEN
        ALTER TABLE bv_spirits ADD COLUMN ean TEXT;
    END IF;
    
    -- External IDs for deduplication
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'open_food_facts_id') THEN
        ALTER TABLE bv_spirits ADD COLUMN open_food_facts_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'external_ids') THEN
        ALTER TABLE bv_spirits ADD COLUMN external_ids JSONB DEFAULT '{}';
    END IF;
    
    -- Additional product details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'ingredients') THEN
        ALTER TABLE bv_spirits ADD COLUMN ingredients TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'allergens') THEN
        ALTER TABLE bv_spirits ADD COLUMN allergens TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'nutrition_facts') THEN
        ALTER TABLE bv_spirits ADD COLUMN nutrition_facts JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'serving_size') THEN
        ALTER TABLE bv_spirits ADD COLUMN serving_size TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bv_spirits' AND column_name = 'calories_per_serving') THEN
        ALTER TABLE bv_spirits ADD COLUMN calories_per_serving INTEGER;
    END IF;
END $$;

-- ============================================================
-- 6. DATA EXPANSION TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS bv_data_expansion_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source tracking
    source TEXT NOT NULL, -- open_food_facts, untappd, distiller, etc.
    batch_id TEXT,
    
    -- Statistics
    products_fetched INTEGER DEFAULT 0,
    products_inserted INTEGER DEFAULT 0,
    products_updated INTEGER DEFAULT 0,
    products_skipped INTEGER DEFAULT 0,
    images_found INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
    error_message TEXT,
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Details
    metadata JSONB DEFAULT '{}'
);

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE bv_user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_collection_image_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_photo_terms_log ENABLE ROW LEVEL SECURITY;

-- User photos: Anyone can view approved photos
CREATE POLICY "Anyone can view approved photos" ON bv_user_photos
    FOR SELECT USING (status = 'approved');

-- User photos: Users can view their own photos regardless of status
CREATE POLICY "Users can view own photos" ON bv_user_photos
    FOR SELECT USING (auth.uid() = user_id);

-- User photos: Authenticated users can insert
CREATE POLICY "Authenticated users can upload photos" ON bv_user_photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User photos: Users can update their own pending photos
CREATE POLICY "Users can update own pending photos" ON bv_user_photos
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Collection preferences: Users can manage their own
CREATE POLICY "Users manage own image preferences" ON bv_collection_image_prefs
    FOR ALL USING (auth.uid() = user_id);

-- Terms log: Users can view and insert their own
CREATE POLICY "Users manage own terms acceptance" ON bv_photo_terms_log
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 8. TRIGGERS
-- ============================================================

-- Update spirit photo count when user photo status changes
CREATE OR REPLACE FUNCTION update_spirit_photo_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE bv_spirits 
        SET user_photo_count = COALESCE(user_photo_count, 0) + 1,
            updated_at = NOW()
        WHERE id = NEW.spirit_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
            UPDATE bv_spirits 
            SET user_photo_count = COALESCE(user_photo_count, 0) + 1,
                updated_at = NOW()
            WHERE id = NEW.spirit_id;
        ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            UPDATE bv_spirits 
            SET user_photo_count = GREATEST(0, COALESCE(user_photo_count, 0) - 1),
                updated_at = NOW()
            WHERE id = NEW.spirit_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE bv_spirits 
        SET user_photo_count = GREATEST(0, COALESCE(user_photo_count, 0) - 1),
            updated_at = NOW()
        WHERE id = OLD.spirit_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_spirit_photo_count ON bv_user_photos;
CREATE TRIGGER trigger_update_spirit_photo_count
    AFTER INSERT OR UPDATE OR DELETE ON bv_user_photos
    FOR EACH ROW EXECUTE FUNCTION update_spirit_photo_count();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_photos_updated_at ON bv_user_photos;
CREATE TRIGGER trigger_user_photos_updated_at
    BEFORE UPDATE ON bv_user_photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_collection_prefs_updated_at ON bv_collection_image_prefs;
CREATE TRIGGER trigger_collection_prefs_updated_at
    BEFORE UPDATE ON bv_collection_image_prefs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 9. HELPFUL VIEWS
-- ============================================================

-- Spirit images with all sources
CREATE OR REPLACE VIEW bv_spirit_images AS
SELECT 
    s.id AS spirit_id,
    s.name,
    s.brand,
    s.image_url AS default_image,
    s.image_source AS default_source,
    s.user_photo_count,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', up.id,
            'url', up.image_url,
            'thumbnail', up.thumbnail_url,
            'quality_score', up.quality_score,
            'source', up.source,
            'upvotes', up.upvotes,
            'is_primary', up.is_primary,
            'is_verified', up.is_verified
        ) ORDER BY up.is_primary DESC, up.quality_score DESC, up.upvotes DESC)
        FROM bv_user_photos up 
        WHERE up.spirit_id = s.id AND up.status = 'approved'),
        '[]'::json
    ) AS user_photos
FROM bv_spirits s;

-- Spirits needing images (priority queue)
CREATE OR REPLACE VIEW bv_spirits_needing_images AS
SELECT 
    id,
    name,
    brand,
    category,
    image_url,
    image_source,
    CASE 
        WHEN image_url IS NULL THEN 1
        WHEN image_url LIKE '%unsplash%' THEN 2
        WHEN image_url LIKE '%placeholder%' THEN 2
        WHEN image_source = 'Category Fallback' THEN 3
        ELSE 4
    END AS priority
FROM bv_spirits
WHERE image_url IS NULL 
   OR image_url LIKE '%unsplash%'
   OR image_url LIKE '%placeholder%'
   OR image_source = 'Category Fallback'
ORDER BY priority ASC, name ASC;

-- ============================================================
-- 10. GRANTS
-- ============================================================
GRANT SELECT ON bv_spirit_images TO authenticated;
GRANT SELECT ON bv_spirit_images TO anon;
GRANT SELECT ON bv_spirits_needing_images TO authenticated;

COMMENT ON TABLE bv_user_photos IS 'User-submitted photos for spirits with legal rights tracking';
COMMENT ON TABLE bv_collection_image_prefs IS 'User preferences for which images to show in their collections';
COMMENT ON TABLE bv_photo_terms_log IS 'Legal audit trail for photo terms acceptance';
COMMENT ON TABLE bv_image_queue IS 'Queue for processing and transforming images';
COMMENT ON TABLE bv_data_expansion_log IS 'Tracking for database expansion operations';
