-- Lower the matrimony bio minimum length requirement to 20 characters
-- Run this migration after deploying reduced min-length validation in the app

BEGIN;

ALTER TABLE matrimony_profile_full
  DROP CONSTRAINT IF EXISTS matrimony_profile_full_bio_check;

ALTER TABLE matrimony_profile_full
  ADD CONSTRAINT matrimony_profile_full_bio_check
  CHECK (bio IS NULL OR (LENGTH(bio) >= 20 AND LENGTH(bio) <= 300));

COMMIT;

