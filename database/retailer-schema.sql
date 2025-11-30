-- =====================================================
-- BARRELVERSE RETAILER/VENUE SYSTEM
-- Bars, Restaurants, Liquor Stores can list inventory
-- Users can find spirits near them
-- =====================================================

-- Business Types
CREATE TYPE business_type AS ENUM (
  'liquor_store', 'bar', 'restaurant', 'hotel_bar', 'distillery', 
  'wine_shop', 'grocery', 'club', 'other'
);

-- Subscription Tiers
CREATE TYPE subscription_tier AS ENUM (
  'free', 'basic', 'pro', 'enterprise'
);

-- =====================================================
-- BUSINESSES TABLE (Retailers/Venues)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Owner relationship
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Business Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  business_type business_type NOT NULL,
  description TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Location
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Hours (JSON: {"mon": {"open": "09:00", "close": "21:00"}, ...})
  hours JSONB DEFAULT '{}'::jsonb,
  
  -- Media
  logo_url TEXT,
  cover_image_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  
  -- Features
  has_tastings BOOLEAN DEFAULT false,
  has_delivery BOOLEAN DEFAULT false,
  has_curbside BOOLEAN DEFAULT false,
  has_bar_seating BOOLEAN DEFAULT false,
  accepts_reservations BOOLEAN DEFAULT false,
  
  -- Subscription
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Stats
  total_spirits INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_favorites INTEGER DEFAULT 0,
  avg_rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- BUSINESS INVENTORY TABLE
-- What spirits each business carries
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_business_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES bv_businesses(id) ON DELETE CASCADE,
  spirit_id UUID NOT NULL REFERENCES bv_spirits(id) ON DELETE CASCADE,
  
  -- Pricing & Availability
  price DECIMAL(10, 2),
  pour_price DECIMAL(10, 2),  -- For bars: price per pour
  is_in_stock BOOLEAN DEFAULT true,
  quantity_available INTEGER,  -- Optional: actual count
  
  -- Special flags
  is_on_sale BOOLEAN DEFAULT false,
  sale_price DECIMAL(10, 2),
  sale_ends_at TIMESTAMPTZ,
  is_allocated BOOLEAN DEFAULT false,  -- Rare/limited
  is_featured BOOLEAN DEFAULT false,   -- Highlight on profile
  
  -- Notes
  notes TEXT,  -- "Ask for it at the counter", "Limit 1 per customer"
  
  -- Timestamps
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(business_id, spirit_id)
);

-- =====================================================
-- BUSINESS REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_business_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES bv_businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  
  -- Specific ratings
  selection_rating INTEGER CHECK (selection_rating >= 1 AND selection_rating <= 5),
  price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  
  -- Status
  is_verified_visit BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(business_id, user_id)
);

-- =====================================================
-- USER FAVORITE BUSINESSES
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_user_favorite_businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES bv_businesses(id) ON DELETE CASCADE,
  
  -- Notifications
  notify_new_arrivals BOOLEAN DEFAULT false,
  notify_rare_bottles BOOLEAN DEFAULT false,
  notify_sales BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, business_id)
);

-- =====================================================
-- SPIRIT ALERTS (User wants to find a specific bottle)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_spirit_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
  spirit_id UUID NOT NULL REFERENCES bv_spirits(id) ON DELETE CASCADE,
  
  -- Alert preferences
  max_price DECIMAL(10, 2),
  max_distance_miles INTEGER DEFAULT 50,
  
  -- Location (user's search center)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city TEXT,
  state TEXT,
  
  -- Notification
  notify_email BOOLEAN DEFAULT true,
  notify_push BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  last_notified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, spirit_id)
);

-- =====================================================
-- BUSINESS CLAIMS (Verify ownership)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_business_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES bv_businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Verification
  verification_method TEXT,  -- 'phone', 'email', 'document'
  verification_code TEXT,
  verification_document_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_businesses_location ON bv_businesses(latitude, longitude);
CREATE INDEX idx_businesses_city_state ON bv_businesses(city, state);
CREATE INDEX idx_businesses_type ON bv_businesses(business_type);
CREATE INDEX idx_businesses_active ON bv_businesses(is_active);
CREATE INDEX idx_businesses_slug ON bv_businesses(slug);

CREATE INDEX idx_inventory_business ON bv_business_inventory(business_id);
CREATE INDEX idx_inventory_spirit ON bv_business_inventory(spirit_id);
CREATE INDEX idx_inventory_in_stock ON bv_business_inventory(is_in_stock);
CREATE INDEX idx_inventory_price ON bv_business_inventory(price);

CREATE INDEX idx_alerts_spirit ON bv_spirit_alerts(spirit_id);
CREATE INDEX idx_alerts_user ON bv_spirit_alerts(user_id);
CREATE INDEX idx_alerts_active ON bv_spirit_alerts(is_active);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE bv_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_business_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_favorite_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_spirit_alerts ENABLE ROW LEVEL SECURITY;

-- Businesses: Public read, owner write
CREATE POLICY "Businesses are viewable by everyone" ON bv_businesses
  FOR SELECT USING (is_active = true);
CREATE POLICY "Business owners can update" ON bv_businesses
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can create businesses" ON bv_businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Inventory: Public read for active businesses
CREATE POLICY "Inventory viewable for active businesses" ON bv_business_inventory
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bv_businesses WHERE id = business_id AND is_active = true)
  );
CREATE POLICY "Business owners can manage inventory" ON bv_business_inventory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM bv_businesses WHERE id = business_id AND owner_id = auth.uid())
  );

-- Reviews: Public read, authenticated write
CREATE POLICY "Reviews are viewable by everyone" ON bv_business_reviews
  FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON bv_business_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON bv_business_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Favorites: Own data only
CREATE POLICY "Users can view own favorites" ON bv_user_favorite_businesses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON bv_user_favorite_businesses
  FOR ALL USING (auth.uid() = user_id);

-- Alerts: Own data only
CREATE POLICY "Users can view own alerts" ON bv_spirit_alerts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own alerts" ON bv_spirit_alerts
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update business stats when inventory changes
CREATE OR REPLACE FUNCTION update_business_spirit_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE bv_businesses 
    SET total_spirits = (SELECT COUNT(*) FROM bv_business_inventory WHERE business_id = OLD.business_id)
    WHERE id = OLD.business_id;
    RETURN OLD;
  ELSE
    UPDATE bv_businesses 
    SET total_spirits = (SELECT COUNT(*) FROM bv_business_inventory WHERE business_id = NEW.business_id)
    WHERE id = NEW.business_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_spirits
AFTER INSERT OR DELETE ON bv_business_inventory
FOR EACH ROW EXECUTE FUNCTION update_business_spirit_count();

-- Update business rating when review added
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bv_businesses 
  SET 
    avg_rating = (SELECT AVG(rating) FROM bv_business_reviews WHERE business_id = NEW.business_id),
    review_count = (SELECT COUNT(*) FROM bv_business_reviews WHERE business_id = NEW.business_id)
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON bv_business_reviews
FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- Function to find spirits near a location
CREATE OR REPLACE FUNCTION find_spirits_nearby(
  p_spirit_id UUID,
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_radius_miles INTEGER DEFAULT 25
)
RETURNS TABLE (
  business_id UUID,
  business_name TEXT,
  business_type business_type,
  address TEXT,
  city TEXT,
  state TEXT,
  distance_miles DECIMAL,
  price DECIMAL,
  is_in_stock BOOLEAN,
  is_on_sale BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.business_type,
    b.address_line1,
    b.city,
    b.state,
    (3959 * acos(
      cos(radians(p_lat)) * cos(radians(b.latitude)) * 
      cos(radians(b.longitude) - radians(p_lng)) + 
      sin(radians(p_lat)) * sin(radians(b.latitude))
    ))::DECIMAL AS distance_miles,
    bi.price,
    bi.is_in_stock,
    bi.is_on_sale
  FROM bv_businesses b
  JOIN bv_business_inventory bi ON b.id = bi.business_id
  WHERE bi.spirit_id = p_spirit_id
    AND b.is_active = true
    AND b.latitude IS NOT NULL
    AND b.longitude IS NOT NULL
    AND (3959 * acos(
      cos(radians(p_lat)) * cos(radians(b.latitude)) * 
      cos(radians(b.longitude) - radians(p_lng)) + 
      sin(radians(p_lat)) * sin(radians(b.latitude))
    )) <= p_radius_miles
  ORDER BY distance_miles;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON bv_businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON bv_business_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_reviews_updated_at BEFORE UPDATE ON bv_business_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
