-- ============================================
-- STORAGE BUCKET POLICIES
-- Run these AFTER creating the buckets in Supabase Dashboard
-- ============================================

-- IMPORTANT: First create these buckets in Supabase Dashboard → Storage:
-- 1. Create bucket: "verification-documents" (Make it PRIVATE)
-- 2. Create bucket: "face-scans" (Make it PRIVATE)

-- Then run the policies below:

-- ⚠️ NOTE: If you get "policy already exists" errors, that means the policies
-- are already applied. You can safely ignore those errors or DROP the existing
-- policies first and recreate them.

-- ============================================
-- POLICIES FOR: verification-documents bucket
-- ============================================

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

-- Allow users to upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update/delete their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- POLICIES FOR: face-scans bucket
-- ============================================

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can upload own face scans" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own face scans" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own face scans" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own face scans" ON storage.objects;

-- Allow users to upload their own face scans
CREATE POLICY "Users can upload own face scans"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'face-scans' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own face scans
CREATE POLICY "Users can read own face scans"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'face-scans' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update/delete their own face scans
CREATE POLICY "Users can update own face scans"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'face-scans' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own face scans"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'face-scans' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- POLICIES FOR: chat-media bucket
-- ============================================

-- IMPORTANT: First create the bucket in Supabase Dashboard → Storage:
-- Create bucket: "chat-media" (Make it PRIVATE)

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can upload chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can read chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own chat media" ON storage.objects;

-- Allow users to upload media for messages they send
CREATE POLICY "Users can upload chat media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' AND
  -- Path structure: {match_id}/{message_id}/{user_id}/{filename}
  -- Verify user is part of the match
  (
    EXISTS (
      SELECT 1 FROM dating_matches
      WHERE id::text = (storage.foldername(name))[1] AND
            (user1_id = auth.uid() OR user2_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM matrimony_matches
      WHERE id::text = (storage.foldername(name))[1] AND
            (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  ) AND
  (storage.foldername(name))[3] = auth.uid()::text
);

-- Allow users to read media for messages in their matches
CREATE POLICY "Users can read chat media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-media' AND
  (
    EXISTS (
      SELECT 1 FROM dating_matches
      WHERE id::text = (storage.foldername(name))[1] AND
            (user1_id = auth.uid() OR user2_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM matrimony_matches
      WHERE id::text = (storage.foldername(name))[1] AND
            (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  )
);

-- Allow users to delete their own uploaded media
CREATE POLICY "Users can delete own chat media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-media' AND
  (storage.foldername(name))[3] = auth.uid()::text
);

-- ============================================
-- DONE! ✅
-- ============================================

