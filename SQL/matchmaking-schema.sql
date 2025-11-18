-- ============================================
-- MATCHMAKING SCHEMA FOR DATING & MATRIMONY
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. DATING LIKES TABLE
-- Stores all likes/passes for dating profiles
-- ============================================
CREATE TABLE IF NOT EXISTS dating_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_dating_like UNIQUE (liker_id, liked_id),
  CONSTRAINT no_self_like_dating CHECK (liker_id != liked_id)
);

-- Indexes for dating likes
CREATE INDEX idx_dating_likes_liker ON dating_likes(liker_id);
CREATE INDEX idx_dating_likes_liked ON dating_likes(liked_id);
CREATE INDEX idx_dating_likes_action ON dating_likes(action);
CREATE INDEX idx_dating_likes_match ON dating_likes(liker_id, liked_id, action);

-- ============================================
-- 2. MATRIMONY LIKES TABLE
-- Stores all likes/passes for matrimony profiles
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'pass', 'connect')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_matrimony_like UNIQUE (liker_id, liked_id),
  CONSTRAINT no_self_like_matrimony CHECK (liker_id != liked_id)
);

-- Indexes for matrimony likes
CREATE INDEX idx_matrimony_likes_liker ON matrimony_likes(liker_id);
CREATE INDEX idx_matrimony_likes_liked ON matrimony_likes(liked_id);
CREATE INDEX idx_matrimony_likes_action ON matrimony_likes(action);
CREATE INDEX idx_matrimony_likes_match ON matrimony_likes(liker_id, liked_id, action);

-- ============================================
-- 3. DATING MATCHES TABLE
-- Stores mutual matches for dating
-- ============================================
CREATE TABLE IF NOT EXISTS dating_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Constraints
  CONSTRAINT unique_dating_match UNIQUE (user1_id, user2_id),
  CONSTRAINT no_self_match_dating CHECK (user1_id != user2_id),
  CONSTRAINT ordered_match_dating CHECK (user1_id < user2_id)
);

-- Indexes for dating matches
CREATE INDEX idx_dating_matches_user1 ON dating_matches(user1_id);
CREATE INDEX idx_dating_matches_user2 ON dating_matches(user2_id);
CREATE INDEX idx_dating_matches_active ON dating_matches(is_active);

-- ============================================
-- 4. MATRIMONY MATCHES TABLE
-- Stores mutual matches for matrimony
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Constraints
  CONSTRAINT unique_matrimony_match UNIQUE (user1_id, user2_id),
  CONSTRAINT no_self_match_matrimony CHECK (user1_id != user2_id),
  CONSTRAINT ordered_match_matrimony CHECK (user1_id < user2_id)
);

-- Indexes for matrimony matches
CREATE INDEX idx_matrimony_matches_user1 ON matrimony_matches(user1_id);
CREATE INDEX idx_matrimony_matches_user2 ON matrimony_matches(user2_id);
CREATE INDEX idx_matrimony_matches_active ON matrimony_matches(is_active);

-- ============================================
-- 5. FUNCTIONS FOR MATCH DETECTION
-- ============================================

-- Function to create dating match when mutual like occurs
CREATE OR REPLACE FUNCTION create_dating_match()
RETURNS TRIGGER AS $$
DECLARE
  mutual_like_exists BOOLEAN;
  match_id UUID;
BEGIN
  -- Only process if action is 'like' or 'super_like'
  IF NEW.action IN ('like', 'super_like') THEN
    -- Check if the liked user has also liked the liker
    SELECT EXISTS(
      SELECT 1 FROM dating_likes
      WHERE liker_id = NEW.liked_id
        AND liked_id = NEW.liker_id
        AND action IN ('like', 'super_like')
    ) INTO mutual_like_exists;

    -- If mutual like exists, create a match
    IF mutual_like_exists THEN
      -- Check if match already exists
      SELECT id INTO match_id FROM dating_matches
      WHERE (user1_id = NEW.liker_id AND user2_id = NEW.liked_id)
         OR (user1_id = NEW.liked_id AND user2_id = NEW.liker_id);
      
      -- Only create if doesn't exist
      IF match_id IS NULL THEN
        BEGIN
          INSERT INTO dating_matches (user1_id, user2_id)
          VALUES (
            LEAST(NEW.liker_id, NEW.liked_id),
            GREATEST(NEW.liker_id, NEW.liked_id)
          )
          ON CONFLICT (user1_id, user2_id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
          -- Ignore errors (e.g., if match was created by another trigger)
          NULL;
        END;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for dating matches (on INSERT)
DROP TRIGGER IF EXISTS trigger_dating_match ON dating_likes;
CREATE TRIGGER trigger_dating_match
  AFTER INSERT ON dating_likes
  FOR EACH ROW
  EXECUTE FUNCTION create_dating_match();

-- Trigger for dating matches (on UPDATE - when pass changes to like)
DROP TRIGGER IF EXISTS trigger_dating_match_update ON dating_likes;
CREATE TRIGGER trigger_dating_match_update
  AFTER UPDATE ON dating_likes
  FOR EACH ROW
  WHEN (OLD.action != NEW.action AND NEW.action IN ('like', 'super_like'))
  EXECUTE FUNCTION create_dating_match();

-- Function to create matrimony match when mutual like occurs
CREATE OR REPLACE FUNCTION create_matrimony_match()
RETURNS TRIGGER AS $$
DECLARE
  mutual_like_exists BOOLEAN;
  match_id UUID;
BEGIN
  -- Only process if action is 'like' or 'connect'
  IF NEW.action IN ('like', 'connect') THEN
    -- Check if the liked user has also liked the liker
    SELECT EXISTS(
      SELECT 1 FROM matrimony_likes
      WHERE liker_id = NEW.liked_id
        AND liked_id = NEW.liker_id
        AND action IN ('like', 'connect')
    ) INTO mutual_like_exists;

    -- If mutual like exists, create a match
    IF mutual_like_exists THEN
      -- Check if match already exists
      SELECT id INTO match_id FROM matrimony_matches
      WHERE (user1_id = NEW.liker_id AND user2_id = NEW.liked_id)
         OR (user1_id = NEW.liked_id AND user2_id = NEW.liker_id);
      
      -- Only create if doesn't exist
      IF match_id IS NULL THEN
        BEGIN
          INSERT INTO matrimony_matches (user1_id, user2_id)
          VALUES (
            LEAST(NEW.liker_id, NEW.liked_id),
            GREATEST(NEW.liker_id, NEW.liked_id)
          )
          ON CONFLICT (user1_id, user2_id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
          -- Ignore errors (e.g., if match was created by another trigger)
          NULL;
        END;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for matrimony matches (on INSERT)
DROP TRIGGER IF EXISTS trigger_matrimony_match ON matrimony_likes;
CREATE TRIGGER trigger_matrimony_match
  AFTER INSERT ON matrimony_likes
  FOR EACH ROW
  EXECUTE FUNCTION create_matrimony_match();

-- Trigger for matrimony matches (on UPDATE - when pass changes to like)
DROP TRIGGER IF EXISTS trigger_matrimony_match_update ON matrimony_likes;
CREATE TRIGGER trigger_matrimony_match_update
  AFTER UPDATE ON matrimony_likes
  FOR EACH ROW
  WHEN (OLD.action != NEW.action AND NEW.action IN ('like', 'connect'))
  EXECUTE FUNCTION create_matrimony_match();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE dating_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrimony_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrimony_matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own likes" ON dating_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON dating_likes;
DROP POLICY IF EXISTS "Users can update own likes" ON dating_likes;
DROP POLICY IF EXISTS "Users can view own likes" ON matrimony_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON matrimony_likes;
DROP POLICY IF EXISTS "Users can update own likes" ON matrimony_likes;
DROP POLICY IF EXISTS "Users can view own matches" ON dating_matches;
DROP POLICY IF EXISTS "Users can insert own matches" ON dating_matches;
DROP POLICY IF EXISTS "Users can view own matches" ON matrimony_matches;
DROP POLICY IF EXISTS "Users can insert own matches" ON matrimony_matches;

-- Dating Likes Policies
CREATE POLICY "Users can view own likes"
  ON dating_likes FOR SELECT
  USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Users can insert own likes"
  ON dating_likes FOR INSERT
  WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can update own likes"
  ON dating_likes FOR UPDATE
  USING (auth.uid() = liker_id)
  WITH CHECK (auth.uid() = liker_id);

-- Matrimony Likes Policies
CREATE POLICY "Users can view own likes"
  ON matrimony_likes FOR SELECT
  USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Users can insert own likes"
  ON matrimony_likes FOR INSERT
  WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can update own likes"
  ON matrimony_likes FOR UPDATE
  USING (auth.uid() = liker_id)
  WITH CHECK (auth.uid() = liker_id);

-- Dating Matches Policies
CREATE POLICY "Users can view own matches"
  ON dating_matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert own matches"
  ON dating_matches FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Matrimony Matches Policies
CREATE POLICY "Users can view own matches"
  ON matrimony_matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert own matches"
  ON matrimony_matches FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

