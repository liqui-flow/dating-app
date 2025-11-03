-- ============================================
-- STORAGE BUCKET POLICIES
-- Run these AFTER creating the buckets in Supabase Dashboard
-- ============================================

-- IMPORTANT: First create these buckets in Supabase Dashboard → Storage:
-- 1. Create bucket: "verification-documents" (Make it PRIVATE)
-- 2. Create bucket: "face-scans" (Make it PRIVATE)

-- Then run the policies below:

-- ============================================
-- POLICIES FOR: verification-documents bucket
-- ============================================

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
-- DONE! ✅
-- ============================================

