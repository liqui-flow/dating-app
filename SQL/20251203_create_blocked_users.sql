-- Create blocked_users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_type VARCHAR(10) NOT NULL CHECK (match_type IN ('dating', 'matrimony')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id, match_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker_id ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_id ON blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_match_type ON blocked_users(match_type);

-- Add RLS (Row Level Security)
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own blocks
CREATE POLICY "Users can view their own blocked users" ON blocked_users
  FOR SELECT USING (auth.uid() = blocker_id);

-- Create policy for users to insert their own blocks
CREATE POLICY "Users can block other users" ON blocked_users
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- Create policy for users to delete their own blocks
CREATE POLICY "Users can unblock other users" ON blocked_users
  FOR DELETE USING (auth.uid() = blocker_id);
