-- Create user_reports table
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_type VARCHAR(10) NOT NULL CHECK (match_type IN ('dating', 'matrimony')),
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  UNIQUE(reporter_id, reported_user_id, match_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_match_type ON user_reports(match_type);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);

-- Add RLS (Row Level Security)
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own reports
CREATE POLICY "Users can view their own reports" ON user_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Create policy for users to insert their own reports
CREATE POLICY "Users can report other users" ON user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Admin policy for viewing all reports (if you have admin role checking)
-- CREATE POLICY "Admins can view all reports" ON user_reports
--   FOR SELECT USING (EXISTS (
--     SELECT 1 FROM auth.users 
--     WHERE id = auth.uid() AND role = 'admin'
--   ));
