-- ============================================
-- FIX ONBOARDING STATUS FOR ACCOUNTS 11-20
-- This script updates onboarding_completed to TRUE for accounts
-- dating11@gmail.com to dating20@gmail.com
-- matrimony11@gmail.com to matrimony20@gmail.com
-- ============================================

-- Update dating accounts 11-20
UPDATE user_profiles
SET 
  onboarding_completed = TRUE,
  onboarding_completed_at = COALESCE(onboarding_completed_at, NOW()),
  selected_path = 'dating'
WHERE user_id IN (
  SELECT id 
  FROM auth.users 
  WHERE email IN (
    'dating11@gmail.com',
    'dating12@gmail.com',
    'dating13@gmail.com',
    'dating14@gmail.com',
    'dating15@gmail.com',
    'dating16@gmail.com',
    'dating17@gmail.com',
    'dating18@gmail.com',
    'dating19@gmail.com',
    'dating20@gmail.com'
  )
)
AND (onboarding_completed IS NULL OR onboarding_completed = FALSE);

-- Update matrimony accounts 11-20
UPDATE user_profiles
SET 
  onboarding_completed = TRUE,
  onboarding_completed_at = COALESCE(onboarding_completed_at, NOW()),
  selected_path = 'matrimony'
WHERE user_id IN (
  SELECT id 
  FROM auth.users 
  WHERE email IN (
    'matrimony11@gmail.com',
    'matrimony12@gmail.com',
    'matrimony13@gmail.com',
    'matrimony14@gmail.com',
    'matrimony15@gmail.com',
    'matrimony16@gmail.com',
    'matrimony17@gmail.com',
    'matrimony18@gmail.com',
    'matrimony19@gmail.com',
    'matrimony20@gmail.com'
  )
)
AND (onboarding_completed IS NULL OR onboarding_completed = FALSE);

-- Verify the updates
SELECT 
  u.email,
  up.selected_path,
  up.onboarding_completed,
  up.onboarding_completed_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email LIKE 'dating1%@gmail.com' 
   OR u.email LIKE 'matrimony1%@gmail.com'
ORDER BY u.email;

